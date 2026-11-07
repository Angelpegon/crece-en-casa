/* Mi camino: estado inicial + progreso de experiencias guardadas. */
(function () {
  const { data, ui, progress, session } = window.CEC;
  const root = document.querySelector("[data-path-root]");
  if (!root || !ui) return;

  const esc = ui.escapeHTML;
  const GOAL = 6;
  const profile = session && session.get ? session.get() : null;

  const savedItems =
    progress && progress.isAvailable()
      ? progress.list().filter((item) => item.state === "tried" || item.type === "activity")
      : [];
  const uniqueKeys = [...new Set(savedItems.map((item) => item.key || `${item.type}:${item.id}`))];
  const savedCount = Math.min(uniqueKeys.length, GOAL);
  const isEmpty = savedCount === 0;

  const STICKER = "assets/img/stickers/";
  const CAMINO = "assets/img/camino/";
  const LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 10V8a5 5 0 0 1 10 0v2h.5A2.5 2.5 0 0 1 20 12.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10Zm2.5 0h5V8a2.5 2.5 0 0 0-5 0Zm2.5 4a1.5 1.5 0 0 0-.75 2.8V18a.75.75 0 0 0 1.5 0v-1.2A1.5 1.5 0 0 0 12 14Z"/></svg>`;

  /* Seis huellas del recorrido: las guardadas muestran su ícono, las demás un candado. */
  const STEPS = [
    { label: "Explora", icon: STICKER + "brote.png" },
    { label: "Comunica", icon: STICKER + "burbuja-chat.png" },
    { label: "Conecta", icon: STICKER + "corazon.png" },
    { label: "Comparte", icon: STICKER + "estrella-amarilla.png" },
    { label: "Descubre", icon: STICKER + "pregunta.png" },
    { label: "Celebra", icon: STICKER + "sol.png" },
  ];

  function growthSteps() {
    return `
      <ol class="camino-steps" aria-label="Huellas: ${savedCount} de ${GOAL}">
        ${STEPS.map((step, index) => {
          const done = index < savedCount;
          return `
          <li class="camino-step camino-step--${index + 1} ${done ? "is-done" : "is-locked"}">
            <span class="camino-step__dot">${
              done ? `<img src="${step.icon}" alt="" width="40" height="40" decoding="async">` : LOCK
            }</span>
            <span>${index + 1}.<br>${esc(step.label)}</span>
          </li>`;
        }).join("")}
      </ol>`;
  }

  const STAGES = [
    {
      icon: STICKER + "brote.png",
      title: "Primeras aventuras",
      text: "Las experiencias que compartan en casa empiezan a formar su camino.",
    },
    {
      icon: STICKER + "zorro.png",
      title: "Nuevos descubrimientos",
      text: "Se suman momentos de juego, palabras, gestos y conexión.",
    },
    {
      icon: STICKER + "sol.png",
      title: "La comunicación en lo cotidiano",
      text: "Reconoces oportunidades para comunicarse durante el día.",
    },
    {
      icon: STICKER + "hoja.png",
      title: "Seguir creciendo juntos",
      text: "Tu recorrido refleja las experiencias que han explorado como familia.",
    },
  ];

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
    if (entry.type === "challenge") return `cada-dia-una-oportunidad.html?id=${encodeURIComponent(entry.id)}`;
    return "experiencias.html";
  }

  function typeLabel(type) {
    if (type === "activity") return "Experiencia";
    if (type === "strategy") return "Idea";
    if (type === "challenge") return "Oportunidad";
    return type;
  }

  function iconFor(entry) {
    if (entry.type === "activity") return `${CAMINO}exp-${entry.id}.webp`;
    if (entry.type === "strategy") {
      const strategy = data.getStrategy(entry.id);
      if (strategy && strategy.icon) return strategy.icon;
    }
    return STICKER + "brote.png";
  }

  const uniqueEntries = savedItems.filter((entry, index, arr) => {
    const key = entry.key || `${entry.type}:${entry.id}`;
    return arr.findIndex((item) => (item.key || `${item.type}:${item.id}`) === key) === index;
  });

  const recentList = !isEmpty
    ? `<ul class="camino-exp__list">
        ${uniqueEntries
          .slice(0, 6)
          .map(
            (entry) => `
          <li>
            <a class="camino-exp__link" href="${hrefFor(entry)}">
              <img class="camino-exp__ico" src="${esc(iconFor(entry))}" alt="" decoding="async">
              <span>
                <span class="camino-exp__type">${esc(typeLabel(entry.type))}</span>
                <strong>${esc(labelFor(entry))}</strong>
              </span>
              <span class="camino-arrow" aria-hidden="true">${ui.icon("i-arrow")}</span>
            </a>
          </li>`
          )
          .join("")}
      </ul>`
    : "";

  const intro = isEmpty
    ? {
        title: "Tu primera huella está por comenzar",
        text: "Cuando termines una experiencia y elijas «Listo, guardar», se añadirá a este recorrido.",
      }
    : {
        title: "Tu camino ya tiene huellas",
        text: "Cada experiencia guardada suma al recorrido. Puedes seguir explorando cuando te sientas bien.",
      };

  root.innerHTML = `
    <div class="camino-page" data-camino-page>
      <div class="container">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <ol>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="mi-camino.html">Nuestro rincón</a></li>
            <li aria-current="page">Mi camino</li>
          </ol>
        </nav>

        <section class="camino-hero" aria-labelledby="page-title">
          <img class="camino-hero__art--wide" src="${CAMINO}hero-plate.webp" width="2000" height="646" alt="" fetchpriority="high">
          <img class="camino-hero__art--narrow" src="${CAMINO}hero-familia.webp" width="720" height="586"
            alt="Una mamá abraza a su hijo; los dos sonríen." fetchpriority="high">
          <div class="camino-hero__body">
            <p class="camino-hero__kicker">Un recorrido que empieza en casa</p>
            <h1 id="page-title">Mi camino <img class="camino-hero__star" src="${STICKER}estrella-amarilla.png" alt="" width="48" height="48"></h1>
            <p class="camino-hero__lead">
              Este espacio reúne las experiencias que compartas con tu hijo y te ayudará<br class="camino-br">
              a reconocer cómo los pequeños momentos cotidianos abren oportunidades<br class="camino-br">
              para comunicarse.
            </p>
            ${profile ? `<p class="camino-hero__hello">Hola, ${esc(profile.name)}. Aquí vas dejando sus huellas.</p>` : ""}
          </div>
          <aside class="camino-hero__note" aria-label="Pequeñas acciones, grandes conversaciones">
            <span class="camino-hero__note-ico" aria-hidden="true">💛</span>
            <div class="camino-hero__note-copy">
              <strong>Pequeñas acciones, grandes conversaciones</strong>
              <p>Tú también formas parte de la experiencia que vive tu hijo.</p>
            </div>
            <a class="camino-hero__note-link" href="ver-la-guia.html" aria-label="Ver la guía para cuidadores">${ui.icon("i-arrow")}</a>
          </aside>
        </section>

        <section class="camino-box camino-growth" aria-labelledby="growth-title">
          <div class="camino-box__head">
            <img class="camino-box__ico" src="${STICKER}brote.png" alt="" width="40" height="40" decoding="async">
            <div>
              <h2 id="growth-title">Tu crecimiento en familia</h2>
              <span class="camino-growth__count">Huellas: ${savedCount} de ${GOAL}</span>
            </div>
          </div>
          ${growthSteps()}
        </section>

        <div class="camino-duo">
          <section class="camino-box camino-areas" aria-labelledby="areas-title">
            <div class="camino-box__head">
              <img class="camino-box__ico" src="${STICKER}brote.png" alt="" width="40" height="40" decoding="async">
              <div>
                <h2 id="areas-title">Áreas que podrás explorar</h2>
                <p class="camino-box__sub">Cada experiencia tiene una intención comunicativa.</p>
              </div>
              <a class="camino-arrow" href="explorar-actividades.html" aria-label="Explorar actividades">${ui.icon("i-arrow")}</a>
            </div>
            <ul class="camino-areas__grid">
              <li class="camino-area camino-area--green"><span class="camino-area__tile"><img src="${STICKER}burbuja-chat.png" alt="" width="40" height="40" decoding="async"></span>Vocabulario</li>
              <li class="camino-area camino-area--pink"><span class="camino-area__tile"><img src="${STICKER}corazon.png" alt="" width="40" height="40" decoding="async"></span>Interacción</li>
              <li class="camino-area camino-area--yellow"><span class="camino-area__tile"><img src="${STICKER}bloques.png" alt="" width="40" height="40" decoding="async"></span>Rutinas y juego</li>
              <li class="camino-area camino-area--lavender"><span class="camino-area__tile"><svg aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-community"></use></svg></span>Comprensión</li>
            </ul>
          </section>

          <section class="camino-box camino-ritmo" aria-labelledby="ritmo-title">
            <div class="camino-box__head">
              <img class="camino-box__ico" src="${STICKER}diana.png" alt="" width="40" height="40" decoding="async">
              <div>
                <h2 id="ritmo-title">A tu propio ritmo</h2>
                <p>No es una competencia ni una prueba del desarrollo. Cada familia avanza a su propio ritmo. <span aria-hidden="true">💚</span></p>
              </div>
            </div>
          </section>
        </div>

        <div class="camino-section-head">
          <div>
            <h2 id="stages-title">Así crecerá tu camino <span aria-hidden="true">🌱</span></h2>
            <p>Cada experiencia que guardes irá dando forma a este recorrido.</p>
          </div>
          <span class="camino-tag">${
            isEmpty
              ? "Aún sin experiencias guardadas"
              : `${savedCount} experiencia${savedCount === 1 ? "" : "s"} en tu recorrido`
          }</span>
        </div>

        <section class="camino-box" aria-labelledby="stages-title">
          <ol class="camino-stages">
            ${[{ icon: STICKER + "estrella-amarilla.png", title: intro.title, text: intro.text }, ...STAGES]
              .map(
                (stage) => `
              <li class="camino-stage">
                <a href="experiencias.html">
                  <span class="camino-stage__icon" aria-hidden="true"><img src="${esc(stage.icon)}" alt="" width="36" height="36" decoding="async"></span>
                  <div>
                    <h3>${esc(stage.title)}</h3>
                    <p>${esc(stage.text)}</p>
                  </div>
                  <span class="camino-arrow" aria-hidden="true">${ui.icon("i-arrow")}</span>
                </a>
              </li>`
              )
              .join("")}
          </ol>
          <div class="camino-path-actions">
            <button class="btn btn--sage" type="button" data-camino-modal-open>¿Cómo se construye Mi camino? ${ui.icon("i-arrow")}</button>
          </div>
        </section>

        <div class="camino-bottom">
          <section class="camino-box camino-exp" aria-labelledby="exp-title">
            <div class="camino-box__head">
              <img class="camino-box__ico" src="${STICKER}sol.png" alt="" width="40" height="40" decoding="async">
              <div>
                <h2 id="exp-title">Tus experiencias</h2>
                <p class="camino-box__sub">${isEmpty ? "Aquí aparecerán cuando guardes la primera." : "Míralas guardadas en esta navegación."}</p>
              </div>
            </div>
            ${
              isEmpty
                ? `<div class="camino-empty">
                    <p>Esta sección se llenará después de que realicen una experiencia y la guarden. No necesitas completar todo hoy.</p>
                  </div>`
                : recentList
            }
            <div class="camino-exp__actions">
              <a class="btn btn--outline" href="experiencias.html"><span aria-hidden="true">⊕</span> Crear otra experiencia</a>
              <a class="btn btn--sage" href="ver-la-guia.html">Siguiente ${ui.icon("i-arrow")}</a>
            </div>
          </section>

          <aside class="camino-box camino-hint" aria-labelledby="hint-title">
            <div class="camino-box__head">
              <span class="camino-hint__ico" aria-hidden="true">💗</span>
              <div>
                <h2 id="hint-title">Un recordatorio para ti</h2>
                <p>No necesitas hacerlo perfecto. Observar lo que le interesa a tu hijo, acompañarlo con palabras y darle tiempo para responder son pequeñas acciones que hacen una gran diferencia.</p>
              </div>
            </div>
            <div class="camino-hint__art">
              <span class="camino-hint__artframe">
                <img src="${CAMINO}recordatorio.webp" width="900" height="775" alt="" loading="lazy" decoding="async">
              </span>
              <p class="camino-hint__bubble">“Pequeñas acciones, grandes conversaciones.”</p>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <div class="camino-modal" data-camino-modal hidden aria-hidden="true">
      <div class="camino-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="camino-modal-title" tabindex="-1">
        <button class="camino-modal__close" type="button" data-camino-modal-close aria-label="Cerrar">×</button>
        <h2 id="camino-modal-title">¿Cómo se construye Mi camino?</h2>
        <ol class="camino-modal__steps">
          <li><strong>Exploran:</strong> eliges un área y realizan una experiencia en casa.</li>
          <li><strong>Guardan:</strong> al finalizar, pulsas «Listo, guardar» en la experiencia.</li>
          <li><strong>Aparece la huella:</strong> Mi camino registra esa experiencia y muestra el recorrido de la familia.</li>
          <li><strong>Continúan:</strong> la <a href="ver-la-guia.html">guía para cuidadores</a> ofrece ideas y oportunidades para probar cuando les resulte útil.</li>
        </ol>
        <button class="btn btn--sage" type="button" data-camino-modal-close>Entendido</button>
      </div>
    </div>`;

  const page = root.querySelector("[data-camino-page]");
  const modal = root.querySelector("[data-camino-modal]");
  const dialog = modal?.querySelector(".camino-modal__dialog");
  let lastOpener = null;

  function focusables(container) {
    return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );
  }

  function openModal(opener) {
    if (!modal || !dialog) return;
    lastOpener = opener || null;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    if (page) page.setAttribute("inert", "");
    document.body.classList.add("camino-modal-open");
    dialog.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (page) page.removeAttribute("inert");
    document.body.classList.remove("camino-modal-open");
    if (lastOpener && typeof lastOpener.focus === "function") lastOpener.focus();
    lastOpener = null;
  }

  root.addEventListener("click", (event) => {
    const openBtn = event.target.closest("[data-camino-modal-open]");
    if (openBtn) {
      openModal(openBtn);
      return;
    }
    if (event.target.closest("[data-camino-modal-close]")) {
      closeModal();
      return;
    }
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!modal || modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab" || !dialog) return;
    const items = focusables(dialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
