/* Mi espacio: lista de actividades guardadas en este navegador. */
(function () {
  const { data, ui, saved } = window.CEC;

  const list = document.querySelector("[data-saved-list]");
  const count = document.querySelector("[data-saved-count]");
  const status = document.querySelector("[data-saved-status]");
  const empty = document.querySelector("[data-saved-empty]");
  const unavailable = document.querySelector("[data-saved-unavailable]");
  const heading = document.getElementById("guardadas-title");
  if (!list || !count || !status || !empty || !unavailable || !heading) return;

  function removeButton(activity) {
    return `
      <div class="activity-card__actions">
        <button class="btn btn--outline btn--small" type="button" data-remove="${ui.escapeHTML(activity.id)}">
          ${ui.icon("i-trash")} Quitar<span class="visually-hidden"> ${ui.escapeHTML(activity.title)} de Mi espacio</span>
        </button>
      </div>`;
  }

  function focusHeading() {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }

  function render() {
    const activities = saved
      .list()
      .map((id) => data.getActivity(id))
      .filter(Boolean);

    list.innerHTML = activities
      .map((activity) => `<li>${ui.activityCard(activity, { actions: removeButton(activity) })}</li>`)
      .join("");

    const total = activities.length;
    count.textContent = total ? `${total} ${total === 1 ? "actividad guardada" : "actividades guardadas"}` : "";
    empty.hidden = total > 0;
  }

  if (!saved.isAvailable()) {
    unavailable.hidden = false;
    return;
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const activity = data.getActivity(button.dataset.remove);
    if (!saved.remove(button.dataset.remove)) {
      status.textContent = "No se pudo quitar la actividad. Revisa si tu navegador permite el almacenamiento local.";
      return;
    }
    render();
    status.textContent = `Se quitó «${activity ? activity.title : "la actividad"}» de Mi espacio.`;
    focusHeading();
  });

  window.addEventListener("storage", () => {
    const hadFocusInList = list.contains(document.activeElement);
    render();
    if (hadFocusInList) focusHeading();
  });

  render();
})();
