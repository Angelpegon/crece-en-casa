/* Comportamiento común a todas las páginas: menú móvil y pie. */
(function () {
  const MOBILE_QUERY = window.matchMedia("(max-width: 63.99em)");

  function setupNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    const label = toggle.querySelector("[data-nav-label]");
    const iconUse = toggle.querySelector("use");
    const backdrop = document.querySelector("[data-nav-backdrop]");

    function setOpen(open) {
      const visible = open && MOBILE_QUERY.matches;
      toggle.setAttribute("aria-expanded", String(visible));
      menu.classList.toggle("is-open", visible);
      document.body.classList.toggle("is-nav-open", visible);
      if (backdrop) backdrop.hidden = !visible;
      if (label) label.textContent = visible ? "Cerrar menú" : "Abrir menú";
      if (iconUse) iconUse.setAttribute("href", `assets/icons/sprite.svg#${visible ? "i-close" : "i-menu"}`);
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !toggle.contains(event.target) && isOpen()) {
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

  function setupSidebarDropdowns() {
    const menu = document.querySelector("[data-nav-menu]");
    if (!menu) return;

    menu.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-side-nav-toggle]");
      if (!toggle) return;

      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!panel) return;

      const open = toggle.getAttribute("aria-expanded") !== "true";
      menu.querySelectorAll("[data-side-nav-toggle]").forEach((item) => {
        const itemPanel = document.getElementById(item.getAttribute("aria-controls"));
        const expanded = item === toggle && open;
        item.setAttribute("aria-expanded", String(expanded));
        if (itemPanel) itemPanel.hidden = !expanded;
      });
    });
  }

  function setupFooterYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function setupHomeWelcome() {
    const dialog = document.querySelector("[data-home-welcome]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    const STORAGE_KEY = "crece-en-casa:home-welcome-seen";
    const closeBtn = dialog.querySelector("[data-home-welcome-close]");
    const cta = dialog.querySelector("[data-home-welcome-cta]");

    function markSeen() {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (error) {
        // Si el almacenamiento no está disponible, el popup puede repetirse.
      }
    }

    function closeWelcome() {
      markSeen();
      if (dialog.open) dialog.close();
    }

    function openWelcome() {
      if (dialog.open) return;
      dialog.showModal();
      closeBtn?.focus({ preventScroll: true });
    }

    closeBtn?.addEventListener("click", closeWelcome);
    cta?.addEventListener("click", markSeen);

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeWelcome();
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeWelcome();
    });

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (error) {
      alreadySeen = false;
    }
    if (!alreadySeen) openWelcome();
  }

  setupNavigation();
  setupSidebarDropdowns();
  setupFooterYear();
  setupHomeWelcome();
})();
