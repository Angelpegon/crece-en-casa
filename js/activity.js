/* Ficha de actividad: contenido según Crece_en_Casa_Fichas_para_Programacion. */
(function () {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-activity-root]");
  if (!root) return;

  const esc = ui.escapeHTML;

  const STICKER = "assets/img/stickers/";

  function stickerImg(file, className) {
    return `<img class="${className}" src="${STICKER}${file}" alt="" width="96" height="96" decoding="async" aria-hidden="true">`;
  }

  /* Pegatinas decorativas por bloque (patrón del mockup de ficha). */
  const BLOCK_STICKERS = {
    materiales: "pila-libros.png",
    antes: "libro-abierto.png",
    areas: "checklist.png",
    acompanar: "burbuja-corazon.png",
    adapta: "engranaje.png",
    recuerda: "bombilla.png",
  };

  const REFLECTION = [
    {
      id: "enjoyed",
      sticker: "hoja.png",
      label: "Lo disfrutamos",
      detail: "Hubo sonrisas, juego o un momento agradable juntos.",
      title: "¡Qué lindo momento!",
      message: "Celebrar lo compartido también cuenta. No hace falta que haya sido perfecto.",
    },
    {
      id: "hard",
      sticker: "corazon.png",
      label: "Fue difícil",
      detail: "Hubo frustración, cansancio o no fluyó como esperaban.",
      title: "También es avanzar",
      message: "Los días difíciles forman parte del camino. Pueden retomarlo con calma cuando quieran.",
    },
    {
      id: "another-day",
      sticker: "calendario.png",
      label: "Otro día",
      detail: "Hoy no era el momento y está bien dejarlo para después.",
      title: "¡Queda guardado para ustedes!",
      message: "Elegir otro momento también es cuidar la conexión. La idea sigue disponible.",
    },
  ];

  function listItems(items) {
    return items.map((item) => `<li>${esc(item)}</li>`).join("");
  }

  function breadcrumb(current) {
    return `
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <ol>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="explorar-actividades.html">Explorar actividades</a></li>
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
          <a class="btn btn--coral" href="explorar-actividades.html">Ver todas las actividades ${ui.icon("i-arrow")}</a>
        </div>
      </section>`;
  }

  function related(activity) {
    const rest = data.activities.filter((item) => item.id !== activity.id);
    const byArea = rest.filter(
      (item) =>
        item.primaryArea === activity.primaryArea ||
        item.areas.some((id) => activity.areas.includes(id))
    );
    const byNearbyAge = rest.filter((item) => Math.abs((item.ages[0] || 0) - (activity.ages[0] || 0)) <= 1);
    const picked = [];
    const seen = new Set();
    [byArea, byNearbyAge, rest].forEach((group) => {
      group.forEach((item) => {
        if (seen.has(item.id) || picked.length >= 3) return;
        seen.add(item.id);
        picked.push(item);
      });
    });
    if (!picked.length) return "";
    const area = data.getArea(activity.primaryArea);
    const title = area ? `Otras actividades de ${area.label.toLowerCase()}` : "Otras actividades";
    return `
      <section class="section related" aria-labelledby="related-title">
        <div class="container">
          <h2 class="related__title" id="related-title">${esc(title)}</h2>
          <ul class="activity-grid">
            ${picked.map((item) => `<li>${ui.activityCard(item)}</li>`).join("")}
          </ul>
        </div>
      </section>`;
  }

  function fichaBlock(tone, icon, titleId, title, body, { wide = false, slot = "" } = {}) {
    const classes = ["ficha-block", `ficha-block--${tone}`];
    if (wide) classes.push("ficha-block--wide");
    if (slot) classes.push(`ficha-block--${slot}`);
    const decor = BLOCK_STICKERS[slot]
      ? stickerImg(BLOCK_STICKERS[slot], "ficha-block__sticker")
      : "";
    return `
      <section class="${classes.join(" ")}" aria-labelledby="${titleId}">
        <h2 class="ficha-block__title" id="${titleId}">
          ${icon ? `<span class="ficha-block__icon" aria-hidden="true">${ui.icon(icon)}</span>` : ""}
          <span>${esc(title)}</span>
        </h2>
        <div class="ficha-block__body">${body}</div>
        ${decor}
      </section>`;
  }

  function areasList(activity) {
    const ordered = [activity.primaryArea, ...activity.areas.filter((id) => id !== activity.primaryArea)];
    return `
      <ul class="ficha-areas">
        ${ordered
          .map((id) => data.getArea(id))
          .filter(Boolean)
          .map(
            (area) => `
            <li class="ficha-areas__item ficha-areas__item--${area.tone || "sage"}">
              ${area.icon ? `<span class="ficha-areas__glyph" aria-hidden="true">${ui.icon(area.icon)}</span>` : ""}
              <span>${esc(area.label)}</span>
            </li>`
          )
          .join("")}
      </ul>`;
  }

  function render(activity) {
    const tone = (data.getAge(activity.ages[0]) || {}).tone || "lavender";
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
                ${activity.duration ? `<li>${ui.icon("i-clock")} ${ui.formatDuration(activity, { html: true })}</li>` : ""}
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
          <div class="ficha-grid">
            ${fichaBlock("sage", "i-brote", "objetivo-title", "Objetivo", `<p>${esc(activity.objective)}</p>`, {
              slot: "objetivo",
            })}
            ${fichaBlock(
              "coral",
              "i-home",
              "materiales-title",
              "Materiales",
              `<ul class="bullet-list">${listItems(activity.materials)}</ul>`,
              { slot: "materiales" }
            )}
            ${fichaBlock(
              "sky",
              "i-interaccion",
              "areas-title",
              "¿Qué áreas de comunicación favorece?",
              areasList(activity),
              { slot: "areas" }
            )}
            ${fichaBlock(
              "yellow",
              "i-spark",
              "antes-title",
              "Antes de empezar",
              `<p>${esc(activity.before)}</p>`,
              { slot: "antes" }
            )}
            ${fichaBlock(
              "sky",
              "i-juego",
              "pasos-title",
              "¿Cómo jugamos?",
              `<ol class="steps">${listItems(activity.steps)}</ol>`,
              { wide: true, slot: "pasos" }
            )}
            ${fichaBlock(
              "coral",
              "i-story",
              "acompanar-title",
              "¿Cómo puedes acompañar?",
              `<p>${esc(activity.accompany)}</p>`,
              { slot: "acompanar" }
            )}
            ${fichaBlock(
              "sage",
              "i-guide",
              "adapta-title",
              "Adapta la actividad",
              `<p>${esc(activity.adapt)}</p>`,
              { slot: "adapta" }
            )}
            ${fichaBlock(
              "lavender",
              "i-check",
              "cerrar-title",
              "Para cerrar",
              `
              <p class="ficha-closing__prompt">${esc(activity.closing)}</p>
              <label class="ficha-closing__label" for="closing-note">Tu respuesta o comentario</label>
              <textarea
                class="ficha-closing__input"
                id="closing-note"
                name="closing"
                rows="4"
                maxlength="500"
                placeholder="Escribe lo que notaste, cómo respondió o lo que quieres recordar…"
                data-closing-note
              ></textarea>
              <div class="ficha-closing__actions">
                <button class="btn btn--coral" type="button" data-save-closing>Guardar</button>
                <p class="ficha-closing__meta">
                  <span class="ficha-closing__hint">Opcional. Se guarda solo en este navegador.</span>
                  <span class="ficha-closing__status" role="status" data-closing-status></span>
                </p>
              </div>
            `,
              { wide: true, slot: "cerrar" }
            )}
            ${fichaBlock(
              "coral",
              "i-info",
              "recuerda-title",
              "Recuerda que…",
              `<p>${esc(activity.remember)}</p>`,
              { wide: true, slot: "recuerda" }
            )}

            <section class="progress-box ficha-close ficha-block ficha-block--progress ficha-block--wide ficha-block--termine" aria-labelledby="termine-title">
              <h2 id="termine-title">Terminé por ahora</h2>
              <p class="ficha-close__lead">Elige cómo se sintió este momento. No hay respuestas correctas: solo una forma de cerrar con cariño.</p>
              <div class="ficha-close__choices" role="group" aria-label="Cómo se sintió el momento">
                ${REFLECTION.map(
                  (option) => `
                  <label class="ficha-close__choice">
                    <input type="radio" name="reflection" value="${esc(option.id)}">
                    <span class="ficha-close__card">
                      <span class="ficha-close__glyph" aria-hidden="true">${stickerImg(option.sticker, "ficha-close__sticker")}</span>
                      <span class="ficha-close__copy">
                        <strong>${esc(option.label)}</strong>
                        <span>${esc(option.detail)}</span>
                      </span>
                    </span>
                  </label>`
                ).join("")}
              </div>
              <div class="ficha-close__cheer" data-reflection-cheer hidden></div>
              <p class="progress-box__hint">Opcional. Se guarda solo en este navegador.</p>
            </section>
          </div>
        </div>
      </article>
      ${related(activity)}`;

    setupPrint();
    setupClosingNote(activity);
    setupReflection(activity);
  }

  function setupPrint() {
    const button = root.querySelector("[data-print]");
    if (button) button.addEventListener("click", () => window.print());
  }

  function setupClosingNote(activity) {
    const field = root.querySelector("[data-closing-note]");
    const button = root.querySelector("[data-save-closing]");
    const status = root.querySelector("[data-closing-status]");
    if (!field || !button) return;

    const saved = progress.isAvailable() ? progress.get("activity", activity.id) : null;
    if (saved && saved.note) field.value = saved.note;

    function saveNote() {
      if (!progress.isAvailable()) {
        if (status) status.textContent = "No se pudo guardar en este navegador.";
        return;
      }
      const ok = progress.set("activity", activity.id, { note: field.value });
      if (status) {
        status.textContent = ok
          ? field.value.trim()
            ? "Guardado en este navegador."
            : "Respuesta borrada."
          : "No se pudo guardar.";
      }
    }

    button.addEventListener("click", saveNote);
    field.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        saveNote();
      }
    });
  }

  function showReflectionCheer(option, { animate = true } = {}) {
    const cheer = root.querySelector("[data-reflection-cheer]");
    if (!cheer || !option) return;
    cheer.hidden = false;
    cheer.innerHTML = `
      <div class="ficha-close__feedback${animate ? " ficha-close__feedback--pop" : ""}" role="status">
        <span class="ficha-close__spark" aria-hidden="true">✦</span>
        <img class="ficha-close__mascot" src="${STICKER}zorro.png" width="120" height="120" alt="" loading="lazy" decoding="async">
        <span class="ficha-close__feedback-copy">
          <strong>${esc(option.title)}</strong>
          <span>${esc(option.message)}</span>
        </span>
      </div>`;
    if (animate) {
      const card = cheer.querySelector(".ficha-close__feedback");
      if (card) {
        card.classList.remove("ficha-close__feedback--pop");
        void card.offsetWidth;
        card.classList.add("ficha-close__feedback--pop");
      }
    }
  }

  function setupReflection(activity) {
    const map = {
      enjoyed: "tried",
      hard: "practice",
      "another-day": "practice",
    };

    const saved = progress.isAvailable() ? progress.get("activity", activity.id) : null;
    if (saved && saved.state === "tried") {
      const input = root.querySelector('[name="reflection"][value="enjoyed"]');
      if (input) {
        input.checked = true;
        showReflectionCheer(REFLECTION.find((item) => item.id === "enjoyed"), { animate: false });
      }
    }

    root.querySelectorAll('[name="reflection"]').forEach((input) => {
      input.addEventListener("change", () => {
        const option = REFLECTION.find((item) => item.id === input.value);
        showReflectionCheer(option, { animate: true });
        if (!progress.isAvailable()) {
          const cheer = root.querySelector("[data-reflection-cheer]");
          if (cheer) {
            cheer.insertAdjacentHTML(
              "beforeend",
              `<p class="ficha-close__save-hint">Tu navegador no permite guardar ideas en este dispositivo.</p>`
            );
          }
          return;
        }
        progress.set("activity", activity.id, { state: map[input.value] || "explored" });
      });
    });
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const activity = id ? data.getActivity(id) : null;
  if (activity) render(activity);
  else notFound();
})();
