/* Catálogo de actividades: filtros combinables sincronizados con la URL. */
(function () {
  const { data, ui } = window.CEC;

  const form = document.querySelector("[data-filters]");
  const groupsHost = form && form.querySelector("[data-filter-groups]");
  const results = document.querySelector("[data-results]");
  const count = document.querySelector("[data-results-count]");
  const empty = document.querySelector("[data-empty]");
  const emptyBody = empty && empty.querySelector("[data-empty-body]");
  const resetButton = form && form.querySelector("[data-reset-filters]");
  const clearSearchButton = form && form.querySelector("[data-clear-search]");
  const activeFilters = document.querySelector("[data-active-filters]");
  if (!form || !groupsHost || !results || !count || !empty || !activeFilters) return;

  const SEARCH_LINK = 'a[href="explorar-actividades.html#buscar"]';
  const TYPING_DELAY = 300;

  /*
    Cada filtro se declara una sola vez. De aquí salen los chips, la lectura de la URL,
    las pastillas de filtros activos y el texto del contador, así que añadir un filtro
    nuevo no obliga a tocar cinco sitios distintos.
  */
  const FILTERS = [
    {
      key: "edad",
      legend: "Edad",
      allLabel: "Todas las edades",
      weight: 10,
      options: data.ages.map((age) => ({ value: String(age.value), label: age.label, tone: age.tone })),
      matches: (activity, value) => activity.ages.includes(Number(value)),
      label: (value) => (data.getAge(value) || {}).label,
      phrase: (value) => {
        const age = data.getAge(value);
        return age && `para ${age.label}`;
      },
    },
    {
      key: "momento",
      legend: "Momento del día",
      allLabel: "Todos",
      icons: true,
      weight: 4,
      options: data.moments.map((moment) => ({
        value: moment.id,
        label: moment.shortLabel || moment.label,
        icon: moment.icon,
        tone: moment.tone,
      })),
      matches: (activity, value) => (activity.momentos || []).includes(value),
      label: (value) => {
        const moment = data.getMoment(value);
        return moment && (moment.shortLabel || moment.label);
      },
      phrase: (value) => {
        const moment = data.getMoment(value);
        return moment && `para ${moment.label.toLowerCase()}`;
      },
    },
    {
      key: "area",
      legend: "Área de comunicación",
      allLabel: "Todas",
      icons: true,
      weight: 3,
      /* Etiquetas largas: con media columna cada chip caería en su propia línea. */
      wide: true,
      options: data.areas.map((area) => ({ value: area.id, label: area.label, icon: area.icon, tone: area.tone })),
      matches: (activity, value) => activity.areas.includes(value),
      label: (value) => (data.getArea(value) || {}).label,
      phrase: (value) => {
        const area = data.getArea(value);
        return area && `de ${area.label.toLowerCase()}`;
      },
    },
    {
      key: "duracion",
      legend: "Tiempo disponible",
      allLabel: "Cualquiera",
      weight: 2,
      options: data.durations.map((duration) => ({ value: duration.id, label: duration.label })),
      matches: (activity, value) => activity.durationId === value,
      label: (value) => (data.getDuration(value) || {}).label,
      phrase: (value) => {
        const duration = data.getDuration(value);
        return duration && `de ${duration.label.toLowerCase()}`;
      },
    },
    {
      key: "materiales",
      legend: "Materiales",
      allLabel: "Todos",
      icons: true,
      weight: 1,
      options: data.materials.map((material) => ({ value: material.id, label: material.label, icon: "i-home" })),
      matches: (activity, value) => activity.materialsId === value,
      label: (value) => (data.getMaterial(value) || {}).label,
      phrase: (value) => {
        const material = data.getMaterial(value);
        return material && `con ${material.label.toLowerCase()}`;
      },
    },
  ];

  /* La búsqueda pesa como el momento: orienta, pero no manda sobre la edad. */
  const SEARCH_WEIGHT = 4;

  /*
    Solo se ofrece lo que el contenido puede sostener: una opción sin ninguna ficha no
    llega a los chips, y un grupo que se queda con menos de dos opciones no separa nada
    y se oculta entero. Cuando el catálogo crezca, ambos vuelven solos.
  */
  const filters = FILTERS.map((filter) => ({
    ...filter,
    options: filter.options.filter((option) => data.activities.some((activity) => filter.matches(activity, option.value))),
  })).filter((filter) => filter.options.length > 1);

  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
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

  const chipNodes = new Map();

  function chip(filter, option) {
    const classes = ["chip"];
    if (option.tone) classes.push(`chip--${option.tone}`);
    if (option.icon) classes.push("chip--icon");
    const glyph = option.icon
      ? `<span class="chip__glyph" aria-hidden="true">${ui.icon(option.icon)}</span>`
      : "";
    return `
      <label class="${classes.join(" ")}" data-chip="${filter.key}" data-value="${ui.escapeHTML(option.value)}">
        <input type="radio" name="${filter.key}" value="${ui.escapeHTML(option.value)}"${option.value ? "" : " checked"}>
        <span>${glyph}${ui.escapeHTML(option.label)}</span>
      </label>`;
  }

  function renderGroups() {
    groupsHost.innerHTML = filters
      .map((filter) => {
        const options = [{ value: "", label: filter.allLabel }].concat(filter.options);
        return `
        <fieldset class="filters__group${filter.wide ? " filters__group--wide" : ""}">
          <legend class="filters__label">${ui.escapeHTML(filter.legend)}</legend>
          <div class="chip-group${filter.icons ? " chip-group--icons" : ""}" data-chips="${filter.key}">
            ${options.map((option) => chip(filter, option)).join("")}
          </div>
        </fieldset>`;
      })
      .join("");

    groupsHost.querySelectorAll("[data-chip]").forEach((label) => {
      chipNodes.set(`${label.getAttribute("data-chip")}:${label.getAttribute("data-value")}`, label);
    });
  }

  function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const current = { q: (params.get("q") || "").trim() };
    filters.forEach((filter) => {
      const value = params.get(filter.key) || "";
      current[filter.key] = filter.options.some((option) => option.value === value) ? value : "";
    });
    return current;
  }

  function readFiltersFromForm() {
    const formData = new FormData(form);
    const current = { q: String(formData.get("q") || "").trim() };
    filters.forEach((filter) => {
      current[filter.key] = String(formData.get(filter.key) || "");
    });
    return current;
  }

  function hasActiveFilters(current) {
    return Boolean(current.q) || filters.some((filter) => Boolean(current[filter.key]));
  }

  function checkRadio(name, value) {
    const group = form.elements[name];
    if (!group) return;
    const inputs = typeof group.length === "number" ? Array.from(group) : [group];
    const input = inputs.find((radio) => radio.value === value);
    if (input) input.checked = true;
  }

  function applyFiltersToForm(current) {
    form.elements.q.value = current.q;
    filters.forEach((filter) => checkRadio(filter.key, current[filter.key]));
    syncSearchClear(current.q);
  }

  function syncSearchClear(query) {
    if (!clearSearchButton) return;
    clearSearchButton.hidden = !String(query || "").trim();
  }

  function syncResetButton(current) {
    if (!resetButton) return;
    const active = hasActiveFilters(current);
    resetButton.hidden = !active;
    if (resetButton.parentElement) resetButton.parentElement.hidden = !active;
  }

  function updateUrl(current) {
    const params = new URLSearchParams();
    Object.entries(current).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  function searchWords(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  function matchesQuery(activity, words) {
    const text = searchIndex.get(activity.id);
    return words.every((word) => text.includes(word));
  }

  function matchesFilter(activity, filter, current) {
    return Boolean(current[filter.key]) && filter.matches(activity, current[filter.key]);
  }

  /*
    Los filtros son preferencias, no condiciones: cada ficha suma el peso de lo que cumple
    y se muestran las que más suman. Mientras exista alguna combinación exacta, esa gana
    (tiene la puntuación máxima posible) y el catálogo se comporta como un filtro de toda
    la vida; cuando no la hay, en vez de vaciarse enseña lo más cercano. Así cualquier
    combinación de chips es seleccionable y siempre deja algo que ver.
  */
  function rankActivities(current) {
    const words = searchWords(current.q);
    let best = -1;
    const scored = data.activities.map((activity) => {
      let score = 0;
      filters.forEach((filter) => {
        if (matchesFilter(activity, filter, current)) score += filter.weight;
      });
      if (words.length && matchesQuery(activity, words)) score += SEARCH_WEIGHT;
      if (score > best) best = score;
      return { activity, score };
    });
    return scored.filter((item) => item.score === best).map((item) => item.activity);
  }

  /*
    Solo se nombra lo que cumple toda la lista. Si la combinación no existía y se está
    enseñando lo más parecido, el contador calla ese filtro en vez de prometer algo falso:
    con la edad, prometer de más sería lo peor que podría hacer esta página.
  */
  function describe(current, list) {
    const total = list.length;
    const singular = total === 1;
    const parts = [];
    filters.forEach((filter) => {
      const value = current[filter.key];
      if (!value) return;
      if (!list.every((activity) => filter.matches(activity, value))) return;
      const phrase = filter.phrase(value);
      if (phrase) parts.push(phrase);
    });
    const words = searchWords(current.q);
    if (words.length && list.every((activity) => matchesQuery(activity, words))) {
      parts.push(`que ${singular ? "coincide" : "coinciden"} con «${current.q}»`);
    }
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

  function renderActiveFilters(current) {
    const pills = [];
    if (current.q) pills.push(activePill("q", `«${current.q}»`));
    filters.forEach((filter) => {
      if (!current[filter.key]) return;
      const label = filter.label(current[filter.key]);
      if (label) pills.push(activePill(filter.key, label));
    });

    activeFilters.hidden = pills.length === 0;
    activeFilters.innerHTML = pills.length
      ? `<p class="filters-active__label">Filtros activos</p><div class="filters-active__list">${pills.join("")}</div>`
      : "";
  }

  /* Red de seguridad: con fichas en el catálogo, `rankActivities` siempre devuelve alguna. */
  function syncEmptyState(total) {
    empty.hidden = total > 0;
    if (total > 0 || !emptyBody) return;
    emptyBody.innerHTML = "<p>Vuelve a intentarlo en un momento.</p>";
  }

  function render(current) {
    const list = rankActivities(current);
    results.innerHTML = list.map((activity) => `<li>${ui.activityCard(activity, { headingLevel: 2 })}</li>`).join("");
    count.textContent = describe(current, list);
    syncEmptyState(list.length);
    renderActiveFilters(current);
    syncResetButton(current);
    syncSearchClear(current.q);
  }

  let typingTimer;

  /* Lo que la familia marca se queda marcado: nada se desmarca solo. */
  function update() {
    clearTimeout(typingTimer);
    const current = readFiltersFromForm();
    render(current);
    updateUrl(current);
  }

  function focusSearch() {
    form.elements.q.focus();
  }

  function clearSearch() {
    form.elements.q.value = "";
    syncSearchClear("");
  }

  function clearFilterKey(key) {
    if (key === "q") clearSearch();
    else checkRadio(key, "");
    update();
  }

  function resetFilters() {
    form.reset();
    syncSearchClear("");
    update();
    focusSearch();
  }

  renderGroups();

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
    setTimeout(() => {
      syncSearchClear("");
      update();
    });
  });

  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", () => {
      clearSearch();
      update();
      focusSearch();
    });
  }

  activeFilters.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-clear-key]");
    if (!pill) return;
    clearFilterKey(pill.getAttribute("data-clear-key"));
  });

  document.querySelectorAll(SEARCH_LINK).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusSearch();
    });
  });

  const cameFromSearchLink = window.location.hash === "#buscar";
  const initial = readFiltersFromUrl();
  applyFiltersToForm(initial);
  update();

  if (cameFromSearchLink) {
    focusSearch();
    window.addEventListener("load", () => requestAnimationFrame(focusSearch), { once: true });
  }
})();
