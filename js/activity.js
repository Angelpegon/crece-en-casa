/* Ficha de actividad: plantilla común según la guía MVP. */
(function () {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-activity-root]");
  if (!root) return;

  const esc = ui.escapeHTML;

  const REFLECTION = [
    { id: "enjoyed", label: "Lo disfrutamos" },
    { id: "hard", label: "Fue difícil" },
    { id: "another-day", label: "Queremos intentarlo otro día" },
  ];

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
    const primary = data.getArea(activity.primaryArea);
    const imageAlt = activity.image ? activity.imageAlt : "";
    const strategies = ui.strategyLinks(activity.strategyIds);
    document.title = `${activity.title} | Crece en Casa`;

    root.innerHTML = `
      <article class="activity" aria-labelledby="page-title">
        <header class="activity-hero activity-hero--${tone}">
          <div class="container activity-hero__layout">
            <div class="activity-hero__content">
              ${breadcrumb(activity.title)}
              <p class="activity-hero__ages">${ui.formatAges(activity.ages)}${
                activity.ageNote ? ` · ${esc(activity.ageNote)}` : ""
              }</p>
              <h1 id="page-title">${esc(activity.title)}</h1>
              <p class="activity-hero__tagline">${esc(activity.tagline)}</p>
              <p class="activity-hero__summary">${esc(activity.summary)}</p>
              <ul class="activity-hero__meta">
                <li>${ui.icon("i-clock")} ${esc(activity.duration)}</li>
                ${primary ? `<li>${esc(primary.label)}</li>` : ""}
              </ul>
              ${strategies ? `<p class="detail-meta"><strong>Estrategia que practicas:</strong> ${strategies}</p>` : ""}
              <div class="activity-hero__actions">
                <button class="btn btn--outline" type="button" data-print>
                  ${ui.icon("i-print")} Imprimir
                </button>
              </div>
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

            <section aria-labelledby="antes-title">
              <h2 id="antes-title">Antes de empezar</h2>
              <p>${esc(activity.before)}</p>
            </section>

            <section aria-labelledby="pasos-title">
              <h2 id="pasos-title">¿Cómo jugamos?</h2>
              <ol class="steps">${listItems(activity.steps)}</ol>
            </section>

            <section aria-labelledby="acompanar-title">
              <h2 id="acompanar-title">¿Cómo puedes acompañar?</h2>
              <p>${esc(activity.accompany)}</p>
            </section>

            <section aria-labelledby="adapta-title">
              <h2 id="adapta-title">Adapta la actividad</h2>
              <p>${esc(activity.adapt)}</p>
            </section>

            <section aria-labelledby="cerrar-title">
              <h2 id="cerrar-title">Para cerrar</h2>
              <p>${esc(activity.closing)}</p>
            </section>

            <section class="progress-box" aria-labelledby="termine-title">
              <h2 id="termine-title">Terminé por ahora</h2>
              <p>¿Cómo les fue? Esta respuesta no evalúa al niño: sirve para que tú reflexiones.</p>
              <div class="chip-group" role="group" aria-label="Cómo les fue">
                ${REFLECTION.map(
                  (option) => `
                  <label class="chip">
                    <input type="radio" name="reflection" value="${esc(option.id)}">
                    <span>${esc(option.label)}</span>
                  </label>`
                ).join("")}
              </div>
              <p class="activity-hero__status" role="status" data-reflection-status></p>
              <p class="progress-box__hint">Opcional. Se guarda solo en este navegador.</p>
            </section>
          </div>

          <aside class="activity-body__aside">
            <section class="note note--static" aria-labelledby="favorece-title">
              <h2 class="note__title hand" id="favorece-title">También puede favorecer</h2>
              <ul class="checklist">
                ${activity.areas
                  .filter((id) => id !== activity.primaryArea)
                  .map((id) => data.getArea(id))
                  .filter(Boolean)
                  .map((area) => `<li>${ui.icon("i-check")}${esc(area.label)}</li>`)
                  .join("")}
              </ul>
            </section>

            <p class="notice">
              <span><strong>Importante:</strong> esta es una propuesta educativa. No es un diagnóstico ni sustituye
              una valoración fonoaudiológica. Si algo te preocupa, consulta con un profesional.</span>
            </p>
          </aside>
        </div>
      </article>
      ${related(activity)}`;

    setupPrint();
    setupReflection(activity);
  }

  function setupPrint() {
    const button = root.querySelector("[data-print]");
    if (button) button.addEventListener("click", () => window.print());
  }

  function setupReflection(activity) {
    const status = root.querySelector("[data-reflection-status]");
    if (!status) return;

    const map = {
      enjoyed: "tried",
      hard: "practice",
      "another-day": "practice",
    };

    root.querySelectorAll('[name="reflection"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (!progress.isAvailable()) {
          status.textContent = "Tu navegador no permite guardar ideas en este dispositivo.";
          return;
        }
        const ok = progress.set("activity", activity.id, { state: map[input.value] || "explored" });
        status.textContent = ok
          ? "Gracias. Tu reflexión quedó en este navegador."
          : "No se pudo guardar. Revisa si tu navegador permite el almacenamiento local.";
      });
    });
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const activity = id ? data.getActivity(id) : null;
  if (activity) render(activity);
  else notFound();
})();
