/* Mi álbum: notas de momentos guardadas en este navegador. */
(function () {
  const { data, ui, album, session } = window.CEC;
  const root = document.querySelector("[data-album-root]");
  if (!root || !album) return;

  const esc = ui.escapeHTML;
  const profile = session && session.get ? session.get() : null;

  function render() {
    const items = album.isAvailable() ? album.list() : [];
    const moments = data.moments
      .map(
        (moment) =>
          `<option value="${esc(moment.id)}">${esc(moment.shortLabel || moment.label)}</option>`
      )
      .join("");

    const cards = items.length
      ? `<ul class="album-grid">
          ${items
            .map((item) => {
              const moment = item.momentId ? data.getMoment(item.momentId) : null;
              return `
              <li class="album-card">
                <p class="album-card__meta">${moment ? esc(moment.label) : "Momento libre"}</p>
                <h3 class="album-card__title">${esc(item.title)}</h3>
                ${item.note ? `<p>${esc(item.note)}</p>` : ""}
                <button class="btn btn--outline btn--small" type="button" data-remove="${esc(item.id)}">
                  Quitar
                </button>
              </li>`;
            })
            .join("")}
        </ul>`
      : `<div class="empty-state">
          <h2>Tu álbum está vacío</h2>
          <p>Guarda un recuerdo breve de un momento en casa. En esta versión no se suben fotos: solo notas en este navegador.</p>
        </div>`;

    root.innerHTML = `
      <section class="page-hero page-hero--coral" aria-labelledby="page-title">
        <div class="container">
          <nav class="breadcrumb" aria-label="Ruta de navegación">
            <ol>
              <li><a href="index.html">Inicio</a></li>
              <li><a href="nuestro-rincon.html">Nuestro rincón</a></li>
              <li aria-current="page">Mi álbum</li>
            </ol>
          </nav>
          <h1 id="page-title">Mi álbum de momentos</h1>
          <p class="page-hero__lead">
            ${
              profile
                ? `${esc(profile.name)}, guarda aquí pequeños recuerdos de lo vivido.`
                : "Espacio local para anotar momentos. Más adelante podrás incorporar fotos e imágenes definitivas."
            }
          </p>
        </div>
      </section>

      <section class="section" aria-labelledby="form-title">
        <div class="container album-layout">
          <form class="album-form" data-album-form>
            <h2 id="form-title">Añadir un momento</h2>
            <label>
              Título
              <input name="title" type="text" maxlength="80" required placeholder="Por ejemplo: Merienda con turnos">
            </label>
            <label>
              Momento
              <select name="momentId">
                <option value="">Sin clasificar</option>
                ${moments}
              </select>
            </label>
            <label>
              Nota (opcional)
              <textarea name="note" rows="3" maxlength="280" placeholder="Qué hicieron o qué notaste…"></textarea>
            </label>
            <button class="btn btn--sage" type="submit">Guardar en este navegador</button>
            <p class="album-form__hint" data-album-status role="status"></p>
          </form>
          <div>
            <h2 class="visually-hidden">Momentos guardados</h2>
            ${cards}
          </div>
        </div>
      </section>`;

    const form = root.querySelector("[data-album-form]");
    const status = root.querySelector("[data-album-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!album.isAvailable()) {
        status.textContent = "No se pudo guardar en este navegador.";
        return;
      }
      const formData = new FormData(form);
      const entry = album.add({
        title: formData.get("title"),
        note: formData.get("note"),
        momentId: formData.get("momentId"),
      });
      if (!entry) {
        status.textContent = "Escribe un título para guardar el momento.";
        return;
      }
      render();
    });

    root.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        album.remove(button.getAttribute("data-remove"));
        render();
      });
    });
  }

  render();
})();
