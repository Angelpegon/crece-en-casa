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
      options: data.materials.map((material) => ({ value: material.id, label: material.label, icon: "i-home" })),
      matches: (activity, value) => activity.materialsId === value,
      label: (value) => (data.getMaterial(value) || {}).label,
      phrase: (value) => {
        const material = data.getMaterial(value);
        return material && `con ${material.label.toLowerCase()}`;
      },
    },
  ];

  /* Cuando hay que soltar algo, se empieza por lo más fino y se deja la edad para el final. */
  const RELAX_ORDER = ["materiales", "duracion", "area", "momento", "edad"];

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

  function filterActivities(current) {
    const words = normalize(current.q).split(/\s+/).filter(Boolean);
    return data.activities.filter((activity) => {
      const text = searchIndex.get(activity.id);
      if (!words.every((word) => text.includes(word))) return false;
      return filters.every((filter) => !current[filter.key] || filter.matches(activity, current[filter.key]));
    });
  }

  /*
    Orden en que se sueltan los filtros cuando una combinación no deja nada. Lo último que
    hizo la familia es lo último que se sacrifica; por lo demás cae antes el texto buscado
    (suele ser una palabra que no acierta) y después los chips, del más fino al más grueso.
  */
  function dropOrder(touchedKey) {
    const chipKeys = RELAX_ORDER.filter(
      (key) => filters.some((filter) => filter.key === key) && key !== touchedKey
    );
    if (touchedKey === "q") return [...chipKeys, "q"];
    const order = ["q", ...chipKeys];
    if (touchedKey) order.push(touchedKey);
    return order;
  }

  /*
    La lista nunca se queda vacía: si la combinación pedida no tiene fichas, se van
    soltando filtros hasta que haya algo que mostrar. El ajuste es silencioso a propósito;
    la familia ve siempre una propuesta cercana a lo que pidió, no un aviso de que falló.
  */
  function resolve(requested, touchedKey) {
    const applied = { ...requested };
    const order = dropOrder(touchedKey);
    while (filterActivities(applied).length === 0) {
      const key = order.find((candidate) => applied[candidate]);
      if (!key) break;
      applied[key] = "";
    }
    return applied;
  }

  function describe(applied, total) {
    const singular = total === 1;
    const parts = [];
    filters.forEach((filter) => {
      if (!applied[filter.key]) return;
      const phrase = filter.phrase(applied[filter.key]);
      if (phrase) parts.push(phrase);
    });
    if (applied.q) parts.push(`que ${singular ? "coincide" : "coinciden"} con «${applied.q}»`);
    const noun = singular ? "actividad" : "actividades";
    return `${total} ${noun}${parts.length ? " " + parts.join(" ") : ""}`;
  }

  function activePill(key, label, ignored) {
    const classes = ["filters-active__pill"];
    if (ignored) classes.push("filters-active__pill--ignored");
    return `
      <button class="${classes.join(" ")}" type="button" data-clear-key="${ui.escapeHTML(key)}">
        <span>${ui.escapeHTML(label)}</span>
        ${ignored ? '<span class="visually-hidden">(sin efecto en estos resultados)</span>' : ""}
        <svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-close"></use></svg>
        <span class="visually-hidden">Quitar filtro</span>
      </button>`;
  }

  /*
    Las pastillas enseñan lo que la familia pidió, no solo lo que se pudo aplicar: una
    búsqueda que quedó fuera sigue visible, marcada, para que se entienda y se pueda quitar.
  */
  function renderActiveFilters(requested, applied) {
    const pills = [];
    if (requested.q) pills.push(activePill("q", `«${requested.q}»`, !applied.q));
    filters.forEach((filter) => {
      if (!applied[filter.key]) return;
      const label = filter.label(applied[filter.key]);
      if (label) pills.push(activePill(filter.key, label, false));
    });

    activeFilters.hidden = pills.length === 0;
    activeFilters.innerHTML = pills.length
      ? `<p class="filters-active__label">Filtros activos</p><div class="filters-active__list">${pills.join("")}</div>`
      : "";
  }

  /* Red de seguridad: con el catálogo poblado, `resolve` garantiza que esto no se vea. */
  function syncEmptyState(total) {
    empty.hidden = total > 0;
    if (total > 0 || !emptyBody) return;
    emptyBody.innerHTML = "<p>Vuelve a intentarlo en un momento.</p>";
  }

  function render(requested, applied) {
    const list = filterActivities(applied);
    results.innerHTML = list.map((activity) => `<li>${ui.activityCard(activity, { headingLevel: 2 })}</li>`).join("");
    count.textContent = describe(applied, list.length);
    syncEmptyState(list.length);
    renderActiveFilters(requested, applied);
    syncResetButton(requested);
    syncSearchClear(requested.q);
  }

  let typingTimer;

  /*
    `touchedKey` es el filtro que la familia acaba de tocar. Los chips que haya que soltar
    se desmarcan de verdad, para que lo resaltado y lo filtrado digan siempre lo mismo;
    el texto buscado se respeta tal cual lo escribieron, aunque se quede sin aplicar.
  */
  function update(touchedKey) {
    clearTimeout(typingTimer);
    const requested = readFiltersFromForm();
    const applied = resolve(requested, touchedKey);
    filters.forEach((filter) => checkRadio(filter.key, applied[filter.key]));
    render(requested, applied);
    updateUrl({ ...applied, q: requested.q });
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
    typingTimer = setTimeout(() => update("q"), TYPING_DELAY);
  });
  form.addEventListener("change", (event) => {
    if (event.target.type === "radio") update(event.target.name);
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
