/* Lista de Cada día, una oportunidad (antes: retos cotidianos). */
(function () {
  const { data, ui } = window.CEC;
  const root = document.querySelector("[data-challenges]");
  if (!root) return;

  root.innerHTML = data.challenges
    .map((challenge) => `<li>${ui.challengeCard(challenge)}</li>`)
    .join("");
})();
