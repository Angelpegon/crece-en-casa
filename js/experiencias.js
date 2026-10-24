/* Flujo de Experiencias para compartir (6 pasos, según la especificación). */
(function () {
  const { data, ui, progress, album, session } = window.CEC;
  const root = document.querySelector("[data-experience-flow]");
  if (!root || !data || !ui) return;

  const STORAGE_KEY = "crece-en-casa:experiencia-flujo";
  const MOMENT_ALERT_DURATION_MS = 5000;
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
    saveIntent: "",
    saveMessage: "",
    saveError: "",
    shareOpen: false,
    momentAlert: false,
    error: "",
    activityStep: 0,
    activityStopped: false,
    observation: "",
  };

  let state = loadState();
  let momentAlertTimer = null;

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...emptyState };
      const parsed = JSON.parse(raw);
      return { ...emptyState, ...parsed, error: "", shareOpen: false, momentAlert: false };
    } catch (error) {
      return { ...emptyState };
    }
  }

  function persist() {
    try {
      const { error, shareOpen, momentAlert, ...rest } = state;
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

  function focusControl(selector, attribute, value) {
    const control = Array.from(root.querySelectorAll(selector))
      .find((item) => item.getAttribute(attribute) === value);
    if (control) control.focus({ preventScroll: true });
  }

  function goTo(step) {
    clearTimeout(momentAlertTimer);
    momentAlertTimer = null;
    setState({
      step,
      error: "",
      shareOpen: false,
      momentAlert: false,
      openAdapt: step === 5 ? state.observation === "observed" ? "noQuiere" : state.openAdapt : "",
    });
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

  function momentLabel() {
    const moment = data.getMoment(state.moment);
    return moment ? moment.shortLabel || moment.label : "este momento";
  }

  function positiveFeedback(message, announceChange = true, { title = "¡Eso también cuenta!", compact = false, field = "" } = {}) {
    return `
      <div class="exp-feedback${compact ? " exp-feedback--compact" : ""}"${announceChange ? ' role="status"' : ""}${field ? ` data-exp-feedback-field="${field}"` : ""}>
        <span class="exp-feedback__spark" aria-hidden="true">✦</span>
        ${compact ? "" : `<img class="exp-feedback__mascot" src="assets/img/temporal/home-zorro.png" width="180" height="180" alt="" loading="lazy" decoding="async">`}
        <span class="exp-feedback__copy">
          <strong class="exp-feedback__title">${esc(title)}</strong>
          <span>${esc(message)}</span>
        </span>
      </div>`;
  }

  function fieldMessage(field) {
    if (field === "age") return `Pensaremos una idea acorde a su edad (${(data.getAge(state.age) || {}).label || state.age}) y a su propio ritmo.`;
    if (field === "skill") return `Acompañaremos ${((data.getExperienceSkill(state.skill) || {}).label || "lo que quieren practicar").toLowerCase()} dentro de un momento cotidiano, sin convertirlo en una prueba.`;
    if (field === "duration") return `${durationPhrase()} también alcanzan para compartir algo valioso.`;
    if (field === "interest") return `Podemos partir de ${interestLabel() || "lo que le gusta"}: seguir su curiosidad es una linda forma de conectar.`;
    return "";
  }

  function fieldFeedbackTitle(field) {
    return ({
      age: "A su propio ritmo",
      skill: "Una intención bonita",
      duration: "Un momento que cabe",
      interest: "Sigamos su curiosidad",
    })[field] || "¡Buena elección!";
  }

  function fieldFeedback(field) {
    return state[field] ? positiveFeedback(fieldMessage(field), false, { compact: true, title: fieldFeedbackTitle(field), field }) : "";
  }

  function completedDetailCount() {
    const interestComplete = state.interest && (state.interest !== "otro" || state.interestOther.trim());
    return ["age", "skill", "duration"].filter((field) => state[field]).length + Number(Boolean(interestComplete));
  }

  function detailsProgress() {
    const count = completedDetailCount();
    return `
      <div class="exp-detail-progress" role="progressbar" aria-label="${count} de 4 detalles elegidos" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${count}" data-exp-detail-progress>
        <div class="exp-detail-progress__copy">
          <span data-exp-detail-label>${count === 4 ? "¡Ya tenemos todo para buscar su idea!" : `${count} de 4 detalles para preparar su idea`}</span>
          <strong data-exp-detail-count>${count}/4</strong>
        </div>
        <span class="exp-detail-progress__track" aria-hidden="true"><span data-exp-detail-bar style="width:${count * 25}%"></span></span>
      </div>`;
  }

  function updateDetailsProgress() {
    const progressMeter = root.querySelector("[data-exp-detail-progress]");
    if (!progressMeter) return;
    const count = completedDetailCount();
    progressMeter.setAttribute("aria-label", `${count} de 4 detalles elegidos`);
    progressMeter.setAttribute("aria-valuenow", String(count));
    progressMeter.querySelector("[data-exp-detail-label]").textContent = count === 4
      ? "¡Ya tenemos todo para buscar su idea!"
      : `${count} de 4 detalles para preparar su idea`;
    progressMeter.querySelector("[data-exp-detail-count]").textContent = `${count}/4`;
    progressMeter.querySelector("[data-exp-detail-bar]").style.width = `${count * 25}%`;
  }

  function updateInterestFeedback() {
    const feedback = root.querySelector('[data-exp-feedback-field="interest"] .exp-feedback__copy > span');
    if (feedback) feedback.textContent = fieldMessage("interest");
  }

  function activityProgress(activityStep, total, { stopped = false } = {}) {
    const completed = Math.min(activityStep, total);
    const label = stopped
      ? `Pausamos aquí · ${completed} de ${total}`
      : completed === total
        ? "¡Momento compartido!"
        : `Vamos juntos · ${completed} de ${total}`;
    return `
      <div class="exp-activity-progress" role="progressbar" aria-label="${completed} de ${total} ideas compartidas" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}">
        <span class="exp-activity-progress__label">${label}</span>
        <span class="exp-activity-progress__track"><span style="width:${total ? completed / total * 100 : 0}%"></span></span>
        <span class="exp-activity-progress__steps" aria-hidden="true">${Array.from({ length: total }, (_, index) => `<span class="${index < completed ? "is-done" : ""}">${index < completed ? "✓" : index + 1}</span>`).join("")}</span>
      </div>`;
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
        <p class="exp-lead">Empecemos por algo que ya está pasando. No hay una respuesta incorrecta.</p>
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
        ${state.momentAlert ? renderMomentAlert() : ""}
      </div>`;
  }

  function renderMomentAlert() {
    return `
      <div class="exp-choice-toast" data-exp-moment-dialog role="status" aria-live="polite" aria-atomic="true" aria-labelledby="exp-moment-alert-title">
        <div class="exp-choice-toast__backdrop" aria-hidden="true"></div>
        <div class="exp-choice-toast__card">
          <span class="exp-choice-toast__spark" aria-hidden="true">✦</span>
          <img src="assets/img/temporal/home-zorro.png" width="180" height="180" alt="" class="exp-choice-toast__mascot">
          <p class="exp-eyebrow">Un buen comienzo</p>
          <h2 id="exp-moment-alert-title">¡Encontraste una oportunidad!</h2>
          <p id="exp-moment-alert-message">Partir de ${esc(momentLabel())} les da una idea cercana para conversar, jugar y conectar a su manera.</p>
        </div>
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
        ${detailsProgress()}
        <form class="exp-form" data-exp-form="details">
          <fieldset class="exp-fieldset" data-field="age">
            <legend class="exp-question">¿Qué edad tiene?</legend>
            ${chipGroup(
              "age",
              data.ages.map((age) => ({ id: String(age.value), label: age.label })),
              state.age
            )}
            ${fieldFeedback("age")}
            ${fieldError("age", "Elige la edad del niño.")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="skill">
            <legend class="exp-question">¿Qué les gustaría disfrutar o practicar?</legend>
            ${radioList("skill", data.experienceSkills, state.skill)}
            ${fieldFeedback("skill")}
            ${fieldError("skill", "Elige qué quieres favorecer.")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="duration">
            <legend class="exp-question">Tiempo disponible</legend>
            ${chipGroup("duration", data.experienceDurations, state.duration)}
            ${fieldFeedback("duration")}
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
            ${fieldFeedback("interest")}
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
    const matchDetails = [
      `lo que están haciendo (${momentLabel()})`,
      interestLabel() ? `su interés por ${interestLabel()}` : "",
      durationPhrase() ? `el tiempo disponible (${durationPhrase()})` : "",
    ].filter(Boolean).join(", ");
    return `
      <div class="exp-panel">
        ${stepper()}
        <img class="exp-deco" src="assets/img/temporal/home-zorro.png" width="180" height="180" alt="" decoding="async">
        <h2 class="exp-title exp-title--center" tabindex="-1">¡Perfecto!</h2>
        <p class="exp-lead exp-lead--center">Esta idea toma en cuenta ${esc(matchDetails)}. Puedes cambiarla si otra les llama más.</p>
        ${positiveFeedback(`La propuesta ${main.title} es solo una invitación. Pueden adaptarla y seguir el interés de tu niño.`, true, { title: "¡Zorrito encontró una idea para ustedes!" })}
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
    const observationChoices = [
      { id: "interested", icon: "i-spark", label: "Se interesó o se acercó", message: "¡Qué bien! Su interés y atención ya son una forma de encontrarse contigo.", title: "¡Se encontraron en este momento!" },
      { id: "communicated", icon: "i-vocabulario", label: "Miró, señaló, hizo un sonido o dijo algo", message: "¡Qué valioso! Cada mirada, gesto, sonido o palabra puede ser parte de la conversación.", title: "¡Te contó algo a su manera!" },
      { id: "observed", icon: "i-person", label: "Prefirió observar, cambiar o parar", message: "También está bien. Respetar su ritmo cuida la confianza; pueden retomarlo otro día.", title: "¡Escuchar también es acompañar!" },
    ];
    const activityStep = state.activityStep || 0;
    const finished = state.activityStopped || activityStep >= activity.steps.length;
    const observation = observationChoices.find((item) => item.id === state.observation);
    const playAlong = finished
      ? `<div class="exp-playalong exp-playalong--done">
          ${activityProgress(activityStep, activity.steps.length, { stopped: state.activityStopped })}
          ${positiveFeedback(state.observation === "observed"
            ? "Hicieron bien en escuchar su ritmo. Observar, cambiar de actividad o parar también son formas de cuidarse."
            : "¡Compartieron este momento a su manera! Estar juntos ya cuenta; no hacía falta completar nada perfecto.", true, { title: state.observation === "observed" ? "Un cierre lleno de cuidado" : "¡Lo hicieron juntos!" })}
          ${navButtons({ back: 3, nextLabel: "Ver formas de adaptarlo", nextAction: "to-adapt" })}
        </div>`
      : `<section class="exp-playalong" aria-labelledby="exp-playalong-title">
          ${activityProgress(activityStep, activity.steps.length)}
          <h3 id="exp-playalong-title">${formatStepText(activity.steps[activityStep])}</h3>
          <p class="exp-help">Prueben esta idea juntos. ¿Qué pasó? Cualquier respuesta está bien.</p>
          <div class="exp-observations" aria-label="¿Qué pasó?">
            ${observationChoices.map((item) => `<button class="exp-observation${state.observation === item.id ? " is-selected" : ""}" type="button" data-exp-observation="${item.id}" aria-pressed="${state.observation === item.id}">${icon(item.icon)}<span>${esc(item.label)}</span></button>`).join("")}
          </div>
          ${observation ? positiveFeedback(observation.message, true, { title: observation.title }) : ""}
          ${observation ? `<button class="btn btn--sage" type="button" data-exp-play-next>${observation.id === "observed" ? "Cerrar por hoy" : activityStep + 1 === activity.steps.length ? "Cerrar este momento" : "Continuar a la siguiente idea"} ${icon("i-arrow")}</button>` : ""}
        </section>`;
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
        <h3>Hagámoslo juntos, a su ritmo</h3>
        ${activity.before ? `<p>${esc(activity.before)}</p>` : ""}
        ${playAlong}
        ${activity.accompany ? `<p>${esc(activity.accompany)}</p>` : ""}
        <details class="exp-materials">
          <summary>Materiales <span aria-hidden="true">+</span></summary>
          ${
            materials.length
              ? `<ul class="bullet-list">${materials.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
              : "<p>¡No necesitas materiales especiales!</p>"
          }
        </details>
        ${finished ? "" : `<div class="exp-nav"><button class="btn btn--outline" type="button" data-exp-go="3">Volver a la idea</button></div>`}
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
        <p class="exp-lead">Ajustar el plan también es acompañar. Elige lo que mejor les venga hoy.</p>
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
                ${open && body ? `${positiveFeedback("Sí, esta también es una buena manera de cuidar el momento.", true, { compact: true, title: "¡Buen plan!" })}<p class="exp-adapt__body">${esc(body)}</p>` : ""}
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
        ${navButtons({ back: 4, nextLabel: "Elegir cómo guardarla", nextAction: "to-save" })}
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
    if (state.saved) {
      return `
        <div class="exp-panel exp-panel--save">
          ${stepper()}
          <h2 class="exp-title exp-title--center" tabindex="-1">Gracias por compartir cómo les fue</h2>
          <p class="exp-lead exp-lead--center">${esc(state.saveMessage || "La experiencia quedó guardada anteriormente en este navegador.")}</p>
          ${positiveFeedback("No hay una única forma correcta de vivir este momento. Puedes volver a esta experiencia cuando quieras.", true, { title: "¡Un recuerdo para celebrar!" })}
          ${state.saveError ? `<p class="notice notice--warm" role="status">${esc(state.saveError)}</p>` : ""}
          <div class="exp-nav">
            <button class="btn btn--outline" type="button" data-exp-go="5">Volver a adaptaciones</button>
          </div>
          <div class="exp-actions exp-actions--stack">
            <a class="btn btn--sage" href="mi-camino.html">Ir a mi historia ${icon("i-arrow")}</a>
            <button class="btn btn--outline" type="button" data-exp-action="share-open">Compartir en la comunidad</button>
            <button class="btn btn--outline" type="button" data-exp-action="restart">Crear otra experiencia</button>
          </div>
          <p class="exp-help">Compartir es opcional. Podrás revisar el contenido antes de publicarlo.</p>
          ${state.shareOpen ? sharePreview() : ""}
        </div>`;
    }
    const saveOptions = [
      { id: "later", icon: "i-clock", label: "La guardamos para otro día", detail: "Aún no la probamos o queremos retomarla después.", message: "Perfecto. Dejar una idea para otro momento también es avanzar.", title: "¡La idea queda lista para ustedes!" },
      { id: "tried", icon: "i-brote", label: "La compartimos hoy", detail: "La intentamos juntos, aunque haya sido solo un instante.", message: "¡Qué valioso! Cada intento cuenta, sin importar cómo resultó.", title: "¡Cada intento merece celebrarse!" },
    ];
    const selectedSaveOption = saveOptions.find((option) => option.id === state.saveIntent);
    return `
      <div class="exp-panel exp-panel--save">
        ${stepper()}
        <h2 class="exp-title exp-title--center" tabindex="-1">¿Cómo quieres guardar esta experiencia?</h2>
        <p class="exp-lead exp-lead--center">Tú decides qué refleja mejor lo que pasó. No hay una respuesta mejor que otra.</p>
        <div class="exp-save-options" role="group" aria-label="Elige cómo guardar la experiencia">
          ${saveOptions.map((option) => `
            <button class="exp-save-option${state.saveIntent === option.id ? " is-selected" : ""}" type="button" data-exp-save-intent="${option.id}" aria-pressed="${state.saveIntent === option.id}">
              ${icon(option.icon)}
              <strong>${esc(option.label)}</strong>
              <span>${esc(option.detail)}</span>
            </button>`).join("")}
        </div>
        ${selectedSaveOption ? positiveFeedback(selectedSaveOption.message, true, { title: selectedSaveOption.title }) : ""}
        ${state.saveError ? `<p class="notice notice--warm" role="alert">${esc(state.saveError)}</p>` : ""}
        <div class="exp-nav">
          <button class="btn btn--outline" type="button" data-exp-go="5">Atrás</button>
          <button class="btn btn--sage" type="button" data-exp-action="save-choice"${state.saveIntent ? "" : " disabled"}>Guardar mi decisión ${icon("i-arrow")}</button>
        </div>
        ${activity ? `<p class="exp-help">Experiencia: ${esc(activity.title)}</p>` : ""}
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

  function closeMomentAlert() {
    clearTimeout(momentAlertTimer);
    momentAlertTimer = null;
    state = { ...state, momentAlert: false };
    persist();
    render();
    focusControl("[data-exp-moment]", "data-exp-moment", state.moment);
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
      saveIntent: "",
      saveMessage: "",
      saveError: "",
      activityStep: 0,
      activityStopped: false,
      observation: "",
    });
    const heading = root.querySelector("h2");
    if (heading) heading.focus();
  }

  function openActivity(id) {
    if (!data.getActivity(id)) return;
    setState({
      activityId: id,
      step: 4,
      error: "",
      saved: false,
      saveIntent: "",
      saveMessage: "",
      saveError: "",
      activityStep: 0,
      activityStopped: false,
      observation: "",
    });
    const heading = root.querySelector("h2");
    if (heading) heading.focus();
  }

  function saveMoment() {
    const activity = currentActivity();
    if (!activity) {
      goTo(3);
      return;
    }
    if (!["later", "tried"].includes(state.saveIntent)) return;

    const progressAvailable = progress && progress.isAvailable();
    const albumAvailable = state.saveIntent === "tried" && album && album.isAvailable();
    let progressSaved = null;
    let albumSaved = null;
    if (progressAvailable) {
      const previousProgress = progress.get("activity", activity.id);
      if (state.saveIntent === "later" && previousProgress) {
        progressSaved = true;
      } else {
        progressSaved = progress.set("activity", activity.id, {
          state: state.saveIntent === "tried" ? "tried" : "explored",
          moment: state.moment || null,
        });
      }
    }
    if (albumAvailable) {
      albumSaved = Boolean(album.add({
        title: activity.title,
        note: `Experiencia para compartir · ${interestLabel() || (data.getMoment(state.moment) || {}).label || ""}`.trim(),
        momentId: state.moment || null,
      }));
    }

    const savedSomewhere = progressSaved === true || albumSaved === true;
    if (!savedSomewhere) {
      setState({
        saveError: state.saveIntent === "tried"
          ? "No se pudo guardar en Mi camino ni en el álbum de este navegador. Revisa el almacenamiento e inténtalo de nuevo."
          : "No se pudo guardar la idea en Mi camino. Revisa el almacenamiento e inténtalo de nuevo.",
      });
      return;
    }

    const saveError = state.saveIntent === "tried"
      ? progressSaved !== true && albumSaved === true
        ? "El momento quedó en tu álbum, pero no se pudo actualizar Mi camino."
        : progressSaved === true && albumSaved !== true
          ? "Mi camino se actualizó, pero no se pudo añadir el recuerdo al álbum."
          : ""
      : "";
    const saveMessage = state.saveIntent === "later"
      ? "La idea quedó guardada en Mi camino para retomarla cuando les venga bien."
      : progressSaved && albumSaved
        ? "El intento quedó registrado en Mi camino y en tu álbum. Cada experiencia cuenta a su manera."
        : progressSaved
          ? "El intento quedó registrado en Mi camino. Cada experiencia cuenta a su manera."
          : "El recuerdo quedó guardado en tu álbum. Cada experiencia cuenta a su manera.";
    setState({ saved: true, saveMessage, saveError, error: "", shareOpen: false });
    const heading = root.querySelector("h2");
    if (heading) heading.focus();
  }

  function restart() {
    clearTimeout(momentAlertTimer);
    momentAlertTimer = null;
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
      const id = momentBtn.getAttribute("data-exp-moment");
      clearTimeout(momentAlertTimer);
      setState({ moment: id, error: "", momentAlert: true });
      focusControl("[data-exp-moment]", "data-exp-moment", id);
      momentAlertTimer = setTimeout(closeMomentAlert, MOMENT_ALERT_DURATION_MS);
      return;
    }

    const observationBtn = event.target.closest("[data-exp-observation]");
    if (observationBtn) {
      const id = observationBtn.getAttribute("data-exp-observation");
      setState({ observation: id });
      focusControl("[data-exp-observation]", "data-exp-observation", id);
      return;
    }

    const playNextBtn = event.target.closest("[data-exp-play-next]");
    if (playNextBtn) {
      const stopForToday = state.observation === "observed";
      setState({
        activityStep: stopForToday ? state.activityStep : state.activityStep + 1,
        activityStopped: stopForToday,
        observation: stopForToday ? state.observation : "",
      });
      const nextHeading = root.querySelector("#exp-playalong-title");
      if (nextHeading) nextHeading.focus();
      else root.querySelector("[data-exp-action='to-adapt']")?.focus();
      return;
    }

    const saveIntentBtn = event.target.closest("[data-exp-save-intent]");
    if (saveIntentBtn) {
      const saveIntent = saveIntentBtn.getAttribute("data-exp-save-intent");
      setState({ saveIntent, saveError: "" });
      focusControl("[data-exp-save-intent]", "data-exp-save-intent", saveIntent);
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
        if (state.activityId) openActivity(state.activityId);
        return;
      }
      if (action === "to-adapt") {
        goTo(5);
        return;
      }
      if (action === "to-save") {
        if (state.saved) {
          goTo(6);
          return;
        }
        setState({ step: 6, saveIntent: "", saveMessage: "", saveError: "", shareOpen: false });
        const heading = root.querySelector("h2");
        if (heading) heading.focus();
        root.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }
      if (action === "save-choice") {
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
      focusControl("[data-exp-adapt]", "data-exp-adapt", id);
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
    const changedControl = event.target;
    if (changedControl.name === "interestOther") {
      state = { ...state, ...next, error: "" };
      persist();
      updateDetailsProgress();
      return;
    }
    const { name, value, type } = changedControl;
    setState({ ...next, error: "" });
    const control = Array.from(root.querySelectorAll("input"))
      .find((input) => input.name === name && (type !== "radio" || input.value === value));
    if (control) control.focus({ preventScroll: true });
    const feedback = fieldMessage(name);
    if (feedback) announce(`${fieldFeedbackTitle(name)}. ${feedback}`);
  });

  root.addEventListener("input", (event) => {
    if (event.target.name !== "interestOther") return;
    state = { ...state, interestOther: event.target.value.trim() };
    persist();
    updateDetailsProgress();
    updateInterestFeedback();
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.momentAlert) {
      event.preventDefault();
      closeMomentAlert();
      return;
    }
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
