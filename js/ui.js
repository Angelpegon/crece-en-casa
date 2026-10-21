/* Utilidades de presentación compartidas entre páginas. */
window.CEC = window.CEC || {};

window.CEC.ui = (function () {
  const SPRITE = "assets/icons/sprite.svg";

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function icon(id, className = "icon") {
    return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="${SPRITE}#${id}"></use></svg>`;
  }

  function formatAges(ages) {
    if (ages.length === 1) return `${ages[0]} años`;
    const sorted = [...ages].sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (sorted.length === 2) return `${first} y ${last} años`;
    return `${first} a ${last} años`;
  }

  function activityUrl(activity) {
    return `actividad.html?id=${encodeURIComponent(activity.id)}`;
  }

  function strategyUrl(strategy) {
    return `estrategia.html?id=${encodeURIComponent(strategy.id)}`;
  }

  function challengeUrl(challenge) {
    return `reto.html?id=${encodeURIComponent(challenge.id)}`;
  }

  function activityImage(activity) {
    if (activity.image) return activity.image;
    return window.CEC.data.getAge(activity.ages[0]).image;
  }

  function imageTag(image, { alt = "", attrs = "" } = {}) {
    return `<img src="${image.src}" width="${image.width}" height="${image.height}" alt="${escapeHTML(alt)}"${
      attrs ? " " + attrs : ""
    }>`;
  }

  function areaTags(activity) {
    return activity.areas
      .map((id) => window.CEC.data.getArea(id))
      .filter(Boolean)
      .map((area) => `<li class="tag tag--${area.tone}">${escapeHTML(area.label)}</li>`)
      .join("");
  }

  function strategyLinks(strategyIds) {
    return (strategyIds || [])
      .map((id) => window.CEC.data.getStrategy(id))
      .filter(Boolean)
      .map((strategy) => `<a href="${strategyUrl(strategy)}">${escapeHTML(strategy.title)}</a>`)
      .join(" · ");
  }

  function activityCard(activity, { headingLevel = 3, actions = "" } = {}) {
    const tone = window.CEC.data.getAge(activity.ages[0]).tone;
    const primary = window.CEC.data.getArea(activity.primaryArea);
    const media = activity.image ? "activity-card__media--photo" : "";
    return `
      <article class="activity-card activity-card--${tone}">
        <div class="activity-card__media ${media}">
          ${imageTag(activityImage(activity), { attrs: 'loading="lazy" decoding="async"' })}
        </div>
        <div class="activity-card__body">
          <p class="activity-card__ages">${formatAges(activity.ages)}</p>
          <h${headingLevel} class="activity-card__title">
            <a class="activity-card__link" href="${activityUrl(activity)}">${escapeHTML(activity.title)}</a>
          </h${headingLevel}>
          <p class="activity-card__tagline">${escapeHTML(activity.tagline)}</p>
          ${primary ? `<p class="activity-card__area">${escapeHTML(primary.label)}</p>` : ""}
          <p class="activity-card__meta">${icon("i-clock")} ${escapeHTML(activity.duration)}</p>
          <a class="btn btn--outline btn--small" href="${activityUrl(activity)}">Ver actividad</a>
          ${actions}
        </div>
      </article>`;
  }

  function tipTone(tone) {
    if (tone === "pink" || tone === "coral") return "coral";
    if (tone === "green" || tone === "sage") return "sage";
    if (tone === "yellow") return "yellow";
    if (tone === "lavender") return "lavender";
    return "sage";
  }

  function strategyCard(strategy) {
    return `
      <article class="tip tip--${tipTone(strategy.tone)}">
        <p class="strategy-card__eyebrow">Estrategia ${strategy.number} de 8</p>
        <h3><a href="${strategyUrl(strategy)}">${escapeHTML(strategy.title)}</a></h3>
        <p><strong>Qué hacer:</strong> ${escapeHTML(strategy.what)}</p>
        <p class="strategy-card__more"><a href="${strategyUrl(strategy)}">Ver estrategia ${icon("i-arrow")}</a></p>
      </article>`;
  }

  function challengeCard(challenge) {
    return `
      <article class="tip tip--${tipTone(challenge.tone)}">
        <p class="strategy-card__eyebrow">${escapeHTML(challenge.tag)}</p>
        <h3><a href="${challengeUrl(challenge)}">${escapeHTML(challenge.title)}</a></h3>
        <p>${escapeHTML(challenge.situation)}</p>
        <p class="strategy-card__more"><a href="${challengeUrl(challenge)}">Empezar reto ${icon("i-arrow")}</a></p>
      </article>`;
  }

  return {
    escapeHTML,
    icon,
    formatAges,
    activityUrl,
    strategyUrl,
    challengeUrl,
    activityImage,
    imageTag,
    areaTags,
    strategyLinks,
    activityCard,
    strategyCard,
    challengeCard,
  };
})();
