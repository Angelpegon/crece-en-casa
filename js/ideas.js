/* Lista de Ideas que acompañan: acordeón en móvil; todas abiertas en desktop. */
(function () {
  const { data, ui } = window.CEC;
  const root = document.querySelector("[data-strategies]");
  if (!root || !data || !ui) return;

  const esc = ui.escapeHTML;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopMq = window.matchMedia("(min-width: 64em)");
  let desktopOpen = desktopMq.matches;
  let openId = "";
  let moreId = "";

  function tipTone(tone) {
    if (tone === "pink" || tone === "coral") return "coral";
    if (tone === "green" || tone === "sage") return "sage";
    if (tone === "yellow") return "yellow";
    if (tone === "lavender") return "lavender";
    return "sage";
  }

  function relatedChips(strategy) {
    const chips = [];
    (strategy.activityIds || []).forEach((id) => {
      const activity = data.getActivity(id);
      if (!activity) return;
      chips.push(
        `<a class="idea-item__chip" href="${ui.activityUrl(activity)}">Actividad: ${esc(activity.title)}</a>`
      );
    });
    (strategy.challengeIds || []).forEach((id) => {
      const challenge = data.getChallenge(id);
      if (!challenge) return;
      chips.push(
        `<a class="idea-item__chip" href="${ui.challengeUrl(challenge)}">Oportunidad: ${esc(challenge.title)}</a>`
      );
    });
    if (!chips.length) return "";
    return `
      <div class="idea-item__block idea-item__reveal" style="--idea-delay:0.14s">
        <h4 class="idea-item__label">Relacionado</h4>
        <div class="idea-item__chips">${chips.join("")}</div>
      </div>`;
  }

  function renderItem(strategy) {
    const tone = tipTone(strategy.tone);
    return `
      <li class="idea-item idea-item--${tone}" data-idea-id="${esc(strategy.id)}">
        <button
          class="idea-item__head"
          type="button"
          data-idea-toggle="${esc(strategy.id)}"
          aria-expanded="false"
          aria-controls="idea-panel-${esc(strategy.id)}"
          id="idea-head-${esc(strategy.id)}"
        >
          <span class="idea-item__badge" aria-hidden="true">${strategy.emoji || strategy.number}</span>
          <span class="idea-item__head-copy">
            <span class="idea-item__eyebrow">Idea ${strategy.number} de ${data.strategies.length} · Estrategia para el día a día</span>
            <span class="idea-item__title">${esc(strategy.title)}</span>
          </span>
          <span class="idea-item__chevron" aria-hidden="true"></span>
        </button>
        <div
          class="idea-item__body"
          id="idea-panel-${esc(strategy.id)}"
          role="region"
          aria-labelledby="idea-head-${esc(strategy.id)}"
          inert
        >
          <div class="idea-item__body-inner">
            <div class="idea-item__block idea-item__reveal" style="--idea-delay:0.06s">
              <h4 class="idea-item__label">Qué hacer</h4>
              <p>${esc(strategy.what)}</p>
            </div>
            <div class="idea-item__block idea-item__reveal" style="--idea-delay:0.12s">
              <h4 class="idea-item__label">Ejemplo</h4>
              <p class="idea-item__example">${esc(strategy.example)}</p>
            </div>
            <div class="idea-item__actions idea-item__reveal" style="--idea-delay:0.18s">
              <button
                class="btn btn--outline"
                type="button"
                data-idea-more-toggle="${esc(strategy.id)}"
                aria-expanded="false"
              >Ver más</button>
            </div>
            <div class="idea-item__more" data-idea-more inert>
              <div class="idea-item__more-inner">
                <div class="idea-item__block idea-item__reveal" style="--idea-delay:0.06s">
                  <h4 class="idea-item__label">Pista rápida</h4>
                  <p>${esc(strategy.tip)}</p>
                </div>
                ${
                  strategy.remember
                    ? `<div class="idea-item__note idea-item__reveal" style="--idea-delay:0.1s"><strong>Recuerda:</strong> ${esc(strategy.remember)}</div>`
                    : ""
                }
                ${relatedChips(strategy)}
                <p class="idea-item__ficha idea-item__reveal" style="--idea-delay:0.18s">
                  <a class="btn btn--outline" href="${ui.strategyUrl(strategy)}">Ver ficha completa ${ui.icon("i-arrow")}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>`;
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

  function isItemOpen(id) {
    return desktopOpen || openId === id;
  }

  function syncUi({ animate = true } = {}) {
    root.classList.toggle("idea-list--desktop", desktopOpen);

    root.querySelectorAll(".idea-item").forEach((item) => {
      const id = item.getAttribute("data-idea-id");
      const open = isItemOpen(id);
      const moreOpen = moreId === id;
      const wasOpen = item.classList.contains("is-open");
      const wasMore = item.classList.contains("is-more");
      const head = item.querySelector("[data-idea-toggle]");
      const body = item.querySelector(".idea-item__body");
      const more = item.querySelector("[data-idea-more]");
      const moreBtn = item.querySelector("[data-idea-more-toggle]");

      item.classList.toggle("is-open", open);
      item.classList.toggle("is-more", moreOpen);

      if (head) {
        head.setAttribute("aria-expanded", open ? "true" : "false");
        if (desktopOpen) {
          head.setAttribute("aria-disabled", "true");
          head.tabIndex = -1;
        } else {
          head.removeAttribute("aria-disabled");
          head.removeAttribute("tabindex");
        }
      }

      if (body) {
        if (open) body.removeAttribute("inert");
        else body.setAttribute("inert", "");
      }
      if (more) {
        if (moreOpen) more.removeAttribute("inert");
        else more.setAttribute("inert", "");
      }

      if (moreBtn) {
        moreBtn.setAttribute("aria-expanded", moreOpen ? "true" : "false");
        moreBtn.textContent = moreOpen ? "Ver menos" : "Ver más";
      }

      if (!animate) {
        if (body) body.style.height = open ? "auto" : "0px";
        if (more) more.style.height = moreOpen ? "auto" : "0px";
        return;
      }

      if (open !== wasOpen && body) {
        if (!open && more && wasMore) more.style.height = "0px";
        animateHeight(body, open);
      }

      if (moreOpen !== wasMore && more) {
        if (moreOpen && body && body.style.height !== "auto" && open) {
          body.style.height = "auto";
          body.classList.remove("is-animating");
          body.ontransitionend = null;
        }
        animateHeight(more, moreOpen);
      }
    });
  }

  function applyViewportMode({ animate = false } = {}) {
    const nextDesktop = desktopMq.matches;
    if (nextDesktop === desktopOpen) return;
    desktopOpen = nextDesktop;
    if (desktopOpen) {
      openId = "";
    } else {
      openId = "";
      moreId = "";
    }
    syncUi({ animate });
  }

  function mount() {
    root.innerHTML = data.strategies.map(renderItem).join("");
    syncUi({ animate: false });
  }

  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-idea-toggle]");
    if (toggle) {
      if (desktopOpen) return;
      const id = toggle.getAttribute("data-idea-toggle");
      const closing = openId === id;
      if (closing) {
        openId = "";
        moreId = "";
      } else {
        openId = id;
        moreId = "";
      }
      syncUi();
      if (!closing && !reduceMotion) {
        const item = root.querySelector(`[data-idea-id="${CSS.escape(id)}"]`);
        item?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    const moreToggle = event.target.closest("[data-idea-more-toggle]");
    if (moreToggle) {
      const id = moreToggle.getAttribute("data-idea-more-toggle");
      moreId = moreId === id ? "" : id;
      if (moreId && !desktopOpen) openId = id;
      syncUi();
    }
  });

  if (typeof desktopMq.addEventListener === "function") {
    desktopMq.addEventListener("change", () => applyViewportMode({ animate: false }));
  } else if (typeof desktopMq.addListener === "function") {
    desktopMq.addListener(() => applyViewportMode({ animate: false }));
  }

  root.classList.add("idea-list");
  root.classList.remove("tip-grid", "tip-grid--three");
  mount();
})();
