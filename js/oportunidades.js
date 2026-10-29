/* Cada día, una oportunidad: lista con flujo inline Ver / Explorar / Dejar para otro momento. */
(function () {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-challenges]");
  if (!root || !data || !ui) return;

  const esc = ui.escapeHTML;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PEND_KEY = "crece-en-casa:opp-pend";

  const CLOSE_OPTIONS = [
    { id: "worked", label: "Sí, me funcionó.", state: "tried" },
    { id: "again", label: "Lo intentaré de nuevo.", state: "practice" },
    { id: "other", label: "Necesito otra idea.", state: "practice" },
  ];

  let openId = "";
  let mode = ""; // ver | hacer
  let choiceId = "";
  let closeId = "";
  let checkedSteps = {};
  let pending = readPending();
  let flashMsg = "";

  function readPending() {
    try {
      const raw = JSON.parse(localStorage.getItem(PEND_KEY) || "[]");
      return Array.isArray(raw) ? raw.filter((id) => data.getChallenge(id)) : [];
    } catch (error) {
      return [];
    }
  }

  function writePending(list) {
    pending = list;
    try {
      localStorage.setItem(PEND_KEY, JSON.stringify(list));
    } catch (error) {
      /* ignore */
    }
  }

  function tipTone(tone) {
    if (tone === "pink" || tone === "coral") return "coral";
    if (tone === "green" || tone === "sage") return "sage";
    if (tone === "yellow") return "yellow";
    if (tone === "lavender") return "lavender";
    return "coral";
  }

  function isDone(id) {
    if (!progress || !progress.isAvailable()) return false;
    const entry = progress.get("challenge", id);
    return entry && entry.state === "tried";
  }

  function isPending(id) {
    return pending.indexOf(id) > -1;
  }

  function markExplored(id) {
    if (progress && progress.isAvailable()) {
      progress.set("challenge", id, { state: "explored" });
    }
  }

  function strategyChips(challenge) {
    return (challenge.strategyIds || [])
      .map((id) => data.getStrategy(id))
      .filter(Boolean)
      .map(
        (strategy) =>
          `<a class="opp-item__chip" href="${ui.strategyUrl(strategy)}">Idea: ${esc(strategy.title)}</a>`
      )
      .join("");
  }

  function activityChips(challenge) {
    return (challenge.activityIds || [])
      .map((id) => data.getActivity(id))
      .filter(Boolean)
      .map(
        (activity) =>
          `<a class="opp-item__chip" href="${ui.activityUrl(activity)}">Actividad: ${esc(activity.title)}</a>`
      )
      .join("");
  }

  function previewChips(challenge) {
    const bits = [];
    const strategies = (challenge.strategyIds || [])
      .map((id) => data.getStrategy(id))
      .filter(Boolean)
      .map((s) => s.title);
    if (strategies.length) {
      bits.push(
        `<span class="opp-item__tag"><span class="opp-item__tag-ico" aria-hidden="true">🎯</span> Practicas: ${esc(strategies.join(" · "))}</span>`
      );
    }
    const activity = (challenge.activityIds || []).map((id) => data.getActivity(id)).find(Boolean);
    if (activity) {
      bits.push(
        `<span class="opp-item__tag"><span class="opp-item__tag-ico" aria-hidden="true">🧩</span> ${esc(activity.title)}</span>`
      );
    }
    const steps = challenge.steps || [];
    if (steps.length) {
      bits.push(
        `<span class="opp-item__tag"><span class="opp-item__tag-ico" aria-hidden="true">✓</span> ${steps.length} pasos sencillos</span>`
      );
    }
    return bits.join("");
  }

  function statusBits(id) {
    const bits = [];
    if (isDone(id)) {
      bits.push('<span class="opp-item__status opp-item__status--done"><span aria-hidden="true">✓</span> Hecho</span>');
    }
    if (isPending(id)) {
      bits.push('<span class="opp-item__status opp-item__status--later"><span aria-hidden="true">🔖</span> Para después</span>');
    }
    return bits.join("");
  }

  function sceneBlock(challenge) {
    if (!challenge.scene) return "";
    return `
      <div class="opp-scene" aria-hidden="true">
        <div class="opp-scene__emoji">${challenge.scene}</div>
        ${
          challenge.sceneCaption
            ? `<div class="opp-scene__caption">${esc(challenge.sceneCaption)}</div>`
            : ""
        }
      </div>`;
  }

  function quoteBubbles(text) {
    const matches = String(text || "").match(/«[^»]+»/g) || [];
    return matches.map((item) => item.slice(1, -1));
  }

  function optionsReadOnly(challenge) {
    return `
      <div class="opp-item__block opp-reveal" style="--opp-delay:0.06s">
        <h4 class="opp-item__label">${esc(challenge.question)}</h4>
        <p class="opp-item__fine">Al hacerlo podrás elegir la que más se parezca a ti. No hay una calificación para la familia.</p>
        <ul class="opp-item__ops-read">
          ${challenge.options.map((option) => `<li>${esc(option.text)}</li>`).join("")}
        </ul>
      </div>`;
  }

  function optionsInteractive(challenge) {
    return `
      <div class="opp-item__block opp-reveal" style="--opp-delay:0.06s">
        <h4 class="opp-item__label">${esc(challenge.question)}</h4>
        <p class="opp-item__fine">Elige la opción que más se parezca a lo que harías. No hay una calificación para la familia.</p>
        <div class="opp-item__ops">
          ${challenge.options
            .map((option) => {
              const selected = choiceId === option.id;
              const locked = Boolean(choiceId);
              return `
                <button
                  class="opp-choice${selected ? " is-selected" : ""}"
                  type="button"
                  data-opp-choice="${esc(option.id)}"
                  ${locked && !selected ? "disabled" : ""}
                >${esc(option.text)}</button>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  function ideaBlock(challenge, delay = "0.1s") {
    const quotes = quoteBubbles(challenge.example);
    const lead = String(challenge.example || "").replace(/«[^»]+»/g, "").trim();
    return `
      <div class="opp-item__deck opp-reveal" style="--opp-delay:${delay}">
        <p class="opp-item__label">Una idea para probar</p>
        ${lead ? `<p class="opp-item__deck-lead">${esc(lead)}</p>` : ""}
        ${quotes.map((quote) => `<div class="opp-bub opp-bub--adult">${esc(quote)}</div>`).join("")}
        <div class="opp-bub opp-bub--kid opp-bub--typing" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="opp-item__fine">Dale espacio: responde a cualquier forma de participar.</p>
      </div>`;
  }

  function stepsBlock(challenge, interactive) {
    const steps = challenge.steps || [];
    if (!steps.length) return "";
    const checked = checkedSteps[challenge.id] || {};
    return `
      <div class="opp-item__block opp-reveal" style="--opp-delay:0.14s">
        <h4 class="opp-item__label">Pasos sencillos</h4>
        <div class="opp-item__steps">
          ${steps
            .map((step, index) => {
              if (!interactive) {
                return `<div class="opp-item__step">${esc(step)}</div>`;
              }
              const on = Boolean(checked[index]);
              return `
                <button
                  class="opp-check${on ? " is-on" : ""}"
                  type="button"
                  data-opp-step="${index}"
                  aria-pressed="${on ? "true" : "false"}"
                >
                  <span class="opp-check__mark" aria-hidden="true">${on ? "✓" : ""}</span>
                  <span>${esc(step)}</span>
                </button>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  function rememberBlock(challenge) {
    if (!challenge.remember) return "";
    return `
      <div class="opp-item__note opp-reveal" style="--opp-delay:0.18s">
        <strong>Recuerda:</strong> ${esc(challenge.remember)}
      </div>`;
  }

  function relatedBlock(challenge) {
    const chips = `${strategyChips(challenge)}${activityChips(challenge)}`;
    if (!chips) return "";
    return `
      <div class="opp-item__block opp-reveal" style="--opp-delay:0.2s">
        <h4 class="opp-item__label">Relacionado</h4>
        <div class="opp-item__chips">${chips}</div>
      </div>`;
  }

  function closeBlock(challenge) {
    return `
      <div class="opp-item__block opp-reveal" style="--opp-delay:0.22s" data-opp-close>
        <h4 class="opp-item__label">¿Cómo te fue?</h4>
        <p class="opp-item__fine">Es voluntario.</p>
        <div class="opp-item__ops" role="group" aria-label="Cierre de la oportunidad">
          ${CLOSE_OPTIONS.map(
            (option) => `
            <button
              class="opp-choice${closeId === option.id ? " is-selected" : ""}"
              type="button"
              data-opp-close-opt="${esc(option.id)}"
            >${esc(option.label)}</button>`
          ).join("")}
        </div>
        <p class="opp-item__status-line" data-opp-close-status role="status"></p>
      </div>`;
  }

  function flowPanel(challenge) {
    if (mode === "ver") {
      return `
        <div class="opp-item__flow">
          ${sceneBlock(challenge)}
          <p class="opp-item__situation opp-reveal" style="--opp-delay:0.02s">${esc(challenge.situation)}</p>
          ${optionsReadOnly(challenge)}
          ${ideaBlock(challenge)}
          ${stepsBlock(challenge, false)}
          ${rememberBlock(challenge)}
          ${relatedBlock(challenge)}
          <div class="opp-item__actions opp-reveal" style="--opp-delay:0.24s">
            <button class="btn" type="button" data-opp-hacer="${esc(challenge.id)}"><span aria-hidden="true">▶</span> Explorar qué harías</button>
            <button class="btn btn--outline" type="button" data-opp-close-panel>Cerrar</button>
          </div>
        </div>`;
    }

    const chosen = challenge.options.find((option) => option.id === choiceId);
    return `
      <div class="opp-item__flow">
        ${sceneBlock(challenge)}
        <p class="opp-item__situation opp-reveal" style="--opp-delay:0.02s">${esc(challenge.situation)}</p>
        ${optionsInteractive(challenge)}
        ${
          chosen
            ? `
          <div class="opp-item__feedback opp-reveal" style="--opp-delay:0.08s" role="status">
            <p>${esc(chosen.feedback)}</p>
          </div>
          ${ideaBlock(challenge, "0.12s")}
          ${stepsBlock(challenge, true)}
          ${rememberBlock(challenge)}
          ${relatedBlock(challenge)}
          ${closeBlock(challenge)}
          <div class="opp-item__actions opp-reveal" style="--opp-delay:0.26s">
            <button class="btn btn--outline" type="button" data-opp-close-panel>Cerrar</button>
          </div>`
            : `
          <div class="opp-item__actions opp-reveal" style="--opp-delay:0.12s">
            <button class="btn btn--outline" type="button" data-opp-close-panel>Cerrar</button>
          </div>`
        }
      </div>`;
  }

  function renderItem(challenge) {
    const tone = tipTone(challenge.tone);
    const open = openId === challenge.id;
    return `
      <li class="opp-item opp-item--${tone}${open ? " is-open" : ""}${mode && open ? ` is-${mode}` : ""}" data-opp-id="${esc(challenge.id)}">
        <div class="opp-item__preview">
          <div class="opp-item__meta">
            <span class="opp-item__eyebrow">${esc(challenge.tag)}</span>
            ${statusBits(challenge.id)}
          </div>
          <h3 class="opp-item__title">${esc(challenge.title)}</h3>
          <p class="opp-item__hook"><span class="opp-item__hook-ico" aria-hidden="true">💭</span> ${esc(challenge.hook || challenge.question)}</p>
          ${!open ? sceneBlock(challenge) : ""}
          <p class="opp-item__intro">${esc(challenge.intro || challenge.situation)}</p>
          <div class="opp-item__tags">${previewChips(challenge)}</div>
          <div class="opp-item__ctas">
            <button class="btn btn--outline" type="button" data-opp-ver="${esc(challenge.id)}"><span aria-hidden="true">👀</span> Ver cómo acompañar</button>
            <button class="btn" type="button" data-opp-hacer="${esc(challenge.id)}"><span aria-hidden="true">▶</span> Explorar qué harías</button>
            <button class="btn btn--outline" type="button" data-opp-later="${esc(challenge.id)}"><span aria-hidden="true">🔖</span> Dejar para otro momento</button>
          </div>
        </div>
        <div class="opp-item__body" ${open ? "" : "inert"}>
          <div class="opp-item__body-inner">
            ${open ? flowPanel(challenge) : ""}
          </div>
        </div>
      </li>`;
  }

  function pendingBox() {
    if (!pending.length && !flashMsg) return "";
    return `
      <div class="opp-pending" data-opp-pending>
        ${
          flashMsg
            ? `<p class="opp-pending__msg" role="status">${esc(flashMsg)}</p>`
            : ""
        }
        ${
          pending.length
            ? `
          <h3 class="opp-pending__title"><span aria-hidden="true">🔖</span> Para otro momento</h3>
          <div class="opp-item__chips">
            ${pending
              .map((id) => {
                const challenge = data.getChallenge(id);
                if (!challenge) return "";
                return `<button class="opp-item__chip opp-item__chip--btn" type="button" data-opp-resume="${esc(id)}">Retomar: ${esc(challenge.title)}</button>`;
              })
              .join("")}
          </div>`
            : ""
        }
      </div>`;
  }

  function animateHeight(panel, open) {
    if (!panel) return;
    if (reduceMotion) {
      panel.classList.remove("is-animating");
      panel.ontransitionend = null;
      panel.style.height = open ? "auto" : "0px";
      return;
    }
    const from = panel.getBoundingClientRect().height;
    panel.ontransitionend = null;
    panel.style.height = `${from}px`;
    panel.classList.add("is-animating");
    if (open) {
      panel.style.height = "auto";
      const to = panel.scrollHeight;
      panel.style.height = `${from}px`;
      void panel.offsetHeight;
      requestAnimationFrame(() => {
        panel.style.height = `${to}px`;
      });
      panel.ontransitionend = (event) => {
        if (event.target !== panel || event.propertyName !== "height") return;
        panel.classList.remove("is-animating");
        panel.ontransitionend = null;
        panel.style.height = "auto";
      };
      return;
    }
    void panel.offsetHeight;
    requestAnimationFrame(() => {
      panel.style.height = "0px";
    });
    panel.ontransitionend = (event) => {
      if (event.target !== panel || event.propertyName !== "height") return;
      panel.classList.remove("is-animating");
      panel.ontransitionend = null;
      panel.style.height = "0px";
    };
  }

  function mount({ animate = false, keepScroll = true } = {}) {
    const y = keepScroll ? window.scrollY : 0;
    const prevOpen = root.querySelector(".opp-item.is-open .opp-item__body");
    const prevHeight = prevOpen ? prevOpen.getBoundingClientRect().height : 0;

    root.innerHTML = `
      ${pendingBox()}
      <ul class="opp-list" data-opp-list>
        ${data.challenges.map(renderItem).join("")}
      </ul>`;

    flashMsg = "";

    const list = root.querySelector("[data-opp-list]");
    if (!list) return;

    list.querySelectorAll(".opp-item").forEach((item) => {
      const body = item.querySelector(".opp-item__body");
      const open = item.classList.contains("is-open");
      if (!body) return;
      if (!animate) {
        body.style.height = open ? "auto" : "0px";
        return;
      }
      if (open) {
        body.style.height = `${prevHeight}px`;
        animateHeight(body, true);
      } else {
        body.style.height = "0px";
      }
    });

    if (closeId) {
      const status = root.querySelector("[data-opp-close-status]");
      if (status) status.textContent = "Respuesta guardada en este navegador.";
    }

    if (keepScroll) window.scrollTo(0, y);

    if (openId && !reduceMotion) {
      const item = root.querySelector(`[data-opp-id="${CSS.escape(openId)}"]`);
      item?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function openFlow(id, nextMode) {
    openId = id;
    mode = nextMode;
    choiceId = "";
    closeId = "";
    markExplored(id);
    if (nextMode === "hacer") {
      writePending(pending.filter((item) => item !== id));
    }
    mount({ animate: true });
  }

  function closeFlow() {
    openId = "";
    mode = "";
    choiceId = "";
    closeId = "";
    mount({ animate: true });
  }

  root.addEventListener("click", (event) => {
    const ver = event.target.closest("[data-opp-ver]");
    if (ver) {
      openFlow(ver.getAttribute("data-opp-ver"), "ver");
      return;
    }

    const hacer = event.target.closest("[data-opp-hacer]");
    if (hacer) {
      openFlow(hacer.getAttribute("data-opp-hacer"), "hacer");
      return;
    }

    const later = event.target.closest("[data-opp-later]");
    if (later) {
      const id = later.getAttribute("data-opp-later");
      if (!isPending(id)) writePending(pending.concat(id));
      if (progress && progress.isAvailable()) {
        progress.set("challenge", id, { state: "practice" });
      }
      flashMsg = "Quedó guardado para otro momento. Vuelve cuando quieras, sin prisa.";
      if (openId === id) {
        openId = "";
        mode = "";
        choiceId = "";
        closeId = "";
      }
      mount({ animate: true });
      return;
    }

    const resume = event.target.closest("[data-opp-resume]");
    if (resume) {
      openFlow(resume.getAttribute("data-opp-resume"), "hacer");
      return;
    }

    if (event.target.closest("[data-opp-close-panel]")) {
      closeFlow();
      return;
    }

    const choice = event.target.closest("[data-opp-choice]");
    if (choice && !choice.disabled) {
      choiceId = choice.getAttribute("data-opp-choice");
      markExplored(openId);
      mount({ animate: true });
      return;
    }

    const stepBtn = event.target.closest("[data-opp-step]");
    if (stepBtn && openId) {
      const index = Number(stepBtn.getAttribute("data-opp-step"));
      const map = Object.assign({}, checkedSteps[openId] || {});
      map[index] = !map[index];
      checkedSteps[openId] = map;
      mount({ animate: false, keepScroll: true });
      return;
    }

    const closeOpt = event.target.closest("[data-opp-close-opt]");
    if (closeOpt && openId) {
      const id = closeOpt.getAttribute("data-opp-close-opt");
      const option = CLOSE_OPTIONS.find((item) => item.id === id);
      closeId = id;
      if (option && progress && progress.isAvailable()) {
        progress.set("challenge", openId, { state: option.state });
      }
      if (option && option.state === "tried") {
        writePending(pending.filter((item) => item !== openId));
      }
      mount({ animate: false, keepScroll: true });
    }
  });

  root.classList.remove("tip-grid", "tip-grid--two");
  root.classList.add("opp-root");

  const params = new URLSearchParams(window.location.search);
  const deepId = params.get("id");
  const deepMode = params.get("mode") === "ver" ? "ver" : "hacer";
  if (deepId && data.getChallenge(deepId)) {
    openId = deepId;
    mode = deepMode;
    markExplored(deepId);
    writePending(pending.filter((item) => item !== deepId));
  }

  mount({ animate: false, keepScroll: false });
})();
