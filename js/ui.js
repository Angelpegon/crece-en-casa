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

  /* `actions` permite añadir controles propios de cada página (p. ej. quitar de Mi espacio). */
  function activityCard(activity, { headingLevel = 3, actions = "" } = {}) {
    const tone = window.CEC.data.getAge(activity.ages[0]).tone;
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
          <ul class="tag-list" aria-label="Áreas que trabaja">${areaTags(activity)}</ul>
          <p class="activity-card__meta">${icon("i-clock")} ${escapeHTML(activity.duration)}</p>
          ${actions}
        </div>
      </article>`;
  }

  return { escapeHTML, icon, formatAges, activityUrl, activityImage, imageTag, areaTags, activityCard };
})();
