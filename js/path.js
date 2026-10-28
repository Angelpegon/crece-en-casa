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

  function progressFill(count, total) {
    if (!total || count <= 0) return 0;
    if (count >= total) return 100;
    if (total === 1) return 100;
    return ((count - 1) / (total - 1)) * 100;
  }

  function growthProgress() {
    const label = savedCount > 0
      ? `Huellas · ${savedCount} de ${GOAL}`
      : `${GOAL} experiencias para guardar`;
    const steps = Array.from({ length: GOAL }, (_, index) => {
      const done = index < savedCount;
      return `<span class="${done ? "is-done" : ""}">${done ? "✓" : index + 1}</span>`;
    }).join("");
    return `
      <div
        class="exp-activity-progress camino-growth__progress"
        role="progressbar"
        aria-label="${label}"
        aria-valuemin="0"
        aria-valuemax="${GOAL}"
        aria-valuenow="${savedCount}"
      >
        <span class="exp-activity-progress__label">${label}</span>
        <div class="exp-activity-progress__meter">
          <span class="exp-activity-progress__track"><span style="width:${progressFill(savedCount, GOAL)}%"></span></span>
          <span class="exp-activity-progress__steps" aria-hidden="true">${steps}</span>
        </div>
      </div>`;
  }

  const STAGES = [
    {
      emoji: "🌱",
      title: "Primeros momentos",
      text: "Las experiencias que compartan en casa empiezan a formar su camino.",
    },
    {
      emoji: "🧸",
      title: "Nuevos descubrimientos",
      text: "Se suman momentos de juego, palabras, gestos y conexión.",
    },
    {
      emoji: "🌼",
      title: "La comunicación en lo cotidiano",
      text: "Reconoces oportunidades para comunicarse durante el día.",
    },
    {
      emoji: "🌳",
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

  const plantsSvg = `
    <svg class="camino-growth__art" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <line x1="10" y1="90" x2="110" y2="90" stroke="#9bb89a" stroke-width="3.5" stroke-linecap="round"/>
      <g stroke="#6f9b72" stroke-width="3" stroke-linecap="round" fill="#6f9b72">
        <path d="M30 90 V52" fill="none"/>
        <ellipse cx="21" cy="56" rx="11" ry="6.5" transform="rotate(-30 21 56)"/>
        <ellipse cx="39" cy="48" rx="11" ry="6.5" transform="rotate(28 39 48)"/>
        <ellipse cx="26" cy="40" rx="8.5" ry="5.5" transform="rotate(-12 26 40)"/>
      </g>
      <g stroke="#4f7f55" stroke-width="3.2" stroke-linecap="round" fill="#4f7f55">
        <path d="M60 90 V30" fill="none"/>
        <ellipse cx="48" cy="44" rx="13" ry="7.5" transform="rotate(-34 48 44)"/>
        <ellipse cx="72" cy="36" rx="13" ry="7.5" transform="rotate(30 72 36)"/>
        <ellipse cx="53" cy="26" rx="9.5" ry="6" transform="rotate(-10 53 26)"/>
        <ellipse cx="67" cy="22" rx="8.5" ry="5.5" transform="rotate(20 67 22)"/>
      </g>
      <g stroke="#7eae7f" stroke-width="3" stroke-linecap="round" fill="#7eae7f">
        <path d="M90 90 V58" fill="none"/>
        <ellipse cx="81" cy="64" rx="10" ry="5.5" transform="rotate(-26 81 64)"/>
        <ellipse cx="99" cy="60" rx="10" ry="5.5" transform="rotate(24 99 60)"/>
        <ellipse cx="90" cy="50" rx="7.5" ry="4.5"/>
      </g>
    </svg>`;

  const recentList = !isEmpty
    ? `<ul class="camino-recent">
        ${savedItems
          .filter((entry, index, arr) => {
            const key = entry.key || `${entry.type}:${entry.id}`;
            return arr.findIndex((item) => (item.key || `${item.type}:${item.id}`) === key) === index;
          })
          .slice(0, 6)
          .map(
            (entry) => `
          <li>
            <a class="camino-recent__link" href="${hrefFor(entry)}">
              <span class="camino-recent__type">${esc(typeLabel(entry.type))}</span>
              <strong>${esc(labelFor(entry))}</strong>
            </a>
          </li>`
          )
          .join("")}
      </ul>`
    : "";

  root.innerHTML = `
    <div class="camino-page" data-camino-page>
      <section class="camino-hero" aria-labelledby="page-title">
        <div class="container camino-hero__grid">
          <div class="camino-hero__copy">
            <nav class="breadcrumb" aria-label="Ruta de navegación">
              <ol>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="nuestro-rincon.html">Nuestro rincón</a></li>
                <li aria-current="page">Mi camino</li>
              </ol>
            </nav>
            <p class="camino-hero__kicker">Un recorrido que empieza en casa</p>
            <h1 id="page-title">Mi camino <span class="camino-hero__spark" aria-hidden="true">✦</span></h1>
            <p class="camino-hero__lead">
              Este espacio reunirá las experiencias que compartas con tu hijo y te ayudará a reconocer
              cómo los pequeños momentos cotidianos abren oportunidades para comunicarse.
            </p>
            ${
              profile
                ? `<p class="camino-hero__hello">Hola, ${esc(profile.name)}. Aquí vas dejando las huellas de lo que viven juntos.</p>`
                : ""
            }
          </div>
          <aside class="camino-hero__note">
            <span class="camino-hero__note-ico" aria-hidden="true">💛</span>
            <div>
              <strong>Pequeñas acciones, grandes conversaciones</strong>
              <p>Tu recorrido se forma con las experiencias que viven juntos.</p>
            </div>
          </aside>
        </div>
      </section>

      <section class="section" aria-label="Resumen de Mi camino">
        <div class="container camino-summary">
          <article class="camino-card camino-card--growth">
            <div class="camino-growth">
              <div class="camino-growth__visual">${plantsSvg}</div>
              <div class="camino-growth__copy">
                <h2>Tu crecimiento en familia</h2>
                ${growthProgress()}
                <p class="camino-growth__hint">Tu recorrido se irá construyendo con cada experiencia guardada.</p>
              </div>
            </div>
          </article>

          <article class="camino-card">
            <div class="camino-card__head">
              <div>
                <h2>Áreas que podrán explorar</h2>
                <p class="camino-card__muted">Cada experiencia tiene una intención comunicativa.</p>
              </div>
              <span class="camino-card__emoji" aria-hidden="true">🌱</span>
            </div>
            <div class="camino-chips" aria-label="Áreas comunicativas">
              <span class="camino-chip">Vocabulario</span>
              <span class="camino-chip camino-chip--pink">Interacción</span>
              <span class="camino-chip camino-chip--yellow">Palabras y frases</span>
              <span class="camino-chip">Comprensión</span>
            </div>
          </article>

          <article class="camino-card">
            <div class="camino-card__head">
              <div>
                <h2>A tu propio ritmo</h2>
                <p class="camino-card__muted">No es una competencia ni una prueba del desarrollo.</p>
              </div>
              <span class="camino-card__emoji" aria-hidden="true">🧭</span>
            </div>
            <p class="camino-card__support">Cada familia avanza a su propio ritmo. <span aria-hidden="true">💚</span></p>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="stages-title">
        <div class="container">
          <div class="camino-section-head">
            <div>
              <h2 id="stages-title">Así crecerá tu camino <span aria-hidden="true">🌱</span></h2>
              <p>Cada experiencia que guardes irá dando forma a este recorrido</p>
            </div>
            <span class="camino-tag">${
              isEmpty
                ? "Vista previa · Aún sin experiencias guardadas"
                : `${savedCount} experiencia${savedCount === 1 ? "" : "s"} en tu recorrido`
            }</span>
          </div>

          <div class="camino-path-card">
            <div class="camino-path-intro">
              <span class="camino-path-intro__ico" aria-hidden="true">✨</span>
              <div>
                <strong>${isEmpty ? "Tu primera huella está por comenzar" : "Tu camino ya tiene huellas"}</strong>
                <p>
                  ${
                    isEmpty
                      ? "Cuando termines una experiencia y elijas «Listo, guardar», se añadirá a este recorrido. Aquí podrás volver a verla y descubrir nuevas ideas para la vida diaria."
                      : "Cada experiencia guardada suma al recorrido. Puedes seguir explorando cuando les venga bien."
                  }
                </p>
              </div>
            </div>

            <ol class="camino-stages">
              ${STAGES.map(
                (stage, index) => `
                <li class="camino-stage">
                  <span class="camino-stage__icon" aria-hidden="true">${stage.emoji}</span>
                  <div>
                    <h3 class="camino-stage__title">${esc(stage.title)}</h3>
                    <p>${esc(stage.text)}</p>
                  </div>
                </li>`
              ).join("")}
            </ol>

            <div class="camino-path-actions">
              <button class="btn btn--sage" type="button" data-camino-modal-open>¿Cómo se construye Mi camino?</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section" aria-label="Experiencias y recordatorio">
        <div class="container camino-bottom">
          <article class="camino-card camino-card--empty">
            ${
              isEmpty
                ? `
              <div class="camino-empty">
                <div class="camino-empty__art" aria-hidden="true">🏡</div>
                <div>
                  <h2>Aquí aparecerán sus experiencias</h2>
                  <p>Esta sección se llenará después de que realicen una experiencia y la guarden. No necesitas completar todo hoy: pueden volver cuando quieran.</p>
                  <a class="btn btn--outline" href="experiencias.html">Ir a Experiencias ${ui.icon("i-arrow")}</a>
                </div>
              </div>`
                : `
              <h2>Sus experiencias</h2>
              <p class="camino-card__muted">Huellas guardadas en este navegador.</p>
              ${recentList}
              <p class="camino-bottom__cta">
                <a class="btn btn--outline" href="experiencias.html">Crear otra experiencia</a>
                <a class="btn btn--sage" href="guia-cuidadores.html">Siguiente ${ui.icon("i-arrow")}</a>
              </p>`
            }
          </article>

          <aside class="camino-hint">
            <span class="camino-hint__ico" aria-hidden="true">💗</span>
            <div>
              <h2>Un recordatorio para ti</h2>
              <p>No necesitas hacerlo perfecto. Observar lo que le interesa a tu hijo, acompañarlo con palabras y darle tiempo para responder son pequeñas acciones que favorecen la comunicación.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>

    <div class="camino-modal" data-camino-modal hidden aria-hidden="true">
      <div class="camino-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="camino-modal-title" tabindex="-1">
        <button class="camino-modal__close" type="button" data-camino-modal-close aria-label="Cerrar">×</button>
        <h2 id="camino-modal-title">¿Cómo se construye Mi camino?</h2>
        <ol class="camino-modal__steps">
          <li><strong>Exploran:</strong> eliges un área y realizan una experiencia en casa.</li>
          <li><strong>Guardan:</strong> al finalizar, pulsas «Listo, guardar» en la experiencia.</li>
          <li><strong>Aparece la huella:</strong> Mi camino registra esa experiencia y muestra el recorrido de la familia.</li>
          <li><strong>Continúan:</strong> la <a href="guia-cuidadores.html">guía para cuidadores</a> ofrece ideas y oportunidades para probar cuando les resulte útil.</li>
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
