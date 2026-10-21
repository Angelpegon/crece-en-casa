/* Reto interactivo: decisión, retroalimentación y cierre. */
(function () {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-challenge-root]");
  if (!root) return;

  const esc = ui.escapeHTML;

  const CLOSE_OPTIONS = [
    { id: "tried", label: "Lo intenté" },
    { id: "later-opportunity", label: "Todavía no se presentó la oportunidad" },
    { id: "practice", label: "Quiero practicarlo después" },
  ];

  function breadcrumb(current) {
    return `
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="guia.html">Guía para cuidadores</a></li>
          <li><a href="guia.html#retos">Retos cotidianos</a></li>
          <li aria-current="page">${esc(current)}</li>
        </ol>
      </nav>`;
  }

  function notFound() {
    document.title = "Reto no encontrado | Crece en Casa";
    root.innerHTML = `
      <section class="page-hero page-hero--coral" aria-labelledby="page-title">
        <div class="container">
          ${breadcrumb("Reto no encontrado")}
          <h1 id="page-title">No encontramos este reto</h1>
          <p class="page-hero__lead">Es posible que el enlace esté incompleto.</p>
          <a class="btn btn--coral" href="guia.html#retos">Ver retos cotidianos ${ui.icon("i-arrow")}</a>
        </div>
      </section>`;
  }

  function strategyLine(challenge) {
    const links = ui.strategyLinks(challenge.strategyIds);
    return links ? `<p class="detail-meta"><strong>Estrategia que practicas:</strong> ${links}</p>` : "";
  }

  function render(challenge) {
    const heroTone = challenge.tone === "sage" ? "sage" : challenge.tone === "yellow" ? "yellow" : "coral";
    document.title = `${challenge.title} | Crece en Casa`;

    root.innerHTML = `
      <article class="detail" aria-labelledby="page-title">
        <header class="page-hero page-hero--${heroTone}" aria-labelledby="page-title">
          <div class="container">
            ${breadcrumb(challenge.title)}
            <p class="activity-hero__ages">${esc(challenge.tag)}</p>
            <h1 id="page-title">${esc(challenge.title)}</h1>
            <p class="page-hero__lead">${esc(challenge.situation)}</p>
            ${strategyLine(challenge)}
          </div>
        </header>

        <div class="container section detail-body">
          <div class="detail-body__main">
            <section aria-labelledby="decision-title" data-decision>
              <h2 id="decision-title">${esc(challenge.question)}</h2>
              <div class="choice-list" role="list">
                ${challenge.options
                  .map(
                    (option) => `
                  <button class="choice" type="button" role="listitem" data-choice="${esc(option.id)}">
                    ${esc(option.text)}
                  </button>`
                  )
                  .join("")}
              </div>
              <div class="feedback" data-feedback hidden></div>
            </section>

            <section aria-labelledby="ejemplo-title" data-example hidden>
              <h2 id="ejemplo-title">Ejemplo para probar</h2>
              <p>${esc(challenge.example)}</p>
            </section>

            <section class="progress-box" aria-labelledby="cierre-title" data-close hidden>
              <h2 id="cierre-title">¿Pudiste probar esta idea?</h2>
              <div class="chip-group" role="group" aria-label="Cierre del reto">
                ${CLOSE_OPTIONS.map(
                  (option) => `
                  <label class="chip">
                    <input type="radio" name="close-state" value="${esc(option.id)}">
                    <span>${esc(option.label)}</span>
                  </label>`
                ).join("")}
              </div>
              <p class="activity-hero__status" role="status" data-close-status></p>
              <p class="progress-box__hint">Opcional. Se guarda solo en este navegador.</p>
            </section>
          </div>
        </div>
      </article>`;

    setupDecision(challenge);
    setupClose(challenge);
  }

  function setupDecision(challenge) {
    const buttons = root.querySelectorAll("[data-choice]");
    const feedback = root.querySelector("[data-feedback]");
    const example = root.querySelector("[data-example]");
    const close = root.querySelector("[data-close]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const option = challenge.options.find((item) => item.id === button.dataset.choice);
        if (!option) return;

        buttons.forEach((item) => {
          item.disabled = true;
          item.classList.toggle("is-selected", item === button);
        });

        feedback.hidden = false;
        feedback.innerHTML = `<p>${esc(option.feedback)}</p>`;
        example.hidden = false;
        close.hidden = false;

        if (progress.isAvailable()) {
          progress.set("challenge", challenge.id, { state: "explored" });
        }
      });
    });
  }

  function setupClose(challenge) {
    const status = root.querySelector("[data-close-status]");
    if (!status) return;

    const map = {
      tried: "tried",
      "later-opportunity": "practice",
      practice: "practice",
    };

    root.querySelectorAll('[name="close-state"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (!progress.isAvailable()) {
          status.textContent = "Tu navegador no permite guardar ideas en este dispositivo.";
          return;
        }
        const ok = progress.set("challenge", challenge.id, { state: map[input.value] || "explored" });
        status.textContent = ok
          ? "Respuesta guardada en este navegador."
          : "No se pudo guardar. Revisa si tu navegador permite el almacenamiento local.";
      });
    });
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const challenge = id ? data.getChallenge(id) : null;
  if (challenge) render(challenge);
  else notFound();
})();
