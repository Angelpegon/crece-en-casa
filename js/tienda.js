/*
 * Tienda · Nuestro Jardín: flujo de compra en 4 pasos (producto, entrega, revisión, confirmación).
 * Prototipo: no procesa pagos. Los campos son opcionales para poder recorrer todo el flujo.
 * La cantidad del carrito se recuerda en este navegador para el contador del encabezado.
 */
(function () {
  const root = document.querySelector("[data-shop-root]");
  if (!root) return;

  const UNIT = 89900;
  const MAX_QTY = 10;
  const CART_KEY = "crece-en-casa:carrito";
  const SPRITE = "assets/icons/sprite.svg?v=cart1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STEPS = [
    { n: 1, name: "Producto" },
    { n: 2, name: "Entrega" },
    { n: 3, name: "Revisión" },
    { n: 4, name: "Listo" },
  ];

  /* Íconos de línea propios de la tienda (mismo trazo que el sprite) */
  const GLYPH = {
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5.5 19.5c1.8-3.2 4-4.8 6.5-4.8s4.7 1.6 6.5 4.8"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
    city: '<path d="M4 20V9l5-3v14M9 20V4l7 3v13M16 20v-8l4 2v6M3 20h18"/>',
    pin: '<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H5.5A1.5 1.5 0 0 1 4 19.5Z"/>',
    chat: '<path d="M5 5.5h14a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.8 7 9.5 4.1-1.7 7-5.2 7-9.5V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19c3-4 6-6.5 9-8"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  };

  function glyph(name) {
    return `<svg class="shop-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${GLYPH[name]}</svg>`;
  }

  const DELIVERY = [
    {
      id: "Domicilio",
      icon: "home",
      title: "Envío a domicilio",
      text: "El kit se enviará a la dirección registrada. El costo y el tiempo de envío se confirmarán antes de finalizar.",
    },
    {
      id: "Coordinar entrega",
      icon: "chat",
      title: "Coordinar entrega",
      text: "El equipo de Crece en Casa se comunicará para acordar el lugar y las condiciones de entrega.",
    },
  ];

  const FIELDS = [
    { id: "name", icon: "user", label: "Nombre completo", placeholder: "Nombre y apellidos", autocomplete: "name" },
    { id: "phone", icon: "phone", label: "Número de celular", placeholder: "Ej. 300 000 0000", autocomplete: "tel", inputmode: "tel", type: "tel" },
    { id: "email", icon: "mail", label: "Correo electrónico", placeholder: "correo@ejemplo.com", autocomplete: "email", type: "email", full: true },
    { id: "city", icon: "city", label: "Ciudad / municipio", placeholder: "Ciudad", autocomplete: "address-level2" },
    { id: "neighborhood", icon: "pin", label: "Barrio", placeholder: "Barrio" },
    { id: "address", icon: "home", label: "Dirección completa", placeholder: "Calle, carrera, número, apartamento o referencia", autocomplete: "street-address", full: true },
  ];

  const emptyForm = { name: "", phone: "", email: "", city: "", neighborhood: "", address: "", notes: "", delivery: "Domicilio" };

  let state = { step: 1, qty: readCart() || 1, form: { ...emptyForm }, reference: "", direction: "forward" };
  let toastTimer = 0;

  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function icon(id) {
    return `<svg class="icon" aria-hidden="true" focusable="false"><use href="${SPRITE}#${id}"></use></svg>`;
  }

  function money(n) {
    return `$ ${n.toLocaleString("es-CO")} COP`;
  }

  function units(n) {
    return `${n} ${n === 1 ? "unidad" : "unidades"}`;
  }

  function readCart() {
    try {
      const n = parseInt(localStorage.getItem(CART_KEY) || "0", 10);
      return Number.isFinite(n) && n > 0 ? Math.min(n, MAX_QTY) : 0;
    } catch (error) {
      return 0;
    }
  }

  function writeCart(n) {
    try {
      if (n > 0) localStorage.setItem(CART_KEY, String(n));
      else localStorage.removeItem(CART_KEY);
    } catch (error) {
      // Sin almacenamiento el flujo funciona igual; solo no se recuerda el contador.
    }
    document.dispatchEvent(new CustomEvent("cec:cart", { detail: { qty: n } }));
  }

  /* ---------- Piezas ---------- */
  function stepper() {
    const fill = ((state.step - 1) / (STEPS.length - 1)) * 100;
    return `
      <ol class="shop-steps" aria-label="Progreso de la compra" style="--shop-progress:${fill}%">
        ${STEPS.map((s) => {
          const status = s.n === state.step ? "current" : s.n < state.step ? "done" : "todo";
          return `
          <li class="shop-steps__item shop-steps__item--${status}"${status === "current" ? ' aria-current="step"' : ""}>
            <span class="shop-steps__num">${status === "done" ? icon("i-check") : s.n}</span>
            <span class="shop-steps__name">${s.name}</span>
          </li>`;
        }).join("")}
      </ol>`;
  }

  function kitArt(size = "") {
    return `
      <div class="shop-kit${size ? ` shop-kit--${size}` : ""}" aria-hidden="true">
        <span class="shop-kit__lid"></span>
        <img src="assets/img/stickers/hoja.png" width="40" height="40" alt="">
        <span class="shop-kit__name">Nuestro<br>Jardín</span>
      </div>`;
  }

  function qtyControl() {
    return `
      <div class="shop-qty" role="group" aria-labelledby="shop-qty-label">
        <button type="button" data-shop-qty="-1" aria-label="Quitar una unidad"${state.qty <= 1 ? " disabled" : ""}>−</button>
        <output aria-live="polite" data-shop-qty-value>${state.qty}</output>
        <button type="button" data-shop-qty="1" aria-label="Agregar una unidad"${state.qty >= MAX_QTY ? " disabled" : ""}>+</button>
      </div>`;
  }

  function summary() {
    const subtotal = UNIT * state.qty;
    return `
      <aside class="shop-summary" aria-labelledby="shop-summary-title">
        <h2 id="shop-summary-title">Resumen del carrito</h2>
        <div class="shop-summary__item">
          ${kitArt("mini")}
          <div>
            <strong>Nuestro Jardín</strong>
            <span>Kit físico · <span data-shop-sum-qty>${units(state.qty)}</span></span>
          </div>
        </div>
        <dl class="shop-summary__lines">
          <div><dt>Precio unitario</dt><dd>${money(UNIT)}</dd></div>
          <div><dt>Subtotal</dt><dd data-shop-sum-sub>${money(subtotal)}</dd></div>
          <div><dt>Envío</dt><dd><span class="shop-tag">Por confirmar</span></dd></div>
        </dl>
        <div class="shop-summary__total">
          <span>Total estimado</span>
          <strong data-shop-sum-total>${money(subtotal)}</strong>
        </div>
        <p class="shop-summary__note">${glyph("shield")} El valor del envío se informa antes de cerrar la compra. No se solicita información bancaria en este prototipo.</p>
      </aside>`;
  }

  /* Barra fija inferior en móvil: total + acción principal del paso */
  function mobileBar() {
    const action = {
      1: `<button class="btn btn--sage" type="button" data-shop-go="2">${icon("i-cart")} Agregar</button>`,
      2: `<button class="btn btn--sage" type="submit" form="shop-form">Revisar ${icon("i-arrow")}</button>`,
      3: `<button class="btn btn--sage" type="button" data-shop-confirm>Confirmar ${icon("i-check")}</button>`,
    }[state.step];
    if (!action) return "";
    return `
      <div class="shop-bar" role="region" aria-label="Total y acción">
        <div class="shop-bar__total">
          <span>Total estimado</span>
          <strong data-shop-bar-total>${money(UNIT * state.qty)}</strong>
        </div>
        ${action}
      </div>`;
  }

  function screenProduct() {
    return `
      <section class="shop-panel" aria-labelledby="shop-step-title">
        <div class="shop-product">
          <div class="shop-product__stage">
            <span class="shop-product__blob" aria-hidden="true"></span>
            ${kitArt()}
            <span class="shop-product__float shop-product__float--one" aria-hidden="true">✦</span>
            <span class="shop-product__float shop-product__float--two" aria-hidden="true">♥</span>
            <span class="shop-product__float shop-product__float--three" aria-hidden="true">✿</span>
          </div>
          <div class="shop-product__copy">
            <span class="shop-pill">${glyph("leaf")} Kit físico</span>
            <h2 id="shop-step-title" tabindex="-1">Nuestro Jardín</h2>
            <p>Material de acompañamiento para compartir experiencias de comunicación y lenguaje en las rutinas cotidianas del hogar.</p>
            <ul class="shop-chips" aria-label="Características">
              <li>Comunicación y lenguaje</li>
              <li>Rutinas del hogar</li>
              <li>Para compartir en familia</li>
            </ul>
            <p class="shop-price">${money(UNIT)}</p>
            <p class="shop-fine">Contenido y disponibilidad sujetos a confirmación.</p>

            <div class="shop-buy">
              <div>
                <span class="shop-label" id="shop-qty-label">Cantidad</span>
                ${qtyControl()}
              </div>
              <button class="btn btn--sage shop-buy__cta" type="button" data-shop-go="2">${icon("i-cart")} Agregar al carrito</button>
            </div>
          </div>
        </div>
        <p class="shop-notice">${glyph("shield")} Al agregar el producto, podrás revisar la cantidad y el valor estimado antes de continuar. Esta demostración no realiza cobros.</p>
      </section>`;
  }

  function field(f) {
    return `
      <div class="shop-field${f.full ? " shop-field--full" : ""}">
        <label for="shop-${f.id}">${f.label}</label>
        <div class="shop-input">
          ${glyph(f.icon)}
          <input id="shop-${f.id}" name="${f.id}" type="${f.type || "text"}" placeholder="${esc(f.placeholder)}"
            value="${esc(state.form[f.id])}"${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ""}${f.inputmode ? ` inputmode="${f.inputmode}"` : ""} data-shop-field>
        </div>
      </div>`;
  }

  function screenDelivery() {
    return `
      <section class="shop-panel" aria-labelledby="shop-step-title">
        <header class="shop-panel__head">
          <h2 id="shop-step-title" tabindex="-1">Datos para la entrega</h2>
          <p class="shop-panel__sub">Completa la información de contacto y la dirección donde deseas recibir el kit.</p>
          <span class="shop-tag shop-tag--soft">Todos los campos son opcionales en esta demostración</span>
        </header>
        <form class="shop-form" id="shop-form" data-shop-form novalidate>
          <div class="shop-fields">
            ${FIELDS.map(field).join("")}
            <div class="shop-field shop-field--full">
              <label for="shop-notes">Indicaciones adicionales</label>
              <textarea id="shop-notes" name="notes" rows="3" placeholder="Referencias para ubicar la dirección, horario preferido u otra indicación." data-shop-field>${esc(state.form.notes)}</textarea>
            </div>
          </div>

          <fieldset class="shop-delivery">
            <legend>Método de entrega</legend>
            <div class="shop-delivery__options">
              ${DELIVERY.map((d) => `
                <label class="shop-choice${state.form.delivery === d.id ? " is-selected" : ""}">
                  <input type="radio" name="delivery" value="${esc(d.id)}"${state.form.delivery === d.id ? " checked" : ""} data-shop-field>
                  <span class="shop-choice__icon">${glyph(d.icon)}</span>
                  <span class="shop-choice__copy">
                    <strong>${d.title}</strong>
                    <span>${d.text}</span>
                  </span>
                  <span class="shop-choice__radio" aria-hidden="true"></span>
                </label>`).join("")}
            </div>
          </fieldset>

          <div class="shop-actions">
            <button class="btn btn--outline" type="button" data-shop-go="1">← Volver al carrito</button>
            <button class="btn btn--sage" type="submit">Continuar a revisión ${icon("i-arrow")}</button>
          </div>
        </form>
      </section>`;
  }

  function orNone(value) {
    return value.trim() ? esc(value.trim()) : '<span class="shop-empty">Sin indicar</span>';
  }

  function reviewRow(label, value) {
    return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function screenReview() {
    const f = state.form;
    const address = [f.address, f.neighborhood, f.city].map((v) => v.trim()).filter(Boolean).join(", ");
    return `
      <section class="shop-panel" aria-labelledby="shop-step-title">
        <header class="shop-panel__head">
          <h2 id="shop-step-title" tabindex="-1">Revisa tu solicitud</h2>
          <p class="shop-panel__sub">Verifica que el producto, los datos de contacto y la entrega estén correctos antes de confirmar.</p>
        </header>

        <div class="shop-review">
          <div class="shop-review__head">
            <h3>Producto seleccionado</h3>
            <button class="shop-link" type="button" data-shop-go="1">Editar</button>
          </div>
          <div class="shop-summary__item">
            ${kitArt("mini")}
            <div>
              <strong>Nuestro Jardín</strong>
              <span>${units(state.qty)} · ${money(UNIT * state.qty)}</span>
            </div>
          </div>
        </div>

        <div class="shop-review">
          <div class="shop-review__head">
            <h3>Datos de contacto y entrega</h3>
            <button class="shop-link" type="button" data-shop-go="2">Editar</button>
          </div>
          <dl class="shop-review__grid">
            ${reviewRow("Nombre", orNone(f.name))}
            ${reviewRow("Celular", orNone(f.phone))}
            ${reviewRow("Correo", orNone(f.email))}
            ${reviewRow("Dirección", orNone(address))}
            ${reviewRow("Entrega", esc(f.delivery))}
            ${f.notes.trim() ? reviewRow("Indicaciones", esc(f.notes.trim())) : ""}
          </dl>
        </div>

        <div class="shop-review">
          <h3>Resumen de valores</h3>
          <dl class="shop-review__grid">
            ${reviewRow("Subtotal", money(UNIT * state.qty))}
            ${reviewRow("Envío", "Por confirmar con el equipo")}
          </dl>
          <p class="shop-review__total">Total estimado: sujeto a confirmación de envío y disponibilidad.</p>
        </div>
        <p class="shop-notice">${glyph("shield")} La confirmación registra una solicitud de compra. No se realizará ningún pago en esta etapa. El equipo deberá validar disponibilidad, costo de envío y método de pago y comunicarse con el cliente.</p>

        <div class="shop-actions">
          <button class="btn btn--outline" type="button" data-shop-go="2">← Editar datos</button>
          <button class="btn btn--sage" type="button" data-shop-confirm>Confirmar solicitud ${icon("i-check")}</button>
        </div>
      </section>`;
  }

  function confetti() {
    if (reduceMotion) return "";
    const colors = ["#77aa97", "#f6c46b", "#f18c82", "#a99bd8", "#80b8d9"];
    return `<div class="shop-confetti" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => {
      const x = Math.round(Math.cos((i / 22) * Math.PI * 2) * (90 + (i % 3) * 30));
      const y = Math.round(Math.sin((i / 22) * Math.PI * 2) * (70 + (i % 4) * 22)) - 30;
      return `<i style="--x:${x}px;--y:${y}px;--r:${(i * 47) % 360}deg;--c:${colors[i % colors.length]};--d:${(i % 5) * 30}ms"></i>`;
    }).join("")}</div>`;
  }

  function screenConfirm() {
    return `
      <section class="shop-panel shop-confirm" aria-labelledby="shop-step-title">
        <div class="shop-confirm__mark" aria-hidden="true">
          ${confetti()}
          ${icon("i-check")}
        </div>
        <h2 id="shop-step-title" tabindex="-1">¡Solicitud recibida!</h2>
        <p>Tu solicitud de <strong>Nuestro Jardín</strong> quedó registrada en esta demostración. El equipo de Crece en Casa se comunicará contigo para validar disponibilidad, envío y forma de pago.</p>
        <div class="shop-ref">
          <span>Referencia</span>
          <strong>${esc(state.reference)}</strong>
        </div>
        <ol class="shop-next" aria-label="Próximos pasos">
          <li>${glyph("chat")}<span>Te contactamos para validar disponibilidad</span></li>
          <li>${glyph("shield")}<span>Acordamos envío y forma de pago</span></li>
          <li>${glyph("home")}<span>Recibes Nuestro Jardín en casa</span></li>
        </ol>
        <p class="shop-fine">En una implementación real, aquí se mostrará el número de pedido y se enviará una notificación al correo del cliente y al administrador de la tienda.</p>
        <div class="shop-actions shop-actions--center">
          <button class="btn btn--outline" type="button" data-shop-restart>Volver al inicio de la tienda</button>
          <a class="btn btn--sage" href="experiencias.html">Explorar experiencias ${icon("i-arrow")}</a>
        </div>
      </section>`;
  }

  /* ---------- Render ---------- */
  function render({ focus = false } = {}) {
    const screens = { 1: screenProduct, 2: screenDelivery, 3: screenReview, 4: screenConfirm };
    root.innerHTML = `
      ${stepper()}
      <div class="shop-layout${state.step === 4 ? " shop-layout--single" : ""}">
        <div class="shop-main shop-main--${state.direction}" data-shop-main>${screens[state.step]()}</div>
        ${state.step === 4 ? "" : summary()}
      </div>
      ${mobileBar()}
      <div class="shop-toast" role="status" data-shop-toast hidden></div>`;
    document.body.classList.toggle("has-shop-bar", state.step < 4);
    if (focus) {
      root.querySelector("#shop-step-title")?.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function toast(message) {
    const node = root.querySelector("[data-shop-toast]");
    if (!node) return;
    node.innerHTML = `${icon("i-check")} ${esc(message)}`;
    node.hidden = false;
    node.classList.remove("is-leaving");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.classList.add("is-leaving");
      toastTimer = setTimeout(() => { node.hidden = true; }, 250);
    }, 2200);
  }

  function go(step) {
    state.direction = step >= state.step ? "forward" : "back";
    state.step = step;
    render({ focus: true });
  }

  function bump(node) {
    if (!node || reduceMotion) return;
    node.classList.remove("is-bumped");
    void node.offsetWidth;
    node.classList.add("is-bumped");
  }

  function syncQty() {
    const subtotal = money(UNIT * state.qty);
    root.querySelector("[data-shop-qty-value]").textContent = state.qty;
    root.querySelector('[data-shop-qty="-1"]').disabled = state.qty <= 1;
    root.querySelector('[data-shop-qty="1"]').disabled = state.qty >= MAX_QTY;
    root.querySelector("[data-shop-sum-qty]").textContent = units(state.qty);
    root.querySelector("[data-shop-sum-sub]").textContent = subtotal;
    ["[data-shop-sum-total]", "[data-shop-bar-total]"].forEach((sel) => {
      const node = root.querySelector(sel);
      if (!node) return;
      node.textContent = subtotal;
      bump(node);
    });
    bump(root.querySelector("[data-shop-qty-value]"));
  }

  function readForm() {
    root.querySelectorAll("[data-shop-field]").forEach((el) => {
      if (el.type === "radio") {
        if (el.checked) state.form.delivery = el.value;
      } else {
        state.form[el.name] = el.value;
      }
    });
  }

  /* ---------- Eventos ---------- */
  root.addEventListener("click", (event) => {
    const qtyBtn = event.target.closest("[data-shop-qty]");
    if (qtyBtn) {
      state.qty = Math.min(MAX_QTY, Math.max(1, state.qty + Number(qtyBtn.dataset.shopQty)));
      syncQty();
      return;
    }

    const goBtn = event.target.closest("[data-shop-go]");
    if (goBtn) {
      const target = Number(goBtn.dataset.shopGo);
      if (state.step === 2) readForm();
      const adding = state.step === 1 && target === 2;
      if (adding) writeCart(state.qty);
      go(target);
      if (adding) toast(`Agregaste ${units(state.qty)} al carrito`);
      return;
    }

    if (event.target.closest("[data-shop-confirm]")) {
      state.reference = `CEC-${Math.floor(100000 + Math.random() * 899999)}`;
      writeCart(0);
      go(4);
      return;
    }

    if (event.target.closest("[data-shop-restart]")) {
      state = { step: 1, qty: 1, form: { ...emptyForm }, reference: "", direction: "back" };
      render({ focus: true });
    }
  });

  root.addEventListener("change", (event) => {
    if (event.target.name !== "delivery") return;
    root.querySelectorAll(".shop-choice").forEach((choice) => {
      choice.classList.toggle("is-selected", choice.querySelector("input").checked);
    });
  });

  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-shop-form]")) return;
    event.preventDefault();
    readForm();
    go(3);
  });

  render();
})();
