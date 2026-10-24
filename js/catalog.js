/* Catálogo de actividades: filtros combinables sincronizados con la URL. */
(function () {
  const { data, ui } = window.CEC;

  const form = document.querySelector("[data-filters]");
  const results = document.querySelector("[data-results]");
  const count = document.querySelector("[data-results-count]");
  const empty = document.querySelector("[data-empty]");
  const clearButton = document.querySelector("[data-clear-filters]");
  const resetButton = form && form.querySelector("[data-reset-filters]");
  const clearSearchButton = form && form.querySelector("[data-clear-search]");
  const activeFilters = document.querySelector("[data-active-filters]");
  if (!form || !results || !count || !empty || !activeFilters) return;

  const SEARCH_LINK = 'a[href="explorar-actividades.html#buscar"]';
  const TYPING_DELAY = 300;

  const validAges = data.ages.map((age) => String(age.value));
  const validAreas = data.areas.map((area) => area.id);
  const validMoments = data.moments.map((moment) => moment.id);
  const validMaterials = data.materials.map((material) => material.id);
  let activeMomento = "";

  function chip(name, value, label, { tone = "", icon = "" } = {}) {
    const classes = ["chip"];
    if (tone) classes.push(`chip--${tone}`);
    if (icon) classes.push("chip--icon");
    const glyph = icon
      ? `<span class="chip__glyph" aria-hidden="true">${ui.icon(icon)}</span>`
      : "";
    return `
      <label class="${classes.join(" ")}">
        <input type="radio" name="${name}" value="${ui.escapeHTML(value)}"${value ? "" : " checked"}>
        <span>${glyph}${ui.escapeHTML(label)}</span>
      </label>`;
  }

  function renderChips() {
    const ageGroup = form.querySelector('[data-chips="edad"]');
    const areaGroup = form.querySelector('[data-chips="area"]');
    const materialGroup = form.querySelector('[data-chips="materiales"]');

    ageGroup.innerHTML =
      chip("edad", "", "Todas las edades") +
      data.ages.map((age) => chip("edad", String(age.value), age.label, { tone: age.tone })).join("");
    areaGroup.innerHTML =
      chip("area", "", "Todas") +
      data.areas.map((area) => chip("area", area.id, area.label, { icon: area.icon, tone: area.tone })).join("");
    materialGroup.innerHTML =
      chip("materiales", "", "Todos") +
      data.materials
        .map((material) => chip("materiales", material.id, material.label, { icon: "i-home" }))
        .join("");
  }

  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const searchIndex = new Map(
    data.activities.map((activity) => {
      const areaLabels = activity.areas.map((id) => data.getArea(id)).filter(Boolean).map((area) => area.label);
      const text = [
        activity.title,
        activity.tagline,
        activity.summary,
        ...areaLabels,
        ...activity.materials,
        activity.accompany,
        activity.adapt,
        ...activity.steps,
      ].join(" ");
      return [activity.id, normalize(text)];
    })
  );

  function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const edad = params.get("edad") || "";
    const area = params.get("area") || "";
    const momento = params.get("momento") || "";
    const materiales = params.get("materiales") || "";
    activeMomento = validMoments.includes(momento) ? momento : "";
    return {
      q: (params.get("q") || "").trim(),
      edad: validAges.includes(edad) ? edad : "",
      area: validAreas.includes(area) ? area : "",
      momento: activeMomento,
      materiales: validMaterials.includes(materiales) ? materiales : "",
    };
  }

  function readFiltersFromForm() {
    const formData = new FormData(form);
    return {
      q: String(formData.get("q") || "").trim(),
      edad: String(formData.get("edad") || ""),
      area: String(formData.get("area") || ""),
      momento: activeMomento,
      materiales: String(formData.get("materiales") || ""),
    };
  }

  function hasActiveFilters(filters) {
    return Boolean(filters.q || filters.edad || filters.area || filters.momento || filters.materiales);
  }

  function checkRadio(name, value) {
    const input = Array.from(form.elements[name]).find((radio) => radio.value === value);
    if (input) input.checked = true;
  }

  function applyFiltersToForm(filters) {
    form.elements.q.value = filters.q;
    checkRadio("edad", filters.edad);
    checkRadio("area", filters.area);
    checkRadio("materiales", filters.materiales);
    syncSearchClear(filters.q);
  }

  function syncSearchClear(query) {
    if (!clearSearchButton) return;
    clearSearchButton.hidden = !String(query || "").trim();
  }

  function syncResetButton(filters) {
    if (!resetButton) return;
    const active = hasActiveFilters(filters);
    resetButton.hidden = !active;
    if (resetButton.parentElement) resetButton.parentElement.hidden = !active;
  }

  function updateUrl(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  function filterActivities(filters) {
    const words = normalize(filters.q).split(/\s+/).filter(Boolean);
    return data.activities.filter((activity) => {
      if (filters.edad && !activity.ages.includes(Number(filters.edad))) return false;
      if (filters.area && !activity.areas.includes(filters.area)) return false;
      if (filters.momento && !(activity.momentos || []).includes(filters.momento)) return false;
      if (filters.materiales && activity.materialsId !== filters.materiales) return false;
      const text = searchIndex.get(activity.id);
      return words.every((word) => text.includes(word));
    });
  }

  function describe(filters, total) {
    const singular = total === 1;
    const parts = [];
    const age = filters.edad ? data.getAge(filters.edad) : null;
    const area = filters.area ? data.getArea(filters.area) : null;
    const moment = filters.momento ? data.getMoment(filters.momento) : null;
    const material = filters.materiales ? data.getMaterial(filters.materiales) : null;
    if (age) parts.push(`para ${age.label}`);
    if (area) parts.push(`de ${area.label.toLowerCase()}`);
    if (moment) parts.push(`para ${moment.label.toLowerCase()}`);
    if (material) parts.push(`con ${material.label.toLowerCase()}`);
    if (filters.q) parts.push(`que ${singular ? "coincide" : "coinciden"} con «${filters.q}»`);
    const noun = singular ? "actividad" : "actividades";
    return `${total} ${noun}${parts.length ? " " + parts.join(" ") : ""}`;
  }

  function activePill(key, label) {
    return `
      <button class="filters-active__pill" type="button" data-clear-key="${ui.escapeHTML(key)}">
        <span>${ui.escapeHTML(label)}</span>
        <svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-close"></use></svg>
        <span class="visually-hidden">Quitar filtro</span>
      </button>`;
  }

  function renderActiveFilters(filters) {
    const pills = [];
    if (filters.q) pills.push(activePill("q", `«${filters.q}»`));
    if (filters.edad) {
      const age = data.getAge(filters.edad);
      if (age) pills.push(activePill("edad", age.label));
    }
    if (filters.area) {
      const area = data.getArea(filters.area);
      if (area) pills.push(activePill("area", area.label));
    }
    if (filters.momento) {
      const moment = data.getMoment(filters.momento);
      if (moment) pills.push(activePill("momento", moment.shortLabel || moment.label));
    }
    if (filters.materiales) {
      const material = data.getMaterial(filters.materiales);
      if (material) pills.push(activePill("materiales", material.label));
    }

    activeFilters.hidden = pills.length === 0;
    activeFilters.innerHTML = pills.length
      ? `<p class="filters-active__label">Filtros activos</p><div class="filters-active__list">${pills.join("")}</div>`
      : "";
  }

  function clearFilterKey(key) {
    if (key === "q") {
      form.elements.q.value = "";
      syncSearchClear("");
    } else if (key === "momento") {
      activeMomento = "";
    } else if (key === "edad" || key === "area" || key === "materiales") {
      checkRadio(key, "");
    }
    update();
  }

  function render(filters) {
    const list = filterActivities(filters);
    results.innerHTML = list.map((activity) => `<li>${ui.activityCard(activity, { headingLevel: 2 })}</li>`).join("");
    count.textContent = describe(filters, list.length);
    empty.hidden = list.length > 0;
    renderActiveFilters(filters);
    syncResetButton(filters);
    syncSearchClear(filters.q);
  }

  let typingTimer;

  function update() {
    clearTimeout(typingTimer);
    const filters = readFiltersFromForm();
    render(filters);
    updateUrl(filters);
  }

  function focusSearch() {
    form.elements.q.focus();
  }

  function resetFilters() {
    activeMomento = "";
    form.reset();
    syncSearchClear("");
    update();
    focusSearch();
  }

  renderChips();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  form.addEventListener("input", (event) => {
    if (event.target.name !== "q") return;
    syncSearchClear(event.target.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(update, TYPING_DELAY);
  });
  form.addEventListener("change", (event) => {
    if (event.target.type === "radio") update();
  });
  form.addEventListener("reset", () => {
    activeMomento = "";
    setTimeout(() => {
      syncSearchClear("");
      update();
    });
  });

  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", () => {
      form.elements.q.value = "";
      syncSearchClear("");
      update();
      focusSearch();
    });
  }

  activeFilters.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-clear-key]");
    if (!pill) return;
    clearFilterKey(pill.getAttribute("data-clear-key"));
  });

  if (clearButton) clearButton.addEventListener("click", resetFilters);

  document.querySelectorAll(SEARCH_LINK).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusSearch();
    });
  });

  const cameFromSearchLink = window.location.hash === "#buscar";
  const initial = readFiltersFromUrl();
  applyFiltersToForm(initial);
  render(initial);
  updateUrl(initial);

  if (cameFromSearchLink) {
    focusSearch();
    window.addEventListener("load", () => requestAnimationFrame(focusSearch), { once: true });
  }
})();
