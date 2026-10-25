/* Flujo de Experiencias para compartir (6 pasos, según la especificación). */
(function () {
    const { data, ui, progress, album, session } = window.CEC;
    const root = document.querySelector("[data-experience-flow]");
    if (!root || !data || !ui) return;

    const MOMENT_ALERT_DURATION_MS = 5000;
    const esc = ui.escapeHTML;

    const STEPS = [
        { n: 1, name: "Elegir mi momento" },
        { n: 2, name: "Personalizar la experiencia" },
        { n: 3, name: "Resultados personalizados" },
        { n: 4, name: "Recordar la experiencia" },
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
    };

    let state = loadState();
    let momentAlertTimer = null;

    function loadState() {
        try {
            sessionStorage.removeItem("crece-en-casa:experiencia-flujo");
        } catch (error) {
            // El estado inicial también se restablece en memoria si el almacenamiento no está disponible.
        }
        return { ...emptyState };
    }

    function setState(patch) {
        state = { ...state, ...patch };
        render();
    }

    function focusControl(selector, attribute, value) {
        const control = Array.from(root.querySelectorAll(selector))
            .find((item) => item.getAttribute(attribute) === value);
        if (control) control.focus({ preventScroll: true });
    }

    function advancePlayStep() {
        setState({ activityStep: (state.activityStep || 0) + 1 });
        const nextHeading = root.querySelector("#exp-playalong-title");
        if (nextHeading) nextHeading.focus();
        else root.querySelector("[data-exp-action='to-adapt']")?.focus();
    }

    function goTo(step) {
        clearTimeout(momentAlertTimer);
        momentAlertTimer = null;
        setState({
            step,
            error: "",
            shareOpen: false,
            momentAlert: false,
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
        ${compact ? "" : `<img class="exp-feedback__mascot" src="assets/img/temporal/home-zorro-cutout.png" width="180" height="180" alt="" loading="lazy" decoding="async">`}
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
        /* Edad, área e interés son necesarios; el tiempo es opcional (como en las fichas). */
        return ["age", "skill"].filter((field) => state[field]).length + Number(Boolean(interestComplete));
    }

    function detailsProgress() {
        const count = completedDetailCount();
        return `
      <div class="exp-detail-progress" role="progressbar" aria-label="${count} de 3 detalles elegidos" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${count}" data-exp-detail-progress>
        <div class="exp-detail-progress__copy">
          <span data-exp-detail-label>${count === 3 ? "¡Ya tenemos todo para buscar su idea!" : `${count} de 3 detalles para preparar su idea`}</span>
          <strong data-exp-detail-count>${count}/3</strong>
        </div>
        <span class="exp-detail-progress__track" aria-hidden="true"><span data-exp-detail-bar style="width:${(count / 3) * 100}%"></span></span>
      </div>`;
    }

    function updateDetailsProgress() {
        const progressMeter = root.querySelector("[data-exp-detail-progress]");
        if (!progressMeter) return;
        const count = completedDetailCount();
        progressMeter.setAttribute("aria-label", `${count} de 3 detalles elegidos`);
        progressMeter.setAttribute("aria-valuemax", "3");
        progressMeter.setAttribute("aria-valuenow", String(count));
        progressMeter.querySelector("[data-exp-detail-label]").textContent = count === 3
            ? "¡Ya tenemos todo para buscar su idea!"
            : `${count} de 3 detalles para preparar su idea`;
        progressMeter.querySelector("[data-exp-detail-count]").textContent = `${count}/3`;
        progressMeter.querySelector("[data-exp-detail-bar]").style.width = `${(count / 3) * 100}%`;
    }

    function activityMoment(activity) {
        const momentos = activity.momentos || [];
        if (state.moment && momentos.includes(state.moment)) return data.getMoment(state.moment);
        return data.getMoment(momentos[0]);
    }

    function ageMismatchNote(activity) {
        const selected = Number(state.age);
        const activityAge = activity && activity.ages ? activity.ages[0] : null;
        if (!activityAge || !selected || activityAge === selected) return "";
        return `Esta ficha está pensada para ${activityAge} años; igual pueden adaptarla a su ritmo.`;
    }

    function updateInterestFeedback() {
        const feedback = root.querySelector('[data-exp-feedback-field="interest"] .exp-feedback__copy > span');
        if (feedback) feedback.textContent = fieldMessage("interest");
    }

    function activityProgress(activityStep, total) {
        const completed = Math.min(activityStep, total);
        const label = completed === total
            ? "Momento ya compartido"
            : `Idea ${Math.min(activityStep + 1, total)} de ${total}`;
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

    function buildObserveGuide(activity, stepIndex) {
        const total = (activity.steps || []).length;
        const stepText = String(activity.steps[stepIndex] || "");
        const stepLower = stepText.toLowerCase();
        const ageValue = Number((activity.ages && activity.ages[0]) || state.age || 3);
        const areaId = activity.primaryArea || state.skill || "interaccion";
        const area = data.getArea(areaId);
        const age = data.getAge(ageValue);
        const moment = data.getMoment(state.moment) || activityMoment(activity);
        const strategies = (activity.strategyIds || [])
            .map((id) => data.getStrategy(id))
            .filter(Boolean);
        const strategy = strategies[stepIndex % Math.max(strategies.length, 1)] || strategies[0];
        const isFirst = stepIndex === 0;
        const isLast = stepIndex >= total - 1;

        const ageCue = {
            2: "una mirada, un gesto, un sonido o acercarse a ti",
            3: "señalar, una palabra, un gesto o buscar tu cara",
            4: "una frase corta, un comentario o invitarte a seguir",
            5: "contar, anticipar, elegir con palabras o explicar a su manera",
        }[ageValue] || "un gesto, una mirada o una palabra";

        const areaLead = {
            vocabulario: "Las palabras también se descubren en lo cotidiano.",
            comprension: "Comprender también se ve en cómo responde.",
            expresion: "A veces, un pequeño gesto dice mucho.",
            interaccion: "La conexión se nota en los turnos que comparten.",
        }[areaId] || "A veces, un pequeño gesto dice mucho.";

        let focus = "cómo participa y qué te comunica a su manera";
        if (/miren|mira|observ|portada|atenci/.test(stepLower)) {
            focus = "hacia dónde va su mirada y qué elige explorar primero";
        } else if (/seña|elige|elegir|opción|pregun/.test(stepLower)) {
            focus = "cómo te hace saber su elección: mirada, gesto, sonido o palabra";
        } else if (/coment|nombr|di |dice|frase/.test(stepLower)) {
            focus = "si retoma algo de lo que nombraste o aporta su propia idea";
        } else if (/pausa|espera|tiempo|sin responder/.test(stepLower)) {
            focus = "qué ocurre en la pausa: si te mira, insiste, espera o cambia de interés";
        } else if (/busca|instruc|indica|muestra|siguiente paso|anticipa/.test(stepLower)) {
            focus = "si la palabra, el gesto o el objeto le ayudaron a entender qué sigue";
        } else if (/turno|altern|juntos|constru/.test(stepLower)) {
            focus = "cómo se turnan: si te espera, te imita o propone el siguiente movimiento";
        } else if (/compar|descub|otro uso|caracter/.test(stepLower)) {
            focus = "qué características o usos le interesan y cómo te lo muestra";
        } else if (/reconoce|particip|continú|continuen|sigan/.test(stepLower)) {
            focus = "si quiere seguir, cambiar o cerrar el momento, y cómo te lo comunica";
        } else if (isFirst) {
            focus = "cómo se acerca a la propuesta y qué le despierta curiosidad";
        } else if (isLast) {
            focus = "qué quedó de este intercambio y cómo te hizo saber que listo o que quiere más";
        }

        const areaBody = {
            vocabulario: `En vocabulario, fíjate si aparece un nombre, una característica o una acción nueva a través de ${ageCue}.`,
            comprension: `En comprensión, observa si sigue la idea con apoyo de gestos, objetos o palabras sencillas —por ejemplo mediante ${ageCue}.`,
            expresion: `En expresión, lo valioso es cómo te cuenta lo que quiere o siente, aunque sea con ${ageCue}.`,
            interaccion: `En interacción, mira si hay ida y vuelta: te mira, responde y deja espacio, incluso con ${ageCue}.`,
        }[areaId] || `Observa si te comunica algo mediante ${ageCue}.`;

        const momentHint = moment
            ? {
                comida: "En la comida, cualquier señal de preferencia ya es comunicación.",
                lectura: "En la lectura, detenerse en una imagen también es conversar.",
                juego: "En el juego, imitar o acercarte a su idea fortalece el turno.",
                rutinas: "En la rutina, anticipar el siguiente paso le da seguridad.",
                afuera: "Afuera, lo que mira o señala puede abrir una mini conversación.",
            }[moment.id]
            : "";

        const positionNote = isFirst
            ? "Este primer paso abre el momento: no hace falta que salga “perfecto”."
            : isLast
                ? (activity.closing
                    ? `Para cerrar, puedes preguntarte: ${activity.closing}`
                    : "Al cerrar, basta con notar qué compartieron hoy.")
                : "Cada paso suma; un solo intercambio atento ya cuenta.";

        const helpBits = [];
        if (activity.accompany) helpBits.push(activity.accompany);
        if (strategy && strategy.tip) {
            helpBits.push(`Pista de la estrategia «${strategy.title}»: ${strategy.tip}`);
        } else if (strategy && strategy.example) {
            helpBits.push(`Ejemplo: ${strategy.example}`);
        }
        if (!helpBits.length) {
            helpBits.push("Mira con calma, sigue su interés y responde a lo que comunique, sin pedirle una forma concreta de responder.");
        }

        return {
            lead: areaLead,
            body: `En esta idea, presta atención a ${focus}.`,
            areaBody,
            closing: [momentHint, positionNote].filter(Boolean).join(" "),
            helps: helpBits,
            meta: [age && age.label, area && area.label, moment && (moment.shortLabel || moment.label)]
                .filter(Boolean)
                .join(" · "),
        };
    }

    function stepper() {
        const current = STEPS[state.step - 1];
        return `
      <ol class="exp-stepper" aria-label="Progreso de la experiencia">
        <li class="exp-stepper__track" aria-hidden="true">
          <span style="width:${(state.step - 1) / (STEPS.length - 1) * 100}%"></span>
        </li>
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
        ${back
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
          <img src="assets/img/temporal/home-zorro-cutout.png" width="180" height="180" alt="" class="exp-choice-toast__mascot">
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
            <legend class="exp-question">Tiempo disponible <span class="exp-optional">(opcional)</span></legend>
            ${chipGroup(
            "duration",
            [{ id: "", label: "Sin preferencia" }, ...data.experienceDurations],
            state.duration || ""
        )}
            ${fieldFeedback("duration")}
          </fieldset>
          <fieldset class="exp-fieldset" data-field="interest">
            <legend class="exp-question">Interés del niño</legend>
            ${chipGroup("interest", data.interests, state.interest, { withIcons: true })}
            ${state.interest === "otro"
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

    function thumbCard(activity) {
        const moment = activityMoment(activity);
        const media = ui.activityImage(activity);
        const area = data.getArea(activity.primaryArea);
        const activityAge = data.getAge(activity.ages[0]);
        return `
      <button class="exp-alt-card" type="button" data-exp-open="${esc(activity.id)}">
        <span class="exp-alt-card__media">
          ${ui.imageTag(media, { alt: "", attrs: "decoding=\"async\"" })}
        </span>
        <span class="exp-alt-card__body">
          <span class="exp-alt-card__title">${esc(activity.title)}</span>
          <span class="exp-alt-card__tagline">${esc(activity.tagline)}</span>
          <span class="exp-alt-card__chips">
            ${activityAge ? `<span>${esc(activityAge.label)}</span>` : ""}
            ${area ? `<span>${esc(area.label)}</span>` : ""}
            ${moment ? `<span>${esc(moment.shortLabel || moment.label)}</span>` : ""}
          </span>
          <span class="exp-alt-card__cta">Ver esta idea ${icon("i-arrow")}</span>
        </span>
      </button>`;
    }

    function featuredActivity(activity) {
        const moment = activityMoment(activity);
        const area = data.getArea(activity.primaryArea);
        const activityAge = data.getAge(activity.ages[0]);
        const mismatch = ageMismatchNote(activity);
        const chips = [
            activityAge ? `<li>${icon("i-person")} ${esc(activityAge.label)}</li>` : "",
            moment ? `<li>${icon("i-home")} ${esc(moment.shortLabel || moment.label)}</li>` : "",
            area ? `<li>${icon(area.icon || "i-vocabulario")} ${esc(area.label)}</li>` : "",
            interestLabel()
                ? `<li>${icon((data.getInterest(state.interest) || {}).icon || "i-spark")} ${esc(interestLabel())}</li>`
                : "",
        ]
            .filter(Boolean)
            .join("");
        return `
      <article class="exp-result" aria-labelledby="exp-result-title">
        <div class="exp-result__mascot">
          <img src="assets/img/temporal/home-zorro-cutout.png" width="220" height="220" alt="" decoding="async">
          <p class="exp-result__bubble">¡Encontré una idea para ustedes!</p>
        </div>
        <div class="exp-result__card">
          ${ui.imageTag(ui.activityImage(activity), {
            alt: activity.imageAlt || "",
            attrs: 'class="exp-result__img" decoding="async"',
        })}
          <div class="exp-result__body">
            <p class="exp-result__eyebrow">Actividad recomendada</p>
            <h3 class="exp-result__title" id="exp-result-title">${esc(activity.title)}</h3>
            <p class="exp-result__tagline">${esc(activity.tagline)}</p>
            ${chips ? `<ul class="exp-result__chips">${chips}</ul>` : ""}
            ${activity.objective ? `<p class="exp-result__objective">${esc(activity.objective)}</p>` : ""}
            ${mismatch ? `<p class="exp-result__note">${esc(mismatch)}</p>` : ""}
          </div>
        </div>
      </article>`;
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
        ]
            .filter(Boolean)
            .join(", ");
        const otherAlts = alternatives.filter((item) => item.id !== main.id);
        return `
      <div class="exp-panel exp-panel--result">
        ${stepper()}
        <h2 class="exp-title exp-title--center" tabindex="-1">¡Perfecto!</h2>
        <p class="exp-lead exp-lead--center">Esta idea tiene en cuenta ${esc(matchDetails)}. Puedes cambiarla si otra les llama más.</p>
        ${featuredActivity(main)}
        <p class="exp-result__invite" role="status">Es solo una invitación: pueden adaptarla y seguir el interés de tu niño.</p>
        ${otherAlts.length
                ? `<section class="exp-alts" aria-labelledby="alts-title">
                <div class="exp-alts__head">
                  <h3 id="alts-title">También podrías explorar</h3>
                  <p>Otras ideas cercanas a lo que eligieron. Toca una para probarla.</p>
                </div>
                <div class="exp-alts__grid">${otherAlts.map((item) => thumbCard(item)).join("")}</div>
              </section>`
                : ""
            }
        ${navButtons({ back: 2, nextLabel: "Probar esta actividad", nextAction: "to-detail" })}
      </div>`;
    }

    function renderStep4() {
        const activity = currentActivity();
        if (!activity) return renderStep3();
        const moment = data.getMoment(state.moment) || activityMoment(activity);
        const activityAge = data.getAge(activity.ages[0]);
        const area = data.getArea(activity.primaryArea);
        const materials = activity.materials && activity.materials.length ? activity.materials : [];
        const mismatch = ageMismatchNote(activity);
        const activityStep = state.activityStep || 0;
        const total = activity.steps.length;
        const finished = activityStep >= total;
        const isLastIdea = activityStep >= total - 1;
        const observe = finished ? null : buildObserveGuide(activity, activityStep);
        const observePanelId = `exp-observe-panel-${activityStep}`;

        const tips = `
      <details class="exp-play__tips">
        <summary>Tips y ayudas para esta idea ${icon("i-info")}</summary>
        <div class="exp-play__tips-body">
          ${materials.length
                ? `<p><strong>Materiales</strong></p><ul class="bullet-list">${materials.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
                : "<p><strong>Materiales:</strong> con lo que ya tenían en casa.</p>"
            }
          ${activity.before ? `<p><strong>Antes:</strong> ${esc(activity.before)}</p>` : ""}
          ${activity.accompany ? `<p><strong>Acompañar:</strong> ${esc(activity.accompany)}</p>` : ""}
        </div>
      </details>`;

        const playBody = finished
            ? `
        <div class="exp-play__done">
          <img class="exp-play__fox" src="assets/img/temporal/home-zorro-cutout.png" width="140" height="140" alt="" decoding="async">
          ${positiveFeedback(
                "Estar juntos ya contó; no hacía falta completar nada perfecto.",
                true,
                {
                    title: "¡Lo vivieron juntos!",
                    compact: true,
                }
            )}
          ${activity.closing
                ? `<div class="exp-play__closing">
                  <p class="exp-play__closing-label">Para cerrar</p>
                  <p class="exp-play__closing-q">${esc(activity.closing)}</p>
                </div>`
                : ""
            }
          ${activity.remember ? `<p class="exp-play__remember">${esc(activity.remember)}</p>` : ""}
          ${navButtons({ back: 3, nextLabel: "Ver formas de adaptarlo", nextAction: "to-adapt" })}
        </div>`
            : `
        <section class="exp-play__stage" aria-labelledby="exp-playalong-title">
          ${activityProgress(activityStep, total)}
          <div class="exp-play__step exp-play__step--recall">
            <p class="exp-play__step-num">Idea ${activityStep + 1} de ${total}</p>
            <p class="exp-play__recall">Lo que se propusieron</p>
            <h3 class="exp-play__step-title" id="exp-playalong-title">${formatStepText(activity.steps[activityStep])}</h3>
            ${activityStep === 0 && activity.before
                ? `<p class="exp-play__prep">${esc(activity.before)}</p>`
                : ""
            }
            <div class="exp-play__observe">
              <button class="exp-play__observe-btn" type="button" data-exp-toggle-hint aria-expanded="false" aria-controls="${observePanelId}">
                ${icon("i-spark")} Descubre qué puedes observar
              </button>
              <div class="exp-play__observe-panel" id="${observePanelId}" data-exp-hint-body hidden>
                ${observe.meta ? `<p class="exp-play__observe-meta">${esc(observe.meta)}</p>` : ""}
                <p class="exp-play__observe-lead">${esc(observe.lead)}</p>
                <p>${esc(observe.body)}</p>
                <p>${esc(observe.areaBody)}</p>
                ${observe.closing ? `<p>${esc(observe.closing)}</p>` : ""}
                <div class="exp-play__observe-helps">
                  <p class="exp-play__observe-helps-label">Ayudas para familiarizarte</p>
                  ${observe.helps.map((item) => `<p>${esc(item)}</p>`).join("")}
                </div>
              </div>
            </div>
          </div>
          <div class="exp-play__continue">
            <button class="btn btn--outline" type="button" data-exp-play-next>
              ${isLastIdea ? "Terminar momento" : "Siguiente idea"}
            </button>
          </div>
        </section>`;

        return `
      <div class="exp-panel exp-panel--play">
        ${stepper()}
        <header class="exp-play__header">
          ${ui.imageTag(ui.activityImage(activity), {
            alt: activity.imageAlt || "",
            attrs: 'class="exp-play__thumb" decoding="async"',
        })}
          <div class="exp-play__header-copy">
            <p class="exp-eyebrow">${icon("d-heart")} Después de la idea</p>
            <h2 class="exp-title" tabindex="-1">${esc(activity.title)}</h2>
            <ul class="exp-play__chips">
              ${activityAge ? `<li>${esc(activityAge.label)}</li>` : ""}
              ${area ? `<li>${esc(area.label)}</li>` : ""}
              ${moment ? `<li>${esc(moment.shortLabel || moment.label)}</li>` : ""}
            </ul>
            ${mismatch ? `<p class="exp-play__note">${esc(mismatch)}</p>` : ""}
          </div>
        </header>
        ${tips}
        ${playBody}
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
        ${activity.adapt ? `<p class="exp-help"><strong>Adapta la actividad:</strong> ${esc(activity.adapt)}</p>` : ""}
        <h3>¿Quieres continuar?</h3>
        <p class="exp-lead">Puedes probar otra ficha cercana a lo que eligieron.</p>
        <div class="exp-continue">
          ${extended && extended.id !== activity.id
                ? `<button class="exp-option" type="button" data-exp-open="${esc(extended.id)}">
                  ${ui.imageTag(ui.activityImage(extended), { alt: "", attrs: 'decoding="async"' })}
                  <span>
                    <strong>Otra idea para ustedes</strong>
                    ${esc(extended.title)} · ${esc(ui.formatAges(extended.ages))}
                  </span>
                </button>`
                : ""
            }
          ${activity.download
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

        const hintToggle = event.target.closest("[data-exp-toggle-hint]");
        if (hintToggle) {
            const body = root.querySelector("[data-exp-hint-body]");
            if (!body) return;
            const open = body.hasAttribute("hidden");
            if (open) {
                body.removeAttribute("hidden");
                body.classList.add("is-open");
            } else {
                body.setAttribute("hidden", "");
                body.classList.remove("is-open");
            }
            hintToggle.setAttribute("aria-expanded", open ? "true" : "false");
            hintToggle.classList.toggle("is-open", open);
            return;
        }

        const playNextBtn = event.target.closest("[data-exp-play-next]");
        if (playNextBtn) {
            advancePlayStep();
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
