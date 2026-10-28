/* Mi álbum de momentos — layout del prototipo Impacto Visual + banner ilustrado. */
(function () {
  const { ui, album } = window.CEC;
  const root = document.querySelector("[data-album-root]");
  if (!root || !album || !ui) return;

  const esc = ui.escapeHTML;
  let photoData = "";
  let lastOpener = null;

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  }

  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Tipo no válido"));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("No se pudo leer"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Imagen inválida"));
        img.onload = () => {
          const max = 900;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function toast(message) {
    const el = root.querySelector("[data-album-toast]");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }

  function focusables(container) {
    return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );
  }

  function modalEls() {
    const modal = root.querySelector("[data-album-modal]");
    return {
      modal,
      dialog: modal?.querySelector(".album-modal__dialog"),
      page: root.querySelector("[data-album-page]"),
      form: root.querySelector("[data-album-form]"),
      uploadText: root.querySelector("[data-album-upload-text]"),
    };
  }

  function openModal(opener) {
    const { modal, dialog, page } = modalEls();
    if (!modal || !dialog) return;
    lastOpener = opener || null;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    if (page) page.setAttribute("inert", "");
    document.body.classList.add("album-modal-open");
    dialog.focus();
  }

  function closeModal() {
    const { modal, page, form, uploadText } = modalEls();
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (page) page.removeAttribute("inert");
    document.body.classList.remove("album-modal-open");
    if (form) form.reset();
    photoData = "";
    if (uploadText) {
      uploadText.innerHTML =
        'Añadir una fotografía <small>Opcional · Elige una imagen de tu dispositivo</small>';
    }
    if (lastOpener && typeof lastOpener.focus === "function") lastOpener.focus();
    lastOpener = null;
  }

  function memoryCard(item) {
    const media = item.photo
      ? `<img class="album-card__photo" src="${item.photo}" alt="">`
      : `<div class="album-card__placeholder" aria-hidden="true">💛📖</div>`;
    return `
      <article class="album-card">
        ${media}
        <p class="album-card__date">${esc(formatDate(item.createdAt))}</p>
        <h3>${esc(item.title)}</h3>
        ${item.note ? `<p class="album-card__desc">${esc(item.note)}</p>` : ""}
        <button class="album-card__remove" type="button" data-album-remove="${esc(item.id)}">Quitar</button>
      </article>`;
  }

  function render() {
    const available = album.isAvailable();
    const items = available ? album.list() : [];
    const isEmpty = items.length === 0;

    root.innerHTML = `
      <div class="album-page" data-album-page>
        <div class="container album-shell">
          <section class="album-banner" aria-labelledby="page-title">
            <nav class="breadcrumb" aria-label="Ruta de navegación">
              <ol>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="mi-camino.html">Nuestro rincón</a></li>
                <li aria-current="page">Mi álbum</li>
              </ol>
            </nav>
            <h1 id="page-title" class="visually-hidden">Mi álbum de momentos</h1>
            <div class="album-banner__frame">
              <img
                class="album-banner__art"
                src="assets/img/album-banner.jpg"
                width="1536"
                height="1024"
                alt="Mi álbum de momentos. Lo pequeño también florece. Un gesto, una palabra, una mirada compartida. Guarda esos instantes que cuentan la historia de cómo se comunican y crecen juntos."
                decoding="async"
                fetchpriority="high"
              >
              <div class="album-banner__tags">
                <span>♡ Recuerdos reales</span>
                <span>✳ A tu ritmo</span>
                <span>↗ Sin tareas</span>
              </div>
            </div>
          </section>

          <div class="album-toolbar">
            <div>
              <h2>${isEmpty ? "Un lugar para sus recuerdos 💚" : "Sus recuerdos guardados 💚"}</h2>
              <p>${
                isEmpty
                  ? "Este espacio se irá llenando solo con los momentos que tú quieras conservar."
                  : "Puedes volver cuando quieras para guardar otro momento."
              }</p>
            </div>
            ${
              !isEmpty
                ? `<button class="album-btn" type="button" data-album-open>＋ Guardar otro recuerdo</button>`
                : ""
            }
          </div>

          ${
            !available
              ? `<section class="album-empty" role="status">
                  <div class="album-empty__copy">
                    <span class="album-empty__eyebrow">SIN ALMACENAMIENTO LOCAL</span>
                    <h2>No se pudo abrir el álbum en este navegador.</h2>
                    <p>Revisa si el almacenamiento local está bloqueado e inténtalo de nuevo.</p>
                  </div>
                </section>`
              : isEmpty
                ? `<section class="album-empty" aria-live="polite">
                    <div class="album-empty__art" aria-hidden="true">
                      <span class="album-empty__spark album-empty__spark--one">✦</span>
                      <span class="album-empty__heart">♥</span>
                      <div class="album-empty__book">
                        <div class="album-empty__page">
                          <span class="album-empty__sun">☼</span>
                          <span class="album-empty__house">⌂</span>
                          <span class="album-empty__flower">✿</span>
                          <i></i><i class="is-short"></i>
                        </div>
                        <div class="album-empty__page album-empty__page--right">
                          <span class="album-empty__speech">“ ”</span>
                          <span class="album-empty__flower album-empty__flower--two">✿</span>
                          <i></i><i class="is-short"></i>
                        </div>
                      </div>
                      <span class="album-empty__spark album-empty__spark--two">✧</span>
                    </div>
                    <div class="album-empty__copy">
                      <span class="album-empty__eyebrow">UN ESPACIO SOLO DE USTEDES</span>
                      <h2>Hay momentos pequeños que se quedan para siempre.</h2>
                      <p>Una palabra inesperada, una mirada cómplice, un gesto o una risa compartida. Cuando quieras guardar uno de esos momentos, aquí tendrá su lugar.</p>
                      <button class="album-btn" type="button" data-album-open>＋ Guardar un recuerdo</button>
                      <p class="album-empty__soft">Puedes guardar solo una foto. Escribir algo es opcional; no tienes que registrarlo todo. 💚</p>
                    </div>
                  </section>`
                : `<section class="album-grid" aria-label="Recuerdos guardados">
                    ${items.map(memoryCard).join("")}
                    <button class="album-add" type="button" data-album-open>
                      <span class="album-add__camera" aria-hidden="true">📷</span>
                      <strong>Guardar un recuerdo</strong>
                      <span>Una foto o una frase, si quieres. ♥</span>
                    </button>
                  </section>`
          }

          <aside class="album-note">
            <div class="album-note__ico" aria-hidden="true">💬🌱</div>
            <div>
              <h3>La comunicación también vive en estos momentos</h3>
              <p>Desde la mirada fonoaudiológica, una palabra, un gesto, una mirada o un turno compartido tienen valor. No necesitas analizarlos ni clasificarlos: basta con reconocer que la comunicación también crece en la vida cotidiana.</p>
            </div>
          </aside>
        </div>
      </div>

      <div class="album-modal" data-album-modal hidden aria-hidden="true">
        <form class="album-modal__dialog" data-album-form role="dialog" aria-modal="true" aria-labelledby="album-modal-title" tabindex="-1">
          <button class="album-modal__close" type="button" data-album-close aria-label="Cerrar">×</button>
          <div class="album-modal__body">
            <h2 id="album-modal-title">Guardar un recuerdo 💌</h2>
            <p>Guarda ese momento que quieres conservar. Puedes añadir solo una foto; escribir es opcional.</p>
            <label class="album-upload">
              <span style="font-size:1.6rem" aria-hidden="true">📷</span>
              <span data-album-upload-text>Añadir una fotografía <small>Opcional · Elige una imagen de tu dispositivo</small></span>
              <input data-album-photo type="file" accept="image/*">
            </label>
            <label class="album-field">
              Un título, si quieres
              <input name="title" type="text" maxlength="70" placeholder="Ej. Nuestra tarde de cuentos">
            </label>
            <label class="album-field">
              Una frase para recordarlo, si quieres
              <textarea name="note" maxlength="350" rows="3" placeholder="Si quieres, escribe una frase para volver a este momento…"></textarea>
            </label>
          </div>
          <div class="album-modal__actions">
            <button class="album-btn album-btn--ghost" type="button" data-album-close>Cancelar</button>
            <button class="album-btn" type="submit">Guardar recuerdo</button>
          </div>
        </form>
      </div>
      <div class="album-toast" data-album-toast hidden role="status"></div>`;
  }

  root.addEventListener("click", (event) => {
    const openBtn = event.target.closest("[data-album-open]");
    if (openBtn && root.contains(openBtn)) {
      openModal(openBtn);
      return;
    }
    if (event.target.closest("[data-album-close]")) {
      closeModal();
      return;
    }
    const removeBtn = event.target.closest("[data-album-remove]");
    if (removeBtn) {
      if (!window.confirm("¿Quieres quitar este recuerdo del álbum?")) return;
      album.remove(removeBtn.getAttribute("data-album-remove"));
      render();
      toast("Recuerdo quitado del álbum.");
      return;
    }
    const { modal } = modalEls();
    if (modal && event.target === modal) closeModal();
  });

  root.addEventListener("change", async (event) => {
    const input = event.target.closest("[data-album-photo]");
    if (!input) return;
    const file = input.files && input.files[0];
    if (!file) return;
    const uploadText = root.querySelector("[data-album-upload-text]");
    try {
      photoData = await readPhoto(file);
      if (uploadText) uploadText.textContent = `Fotografía seleccionada: ${file.name}`;
    } catch (error) {
      photoData = "";
      toast("No se pudo cargar esa imagen. Prueba con otra.");
    }
  });

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-album-form]");
    if (!form) return;
    event.preventDefault();
    if (!album.isAvailable()) {
      toast("No se pudo guardar en este navegador.");
      return;
    }
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const note = String(data.get("note") || "").trim();
    if (!photoData && !note && !title) {
      toast("Añade una foto o escribe algo que quieras recordar.");
      return;
    }
    const entry = album.add({ title, note, photo: photoData || null });
    if (!entry) {
      toast("No se pudo guardar. La foto puede ser demasiado grande para este navegador.");
      return;
    }
    closeModal();
    render();
    toast("Tu recuerdo ya aparece en el álbum.");
  });

  document.addEventListener("keydown", (event) => {
    const { modal, dialog } = modalEls();
    if (!modal || modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab" || !dialog) return;
    const items = focusables(dialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  render();
})();
