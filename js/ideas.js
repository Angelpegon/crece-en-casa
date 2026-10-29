(() => {
  const { data, ui, progress } = window.CEC;
  const root = document.querySelector("[data-strategies]");
  if (!root || !data?.strategies?.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let moreId = "";

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tipTone(tone) {
    if (tone === "pink" || tone === "coral") return "coral";
    if (tone === "yellow" || tone === "gold") return "yellow";
    if (tone === "green" || tone === "sage" || tone === "mint") return "sage";
    if (tone === "lavender" || tone === "sky") return "lavender";
    return "sage";
  }

  function canSave() {
    return !!(progress && typeof progress.isAvailable === "function" && progress.isAvailable());
  }

  function isSaved(id) {
    if (!canSave()) return false;
    const entry = progress.get("strategy", id);
    return !!(entry && entry.state);
  }

  function toggleSaved(id) {
    if (!canSave()) return null;
    if (isSaved(id)) {
      const ok = progress.remove("strategy", id);
      return ok ? false : null;
    }
    const ok = progress.set("strategy", id, { state: "explored" });
    return ok ? true : null;
  }

  function saveButton(strategy) {
    if (!canSave()) return "";
    const saved = isSaved(strategy.id);
    return `<button
      class="btn ${saved ? "btn--sage is-saved" : "btn--outline"}"
      type="button"
      data-idea-save="${esc(strategy.id)}"
      aria-pressed="${saved ? "true" : "false"}"
    >${saved ? "♥ Idea guardada" : "♡ Guardar idea"}</button>`;
  }

  function relatedChips(strategy) {
    const related = (strategy.activityIds || strategy.relatedActivityIds || [])
      .map((id) => data.activities.find((activity) => activity.id === id))
      .filter(Boolean)
      .slice(0, 3);
    if (!related.length) return "";
    return `<div class="idea-item__related idea-item__reveal" style="--idea-delay:0.14s">
      <h4 class="idea-item__label">Actividades relacionadas</h4>
      <div class="idea-item__chips">
        ${related
          .map(
            (activity) =>
              `<a class="idea-item__chip" href="${ui.activityUrl(activity)}">${esc(activity.title)}</a>`
          )
          .join("")}
      </div>
    </div>`;
  }

  function renderItem(strategy) {
    const tone = tipTone(strategy.tone);
    const media = strategy.cardImage
      ? `<div class="idea-item__media" aria-hidden="true">
           <img class="idea-item__art" src="${esc(strategy.cardImage)}" alt="" width="520" height="360" loading="lazy" decoding="async">
         </div>`
      : "";
    const badge = strategy.icon
      ? `<img class="idea-item__badge-img" src="${esc(strategy.icon)}" alt="" width="44" height="44" decoding="async">`
      : strategy.emoji || strategy.number;

    return `
      <li class="idea-item idea-item--${tone}" data-idea-id="${esc(strategy.id)}">
        <div class="idea-item__layout">
          <div class="idea-item__main">
            <div class="idea-item__head" id="idea-head-${esc(strategy.id)}">
              <span class="idea-item__badge" aria-hidden="true">${badge}</span>
              <span class="idea-item__head-copy">
                <span class="idea-item__eyebrow">Idea ${strategy.number} de ${data.strategies.length} · Estrategia para el día a día</span>
                <h3 class="idea-item__title">${esc(strategy.title)}</h3>
              </span>
            </div>
            <div class="idea-item__preview">
              <div class="idea-item__block">
                <h4 class="idea-item__label">Qué hacer</h4>
                <p>${esc(strategy.what)}</p>
              </div>
              <div class="idea-item__block">
                <h4 class="idea-item__label">Ejemplo</h4>
                <p class="idea-item__example">${esc(strategy.example)}</p>
              </div>
              <div class="idea-item__actions">
                <button
                  class="btn btn--sage"
                  type="button"
                  data-idea-more-toggle="${esc(strategy.id)}"
                  aria-expanded="false"
                  aria-controls="idea-more-${esc(strategy.id)}"
                >Ver más ${ui.icon("i-arrow")}</button>
                ${saveButton(strategy)}
              </div>
            </div>
            <div
              class="idea-item__more"
              id="idea-more-${esc(strategy.id)}"
              data-idea-more
              role="region"
              aria-labelledby="idea-head-${esc(strategy.id)}"
              inert
            >
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
          ${media}
        </div>
      </li>`;
  }

  function animateHeight(panel, open) {
    if (!panel) return;
    if (reduceMotion) {
      panel.style.height = open ? "auto" : "0px";
      panel.classList.remove("is-animating");
      return;
    }

    panel.ontransitionend = null;
    panel.classList.add("is-animating");

    if (open) {
      panel.style.height = "0px";
      void panel.offsetHeight;
      panel.style.height = `${panel.scrollHeight}px`;
      panel.ontransitionend = (event) => {
        if (event.target !== panel || event.propertyName !== "height") return;
        panel.classList.remove("is-animating");
        panel.ontransitionend = null;
        panel.style.height = "auto";
      };
      return;
    }

    panel.style.height = `${panel.scrollHeight}px`;
    void panel.offsetHeight;
    panel.style.height = "0px";
    panel.ontransitionend = (event) => {
      if (event.target !== panel || event.propertyName !== "height") return;
      panel.classList.remove("is-animating");
      panel.ontransitionend = null;
      panel.style.height = "0px";
    };
  }

  function syncUi({ animate = true } = {}) {
    root.querySelectorAll(".idea-item").forEach((item) => {
      const id = item.getAttribute("data-idea-id");
      const moreOpen = moreId === id;
      const wasMore = item.classList.contains("is-more");
      const more = item.querySelector("[data-idea-more]");
      const moreBtn = item.querySelector("[data-idea-more-toggle]");

      item.classList.toggle("is-more", moreOpen);

      if (more) {
        if (moreOpen) more.removeAttribute("inert");
        else more.setAttribute("inert", "");
      }

      if (moreBtn) {
        moreBtn.setAttribute("aria-expanded", moreOpen ? "true" : "false");
        moreBtn.innerHTML = moreOpen
          ? `Ver menos ${ui.icon("i-arrow")}`
          : `Ver más ${ui.icon("i-arrow")}`;
      }

      if (!animate) {
        if (more) more.style.height = moreOpen ? "auto" : "0px";
        return;
      }

      if (moreOpen !== wasMore && more) {
        animateHeight(more, moreOpen);
      }
    });
  }

  function mount() {
    root.innerHTML = data.strategies.map(renderItem).join("");
    syncUi({ animate: false });
  }

  root.addEventListener("click", (event) => {
    const moreToggle = event.target.closest("[data-idea-more-toggle]");
    if (moreToggle) {
      const id = moreToggle.getAttribute("data-idea-more-toggle");
      moreId = moreId === id ? "" : id;
      syncUi();
      return;
    }

    const saveBtn = event.target.closest("[data-idea-save]");
    if (saveBtn) {
      const id = saveBtn.getAttribute("data-idea-save");
      if (!id || !canSave()) return;
      const nextSaved = toggleSaved(id);
      if (nextSaved === null) return;
      saveBtn.classList.toggle("btn--sage", nextSaved);
      saveBtn.classList.toggle("btn--outline", !nextSaved);
      saveBtn.classList.toggle("is-saved", nextSaved);
      saveBtn.setAttribute("aria-pressed", nextSaved ? "true" : "false");
      saveBtn.textContent = nextSaved ? "♥ Idea guardada" : "♡ Guardar idea";
    }
  });

  root.classList.add("idea-list");
  root.classList.remove("tip-grid", "tip-grid--three");
  mount();
})();
