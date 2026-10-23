/* Acceso local: crear o recuperar el nombre del espacio en este navegador. */
(function () {
  const { session, ui } = window.CEC;
  const form = document.querySelector("[data-access-form]");
  const status = document.querySelector("[data-access-status]");
  const nameInput = document.querySelector("[data-access-name]");
  const signOut = document.querySelector("[data-access-signout]");
  if (!form || !session) return;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("modo") === "registro" ? "registro" : "entrar";
  const current = session.get();

  if (nameInput && current) nameInput.value = current.name || "";

  if (status && current) {
    status.textContent = `Ya hay un espacio local como «${current.name}». Puedes continuar o cambiar el nombre.`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!session.isAvailable()) {
      status.textContent = "Este navegador no permite guardar el espacio local.";
      return;
    }
    const name = new FormData(form).get("name");
    const ok = session.signIn({ name, mode });
    if (!ok) {
      status.textContent = "Escribe un nombre para continuar.";
      return;
    }
    window.location.href = "mi-camino.html";
  });

  if (signOut) {
    signOut.hidden = !session.isSignedIn();
    signOut.addEventListener("click", () => {
      session.signOut();
      window.location.reload();
    });
  }
})();
