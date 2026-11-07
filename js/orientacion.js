/* Orientación Fonoaudiológica: biblioteca de temas, momentos de la mirada y situaciones cotidianas.
   Todo es contenido informativo; no se guarda nada en el navegador. */
(function () {
  const page = document.querySelector(".orien-page");
  if (!page) return;

  /* ---------- 01 · Biblioteca: abrir y cerrar cada tema ---------- */
  const TOPICS = {
    intencion: {
      title: "Intención comunicativa",
      text: "Los niños comunican con diferentes recursos: pueden mirar, señalar, acercarse, vocalizar o usar palabras para pedir, rechazar, llamar la atención o compartir algo. La intención se interpreta observando el contexto y la combinación de señales.",
    },
    comprension: {
      title: "Comprensión del lenguaje",
      text: "Comprender implica mucho más que responder a una orden. Los niños interpretan palabras, gestos, expresiones y situaciones. La familiaridad del contexto, la atención y la forma del mensaje influyen en cómo responden.",
    },
    expresion: {
      title: "Expresión y lenguaje",
      text: "La expresión puede manifestarse mediante gestos, sonidos, palabras y combinaciones. Acompañar no significa exigir que el niño repita: significa reconocer su mensaje, responder y ofrecer modelos de lenguaje en situaciones significativas.",
    },
    interaccion: {
      title: "Juego e interacción",
      text: "En el juego aparecen oportunidades para compartir atención, imitar, alternar turnos, simbolizar y construir intercambios. Seguir el interés del niño permite participar sin convertir el juego en una actividad dirigida.",
    },
  };

  const topicButtons = Array.from(page.querySelectorAll("[data-orien-topic]"));
  const detail = page.querySelector("[data-orien-detail]");

  if (topicButtons.length && detail) {
    let openTopic = "";

    const closeDetail = () => {
      openTopic = "";
      detail.hidden = true;
      detail.textContent = "";
      topicButtons.forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        btn.classList.remove("is-open");
      });
    };

    const openDetail = (id, button) => {
      const topic = TOPICS[id];
      if (!topic) return;
      openTopic = id;

      detail.textContent = "";
      const icon = button.querySelector(".orien-topic__icon");
      const mark = document.createElement("span");
      mark.className = "orien-detail__icon";
      mark.setAttribute("aria-hidden", "true");
      if (icon) Array.from(icon.children).forEach((child) => mark.appendChild(child.cloneNode(true)));

      const body = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = topic.title;
      const text = document.createElement("p");
      text.textContent = topic.text;
      body.append(title, text);

      const close = document.createElement("button");
      close.type = "button";
      close.className = "orien-detail__close";
      close.textContent = "Cerrar";

      detail.append(mark, body, close);
      detail.hidden = false;
      /* Reinicia la animación de entrada al cambiar de tema */
      detail.classList.remove("is-in");
      void detail.offsetWidth;
      detail.classList.add("is-in");

      topicButtons.forEach((btn) => {
        const active = btn === button;
        btn.setAttribute("aria-expanded", String(active));
        btn.classList.toggle("is-open", active);
      });

      close.addEventListener("click", () => {
        closeDetail();
        button.focus();
      });
    };

    topicButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.orienTopic;
        if (id === openTopic) {
          closeDetail();
          return;
        }
        openDetail(id, button);
      });
    });
  }

  /* ---------- 02 · Momentos de la mirada fonoaudiológica ---------- */
  const MOMENTS = {
    observar: {
      art: "assets/img/orientacion/observar.webp",
      title: "Primero, observar al niño en contexto.",
      text: "La comunicación no se reduce a contar palabras. También observamos miradas, gestos, sonidos, comprensión, juego e interacción.",
    },
    comprender: {
      art: "assets/img/orientacion/comprender.webp",
      title: "Después, comprender qué proceso participa.",
      text: "Una misma conducta puede tener distintos significados según el contexto. La mirada fonoaudiológica considera la intención, la situación, los recursos del niño y la respuesta de quienes lo acompañan.",
    },
    acompanar: {
      art: "assets/img/orientacion/acompanar.webp",
      title: "Finalmente, acompañar sin añadir exigencias.",
      text: "La familia puede incorporar respuestas sencillas en sus rutinas: seguir el interés del niño, poner palabras a lo que ocurre, esperar y responder a sus intentos comunicativos.",
    },
  };

  const tabs = Array.from(page.querySelectorAll("[data-orien-tab]"));
  const tabPanel = page.querySelector("[data-orien-tabpanel]");

  if (tabs.length && tabPanel) {
    const tabArt = tabPanel.querySelector("[data-orien-tab-art]");
    const tabTitle = tabPanel.querySelector("[data-orien-tab-title]");
    const tabText = tabPanel.querySelector("[data-orien-tab-text]");

    const selectTab = (tab, moveFocus) => {
      const moment = MOMENTS[tab.dataset.orienTab];
      if (!moment) return;
      tabs.forEach((other) => {
        const active = other === tab;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", String(active));
        other.tabIndex = active ? 0 : -1;
      });
      tabPanel.setAttribute("aria-labelledby", tab.id);
      tabArt.src = moment.art;
      tabTitle.textContent = moment.title;
      tabText.textContent = moment.text;
      tabPanel.classList.remove("is-in");
      void tabPanel.offsetWidth;
      tabPanel.classList.add("is-in");
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTab(tab, false));
      tab.addEventListener("keydown", (event) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        selectTab(tabs[(index + step + tabs.length) % tabs.length], true);
      });
    });
  }

  /* ---------- 03 · Situaciones cotidianas ---------- */
  const SITUATIONS = {
    senala: {
      art: "assets/img/orientacion/senala.webp",
      title: "Reconoce su gesto y dale significado.",
      text: "Si señala un objeto, acércate a su interés y nombra lo que podría estar comunicando.",
      doing: "Puedes decir: «Quieres la pelota. Aquí está». No es necesario pedirle que repita la palabra.",
    },
    sonidos: {
      art: "assets/img/orientacion/sonidos.webp",
      title: "Responde y continúa el intercambio.",
      text: "Un sonido puede ser una invitación a interactuar. Respóndele con naturalidad, añade una palabra relacionada y haz una pausa.",
      doing: "Puedes decir: «¡Ah, un carro!». Evita convertir el sonido en un ejercicio de repetición.",
    },
    frustra: {
      art: "assets/img/orientacion/frustra.webp",
      title: "Primero conecta; después intenta comprender.",
      text: "Cuando no logra hacerse entender, puede necesitar apoyo para regular la emoción. Reconoce lo que siente y busca pistas sobre su mensaje.",
      doing: "Puedes decir: «Veo que algo te molesta. Vamos a descubrir qué necesitas». Ofrece ayuda sin exigir que lo diga.",
    },
    juega: {
      art: "assets/img/orientacion/juega.webp",
      title: "Sigue su iniciativa y comparte el juego.",
      text: "Observa qué le interesa. Acércate, imita una acción o comenta brevemente lo que está haciendo, sin tomar el control del juego.",
      doing: "Puedes decir: «El tren va rápido». Después espera y deja que él decida cómo continúa.",
    },
  };

  const choices = Array.from(page.querySelectorAll("[data-orien-situation]"));
  const response = page.querySelector("[data-orien-response]");

  if (choices.length && response) {
    const responseArt = response.querySelector("[data-orien-response-art]");
    const responseTitle = response.querySelector("[data-orien-response-title]");
    const responseText = response.querySelector("[data-orien-response-text]");
    const responseDo = response.querySelector("[data-orien-response-do]");

    choices.forEach((choice) => {
      choice.addEventListener("click", () => {
        const situation = SITUATIONS[choice.dataset.orienSituation];
        if (!situation) return;
        choices.forEach((other) => {
          const active = other === choice;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        responseArt.src = situation.art;
        responseTitle.textContent = situation.title;
        responseText.textContent = situation.text;
        responseDo.textContent = situation.doing;
        response.classList.remove("is-in");
        void response.offsetWidth;
        response.classList.add("is-in");
      });
    });
  }
})();
