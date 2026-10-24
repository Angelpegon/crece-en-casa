/* Flujo de Experiencias para compartir (6 pasos, según la especificación). */
(function () {
  const { data, ui, progress, album, session } = window.CEC;
  const root = document.querySelector("[data-experience-flow]");
  if (!root || !data || !ui) return;

  const STORAGE_KEY = "crece-en-casa:experiencia-flujo";
  const esc = ui.escapeHTML;

  const STEPS = [
    { n: 1, name: "Elegir mi momento" },
    { n: 2, name: "Personalizar la experiencia" },
    { n: 3, name: "Resultados personalizados" },
    { n: 4, name: "Experiencia paso a paso" },
    { n: 5, name: "Adaptaciones y más opciones" },
    { n: 6, name: "Guardar y compartir" },
  ];

  const ADAPT_CARDS = [
    { id: "corta", title: "Tenemos menos tiempo", lead: "Versión de 2-3 minutos.", key: "corta", icon: "i-clock", tone: "sage" },
    { id: "sencilla", title: "Necesitamos algo más sencillo", lead: "Menos pasos o materiales.", key: "sencilla", icon: "i-juego", tone: "lavender" },
    { id: "noQuiere", title: "Hoy no quiere participar", lead: "Cómo intentarlo sin insistir.", key: "noQuiere", icon: "i-person", tone: "pink" },
    { id: "sinMateriales", title: "No tengo los materiales", lead: "Alternativas con lo que tienes en casa.", key: "sinMateriales", icon: "i-home", tone: "yellow" },
  ];

  function icon(id) {
    return `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#${id}"></use></svg>`;
  }

  const emptyState = {
    step: 1,
    moment: "",
    age: "",
    skill: "",
    duration: "",
    interest: "",
    interestOther: "",
    activityId: "",
    openAdapt: "",
    saved: false,
    shareOpen: false,
    error: "",
  };

  let state = loadState();

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...emptyState };
      const parsed = JSON.parse(raw);
      return { ...emptyState, ...parsed, error: "", shareOpen: false };
    } catch (error) {
      return { ...emptyState };
    }
  }

  function persist() {
    try {
      const { error, shareOpen, ...rest } = state;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (error) {
      /* El flujo sigue en memoria si sessionStorage no está disponible. */
    }
  }

  function setState(patch) {
    state = { ...state, ...patch };
    persist();
    render();
  }

  function goTo(step) {
    setState({ step, error: "", shareOpen: false, openAdapt: step === 5 ? state.openAdapt : "" });
    const heading = root.querySelector("h2, h3");
    if (heading) heading.focus();
    root.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function currentActivity() {
    return data.getActivity(state.activityId);
  }

  function recommendations() {
    return data.recommendExperiences({
      moment: state.moment,
      age: state.age,
      skill: state.skill,
      duration: state.duration,
      interest: state.interest,
    });
  }

  function interestLabel() {
    if (state.interest === "otro") {
      return state.interestOther.trim() || "Otro interés";
    }
    const item = data.getInterest(state.interest);
    return item ? item.label : "";
  }

  function durationPhrase() {
    const duration = data.getExperienceDuration(state.duration);
    if (!duration) return "";
    const map = { "3": "3 minutos", "5": "5 minutos", "10": "10 minutos" };
    return map[duration.id] || duration.label;
  }

  function formatStepText(text) {
    const cut = text.indexOf(". ");
    if (cut === -1) return esc(text);
    return `<strong>${esc(text.slice(0, cut + 1))}</strong> ${esc(text.slice(cut + 2))}`;
  }

  function stepper() {
    const current = STEPS[state.step - 1];
    return `
      <ol class="exp-stepper" aria-label="Progreso de la experiencia">
        ${STEPS.map((step) => {
          const isCurrent = step.n === state.step;
          const done = step.n < state.step;
          const status = isCurrent ? "current" : done ? "done" : "todo";
          return `
            <li class="exp-stepper__item exp-stepper__item--${status}"${isCurrent ? ' aria-current="step"' : ""}>
              <span class="exp-stepper__num">${step.n}</span>
              <span class="exp-stepper__name">${esc(step.name)}</span>
            </li>`;
        }).join("")}
      </ol>
      <header class="exp-stephead">
        <span class="exp-stephead__num">${current.n}</span>
        <p class="exp-stephead__name">${esc(current.name)}</p>
      </header>`;
  }

  function fieldError(id, message) {
    if (state.error !== id) return "";
    return `<p class="exp-field-error" role="alert">${esc(message)}</p>`;
  }

  function liveRegion() {
    return `<p class="visually-hidden" aria-live="polite" data-exp-live></p>`;
  }

  function navButtons({ back, nextLabel, nextAction, nextDisabled, wide }) {
    return `
      <div class="exp-nav${wide ? " exp-nav--wide" : ""}">
        ${
          back
            ? `<button class="btn btn--outline" type="button" data-exp-go="${back}">Atrás</button>`
            : ""
        }
        <button class="btn btn--sage${wide ? " exp-nav__primary" : ""}" type="button" data-exp-action="${nextAction}"${nextDisabled ? " disabled" : ""}>
          ${esc(nextLabel)}
          ${icon("i-arrow")}
        </button>
      </div>`;
  }

  function renderStep1() {
    return `
      <div class="exp-panel">
        ${stepper()}
        <h2 class="exp-title" tabindex="-1">Crea tu experiencia</h2>
        <p class="exp-lead">Cuéntanos un poco sobre tu momento de hoy.</p>
        <fieldset class="exp-fieldset">
          <legend class="exp-question">¿Qué están haciendo?</legend>
          <ul class="moment-grid moment-grid--five exp-moments">
            ${data.moments
              .map((moment) => {
                const selected = state.moment === moment.id;
                const img = moment.image;
                const tileTone = { coral: "pink", green: "pink", yellow: "sage", blue: "sage", lavender: "pink" }[moment.tone] || "sage";
                return `
                  <li>
                    <button class="moment-tile moment-tile--${tileTone}${selected ? " is-selected" : ""}" type="button" data-exp-moment="${moment.id}" aria-pressed="${selected}">
                      ${img ? `<img class="moment-tile__img" src="${img.src}" width="${img.width}" height="${img.height}" alt="" decoding="async">` : ""}
                      <span class="moment-tile__title">${esc(moment.flowLabel || moment.label)}</span>
                    </button>
                  </li>`;
              })
              .join("")}
          </ul>
        </fieldset>
        ${fieldError("moment", "Elige el momento que más se parezca a lo que están haciendo.")}
        <p class="exp-help">Puedes elegir la opción que más se parezca a tu rutina.</p>
        ${navButtons({ nextLabel: "Siguiente", nextAction: "step1-next", wide: true })}
      </div>`;
  }

  function chipGroup(name, items, selected, { valueKey = "id", labelKey = "label", withIcons = false } = {}) {
    return `
      <div class="chip-group${withIcons ? " chip-group--icons" : ""}" role="radiogroup">
        ${items
          .map((item) => {
            const value = item[valueKey];
            const checked = String(selected) === String(value);
            const mark = withIcons && item.icon ? `<span class="chip__glyph">${icon(item.icon)}</span>` : "";
            return `
              <label class="chip${withIcons ? " chip--icon" : ""}">
                <input type="radio" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}>
                <span>${mark}${esc(item[labelKey])}</span>
              </label>`;
          })
          .join("")}
      </div>`;
  }

  function radioList(name, items, selected) {
    return `
      <div class="exp-radios" role="radiogroup">
        ${items
          .map((item) => {
            const checked = String(selected) === String(item.id);
            return `
              <label class="exp-radio">
                <input type="radio" name="${name}" value="${esc(item.id)}"${checked ? " checked" : ""}>
                <span>${esc(item.label)}</span>
              </label>`;
          })
          .join("")}
      </div>`;
  }

  function renderStep2() {
    return `
      <div class="exp-panel">
        ${stepper()}
        <h2 class="exp-title" tabindex="-1">Completa los detalles</h2>
        <p class="exp-lead">Esta información nos ayudará a recomendarte una experiencia especial.</p>
        <form class="exp-form" data-exp-form="details">
          <fieldset class="exp-fieldset" data-field="age">
            <legend class="exp-question">Edad del niño</legend>
            ${chipGroup(
              "age",
              data.ages.map((age) => ({ id: String(age.value), label: age.label })),
              state.age
            )}
            ${fieldError("age", "Elige la edad del niño.")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="skill">
            <legend class="exp-question">¿Qué quieres favorecer?</legend>
            ${radioList("skill", data.experienceSkills, state.skill)}
            ${fieldError("skill", "Elige qué quieres favorecer.")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="duration">
            <legend class="exp-question">Tiempo disponible</legend>
            ${chipGroup("duration", data.experienceDurations, state.duration)}
            ${fieldError("duration", "Elige el tiempo que tienen.")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="interest">
            <legend class="exp-question">Interés del niño</legend>
            ${chipGroup("interest", data.interests, state.interest, { withIcons: true })}
            ${
              state.interest === "otro"
                ? `<label class="exp-other" for="exp-interest-other">Describe su interés
                    <input id="exp-interest-other" name="interestOther" type="text" maxlength="60" value="${esc(state.interestOther)}" placeholder="Por ejemplo: dinosaurios">
                  </label>`
                : ""
            }
            ${fieldError("interest", "Elige un interés o escribe otro.")}
          </fieldset>
          <div class="exp-nav">
            <button class="btn btn--outline" type="button" data-exp-go="1">Atrás</button>
            <button class="btn btn--sage" type="submit">Crear mi experiencia ${icon("i-arrow")}</button>
          </div>
        </form>
      </div>`;
  }

  function summaryList() {
    const moment = data.getMoment(state.moment);
    const age = data.getAge(state.age);
    const skill = data.getExperienceSkill(state.skill);
    const duration = data.getExperienceDuration(state.duration);
    const interest = data.getInterest(state.interest);
    const rows = [
      ["i-person", age ? age.label : ""],
      ["i-home", moment ? moment.label : ""],
      ["i-vocabulario", skill ? skill.label : ""],
      ["i-clock", durationPhrase()],
      [interest && interest.icon ? interest.icon : "i-spark", interestLabel()],
    ].filter((row) => row[1]);
    return `
      <ul class="exp-summary">
        ${rows.map(([ic, label]) => `<li>${icon(ic)}<span>${esc(label)}</span></li>`).join("")}
      </ul>`;
  }

  function thumbCard(activity) {
    const moment = data.getMoment((activity.momentos || [])[0]);
    const media = ui.activityImage(activity);
    return `
      <button class="exp-thumb" type="button" data-exp-open="${esc(activity.id)}">
        ${ui.imageTag(media, { alt: "", attrs: 'decoding="async"' })}
        <span class="exp-thumb__title">${esc(activity.title)}</span>
        <span class="exp-thumb__meta">${esc(activity.duration)}${moment ? ` · ${esc(moment.shortLabel)}` : ""}</span>
      </button>`;
  }

  function renderStep3() {
    const { main, alternatives } = recommendations();
    if (!main) {
      return `
        <div class="exp-panel">
          ${stepper()}
          <h2 class="exp-title" tabindex="-1">Aún no encontramos una experiencia</h2>
          <p class="exp-lead">Prueba con otra combinación o mira el catálogo completo.</p>
          <div class="exp-nav">
            <button class="btn btn--outline" type="button" data-exp-go="2">Atrás</button>
            <a class="btn btn--sage" href="explorar-actividades.html">Ver todas las actividades</a>
          </div>
        </div>`;
    }
    return `
      <div class="exp-panel">
        ${stepper()}
        <img class="exp-deco" src="assets/img/temporal/home-zorro.png" width="180" height="180" alt="" decoding="async">
        <h2 class="exp-title exp-title--center" tabindex="-1">¡Perfecto!</h2>
        <p class="exp-lead exp-lead--center">Aquí tienes tu experiencia personalizada</p>
        ${summaryList()}
        ${
          alternatives.length
            ? `<section class="exp-alts" aria-labelledby="alts-title">
                <h3 id="alts-title">También podrías explorar:</h3>
                <div class="exp-alts__grid">${alternatives.map((item) => thumbCard(item)).join("")}</div>
              </section>`
            : ""
        }
        ${navButtons({ back: 2, nextLabel: "Continuar", nextAction: "to-detail" })}
      </div>`;
  }

  function renderStep4() {
    const activity = currentActivity();
    if (!activity) return renderStep3();
    const moment = data.getMoment(state.moment);
    const age = data.getAge(state.age);
    const skill = data.getExperienceSkill(state.skill);
    const media = ui.activityImage(activity);
    const materials = activity.materials && activity.materials.length
      ? activity.materials
      : [];
    return `
      <div class="exp-panel">
        ${stepper()}
        <p class="exp-eyebrow">${icon("d-heart")} Tu experiencia de hoy</p>
        <h2 class="exp-title" tabindex="-1">${esc(activity.title)}</h2>
        <p class="exp-lead">${esc(activity.tagline)}</p>
        ${ui.imageTag(media, { alt: activity.imageAlt || "", attrs: 'class="exp-detail__img" decoding="async"' })}
        <ul class="exp-tags">
          ${age ? `<li>${icon("i-person")} Edad ${esc(age.label)}</li>` : ""}
          ${durationPhrase() ? `<li>${icon("i-clock")} Tiempo ${esc(durationPhrase())}</li>` : ""}
          ${skill ? `<li>${icon("i-vocabulario")} Área ${esc(skill.label)}</li>` : ""}
          ${moment ? `<li>${icon("i-home")} Momento ${esc(moment.shortLabel || moment.label)}</li>` : ""}
          ${interestLabel() ? `<li>${icon((data.getInterest(state.interest) || {}).icon || "i-spark")} Interés ${esc(interestLabel())}</li>` : ""}
        </ul>
        <h3>¿Cómo lo hacemos?</h3>
        ${activity.before ? `<p>${esc(activity.before)}</p>` : ""}
        <ol class="steps exp-steps">
          ${activity.steps.map((step) => `<li>${formatStepText(step)}</li>`).join("")}
        </ol>
        ${activity.accompany ? `<p>${esc(activity.accompany)}</p>` : ""}
        <details class="exp-materials">
          <summary>Materiales <span aria-hidden="true">+</span></summary>
          ${
            materials.length
              ? `<ul class="bullet-list">${materials.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
              : "<p>¡No necesitas materiales especiales!</p>"
          }
        </details>
        ${navButtons({ back: 3, nextLabel: "Siguiente", nextAction: "to-adapt" })}
      </div>`;
  }

  function renderStep5() {
    const activity = currentActivity();
    if (!activity) return renderStep3();
    const { extended } = recommendations();
    const adaptations = activity.adaptations || {};
    return `
      <div class="exp-panel">
        ${stepper()}
        <h2 class="exp-title" tabindex="-1">¿Necesitas otra forma?</h2>
        <ul class="exp-adapt">
          ${ADAPT_CARDS.map((card) => {
            const open = state.openAdapt === card.id;
            const body = adaptations[card.key] || activity.adapt || "";
            return `
              <li class="exp-adapt__item exp-adapt__item--${card.tone}${open ? " is-open" : ""}">
                <button class="exp-adapt__card" type="button" data-exp-adapt="${card.id}" aria-expanded="${open}">
                  ${icon(card.icon)}
                  <strong>${esc(card.title)}</strong>
                  <span>${esc(card.lead)}</span>
                </button>
                ${open && body ? `<p class="exp-adapt__body">${esc(body)}</p>` : ""}
              </li>`;
          }).join("")}
        </ul>
        <h3>¿Quieres continuar?</h3>
        <p class="exp-lead">Puedes ampliar la experiencia con una variación.</p>
        <div class="exp-continue">
          ${
            extended
              ? `<button class="exp-option" type="button" data-exp-open="${esc(extended.id)}">
                  ${ui.imageTag(ui.activityImage(extended), { alt: "", attrs: 'decoding="async"' })}
                  <span>
                    <strong>Versión extendida</strong>
                    ${esc(extended.title)} · ${esc(extended.duration)}
                  </span>
                </button>`
              : ""
          }
          ${
            activity.download
              ? `<a class="exp-option" href="${esc(activity.download.href)}" download>
                  ${icon("i-print")}
                  <span><strong>Descargar material</strong>${esc(activity.download.label || "Tarjetas de apoyo")}</span>
                </a>`
              : ""
          }
        </div>
        ${navButtons({ back: 4, nextLabel: "Guardar este momento", nextAction: "to-save" })}
      </div>`;
  }

  function sharePreview() {
    const activity = currentActivity();
    if (!activity) return "";
    const profile = session && session.get ? session.get() : null;
    return `
      <div class="exp-share" role="dialog" aria-labelledby="share-title">
        <h3 id="share-title">Revisa antes de compartir</h3>
        <p>Nada se publica solo. Si continúas, irás a la comunidad para ver cómo se cuentan las experiencias de otras familias.</p>
        <ul class="exp-share__preview">
          ${profile && profile.name ? `<li><strong>Quién:</strong> ${esc(profile.name)}</li>` : ""}
          <li><strong>Experiencia:</strong> ${esc(activity.title)}</li>
          <li><strong>Momento:</strong> ${esc((data.getMoment(state.moment) || {}).flowLabel || (data.getMoment(state.moment) || {}).label || "")}</li>
        </ul>
        <p class="exp-help">Compartir es opcional. Podrás revisar el contenido antes de publicarlo.</p>
        <div class="exp-nav">
          <button class="btn btn--outline" type="button" data-exp-action="share-cancel">Seguir aquí</button>
          <a class="btn btn--sage" href="experiencias-familias.html">Ir a la comunidad</a>
        </div>
      </div>`;
  }

  function renderStep6() {
    const activity = currentActivity();
    const canStore = (progress && progress.isAvailable()) || (album && album.isAvailable());
    return `
      <div class="exp-panel exp-panel--save">
        ${stepper()}
        <img class="exp-deco exp-deco--wide" src="assets/img/temporal/exp-nina-zorro.jpg" width="900" height="720" alt="" decoding="async">
        <h2 class="exp-title exp-title--center" tabindex="-1">¡Momento guardado!</h2>
        <p class="exp-lead exp-lead--center">Este recuerdo ya forma parte de tu historia.</p>
        ${
          !canStore
            ? `<p class="notice notice--warm">No pudimos guardar en este navegador. Puedes copiar el nombre de la experiencia: ${activity ? esc(activity.title) : ""}.</p>`
            : session && session.isSignedIn && !session.isSignedIn()
              ? `<p class="notice">Se guardó en este navegador. Si quieres un nombre en Mi camino, puedes <a href="mi-espacio.html">crear tu espacio</a>.</p>`
              : ""
        }
        <div class="exp-actions exp-actions--stack">
          <a class="btn btn--sage" href="mi-camino.html">Ir a mi historia ${icon("i-arrow")}</a>
          <button class="btn btn--outline" type="button" data-exp-action="share-open">Compartir en la comunidad</button>
          <button class="btn btn--outline" type="button" data-exp-action="restart">Crear otra experiencia</button>
        </div>
        <p class="exp-help">Compartir es opcional. Podrás revisar el contenido antes de publicarlo.</p>
        ${state.shareOpen ? sharePreview() : ""}
      </div>`;
  }

  function announce(message) {
    const live = root.querySelector("[data-exp-live]");
    if (live) live.textContent = message;
  }

  function render() {
    const views = {
      1: renderStep1,
      2: renderStep2,
      3: renderStep3,
      4: renderStep4,
      5: renderStep5,
      6: renderStep6,
    };
    const view = views[state.step] || renderStep1;
    root.innerHTML = liveRegion() + view();
  }

  function validateStep1() {
    if (state.moment) return true;
    setState({ error: "moment" });
    announce("Elige el momento que más se parezca a lo que están haciendo.");
    return false;
  }

  function readDetailsForm(form) {
    const formData = new FormData(form);
    return {
      age: String(formData.get("age") || ""),
      skill: String(formData.get("skill") || ""),
      duration: String(formData.get("duration") || ""),
      interest: String(formData.get("interest") || ""),
      interestOther: String(formData.get("interestOther") || "").trim(),
    };
  }

  function validateStep2(form) {
    const next = readDetailsForm(form);
    if (!next.age) {
      setState({ ...next, error: "age" });
      announce("Elige la edad del niño.");
      return null;
    }
    if (!next.skill) {
      setState({ ...next, error: "skill" });
      announce("Elige qué quieres favorecer.");
      return null;
    }
    if (!next.duration) {
      setState({ ...next, error: "duration" });
      announce("Elige el tiempo que tienen.");
      return null;
    }
    if (!next.interest || (next.interest === "otro" && !next.interestOther)) {
      setState({ ...next, error: "interest" });
      announce("Elige un interés o escribe otro.");
      return null;
    }
    return next;
  }

  function createExperience(details) {
    const recs = data.recommendExperiences({
      moment: state.moment,
      age: details.age,
      skill: details.skill,
      duration: details.duration,
      interest: details.interest,
    });
    setState({
      ...details,
      activityId: recs.main ? recs.main.id : "",
      step: 3,
      error: "",
      saved: false,
    });
  }

  function openActivity(id) {
    if (!data.getActivity(id)) return;
    setState({ activityId: id, step: 4, error: "" });
  }

  function saveMoment() {
    const activity = currentActivity();
    if (!activity) {
      goTo(3);
      return;
    }
    if (progress && progress.isAvailable()) {
      progress.set("activity", activity.id, { state: "tried", moment: state.moment || null });
    }
    if (album && album.isAvailable()) {
      album.add({
        title: activity.title,
        note: `Experiencia para compartir · ${interestLabel() || (data.getMoment(state.moment) || {}).label || ""}`.trim(),
        momentId: state.moment || null,
      });
    }
    setState({ step: 6, saved: true, error: "", shareOpen: false });
  }

  function restart() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* no-op */
    }
    state = { ...emptyState };
    render();
    announce("Puedes crear otra experiencia.");
    root.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  root.addEventListener("click", (event) => {
    const momentBtn = event.target.closest("[data-exp-moment]");
    if (momentBtn) {
      setState({ moment: momentBtn.getAttribute("data-exp-moment"), error: "" });
      return;
    }

    const go = event.target.closest("[data-exp-go]");
    if (go) {
      goTo(Number(go.getAttribute("data-exp-go")));
      return;
    }

    const actionBtn = event.target.closest("[data-exp-action]");
    if (actionBtn) {
      const action = actionBtn.getAttribute("data-exp-action");
      if (action === "step1-next") {
        if (validateStep1()) goTo(2);
        return;
      }
      if (action === "to-detail") {
        if (state.activityId) goTo(4);
        return;
      }
      if (action === "to-adapt") {
        goTo(5);
        return;
      }
      if (action === "to-save") {
        saveMoment();
        return;
      }
      if (action === "share-open") {
        setState({ shareOpen: true });
        return;
      }
      if (action === "share-cancel") {
        setState({ shareOpen: false });
        return;
      }
      if (action === "restart") {
        restart();
      }
      return;
    }

    const openBtn = event.target.closest("[data-exp-open]");
    if (openBtn) {
      openActivity(openBtn.getAttribute("data-exp-open"));
      return;
    }

    const adaptBtn = event.target.closest("[data-exp-adapt]");
    if (adaptBtn) {
      const id = adaptBtn.getAttribute("data-exp-adapt");
      setState({ openAdapt: state.openAdapt === id ? "" : id });
    }
  });

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-exp-form='details']");
    if (!form) return;
    event.preventDefault();
    const details = validateStep2(form);
    if (details) createExperience(details);
  });

  root.addEventListener("change", (event) => {
    const form = event.target.closest("[data-exp-form='details']");
    if (!form) return;
    const next = readDetailsForm(form);
    setState({ ...next, error: "" });
  });

  root.addEventListener("keydown", (event) => {
    const tile = event.target.closest("[data-exp-moment]");
    if (!tile) return;
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const tiles = Array.from(root.querySelectorAll("[data-exp-moment]"));
    const index = tiles.indexOf(tile);
    if (index < 0) return;
    const cols = window.matchMedia("(min-width: 30em)").matches ? 2 : 1;
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tiles.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tiles.length) % tiles.length;
    if (event.key === "ArrowDown") next = Math.min(tiles.length - 1, index + cols);
    if (event.key === "ArrowUp") next = Math.max(0, index - cols);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tiles.length - 1;
    if (next === index) return;
    event.preventDefault();
    tiles[next].focus();
  });

  render();
})();
