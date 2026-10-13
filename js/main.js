/* Comportamiento común a todas las páginas: menú móvil y pie de página. */
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
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      if (iconUse) iconUse.setAttribute("href", `assets/icons/sprite.svg#${open ? "i-close" : "i-menu"}`);
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    const closeMenu = () => setOpen(false);
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
