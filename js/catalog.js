/* Catálogo de actividades: filtros combinables sincronizados con la URL. */
(function () {
  const { data, ui } = window.CEC;

  const form = document.querySelector("[data-filters]");
  const groupsHost = form && form.querySelector("[data-filter-groups]");
  const results = document.querySelector("[data-results]");
  const count = document.querySelector("[data-results-count]");
  const empty = document.querySelector("[data-empty]");
  const emptyBody = empty && empty.querySelector("[data-empty-body]");
  const notice = document.querySelector("[data-filters-notice]");
  const resetButton = form && form.querySelector("[data-reset-filters]");
  const clearSearchButton = form && form.querySelector("[data-clear-search]");
  const activeFilters = document.querySelector("[data-active-filters]");
  if (!form || !groupsHost || !results || !count || !empty || !activeFilters) return;

  const SEARCH_LINK = 'a[href="explorar-actividades.html#buscar"]';
  const TYPING_DELAY = 300;

  /*
    Cada filtro se declara una sola vez. De aquí salen los chips, la lectura de la URL,
    las pastillas de filtros activos, el texto del contador y el cálculo de disponibilidad,
    así que añadir un filtro nuevo no obliga a tocar cinco sitios distintos.
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

  /* Al soltar un filtro se empieza por el final de esta lista: lo más fino cae primero. */
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
        <span>${glyph}${ui.escapeHTML(option.label)}<span class="chip__note visually-hidden"></span></span>
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

  /* `exceptKey` deja fuera un grupo para poder contar cuánto ofrecería cada una de sus opciones. */
  function filterActivities(current, exceptKey) {
    const words = normalize(current.q).split(/\s+/).filter(Boolean);
    return data.activities.filter((activity) => {
      const text = searchIndex.get(activity.id);
      if (!words.every((word) => text.includes(word))) return false;
      return filters.every(
        (filter) =>
          filter.key === exceptKey || !current[filter.key] || filter.matches(activity, current[filter.key])
      );
    });
  }

  /*
    Un chip solo queda activo si, junto al resto de filtros, deja algo que ver. El recuento
    ignora su propio grupo, así que moverse dentro de un grupo nunca puede vaciar la lista:
    cualquier opción pulsable garantiza al menos una actividad.
  */
  function syncAvailability(current) {
    filters.forEach((filter) => {
      const pool = filterActivities(current, filter.key);
      filter.options.forEach((option) => {
        const label = chipNodes.get(`${filter.key}:${option.value}`);
        if (!label) return;
        const input = label.querySelector("input");
        const note = label.querySelector(".chip__note");
        const available = pool.some((activity) => filter.matches(activity, option.value));
        /* La opción marcada nunca se bloquea: hay que poder salir de ella. */
        const blocked = !available && !input.checked;
        input.disabled = blocked;
        label.classList.toggle("chip--unavailable", blocked);
        if (note) note.textContent = blocked ? " (sin actividades con los filtros actuales)" : "";
      });
    });
  }

  /*
    Una URL compartida puede traer una combinación sin fichas. En vez de recibir a la familia
    con una pantalla vacía, se sueltan filtros por orden hasta que haya algo que mostrar.
  */
  function relax(current) {
    const dropped = [];
    const keys = RELAX_ORDER.filter((key) => filters.some((filter) => filter.key === key));
    while (filterActivities(current).length === 0) {
      const key = keys.find((candidate) => current[candidate]);
      if (!key) break;
      current[key] = "";
      dropped.push(key);
    }
    return dropped;
  }

  function listText(items) {
    if (items.length <= 1) return items[0] || "";
    return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
  }

  function showNotice(dropped) {
    if (!notice) return;
    if (!dropped.length) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }
    const names = dropped
      .map((key) => (filters.find((filter) => filter.key === key) || {}).legend)
      .filter(Boolean)
      .map((name) => name.toLowerCase());
    const plural = names.length > 1;
    notice.hidden = false;
    notice.textContent = `Esa combinación no tenía actividades, así que quitamos ${
      plural ? "los filtros" : "el filtro"
    } de ${listText(names)} para mostrarte propuestas.`;
  }

  function describe(current, total) {
    const singular = total === 1;
    const parts = [];
    filters.forEach((filter) => {
      if (!current[filter.key]) return;
      const phrase = filter.phrase(current[filter.key]);
      if (phrase) parts.push(phrase);
    });
    if (current.q) parts.push(`que ${singular ? "coincide" : "coinciden"} con «${current.q}»`);
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

  /*
    Con los chips vigilados, el vacío solo llega por texto escrito. Se ofrece la salida más
    corta: soltar los chips si la búsqueda sola sí encuentra algo, o limpiar la búsqueda.
  */
  function syncEmptyState(current, total) {
    empty.hidden = total > 0;
    if (total > 0 || !emptyBody) return;
    const onlySearch = filterActivities({ q: current.q });
    const chipsApplied = filters.some((filter) => Boolean(current[filter.key]));
    if (chipsApplied && onlySearch.length > 0) {
      const singular = onlySearch.length === 1;
      emptyBody.innerHTML = `
        <p>Hay ${onlySearch.length} ${singular ? "actividad que coincide" : "actividades que coinciden"} con «${ui.escapeHTML(
        current.q
      )}», pero no con el resto de filtros.</p>
        <button class="btn btn--coral" type="button" data-empty-action="chips">Quitar los demás filtros</button>`;
      return;
    }
    if (current.q) {
      emptyBody.innerHTML = `
        <p>No hay actividades que coincidan con «${ui.escapeHTML(current.q)}». Prueba con otra palabra.</p>
        <button class="btn btn--coral" type="button" data-empty-action="search">Limpiar la búsqueda</button>`;
      return;
    }
    emptyBody.innerHTML = `
      <p>Prueba con otra combinación.</p>
      <button class="btn btn--coral" type="button" data-empty-action="all">Ver todas las actividades</button>`;
  }

  function render(current) {
    const list = filterActivities(current);
    results.innerHTML = list.map((activity) => `<li>${ui.activityCard(activity, { headingLevel: 2 })}</li>`).join("");
    count.textContent = describe(current, list.length);
    syncEmptyState(current, list.length);
    renderActiveFilters(current);
    syncResetButton(current);
    syncSearchClear(current.q);
    syncAvailability(current);
  }

  let typingTimer;

  function update() {
    clearTimeout(typingTimer);
    showNotice([]);
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

  function clearChips() {
    filters.forEach((filter) => checkRadio(filter.key, ""));
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

  empty.addEventListener("click", (event) => {
    const button = event.target.closest("[data-empty-action]");
    if (!button) return;
    const action = button.getAttribute("data-empty-action");
    if (action === "chips") clearChips();
    else if (action === "search") clearSearch();
    else {
      clearChips();
      clearSearch();
    }
    update();
    focusSearch();
  });

  document.querySelectorAll(SEARCH_LINK).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusSearch();
    });
  });

  const cameFromSearchLink = window.location.hash === "#buscar";
  const initial = readFiltersFromUrl();
  const dropped = relax(initial);
  applyFiltersToForm(initial);
  render(initial);
  updateUrl(initial);
  showNotice(dropped);

  if (cameFromSearchLink) {
    focusSearch();
    window.addEventListener("load", () => requestAnimationFrame(focusSearch), { once: true });
  }
})();
