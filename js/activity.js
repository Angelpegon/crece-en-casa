/* Ficha de actividad: se construye a partir de ?id= y de los datos de js/data.js. */
(function () {
  const { data, ui, saved } = window.CEC;
  const root = document.querySelector("[data-activity-root]");
  if (!root) return;

  const esc = ui.escapeHTML;

  function listItems(items) {
    return items.map((item) => `<li>${esc(item)}</li>`).join("");
  }

  function breadcrumb(current) {
    return `
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="actividades.html">Actividades</a></li>
          <li aria-current="page">${esc(current)}</li>
        </ol>
      </nav>`;
  }

  function notFound() {
    document.title = "Actividad no encontrada | Crece en Casa";
    root.innerHTML = `
      <section class="page-hero page-hero--yellow" aria-labelledby="page-title">
        <div class="container">
          ${breadcrumb("Actividad no encontrada")}
          <h1 id="page-title">No encontramos esta actividad</h1>
          <p class="page-hero__lead">Es posible que el enlace esté incompleto o que la actividad ya no esté disponible.</p>
          <a class="btn btn--coral" href="actividades.html">Ver todas las actividades ${ui.icon("i-arrow")}</a>
        </div>
      </section>`;
  }

  function saveButton(activity) {
    if (!saved.isAvailable()) {
      return `<p class="activity-hero__hint">Tu navegador no permite guardar actividades en este dispositivo.</p>`;
    }
    return `
      <button class="btn btn--outline" type="button" data-save="${esc(activity.id)}">
        ${ui.icon("i-bookmark")}
        <span data-save-label>Guardar en Mi espacio</span>
      </button>`;
  }

  function related(activity) {
    const others = data.activities
      .filter((item) => item.id !== activity.id && item.ages.some((age) => activity.ages.includes(age)))
      .slice(0, 3);
    if (!others.length) return "";
    return `
      <section class="section related" aria-labelledby="related-title">
        <div class="container">
          <h2 class="related__title" id="related-title">Otras actividades para ${ui.formatAges(activity.ages)}</h2>
          <ul class="activity-grid">
            ${others.map((item) => `<li>${ui.activityCard(item)}</li>`).join("")}
          </ul>
        </div>
      </section>`;
  }

  function render(activity) {
    const tone = data.getAge(activity.ages[0]).tone;
    const imageAlt = activity.image ? activity.imageAlt : "";
    document.title = `${activity.title} | Crece en Casa`;

    root.innerHTML = `
      <article class="activity" aria-labelledby="page-title">
        <header class="activity-hero activity-hero--${tone}">
          <div class="container activity-hero__layout">
            <div class="activity-hero__content">
              ${breadcrumb(activity.title)}
              <p class="activity-hero__ages">${ui.formatAges(activity.ages)}</p>
              <h1 id="page-title">${esc(activity.title)}</h1>
              <p class="activity-hero__tagline">${esc(activity.tagline)}</p>
              <p class="activity-hero__summary">${esc(activity.summary)}</p>
              <ul class="activity-hero__meta">
                <li>${ui.icon("i-clock")} ${esc(activity.duration)}</li>
              </ul>
              <ul class="tag-list" aria-label="Áreas que trabaja">${ui.areaTags(activity)}</ul>
              <div class="activity-hero__actions">
                ${saveButton(activity)}
                <button class="btn btn--outline" type="button" data-print>
                  ${ui.icon("i-print")} Imprimir
                </button>
              </div>
              <p class="activity-hero__status" role="status" data-save-status></p>
            </div>
            <div class="activity-hero__media ${activity.image ? "activity-hero__media--photo" : ""}">
              ${ui.imageTag(ui.activityImage(activity), { alt: imageAlt })}
            </div>
          </div>
        </header>

        <div class="container section activity-body">
          <div class="activity-body__main">
            <section aria-labelledby="materiales-title">
              <h2 id="materiales-title">Materiales</h2>
              <ul class="bullet-list">${listItems(activity.materials)}</ul>
            </section>

            <section aria-labelledby="pasos-title">
              <h2 id="pasos-title">Paso a paso</h2>
              <ol class="steps">${listItems(activity.steps)}</ol>
            </section>

            <section aria-labelledby="consejos-title">
              <h2 id="consejos-title">Consejos</h2>
              <ul class="bullet-list">${listItems(activity.tips)}</ul>
            </section>
          </div>

          <aside class="activity-body__aside">
            <section class="note note--static" aria-labelledby="favorece-title">
              <h2 class="note__title hand" id="favorece-title">¿Qué favorece?</h2>
              <ul class="checklist">
                ${activity.favors.map((item) => `<li>${ui.icon("i-check")}${esc(item)}</li>`).join("")}
              </ul>
            </section>

            <p class="notice">
              <span><strong>Importante:</strong> esta es una propuesta educativa de ejemplo. No es un diagnóstico ni sustituye
              una valoración fonoaudiológica. Si algo te preocupa, consulta con un profesional.</span>
            </p>
          </aside>
        </div>
      </article>
      ${related(activity)}`;

    setupSave(activity);
    setupPrint();
  }

  function setupSave(activity) {
    const button = root.querySelector("[data-save]");
    const status = root.querySelector("[data-save-status]");
    if (!button) return;
    const label = button.querySelector("[data-save-label]");
    const iconUse = button.querySelector("use");

    function sync() {
      const isSaved = saved.has(activity.id);
      label.textContent = isSaved ? "Quitar de Mi espacio" : "Guardar en Mi espacio";
      iconUse.setAttribute("href", `assets/icons/sprite.svg#${isSaved ? "i-trash" : "i-bookmark"}`);
    }

    button.addEventListener("click", () => {
      const wasSaved = saved.has(activity.id);
      const ok = wasSaved ? saved.remove(activity.id) : saved.add(activity.id);
      if (!ok) {
        status.textContent = "No se pudo guardar. Revisa si tu navegador permite el almacenamiento local.";
        return;
      }
      sync();
      status.innerHTML = wasSaved
        ? "Se quitó de Mi espacio."
        : 'Guardada en este navegador. Puedes verla en <a href="mi-espacio.html">Mi espacio</a>.';
    });

    window.addEventListener("storage", sync);
    sync();
  }

  function setupPrint() {
    const button = root.querySelector("[data-print]");
    if (button) button.addEventListener("click", () => window.print());
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const activity = id ? data.getActivity(id) : null;
  if (activity) {
    render(activity);
  } else {
    notFound();
  }
})();
