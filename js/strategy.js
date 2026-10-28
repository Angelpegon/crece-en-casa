/* Ficha de estrategia: se construye a partir de ?id= y js/data.js. */
(function () {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-strategy-root]");
  if (!root) return;

  const esc = ui.escapeHTML;
  const TOTAL = 8;

  function breadcrumb(current) {
    return `
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="ver-la-guia.html">Guía para cuidadores</a></li>
          <li><a href="ideas-que-acompanan.html">Ideas que acompañan</a></li>
          <li aria-current="page">${esc(current)}</li>
        </ol>
      </nav>`;
  }

  function notFound() {
    document.title = "Idea no encontrada | Crece en Casa";
    root.innerHTML = `
      <section class="page-hero page-hero--sage" aria-labelledby="page-title">
        <div class="container">
          ${breadcrumb("Idea no encontrada")}
          <h1 id="page-title">No encontramos esta idea</h1>
          <p class="page-hero__lead">Es posible que el enlace esté incompleto.</p>
          <a class="btn btn--coral" href="ideas-que-acompanan.html">Ver ideas que acompañan ${ui.icon("i-arrow")}</a>
        </div>
      </section>`;
  }

  function relatedChallenges(strategy) {
    const list = strategy.challengeIds.map((id) => data.getChallenge(id)).filter(Boolean);
    if (!list.length) return `<p class="related-empty">Sin oportunidad relacionada en esta versión.</p>`;
    return `<ul class="link-list">${list
      .map((item) => `<li><a href="${ui.challengeUrl(item)}">${esc(item.title)}</a></li>`)
      .join("")}</ul>`;
  }

  function relatedActivities(strategy) {
    const list = strategy.activityIds.map((id) => data.getActivity(id)).filter(Boolean);
    if (!list.length) return "";
    return `<ul class="activity-grid">${list.map((item) => `<li>${ui.activityCard(item)}</li>`).join("")}</ul>`;
  }

  function progressBlock(strategy) {
    if (!progress.isAvailable()) {
      return `<p class="notice notice--warm">Tu navegador no permite guardar ideas en este dispositivo.</p>`;
    }
    const current = progress.get("strategy", strategy.id);
    const momentOptions = data.moments
      .map((moment) => `<option value="${esc(moment.id)}">${esc(moment.label)}</option>`)
      .join("");
    return `
      <section class="progress-box" aria-labelledby="progress-title">
        <h2 id="progress-title">Tus ideas para acompañar</h2>
        <p>Cada familia avanza a su ritmo. Guarda las ideas que te sirvan en este navegador.</p>
        <div class="chip-group" role="group" aria-label="Estado de esta idea" data-progress-states>
          ${Object.entries(progress.STATES)
            .map(
              ([value, label]) => `
            <label class="chip">
              <input type="radio" name="progress-state" value="${esc(value)}"${
                current && current.state === value ? " checked" : ""
              }>
              <span>${esc(label)}</span>
            </label>`
            )
            .join("")}
        </div>
        <div class="progress-box__moment" data-progress-moment hidden>
          <label class="filters__label" for="progress-moment">¿En qué momento la intentaste? (opcional)</label>
          <select id="progress-moment" name="progress-moment">
            <option value="">Otro momento / no indicar</option>
            ${momentOptions}
          </select>
        </div>
        <p class="activity-hero__status" role="status" data-progress-status></p>
        <p class="progress-box__hint">Se guarda solo en este navegador. No hay cuenta ni sincronización.</p>
      </section>`;
  }

  function heroTone(tone) {
    if (tone === "pink") return "coral";
    if (tone === "green") return "sage";
    if (tone === "yellow") return "yellow";
    return "lavender";
  }

  function render(strategy) {
    document.title = `${strategy.title} | Crece en Casa`;

    root.innerHTML = `
      <article class="detail" aria-labelledby="page-title">
        <header class="page-hero page-hero--${heroTone(strategy.tone)}" aria-labelledby="page-title">
          <div class="container">
            ${breadcrumb(strategy.title)}
            <p class="detail-back">
              <a class="btn btn--outline detail-back__btn" href="ideas-que-acompanan.html">← Volver a Ideas que acompañan</a>
            </p>
            <p class="activity-hero__ages">Idea ${strategy.number} de ${TOTAL}</p>
            <h1 id="page-title">${esc(strategy.title)}</h1>
          </div>
        </header>

        <div class="container section detail-body">
          <div class="detail-body__main">
            <section aria-labelledby="que-hacer-title">
              <h2 id="que-hacer-title">Qué hacer</h2>
              <p>${esc(strategy.what)}</p>
            </section>
            <section aria-labelledby="ejemplo-title">
              <h2 id="ejemplo-title">Ejemplo</h2>
              <p>${esc(strategy.example)}</p>
            </section>
            <section class="note note--static" aria-labelledby="pista-title">
              <h2 class="note__title hand" id="pista-title">Pista rápida</h2>
              <p>${esc(strategy.tip)}</p>
            </section>
            <section aria-labelledby="reto-rel-title">
              <h2 id="reto-rel-title">Oportunidad relacionada</h2>
              ${relatedChallenges(strategy)}
            </section>
            <section aria-labelledby="act-rel-title">
              <h2 id="act-rel-title">Actividad relacionada</h2>
              ${relatedActivities(strategy)}
            </section>
            ${progressBlock(strategy)}
            <p class="detail-back detail-back--footer">
              <a class="btn btn--outline detail-back__btn" href="ideas-que-acompanan.html">← Volver a Ideas que acompañan</a>
            </p>
          </div>
        </div>
      </article>`;

    setupProgress(strategy);
  }

  function setupProgress(strategy) {
    const status = root.querySelector("[data-progress-status]");
    const momentWrap = root.querySelector("[data-progress-moment]");
    const momentSelect = root.querySelector("#progress-moment");
    if (!status) return;

    const current = progress.get("strategy", strategy.id);
    if (current && current.state === "tried") {
      momentWrap.hidden = false;
      if (current.moment) momentSelect.value = current.moment;
    }

    function save(state) {
      const moment = state === "tried" ? momentSelect.value || null : null;
      const ok = progress.set("strategy", strategy.id, { state, moment });
      status.textContent = ok
        ? "Idea guardada en este navegador."
        : "No se pudo guardar. Revisa si tu navegador permite el almacenamiento local.";
    }

    root.querySelectorAll('[name="progress-state"]').forEach((input) => {
      input.addEventListener("change", () => {
        momentWrap.hidden = input.value !== "tried";
        save(input.value);
      });
    });

    if (momentSelect) {
      momentSelect.addEventListener("change", () => {
        const selected = root.querySelector('[name="progress-state"]:checked');
        if (selected && selected.value === "tried") save("tried");
      });
    }
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const strategy = id ? data.getStrategy(id) : null;
  if (strategy) render(strategy);
  else notFound();
})();
