/* Mi camino: resumen del progreso guardado en este navegador. */
(function () {
  const { data, ui, progress, session } = window.CEC;
  const root = document.querySelector("[data-path-root]");
  if (!root || !progress) return;

  const esc = ui.escapeHTML;
  const weekly = progress.weeklyTriedCount(5);
  const items = progress.isAvailable() ? progress.list() : [];
  const profile = session && session.get ? session.get() : null;

  function labelFor(entry) {
    if (entry.type === "activity") {
      const activity = data.getActivity(entry.id);
      return activity ? activity.title : entry.id;
    }
    if (entry.type === "strategy") {
      const strategy = data.getStrategy(entry.id);
      return strategy ? strategy.title : entry.id;
    }
    if (entry.type === "challenge") {
      const challenge = data.getChallenge(entry.id);
      return challenge ? challenge.title : entry.id;
    }
    return entry.id;
  }

  function hrefFor(entry) {
    if (entry.type === "activity") return `actividad.html?id=${encodeURIComponent(entry.id)}`;
    if (entry.type === "strategy") return `estrategia.html?id=${encodeURIComponent(entry.id)}`;
    if (entry.type === "challenge") return `reto.html?id=${encodeURIComponent(entry.id)}`;
    return "ideas-que-acompanan.html";
  }

  const leaves = Array.from({ length: weekly.total }, (_, index) => {
    const filled = index < weekly.count;
    return `<span class="path-leaf${filled ? " is-filled" : ""}" aria-hidden="true">${ui.icon("i-brote")}</span>`;
  }).join("");

  const listMarkup = items.length
    ? `<ul class="path-list">
        ${items
          .slice(0, 12)
          .map(
            (entry) => `
          <li>
            <a href="${hrefFor(entry)}">
              <span class="path-list__type">${esc(entry.type)}</span>
              <strong>${esc(labelFor(entry))}</strong>
              <span>${esc(progress.STATES[entry.state] || entry.state)}</span>
            </a>
          </li>`
          )
          .join("")}
      </ul>`
    : `<div class="empty-state">
        <h2>Aún no hay huellas guardadas</h2>
        <p>Cuando explores una idea, una oportunidad o una actividad y marques cómo te fue, aparecerá aquí.</p>
        <a class="btn btn--sage" href="explorar-actividades.html">Explorar actividades ${ui.icon("i-arrow")}</a>
      </div>`;

  root.innerHTML = `
    <section class="page-hero page-hero--sage" aria-labelledby="page-title">
      <div class="container">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <ol>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="nuestro-rincon.html">Nuestro rincón</a></li>
            <li aria-current="page">Mi camino</li>
          </ol>
        </nav>
        <h1 id="page-title">Mi camino</h1>
        <p class="page-hero__lead">
          ${
            profile
              ? `Hola, ${esc(profile.name)}. Aquí ves lo que has ido practicando en este navegador.`
              : "Tu progreso se guarda solo en este navegador. No hay cuenta en la nube todavía."
          }
        </p>
      </div>
    </section>

    <section class="section" aria-labelledby="week-title">
      <div class="container path-week">
        <h2 id="week-title">Huellas de esta semana</h2>
        <p class="path-week__count"><strong>${weekly.count}</strong> de ${weekly.total}</p>
        <div class="path-week__leaves" role="img" aria-label="${weekly.count} de ${weekly.total} prácticas esta semana">
          ${leaves}
        </div>
        <p class="path-week__hint">Se cuenta cada idea marcada como «La intenté en casa» desde el lunes.</p>
        <p class="path-week__actions">
          <a class="btn btn--sage" href="ideas-que-acompanan.html">Ideas que acompañan ${ui.icon("i-arrow")}</a>
          ${profile ? "" : `<a class="btn btn--outline" href="mi-espacio.html">Crear mi espacio</a>`}
        </p>
      </div>
    </section>

    <section class="section section--tint" aria-labelledby="list-title">
      <div class="container">
        <h2 id="list-title">Actividad reciente</h2>
        ${listMarkup}
      </div>
    </section>`;
})();
