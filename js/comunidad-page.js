(function () {
  const root = document.querySelector("[data-comunidad-root]");
  if (!root) return;

  let posts = [];
  let activeCat = "Todas";

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function els() {
    return {
      modal: root.querySelector("[data-com-modal]"),
      toast: root.querySelector("[data-com-toast]"),
      list: root.querySelector("[data-com-list]"),
      search: root.querySelector("[data-com-search]"),
      sort: root.querySelector("[data-com-sort]"),
      type: root.querySelector("[data-com-type]"),
      title: root.querySelector("[data-com-title]"),
      body: root.querySelector("[data-com-body]"),
      topic: root.querySelector("[data-com-topic]"),
    };
  }

  function toast(message) {
    const { toast: node } = els();
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      node.hidden = true;
    }, 2500);
  }

  function openModal() {
    const { modal } = els();
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("comunidad-modal-open");
    modal.querySelector("[data-com-title]")?.focus();
  }

  function closeModal() {
    const { modal } = els();
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("comunidad-modal-open");
  }

  function avatarFor(type) {
    if (type === "Pregunta") return "💬";
    if (type === "Logro") return "🌟";
    if (type === "Idea") return "💡";
    return "🌱";
  }

  function render() {
    const { list, search, sort } = els();
    if (!list) return;

    const q = (search?.value || "").trim().toLowerCase();
    let all = posts.filter(
      (p) =>
        (activeCat === "Todas" || p.type === activeCat) &&
        (!q ||
          `${p.title} ${p.body} ${p.topic} ${p.type}`.toLowerCase().includes(q))
    );

    if (sort?.value === "likes") all.sort((a, b) => b.likes - a.likes);
    else all.sort((a, b) => b.id - a.id);

    if (!all.length) {
      list.className = "comunidad-empty";
      list.innerHTML = `
        <img class="comunidad-empty__sticker" src="assets/img/stickers/hoja.png" alt="" width="56" height="56" decoding="async" aria-hidden="true">
        <h3>Este espacio está listo para escucharte</h3>
        <p>Aquí aparecerán las publicaciones que tú y otras familias decidan compartir. Puedes iniciar la conversación cuando quieras.</p>
        <button class="btn btn--sage" type="button" data-com-open>Subir una publicación</button>`;
      return;
    }

    list.className = "comunidad-feed";
    list.innerHTML =
      all
        .map(
          (p) => `
      <article class="comunidad-post">
        <div class="comunidad-post__top">
          <div class="comunidad-post__avatar" aria-hidden="true">${avatarFor(p.type)}</div>
          <div>
            <div class="comunidad-post__person">Miembro de la comunidad</div>
            <div class="comunidad-post__meta">Publicación de esta sesión · ${esc(p.topic)}</div>
          </div>
          <span class="comunidad-post__tag">${esc(p.type)}</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
        <div class="comunidad-post__actions">
          <button type="button" data-com-like="${p.id}">♡ Apoyar (${p.likes})</button>
          <button type="button" data-com-comment="${p.id}">↩ Comentar</button>
          <button type="button" data-com-report="${p.id}">⚑ Reportar</button>
        </div>
      </article>`
        )
        .join("") +
      `<div class="comunidad-feed__more">
        <button class="btn btn--outline" type="button" data-com-open>＋ Subir otra publicación</button>
      </div>`;
  }

  function publish() {
    const { title, body, type, topic } = els();
    const t = title?.value.trim() || "";
    const b = body?.value.trim() || "";
    if (!t || !b) {
      toast("Completa el título y el contenido para publicar.");
      return;
    }
    posts.unshift({
      id: Date.now(),
      type: type?.value || "Experiencia",
      title: t,
      body: b,
      topic: topic?.value || "Comunicación y lenguaje",
      likes: 0,
    });
    if (title) title.value = "";
    if (body) body.value = "";
    closeModal();
    activeCat = "Todas";
    root.querySelectorAll("[data-com-cat]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.comCat === "Todas");
    });
    render();
    toast("Publicación añadida a esta vista del prototipo.");
  }

  root.innerHTML = `
    <section class="page-hero page-hero--sage comunidad-hero" aria-labelledby="page-title">
      <div class="container">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <ol>
            <li><a href="index.html">Inicio</a></li>
            <li aria-current="page">Nuestra comunidad</li>
          </ol>
        </nav>
        <p class="comunidad-hero__eyebrow">Comunidad Crece en Casa</p>
        <h1 id="page-title">¿Qué te gustaría conversar?</h1>
        <p class="page-hero__lead">Un espacio para que las familias compartan publicaciones, hagan preguntas y se acompañen en el camino de la comunicación y el lenguaje.</p>
      </div>
    </section>

    <div class="container comunidad-layout">
      <aside class="comunidad-warning" role="note">
        <span class="comunidad-warning__ico" aria-hidden="true">🛡️</span>
        <div>
          <strong>Antes de participar, cuidemos a nuestras familias</strong>
          <p>Evita publicar nombres completos, datos de contacto, direcciones, colegio o imágenes que permitan identificar a niños. Comparte con respeto: este espacio acompaña, pero no reemplaza una valoración profesional ni ofrece diagnósticos.</p>
        </div>
      </aside>

      <section class="comunidad-panel" aria-labelledby="com-compose-title">
        <div class="comunidad-panel__head">
          <div class="comunidad-panel__copy">
            <h2 id="com-compose-title">Conversemos en comunidad</h2>
            <p>Puedes compartir una experiencia, hacer una pregunta o abrir una conversación.</p>
          </div>
          <button class="btn btn--sage" type="button" data-com-open>＋ Subir una publicación</button>
        </div>
        <div class="comunidad-search">
          <label class="visually-hidden" for="com-search">Buscar publicaciones</label>
          <input id="com-search" class="comunidad-search__input" data-com-search type="search" placeholder="Buscar por palabra o tema…">
          <button class="btn btn--outline" type="button" data-com-search-btn>Buscar</button>
        </div>
        <div class="comunidad-chips" role="group" aria-label="Filtrar por tipo">
          <button class="comunidad-chip is-active" type="button" data-com-cat="Todas">Todas</button>
          <button class="comunidad-chip" type="button" data-com-cat="Experiencia">Experiencias</button>
          <button class="comunidad-chip" type="button" data-com-cat="Pregunta">Preguntas</button>
          <button class="comunidad-chip" type="button" data-com-cat="Idea">Ideas que ayudan</button>
          <button class="comunidad-chip" type="button" data-com-cat="Logro">Pequeños logros</button>
        </div>
      </section>

      <div class="comunidad-feedhead">
        <div class="comunidad-feedhead__copy">
          <h2>Publicaciones de la comunidad</h2>
          <p>Cuando las familias participen, sus publicaciones aparecerán aquí.</p>
        </div>
        <label class="visually-hidden" for="com-sort">Ordenar</label>
        <select id="com-sort" class="comunidad-sort" data-com-sort>
          <option value="recent">Más recientes</option>
          <option value="likes">Más apoyadas</option>
        </select>
      </div>

      <div data-com-list></div>

      <aside class="comunidad-tips" aria-label="Orientaciones de la comunidad">
        <div class="comunidad-tips__block">
          <h3>¿Cómo hacemos que esta comunidad sea útil?</h3>
          <p>Queremos que las conversaciones ayuden a reconocer oportunidades para acompañar la comunicación cotidiana.</p>
          <ul class="comunidad-tips__list">
            <li><strong>Apoyo entre familias</strong> — escuchar y compartir sin comparar ni juzgar.</li>
            <li><strong>Orientación pertinente</strong> — vincular, cuando corresponda, con un recurso de Crece en Casa.</li>
            <li><strong>Aprender de lo cotidiano</strong> — ideas que quepan en las rutinas reales.</li>
          </ul>
        </div>
        <div class="comunidad-tips__block">
          <h3>Acuerdos de convivencia</h3>
          <p>Trata a las demás familias con empatía. No ridiculices, no difundas información ajena y evita presentar experiencias personales como soluciones para todos los niños.</p>
        </div>
        <div class="comunidad-tips__block">
          <h3>Un recordatorio importante</h3>
          <p>Si te preocupa de forma persistente el desarrollo del lenguaje, la comprensión o la audición de tu hijo/a, busca orientación profesional. La comunidad no diagnostica.</p>
        </div>
      </aside>
      <p class="comunidad-note">Prototipo demostrativo: las publicaciones se muestran solo en esta sesión del navegador. No hay cuentas, almacenamiento compartido ni moderación real.</p>
    </div>

    <div class="comunidad-modal" data-com-modal hidden aria-hidden="true">
      <form class="comunidad-modal__dialog" data-com-form role="dialog" aria-modal="true" aria-labelledby="com-modal-title" tabindex="-1">
        <div class="comunidad-modal__body">
          <p class="comunidad-hero__eyebrow">Comunidad Crece en Casa</p>
          <div class="comunidad-modal__head">
            <h2 id="com-modal-title">Subir una publicación</h2>
            <button class="comunidad-modal__close" type="button" data-com-close aria-label="Cerrar">✕</button>
          </div>
          <p>Comparte lo que quieras conversar con otras familias. No tiene que ser un logro: una pregunta o una situación difícil también puede iniciar una conversación.</p>

          <label class="comunidad-field">
            ¿Qué quieres compartir?
            <select data-com-type>
              <option value="Experiencia">Una experiencia cotidiana</option>
              <option value="Pregunta">Una pregunta o duda</option>
              <option value="Idea">Una idea que te ha ayudado</option>
              <option value="Logro">Un pequeño logro</option>
            </select>
          </label>
          <label class="comunidad-field">
            Título de la publicación
            <input data-com-title type="text" maxlength="120" placeholder="Resume tu idea en una frase" required>
          </label>
          <label class="comunidad-field">
            Cuéntanos más
            <textarea data-com-body rows="4" maxlength="1200" placeholder="¿Qué pasó? ¿Qué te gustaría compartir o preguntar?" required></textarea>
          </label>
          <label class="comunidad-field">
            Tema relacionado (opcional)
            <select data-com-topic>
              <option>Comunicación y lenguaje</option>
              <option>Primeras palabras</option>
              <option>Comprensión</option>
              <option>Juego e interacción</option>
              <option>Rutinas familiares</option>
              <option>Orientación profesional</option>
            </select>
          </label>

          <aside class="comunidad-warning comunidad-warning--compact" role="note">
            <span class="comunidad-warning__ico" aria-hidden="true">🔒</span>
            <div>
              <strong>Protege la privacidad</strong>
              <p>No incluyas nombres completos, direcciones, teléfonos, colegio ni fotos identificables de niños.</p>
            </div>
          </aside>
        </div>
        <div class="comunidad-modal__actions">
          <button class="btn btn--outline" type="button" data-com-close>Cancelar</button>
          <button class="btn btn--sage" type="submit">Publicar</button>
        </div>
      </form>
    </div>
    <div class="comunidad-toast" data-com-toast hidden role="status"></div>`;

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-com-open]")) {
      openModal();
      return;
    }
    if (event.target.closest("[data-com-close]")) {
      closeModal();
      return;
    }
    if (event.target.closest("[data-com-search-btn]")) {
      render();
      return;
    }
    const cat = event.target.closest("[data-com-cat]");
    if (cat) {
      activeCat = cat.dataset.comCat;
      root.querySelectorAll("[data-com-cat]").forEach((btn) => {
        btn.classList.toggle("is-active", btn === cat);
      });
      render();
      return;
    }
    const like = event.target.closest("[data-com-like]");
    if (like) {
      const post = posts.find((p) => String(p.id) === like.dataset.comLike);
      if (post) {
        post.likes += 1;
        render();
      }
      return;
    }
    if (event.target.closest("[data-com-comment]")) {
      toast("Los comentarios compartidos requieren una versión conectada con cuentas y moderación.");
      return;
    }
    if (event.target.closest("[data-com-report]")) {
      toast("El reporte real requiere un sistema de moderación conectado.");
    }
  });

  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-com-form]")) return;
    event.preventDefault();
    publish();
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els().modal?.hidden) closeModal();
    if (event.key === "Enter" && event.target.matches("[data-com-search]")) {
      event.preventDefault();
      render();
    }
  });

  root.querySelector("[data-com-sort]")?.addEventListener("change", render);
  root.querySelector("[data-com-modal]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-com-modal]")) closeModal();
  });

  render();
})();
