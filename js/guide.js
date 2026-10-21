/* Hub de la Guía: ruta de estrategias y retos cotidianos. */
(function () {
  const { data, ui } = window.CEC;
  const strategiesRoot = document.querySelector("[data-strategies]");
  const challengesRoot = document.querySelector("[data-challenges]");
  if (!strategiesRoot || !challengesRoot) return;

  strategiesRoot.innerHTML = data.strategies
    .map((strategy) => `<li>${ui.strategyCard(strategy)}</li>`)
    .join("");

  challengesRoot.innerHTML = data.challenges
    .map((challenge) => `<li>${ui.challengeCard(challenge)}</li>`)
    .join("");
})();
