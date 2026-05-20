const githubUser = "CMAF23";

const fallbackRepositories = [
  {
    name: "back-up-serverminecraft",
    html_url: "https://github.com/CMAF23/back-up-serverminecraft",
    description: "Backup de mi server de Minecraft.",
    language: "JavaScript",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2026-05-08T21:27:33Z",
  },
  {
    name: "ZAFRA-APP",
    html_url: "https://github.com/CMAF23/ZAFRA-APP",
    description: "Proyecto personal de uso diario para un emprendimiento.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2026-05-05T16:27:49Z",
  },
  {
    name: "OAXACAIA",
    html_url: "https://github.com/CMAF23/OAXACAIA",
    description: "Proyecto con JavaScript enfocado en ideas y experimentación.",
    language: "JavaScript",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2026-05-05T15:45:29Z",
  },
  {
    name: "trabajodiseodigital",
    html_url: "https://github.com/CMAF23/trabajodiseodigital",
    description: "Proyecto de diseño digital publicado en GitHub.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2025-10-16T17:50:50Z",
  },
  {
    name: "fiestapatronalterceraseccion2024",
    html_url: "https://github.com/CMAF23/fiestapatronalterceraseccion2024",
    description: "Sitio web para un evento local publicado en GitHub.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2024-09-01T16:56:12Z",
  },
  {
    name: "NICO",
    html_url: "https://github.com/CMAF23/NICO",
    description: "Proyecto web estático desarrollado en HTML.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2024-08-31T22:14:55Z",
  },
  {
    name: "Portafolio-Personal",
    html_url: "https://github.com/CMAF23/Portafolio-Personal",
    description: "Mi portafolio personal en constante mejora.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2024-07-14T00:23:11Z",
  },
  {
    name: "CafePETRONA",
    html_url: "https://github.com/CMAF23/CafePETRONA",
    description: "Menú web para Café Petrona.",
    language: "HTML",
    stargazers_count: 0,
    forks_count: 0,
    homepage: "",
    updated_at: "2023-06-29T16:30:43Z",
  },
];

const repoGrid = document.querySelector("#repo-grid");
const repoStatus = document.querySelector("#repo-status");
const repoCount = document.querySelector("#repo-count");

const formatDate = (date) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const createChip = (text) => `<span class="repo-chip">${text}</span>`;
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const sanitizeUrl = (value) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
};

const renderRepositories = (repositories, usedFallback = false) => {
  if (!repoGrid || !repoStatus || !repoCount) {
    return;
  }

  const sortedRepositories = [...repositories].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  );

  repoCount.textContent = `${sortedRepositories.length}`;
  repoStatus.textContent = usedFallback
    ? "No se pudo consultar GitHub en este momento, pero se muestran mis repositorios conocidos."
    : `Mostrando ${sortedRepositories.length} repositorios públicos actualizados automáticamente desde GitHub.`;

  repoGrid.innerHTML = sortedRepositories
    .map((repository) => {
      const description =
        repository.description?.trim() ||
        "Repositorio público disponible en GitHub.";
      const safeName = escapeHtml(repository.name);
      const safeDescription = escapeHtml(description);
      const safeHtmlUrl = sanitizeUrl(repository.html_url);
      const safeHomepageUrl = sanitizeUrl(repository.homepage);
      const languageChip = repository.language
        ? createChip(escapeHtml(repository.language))
        : createChip("Sin lenguaje detectado");
      const starsChip = createChip(`★ ${repository.stargazers_count ?? 0}`);
      const forksChip = createChip(`⑂ ${repository.forks_count ?? 0}`);
      const homepageLink = safeHomepageUrl
        ? `<a class="btn btn-sm btn-outline-light" href="${safeHomepageUrl}" target="_blank" rel="noreferrer">Demo</a>`
        : "";

      return `
        <article class="repo-card">
          <div class="repo-card-header">
            <h3 class="repo-title">${safeName}</h3>
            <span class="repo-chip">Actualizado ${formatDate(repository.updated_at)}</span>
          </div>
          <p class="repo-description">${safeDescription}</p>
          <div class="repo-meta">
            ${languageChip}
            ${starsChip}
            ${forksChip}
          </div>
          <div class="repo-actions">
            <a class="btn btn-sm btn-primary" href="${safeHtmlUrl}" target="_blank" rel="noreferrer">Repositorio</a>
            ${homepageLink}
          </div>
        </article>
      `;
    })
    .join("");
};

const loadRepositories = async () => {
  if (!repoGrid || !repoStatus || !repoCount) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub respondió con ${response.status}`);
    }

    const repositories = await response.json();
    renderRepositories(
      repositories.filter((repository) => !repository.fork),
      false,
    );
  } catch (error) {
    console.error("No fue posible cargar los repositorios desde GitHub", error);
    renderRepositories(fallbackRepositories, true);
  }
};

loadRepositories();
