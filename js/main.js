/* Comportamiento común a todas las páginas: menú móvil, submenu Guía y pie. */
(function () {
  const MOBILE_QUERY = window.matchMedia("(max-width: 63.99em)");

  function setupNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    const label = toggle.querySelector("[data-nav-label]");
    const iconUse = toggle.querySelector("use");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("is-nav-open", open && MOBILE_QUERY.matches);
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      if (iconUse) iconUse.setAttribute("href", `assets/icons/sprite.svg#${open ? "i-close" : "i-menu"}`);
      if (!open) closeAllSubmenus();
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function closeAllSubmenus() {
      menu.querySelectorAll("[data-submenu-toggle]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
        const panel = submenuFor(button);
        if (panel) panel.classList.remove("is-open");
      });
    }

    function submenuFor(button) {
      const id = button.getAttribute("aria-controls");
      return id ? document.getElementById(id) : null;
    }

    function setSubmenuOpen(button, open) {
      button.setAttribute("aria-expanded", String(open));
      const panel = submenuFor(button);
      if (panel) panel.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    menu.querySelectorAll("[data-submenu-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        closeAllSubmenus();
        setSubmenuOpen(button, willOpen);
      });
    });

    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      setOpen(false);
      closeAllSubmenus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (menu.querySelector('[data-submenu-toggle][aria-expanded="true"]')) {
        closeAllSubmenus();
        const focusButton = menu.querySelector("[data-submenu-toggle]");
        if (focusButton) focusButton.focus();
        return;
      }
      if (isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        closeAllSubmenus();
        if (isOpen()) setOpen(false);
      }
    });

    const closeMenu = () => {
      setOpen(false);
      closeAllSubmenus();
    };
    if (MOBILE_QUERY.addEventListener) {
      MOBILE_QUERY.addEventListener("change", closeMenu);
    } else {
      MOBILE_QUERY.addListener(closeMenu);
    }
  }

  function setupFooterYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  setupNavigation();
  setupFooterYear();
})();
