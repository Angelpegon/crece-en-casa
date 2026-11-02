/*
 * Mi espacio: perfil local del cuidador (sin servidor ni contraseñas).
 * Pantallas: bienvenida (crear/continuar) y área personal con Resumen, Mi perfil,
 * Mi familia, Mis preferencias y Mis huellas. Todo se guarda en la sesión local
 * (js/session.js), la misma que usan Mi camino y Experiencias para saludar por nombre.
 * Ningún campo es obligatorio para poder recorrer todo sin rellenar.
 */
(function () {
  const root = document.querySelector("[data-space-root]");
  const { session, data, ui, progress, album } = window.CEC || {};
  if (!root || !session) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STICKER = "assets/img/stickers/";
  const esc = ui ? ui.escapeHTML : (s) => String(s);

  const AVATARS = [
    { id: "zorro", label: "Zorrito" },
    { id: "sol", label: "Sol" },
    { id: "brote", label: "Brote" },
    { id: "corazon", label: "Corazón" },
    { id: "estrella-amarilla", label: "Estrella" },
    { id: "burbuja-chat", label: "Conversación" },
  ];

  const AGES = [2, 3, 4, 5];
  const DAY_MOMENTS = ["En la mañana", "Al mediodía", "En la tarde", "En la noche", "Varía según el día"];
  const DURATIONS = (data && data.experienceDurations) || [
    { id: "3", label: "3 min" },
    { id: "5", label: "5 min" },
    { id: "10", label: "10 min" },
  ];
  const FORMATS = ["Sin materiales adicionales", "Objetos que tenemos en casa", "Material impreso", "Una combinación de opciones"];
  const GOALS = [...((data && data.experienceSkills) || []), { id: "varias", label: "Explorar varias habilidades" }];
  const INTERESTS = ((data && data.interests) || []).filter((i) => i.id !== "otro");

  const MILESTONES = [
    { title: "Creamos un momento para conversar", icon: "burbuja-chat" },
    { title: "Compartimos un cuento o una historia", icon: "libro-abierto" },
    { title: "Jugamos a nombrar y describir", icon: "bloques" },
    { title: "Escuchamos y seguimos sus ideas", icon: "corazon" },
    { title: "Incluimos la comunicación en una rutina", icon: "calendario" },
    { title: "Reconocemos un pequeño avance", icon: "estrella-amarilla" },
  ];

  const PAGES = [
    { id: "resumen", label: "Resumen", icon: "i-home" },
    { id: "perfil", label: "Mi perfil", icon: "i-user" },
    { id: "familia", label: "Mi familia", icon: "i-community" },
    { id: "preferencias", label: "Mis preferencias", icon: "i-clock" },
    { id: "huellas", label: "Mis huellas", icon: "i-brote" },
  ];

  let profile = session.get();
  let page = pageFromHash();
  let toastTimer = 0;

  function icon(id) {
    return `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg?v=espacio1#${id}"></use></svg>`;
  }

  function sticker(id, size = 40) {
    return `<img src="${STICKER}${id}.png" width="${size}" height="${size}" alt="" decoding="async">`;
  }

  function pageFromHash() {
    const id = location.hash.replace("#", "");
    return PAGES.some((p) => p.id === id) ? id : "resumen";
  }

  function firstName() {
    return (profile?.name || "Familia").trim().split(/\s+/)[0];
  }

  function marks() {
    return Array.isArray(profile?.marks) ? profile.marks : [];
  }

  function marksCount() {
    return marks().filter(Boolean).length;
  }

  /* Qué tan completo está el espacio: 6 piezas útiles para personalizar */
  function completeness() {
    const p = profile || {};
    const pieces = [p.email || p.phone, p.child, p.age, (p.interests || []).length, p.goal, p.duration || p.dayMoment];
    const done = pieces.filter(Boolean).length;
    return { done, total: pieces.length, pct: Math.round((done / pieces.length) * 100) };
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function savedExperiences() {
    if (!progress || !progress.isAvailable()) return 0;
    const keys = new Set(
      progress.list().filter((item) => item.state === "tried" || item.type === "activity").map((item) => item.key)
    );
    return keys.size;
  }

  function albumCount() {
    try {
      return album && album.isAvailable() ? album.list().length : 0;
    } catch (error) {
      return 0;
    }
  }

  function recommendation() {
    if (!data || !data.recommendExperiences) return null;
    const p = profile || {};
    const result = data.recommendExperiences({
      age: p.age,
      skill: p.goal && p.goal !== "varias" ? p.goal : "",
      duration: p.duration,
      interest: (p.interests || [])[0],
    });
    return result && result.main ? result.main : data.activities[0] || null;
  }

  /* ---------- Piezas comunes ---------- */
  function chips(name, options, selected, { multiple = false } = {}) {
    const values = multiple ? selected || [] : [selected];
    return `
      <div class="space-chips" role="${multiple ? "group" : "radiogroup"}">
        ${options.map((o) => {
          const value = String(o.id ?? o.value ?? o);
          const label = o.label ?? o;
          const checked = values.map(String).includes(value);
          return `
          <label class="space-chip">
            <input type="${multiple ? "checkbox" : "radio"}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}>
            <span>${o.icon ? icon(o.icon) : ""}${esc(label)}</span>
          </label>`;
        }).join("")}
      </div>`;
  }

  function avatarPicker(current) {
    return `
      <fieldset class="space-field space-field--full space-avatars">
        <legend>Elige tu ícono</legend>
        <div class="space-avatars__list">
          ${AVATARS.map((a) => `
            <label class="space-avatar-option" title="${a.label}">
              <input type="radio" name="avatar" value="${a.id}"${(current || "zorro") === a.id ? " checked" : ""}>
              <span>${sticker(a.id, 44)}<span class="visually-hidden">${a.label}</span></span>
            </label>`).join("")}
        </div>
      </fieldset>`;
  }

  function input(id, label, { type = "text", placeholder = "", value = "", autocomplete = "", inputmode = "", full = false, iconId = "" } = {}) {
    return `
      <div class="space-field${full ? " space-field--full" : ""}">
        <label for="space-${id}">${label}</label>
        <div class="space-input">
          ${iconId ? icon(iconId) : ""}
          <input id="space-${id}" name="${id}" type="${type}" value="${esc(value || "")}" placeholder="${esc(placeholder)}"${autocomplete ? ` autocomplete="${autocomplete}"` : ""}${inputmode ? ` inputmode="${inputmode}"` : ""}>
        </div>
      </div>`;
  }

  /* ---------- Bienvenida (sin perfil) ---------- */
  function welcomeScreen() {
    return `
      <section class="space-welcome" aria-labelledby="page-title">
        <div class="space-welcome__intro">
          <p class="space-kicker">Área personal</p>
          <h1 id="page-title">Mi espacio</h1>
          <p class="space-welcome__lead">Un lugar para ti y tu familia. Personaliza las experiencias, organiza tus preferencias y reconoce los pequeños momentos de comunicación que construyen grandes avances.</p>
          <ul class="space-perks">
            <li>${sticker("corazon", 32)}<span><strong>Experiencias a su medida</strong> según la edad y los intereses de tu niño o niña.</span></li>
            <li>${sticker("calendario", 32)}<span><strong>A tu ritmo</strong>: eliges el momento del día y el tiempo disponible.</span></li>
            <li>${sticker("estrella-amarilla", 32)}<span><strong>Tus huellas</strong>: reconoce lo que ya hacen juntos, sin calificaciones.</span></li>
          </ul>
          <img class="space-welcome__art" src="assets/img/temporal/zorrito-sidebar.png" width="1065" height="768" alt="" decoding="async">
        </div>

        <form class="space-card space-create" data-space-create novalidate>
          <h2>Comienza tu recorrido</h2>
          <p class="space-muted">Crea tu perfil de cuidador. Todos los campos son opcionales: puedes completarlos después.</p>
          <div class="space-grid">
            ${input("name", "Tu nombre o el de la familia", { placeholder: "Por ejemplo: Ana", autocomplete: "name", full: true, iconId: "i-user" })}
            ${input("email", "Correo electrónico", { type: "email", placeholder: "correo@ejemplo.com", autocomplete: "email", iconId: "i-mail" })}
            ${input("phone", "Celular de contacto", { type: "tel", placeholder: "Número de contacto", autocomplete: "tel", inputmode: "tel", iconId: "i-phone" })}
            ${avatarPicker("zorro")}
          </div>
          <p class="space-notice">${icon("i-info")} Se guarda solo en este navegador y no pedimos contraseñas. No registres información sensible ni datos clínicos.</p>
          <button class="btn btn--sage space-create__cta" type="submit">Crear mi espacio ${icon("i-arrow")}</button>
        </form>
      </section>`;
  }

  /* ---------- Área personal ---------- */
  function sidebar() {
    const avatar = profile?.avatar || "zorro";
    return `
      <aside class="space-side" aria-label="Secciones de Mi espacio">
        <div class="space-person">
          <span class="space-person__avatar">${sticker(avatar, 52)}</span>
          <div>
            <strong>${esc(profile?.name || "Familia")}</strong>
            <small>${esc(profile?.email || "Perfil local")}</small>
          </div>
        </div>
        <nav class="space-nav">
          ${PAGES.map((p) => `
            <a href="#${p.id}" class="space-nav__link${p.id === page ? " is-active" : ""}"${p.id === page ? ' aria-current="page"' : ""}>
              ${icon(p.icon)}<span>${p.label}</span>
              ${p.id === "huellas" ? `<span class="space-nav__badge">${marksCount()}/6</span>` : ""}
            </a>`).join("")}
        </nav>
        <button class="space-side__out" type="button" data-space-signout>Salir de este espacio</button>
      </aside>`;
  }

  function hero() {
    const c = completeness();
    return `
      <section class="space-hero" aria-labelledby="page-title">
        <div class="space-hero__copy">
          <p class="space-kicker">${greeting()}</p>
          <h1 id="page-title">Hola, ${esc(firstName())} <span aria-hidden="true">👋</span></h1>
          <p>Este espacio acompaña tu día a día. Ajusta tus preferencias y reconoce los momentos de comunicación que compartes con ${profile?.child ? esc(profile.child) : "tu niño o niña"}, a tu propio ritmo.</p>
        </div>
        <div class="space-ring" style="--pct:${c.pct}" role="img" aria-label="Espacio completo al ${c.pct} por ciento">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="space-ring__track" cx="60" cy="60" r="52"/>
            ${c.pct ? '<circle class="space-ring__fill" cx="60" cy="60" r="52" pathLength="100"/>' : ""}
          </svg>
          <div class="space-ring__label"><strong>${c.pct}%</strong><span>completo</span></div>
        </div>
      </section>`;
  }

  function stat(stickerId, value, label, href) {
    return `
      <a class="space-stat" href="${href}">
        ${sticker(stickerId, 36)}
        <strong>${value}</strong>
        <span>${label}</span>
      </a>`;
  }

  function tile({ label, title, text, empty, jump, stickerId }) {
    return `
      <article class="space-tile${empty ? " is-empty" : ""}">
        <span class="space-tile__icon">${sticker(stickerId, 30)}</span>
        <p class="space-tile__label">${label}</p>
        <h3>${title}</h3>
        <p>${text}</p>
        <a class="space-tile__link" href="#${jump}">${empty ? "Completar" : "Editar"} ${icon("i-arrow")}</a>
      </article>`;
  }

  function pageResumen() {
    const p = profile || {};
    const interests = (p.interests || []).map((id) => data?.getInterest?.(id)?.label).filter(Boolean);
    const goal = GOALS.find((g) => g.id === p.goal);
    const duration = DURATIONS.find((d) => d.id === p.duration);
    const rec = recommendation();
    const n = marksCount();
    return `
      <div class="space-stats">
        ${stat("estrella-amarilla", `${n}/6`, "huellas reconocidas", "#huellas")}
        ${stat("brote", savedExperiences(), "experiencias en Mi camino", "mi-camino.html")}
        ${stat("libro-abierto", albumCount(), "recuerdos en tu álbum", "mi-album.html")}
      </div>

      <div class="space-head">
        <div>
          <h2>Tu espacio, de un vistazo</h2>
          <p>Información útil para que cada experiencia tenga sentido en casa.</p>
        </div>
      </div>
      <div class="space-tiles">
        ${tile({ label: "Perfil del cuidador", stickerId: "zorro", title: esc(p.name || "Familia"), text: esc([p.email, p.phone].filter(Boolean).join(" · ") || "Añade un dato de contacto."), empty: !(p.email || p.phone), jump: "perfil" })}
        ${tile({ label: "Mi familia", stickerId: "corazon", title: esc(p.child || "Completa este espacio"), text: p.age ? `${p.age} años${interests.length ? ` · Le gusta: ${esc(interests.join(", "))}` : ""}` : "Añade la edad y los intereses del niño o niña.", empty: !p.child && !p.age, jump: "familia" })}
        ${tile({ label: "Tu rutina", stickerId: "calendario", title: esc(p.dayMoment || "Define tu momento"), text: duration ? `Tiempo disponible: ${esc(duration.label)}` : "Cuéntanos cuánto tiempo tienen disponible.", empty: !p.dayMoment && !p.duration, jump: "preferencias" })}
        ${tile({ label: "Tu enfoque", stickerId: "diana", title: esc(goal ? goal.label : "Personaliza las experiencias"), text: esc(p.format || "Elige qué materiales prefieren."), empty: !goal, jump: "familia" })}
      </div>

      ${rec ? `
      <article class="space-rec">
        ${rec.image ? `<img class="space-rec__img" src="${esc(rec.image.src)}" width="${rec.image.width}" height="${rec.image.height}" alt="" loading="lazy" decoding="async">` : ""}
        <div class="space-rec__copy">
          <p class="space-kicker">${p.age || p.goal || p.duration ? "Sugerida para tu familia" : "Para empezar"}</p>
          <h3>${esc(rec.title)}</h3>
          <p>${esc(rec.summary || rec.tagline || "")}</p>
          <p class="space-rec__meta">${esc(rec.duration || "")}${p.dayMoment ? ` · Ideal ${esc(p.dayMoment.toLowerCase())}` : ""}</p>
          <div class="space-rec__actions">
            <a class="btn btn--sage" href="${ui ? ui.activityUrl(rec) : "#"}">Ver la actividad ${icon("i-arrow")}</a>
            <a class="btn btn--outline" href="#preferencias">Ajustar preferencias</a>
          </div>
        </div>
      </article>` : ""}

      <div class="space-head">
        <div>
          <h2>Tus pequeñas huellas</h2>
          <p>Pequeños pasos, sin afán ni calificaciones.</p>
        </div>
        <a class="space-link" href="#huellas">Ver todas ${icon("i-arrow")}</a>
      </div>
      ${growthBar()}`;
  }

  function growthBar() {
    const n = marksCount();
    return `
      <div class="space-card space-growth">
        <div class="space-growth__head">
          <strong>Mis pequeñas huellas</strong>
          <span data-space-count>${n} de 6 momentos</span>
        </div>
        <div class="space-growth__track"><span data-space-bar style="width:${(n / 6) * 100}%"></span></div>
        <ol class="space-growth__dots" aria-hidden="true">
          ${MILESTONES.map((m, i) => `<li class="${marks()[i] ? "is-done" : ""}">${sticker(m.icon, 22)}</li>`).join("")}
        </ol>
      </div>`;
  }

  function pagePerfil() {
    const p = profile || {};
    return `
      <div class="space-head"><div><h2>Mi perfil</h2><p>Administra tus datos de contacto y tu ícono.</p></div></div>
      <form class="space-card" data-space-form="perfil" novalidate>
        <div class="space-grid">
          ${input("name", "Nombre completo", { value: p.name, placeholder: "Tu nombre", autocomplete: "name", full: true, iconId: "i-user" })}
          ${input("email", "Correo electrónico", { type: "email", value: p.email, placeholder: "correo@ejemplo.com", autocomplete: "email", iconId: "i-mail" })}
          ${input("phone", "Celular de contacto", { type: "tel", value: p.phone, placeholder: "Número de contacto", autocomplete: "tel", inputmode: "tel", iconId: "i-phone" })}
          ${avatarPicker(p.avatar)}
        </div>
        <div class="space-actions">
          <span class="space-muted">Puedes actualizar estos datos cuando lo necesites.</span>
          <button class="btn btn--sage" type="submit">Guardar cambios</button>
        </div>
      </form>`;
  }

  function pageFamilia() {
    const p = profile || {};
    return `
      <div class="space-head"><div><h2>Mi familia</h2><p>Información para adaptar las experiencias a la etapa e intereses del niño o niña.</p></div></div>
      <form class="space-card" data-space-form="familia" novalidate>
        <div class="space-grid">
          ${input("child", "Nombre o apodo del niño o niña", { value: p.child, placeholder: "Nombre que deseas utilizar", full: true, iconId: "i-paw" })}
          <fieldset class="space-field space-field--full"><legend>Edad</legend>
            ${chips("age", AGES.map((a) => ({ id: a, label: `${a} años` })), p.age)}
          </fieldset>
          <fieldset class="space-field space-field--full"><legend>¿Qué le gusta?</legend>
            ${chips("interests", INTERESTS, p.interests, { multiple: true })}
          </fieldset>
          <fieldset class="space-field space-field--full"><legend>¿Qué te gustaría favorecer?</legend>
            ${chips("goal", GOALS, p.goal)}
          </fieldset>
        </div>
        <p class="space-notice">${icon("i-info")} Solicitamos únicamente información para personalizar la experiencia. No registres diagnósticos ni datos clínicos.</p>
        <div class="space-actions">
          <span></span>
          <button class="btn btn--sage" type="submit">Guardar información familiar</button>
        </div>
      </form>`;
  }

  function pagePreferencias() {
    const p = profile || {};
    return `
      <div class="space-head"><div><h2>Mis preferencias</h2><p>La plataforma se adapta a los tiempos y recursos de tu hogar.</p></div></div>
      <form class="space-card" data-space-form="preferencias" novalidate>
        <div class="space-grid">
          <fieldset class="space-field space-field--full"><legend>¿En qué momento del día suelen compartir actividades?</legend>
            ${chips("dayMoment", DAY_MOMENTS, p.dayMoment)}
          </fieldset>
          <fieldset class="space-field space-field--full"><legend>¿Cuánto tiempo tienen disponible?</legend>
            ${chips("duration", DURATIONS, p.duration)}
          </fieldset>
          <fieldset class="space-field space-field--full"><legend>¿Qué tipo de materiales prefieren?</legend>
            ${chips("format", FORMATS, p.format)}
          </fieldset>
        </div>
        <div class="space-actions">
          <span class="space-muted">Tus preferencias orientan las sugerencias de experiencias.</span>
          <button class="btn btn--sage" type="submit">Guardar preferencias</button>
        </div>
      </form>`;
  }

  function pageHuellas() {
    return `
      <div class="space-head"><div><h2>Mis huellas</h2><p>Reconoce los momentos compartidos. Cada familia avanza a su propio ritmo.</p></div></div>
      ${growthBar()}
      <ul class="space-milestones">
        ${MILESTONES.map((m, i) => `
          <li>
            <label class="space-milestone${marks()[i] ? " is-done" : ""}">
              <input type="checkbox" data-space-mark="${i}"${marks()[i] ? " checked" : ""}>
              <span class="space-milestone__icon">${sticker(m.icon, 34)}</span>
              <span class="space-milestone__copy">
                <small>Momento ${i + 1}</small>
                <strong>${m.title}</strong>
              </span>
              <span class="space-milestone__check" aria-hidden="true">${icon("i-check")}</span>
            </label>
          </li>`).join("")}
      </ul>
      <p class="space-notice">${icon("i-info")} Este seguimiento reconoce la participación familiar. No mide el desarrollo del niño ni reemplaza una valoración fonoaudiológica.</p>`;
  }

  function workspace() {
    const pages = { resumen: pageResumen, perfil: pagePerfil, familia: pageFamilia, preferencias: pagePreferencias, huellas: pageHuellas };
    return `
      ${hero()}
      <div class="space-shell">
        ${sidebar()}
        <div class="space-content" data-space-content>${pages[page]()}</div>
      </div>`;
  }

  function render({ animate = false } = {}) {
    profile = session.get();
    root.innerHTML = `${profile ? workspace() : welcomeScreen()}<div class="space-toast" role="status" data-space-toast hidden></div>`;
    if (animate && !reduceMotion) root.querySelector("[data-space-content]")?.classList.add("is-entering");
    /* En móvil el menú es una fila deslizable: deja visible la pestaña activa */
    const nav = root.querySelector(".space-nav");
    const active = nav?.querySelector(".is-active");
    if (nav && active && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - 8;
  }

  function toast(message) {
    const node = root.querySelector("[data-space-toast]");
    if (!node) return;
    node.innerHTML = `${icon("i-check")} ${esc(message)}`;
    node.hidden = false;
    node.classList.remove("is-leaving");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.classList.add("is-leaving");
      toastTimer = setTimeout(() => { node.hidden = true; }, 250);
    }, 2400);
  }

  function formValues(form) {
    const fd = new FormData(form);
    const out = {};
    for (const [key, value] of fd.entries()) {
      if (key === "interests") (out.interests = out.interests || []).push(value);
      else out[key] = String(value).trim();
    }
    if (form.querySelector('[name="interests"]') && !out.interests) out.interests = [];
    return out;
  }

  /* ---------- Eventos ---------- */
  root.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;

    if (form.matches("[data-space-create]")) {
      const values = formValues(form);
      if (!session.update({ ...values, name: values.name || "Familia", email: (values.email || "").toLowerCase(), marks: [] })) {
        toast("Este navegador no permite guardar el espacio.");
        return;
      }
      page = "resumen";
      history.replaceState(null, "", "#resumen");
      render({ animate: true });
      toast("¡Tu espacio está listo!");
      return;
    }

    const kind = form.dataset.spaceForm;
    if (!kind) return;
    const values = formValues(form);
    if (kind === "perfil") {
      values.name = values.name || profile?.name || "Familia";
      values.email = (values.email || "").toLowerCase();
    }
    if (kind === "familia" || kind === "preferencias") {
      ["age", "goal", "dayMoment", "duration", "format"].forEach((key) => {
        if (form.querySelector(`[name="${key}"]`) && !(key in values)) values[key] = "";
      });
    }
    session.update(values);
    render();
    toast({ perfil: "Perfil actualizado.", familia: "Información familiar guardada.", preferencias: "Preferencias guardadas." }[kind]);
  });

  /* Chips de opción única: tocar con el dedo/ratón la elegida la deselecciona */
  root.addEventListener("click", (event) => {
    const radio = event.target.closest('.space-chip input[type="radio"]');
    if (radio) {
      if (radio.dataset.wasChecked === "true") radio.checked = false;
      delete radio.dataset.wasChecked;
      return;
    }

    if (event.target.closest("[data-space-signout]")) {
      const ok = window.confirm("¿Salir de este espacio? Se borrarán de este navegador tu perfil, tu familia y tus preferencias. Mi camino y tu álbum se conservan.");
      if (!ok) return;
      session.signOut();
      history.replaceState(null, "", location.pathname);
      render();
      toast("Saliste de tu espacio.");
    }
  });

  root.addEventListener("pointerdown", (event) => {
    const radio = event.target.closest(".space-chip")?.querySelector('input[type="radio"]');
    if (radio) radio.dataset.wasChecked = String(radio.checked);
  });

  root.addEventListener("change", (event) => {
    const mark = event.target.closest("[data-space-mark]");
    if (!mark) return;
    const next = marks().slice();
    next[Number(mark.dataset.spaceMark)] = mark.checked;
    session.update({ marks: next });
    profile = session.get();
    mark.closest(".space-milestone").classList.toggle("is-done", mark.checked);
    const n = marksCount();
    root.querySelectorAll("[data-space-count]").forEach((node) => { node.textContent = `${n} de 6 momentos`; });
    root.querySelectorAll("[data-space-bar]").forEach((node) => { node.style.width = `${(n / 6) * 100}%`; });
    root.querySelectorAll(".space-growth__dots li").forEach((li, i) => li.classList.toggle("is-done", Boolean(next[i])));
    const badge = root.querySelector(".space-nav__badge");
    if (badge) badge.textContent = `${n}/6`;
    if (mark.checked) toast(n === 6 ? "¡Seis huellas! Celebren juntos 🎉" : "Huella guardada 💚");
  });

  window.addEventListener("hashchange", () => {
    page = pageFromHash();
    if (!profile) return;
    render({ animate: true });
    const content = root.querySelector(".space-shell");
    if (content && content.getBoundingClientRect().top < 0) {
      content.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });

  render();
})();
