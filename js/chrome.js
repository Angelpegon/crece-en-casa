/*
 * Layout del sitio: la navegación vive en la barra lateral (todas las páginas).
 * En cada sección activa se muestran la descripción y las opciones hijas.
 * En pantallas estrechas la barra se abre desde una franja con la marca.
 */
(function () {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  if (!header && !footer) return;

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const SECTIONS = [
    {
      id: "inicio",
      href: "index.html",
      label: "Inicio",
      icon: "i-home",
      pages: ["index.html", ""],
      blurb: null,
      children: [],
    },
    {
      id: "actividades",
      href: "actividades.html",
      label: "Actividades",
      icon: "i-juego",
      pages: ["actividades.html", "experiencias.html", "explorar-actividades.html", "actividad.html"],
      blurb: "Momentos cotidianos convertidos en experiencias de comunicación.",
      children: [
        { href: "experiencias.html", label: "Experiencias" },
        { href: "explorar-actividades.html", label: "Actividades" },
      ],
    },
    {
      id: "guia",
      href: "ver-la-guia.html",
      label: "Guía para cuidadores",
      icon: "i-guide",
      pages: [
        "ver-la-guia.html",
        "ideas-que-acompanan.html",
        "cada-dia-una-oportunidad.html",
        "estrategia.html",
        "reto.html",
        "guia-cuidadores.html",
        "guia.html",
      ],
      blurb: "Ideas y oportunidades para acompañar el lenguaje en casa.",
      children: [
        { href: "ver-la-guia.html", label: "Ver la guía" },
        { href: "ideas-que-acompanan.html", label: "Ideas que acompañan" },
        { href: "cada-dia-una-oportunidad.html", label: "Cada día, una oportunidad" },
      ],
    },
    {
      id: "rincon",
      href: "mi-camino.html",
      label: "Nuestro rincón",
      icon: "i-story",
      pages: ["nuestro-rincon.html", "mi-camino.html", "mi-album.html"],
      blurb: "Nuestros recuerdos también construyen su lenguaje.",
      children: [
        { href: "mi-camino.html", label: "Mi camino" },
        { href: "mi-album.html", label: "Mi álbum de momentos" },
      ],
    },
    {
      id: "comunidad",
      href: "nuestra-comunidad.html",
      label: "Nuestra comunidad",
      icon: "i-community",
      pages: [
        "nuestra-comunidad.html",
        "comunidad.html",
        "experiencias-familias.html",
        "preguntas-frecuentes.html",
        "familias.html",
      ],
      blurb: null,
      children: [],
    },
    {
      id: "sobre",
      href: "sobre.html",
      label: "Sobre Crece en Casa",
      icon: "i-info",
      pages: ["sobre.html"],
      blurb: "Nuestra historia, misión y propósito.",
      children: [],
    },
    {
      id: "espacio",
      href: "mi-espacio.html",
      label: "Mi espacio",
      icon: "i-user",
      pages: ["mi-espacio.html", "acceso.html"],
      blurb: "Tu progreso se guarda en este navegador.",
      children: [],
    },
  ];

  function isActive(section) {
    return section.pages.includes(page);
  }

  function icon(id) {
    return `<svg class="icon nav-icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#${id}"></use></svg>`;
  }

  function childLinks(section) {
    if (!section.children.length) return "";
    return `
      <ul class="side-nav__children">
        ${section.children
          .map((child) => {
            const active = child.href === page ? ' aria-current="page"' : "";
            return `<li><a href="${child.href}"${active}>${child.label}</a></li>`;
          })
          .join("")}
      </ul>`;
  }

  function sidebarItems() {
    return SECTIONS.filter((section) => section.id !== "espacio").map((section) => {
      const active = isActive(section);
      const currentPage = section.href === page;
      const hasChildren = section.children.length > 0;
      const panelId = `side-nav-panel-${section.id}`;
      const blurb = section.blurb ? `<p class="side-nav__blurb">${section.blurb}</p>` : "";
      const children = childLinks(section);
      const panel = hasChildren
        ? `<div class="side-nav__panel" id="${panelId}"${active ? "" : " hidden"}>${blurb}${children}</div>`
        : "";
      const link = hasChildren
        ? `<button class="side-nav__link side-nav__toggle${active ? " side-nav__link--active" : ""}" type="button" aria-expanded="${active}" aria-controls="${panelId}" data-side-nav-toggle>
            ${icon(section.icon)}
            <span>${section.label}</span>
            <span class="side-nav__chevron" aria-hidden="true"></span>
          </button>`
        : `<a class="side-nav__link${active ? " side-nav__link--active" : ""}" href="${section.href}"${currentPage ? ' aria-current="page"' : ""}>
            ${icon(section.icon)}
            <span>${section.label}</span>
          </a>`;
      return `
        <li class="side-nav__item${active ? " is-active" : ""}">
          ${link}
          ${panel}
        </li>`;
    }).join("");
  }

  if (header) {
    header.innerHTML = `
      <div class="container site-header__bar">
        <a class="brand brand--mark" href="index.html" aria-label="Crece en Casa, ir al inicio">
          <img class="brand__mark" src="assets/brand/icon-mark.jpg" width="40" height="40" alt="">
          <span class="brand__copy">
            <span class="brand__name">Crece en Casa</span>
            <span class="brand__tag">El lenguaje sucede</span>
          </span>
        </a>

        <div class="header-actions">
          <a class="icon-button" href="explorar-actividades.html#buscar" aria-label="Buscar actividades">
            <svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-search"></use></svg>
          </a>
          <a class="btn btn--outline btn--small header-actions__access" href="mi-espacio.html"${isActive(SECTIONS.find((s) => s.id === "espacio")) ? ' aria-current="page"' : ""}>
            <svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-user"></use></svg>
            Mi espacio
          </a>
          <button class="nav-toggle icon-button" type="button" aria-expanded="false" aria-controls="menu-principal" data-nav-toggle>
            <svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#i-menu"></use></svg>
            <span class="visually-hidden" data-nav-label>Abrir menú</span>
          </button>
        </div>
      </div>`;
  }

  const main = document.querySelector("main");
  if (main && !document.querySelector(".page-shell")) {
    document.body.classList.add("has-page-sidebar");
    const shell = document.createElement("div");
    shell.className = "page-shell";
    const aside = document.createElement("aside");
    aside.className = "page-sidebar";
    aside.id = "menu-principal";
    aside.setAttribute("data-nav-menu", "");
    aside.setAttribute("aria-label", "Secciones");
    aside.innerHTML = `
      <nav class="side-nav" aria-label="Secciones del sitio">
        <ul class="side-nav__list">
          ${sidebarItems()}
        </ul>
      </nav>
      <div class="page-sidebar__foot">
        <img class="page-sidebar__fox" src="assets/img/temporal/zorrito-sidebar.png" width="1065" height="768" alt="">
        <p class="page-sidebar__quote">Cada palabra, cada gesto, cada momento también cuenta.</p>
      </div>`;
    const backdrop = document.createElement("button");
    backdrop.className = "nav-backdrop";
    backdrop.type = "button";
    backdrop.hidden = true;
    backdrop.setAttribute("data-nav-backdrop", "");
    backdrop.setAttribute("tabindex", "-1");
    backdrop.setAttribute("aria-hidden", "true");
    main.parentNode.insertBefore(shell, main);
    shell.appendChild(aside);
    shell.appendChild(main);
    document.body.appendChild(backdrop);
  }

  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a class="brand brand--mark" href="index.html" aria-label="Crece en Casa, ir al inicio">
              <img class="brand__mark" src="assets/brand/icon-mark.jpg" width="36" height="36" alt="">
              <span class="brand__copy">
                <span class="brand__name">Crece en Casa</span>
                <span class="brand__tag">El lenguaje sucede</span>
              </span>
            </a>
            <p>Ideas para acompañar la comunicación y el lenguaje de niños de 2 a 5 años, a partir de la vida cotidiana en casa.</p>
          </div>
          <nav aria-labelledby="footer-nav-title">
            <h2 id="footer-nav-title">Explora</h2>
            <ul class="site-footer__links">
              <li><a href="actividades.html">Actividades</a></li>
              <li><a href="ver-la-guia.html">Guía para cuidadores</a></li>
              <li><a href="mi-camino.html">Nuestro rincón</a></li>
              <li><a href="nuestra-comunidad.html">Nuestra comunidad</a></li>
              <li><a href="sobre.html">Sobre Crece en Casa</a></li>
              <li><a href="mi-espacio.html">Mi espacio</a></li>
            </ul>
          </nav>
          <div>
            <h2>Importante</h2>
            <p>Las orientaciones de Crece en Casa son educativas. No constituyen un diagnóstico ni sustituyen una valoración fonoaudiológica. Si tienes dudas sobre el desarrollo de tu hijo o hija, consulta con un profesional.</p>
          </div>
        </div>
        <div class="site-footer__bottom">
          <p>© <span data-current-year>2026</span> Crece en Casa</p>
          <p>Sitio en desarrollo · Progreso local en este navegador</p>
        </div>
      </div>`;
  }
})();
