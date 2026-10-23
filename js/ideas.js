/* Lista de Ideas que acompañan (antes: ruta de estrategias). */
(function () {
  const { data, ui } = window.CEC;
  const root = document.querySelector("[data-strategies]");
  if (!root) return;

  root.innerHTML = data.strategies
    .map((strategy) => `<li>${ui.strategyCard(strategy)}</li>`)
    .join("");
})();
