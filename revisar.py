"""Revisa el portafolio: que los enlaces sigan vivos, que las imagenes existan
y que el HTML no tenga etiquetas sin cerrar.

Se corre solo:   python3 revisar.py
"""
import html.parser
import os
import re
import sys
import urllib.error
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
PAGINA = os.path.join(AQUI, 'index.html')
VACIAS = {'meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'}


class Lector(html.parser.HTMLParser):
    """Va apilando etiquetas para ver si alguna se queda sin cerrar."""

    def __init__(self):
        super().__init__()
        self.pila = []
        self.quejas = []

    def handle_starttag(self, tag, attrs):
        if tag not in VACIAS:
            self.pila.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VACIAS:
            return
        if not self.pila:
            self.quejas.append(f'linea {self.getpos()[0]}: cierra </{tag}> y no habia nada abierto')
            return
        abierta, linea = self.pila.pop()
        if abierta != tag:
            self.quejas.append(f'linea {self.getpos()[0]}: cierra </{tag}> pero lo abierto era <{abierta}> de la linea {linea}')


def mirar(url):
    pet = urllib.request.Request(url, method='GET', headers={'User-Agent': 'revisar-portafolio/1'})
    try:
        with urllib.request.urlopen(pet, timeout=12) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:                      # sin red, dominio caido, certificado
        return type(e).__name__


def main():
    s = open(PAGINA, encoding='utf-8').read()
    mal = 0

    lector = Lector()
    lector.feed(s)
    pendientes = [f'<{t}> de la linea {l}' for t, l in lector.pila]
    if lector.quejas or pendientes:
        mal += 1
        print('HTML:')
        for q in lector.quejas:
            print('  ', q)
        for p in pendientes:
            print('   se quedo abierta', p)
    else:
        print('HTML: todas las etiquetas cierran')

    archivos = sorted(set(re.findall(r'(?:src|href)="((?:img|fuentes)/[^"]+)"', s)
                          + re.findall(r'srcset="([^"]+)"', s)))
    faltantes = []
    for entrada in archivos:
        for pedazo in entrada.split(','):
            ruta = pedazo.strip().split(' ')[0]
            if ruta and not ruta.startswith('http') and not os.path.exists(os.path.join(AQUI, ruta)):
                faltantes.append(ruta)
    if faltantes:
        mal += 1
        print('Archivos que la pagina pide y no estan:', ', '.join(sorted(set(faltantes))))
    else:
        print('Archivos: todas las imagenes del HTML existen en el repo')

    anclas = set(re.findall(r'href="#([^"]+)"', s))
    ids = set(re.findall(r'id="([^"]+)"', s))
    rotas = sorted(a for a in anclas if a and a not in ids)
    if rotas:
        mal += 1
        print('Enlaces internos que no llevan a ningun lado:', ', '.join(rotas))
    else:
        print('Enlaces internos: todos apuntan a una seccion que existe')

    fuera = sorted(set(re.findall(r'href="(https?://[^"]+)"', s)))
    fuera = [u for u in fuera if 'fonts.googleapis' not in u and 'fonts.gstatic' not in u]
    print('Enlaces a otros sitios:')
    for u in fuera:
        estado = mirar(u)
        bien = estado in (200, 301, 302, 307, 308)
        if not bien:
            mal += 1
        print(f'  {"ok  " if bien else "MAL "} {estado}  {u}')

    print()
    print('todo en orden' if not mal else f'{mal} cosas que revisar')
    return 1 if mal else 0


if __name__ == '__main__':
    sys.exit(main())
