/*
 * Progreso opcional y privado en este navegador (sin cuentas).
 * Estados: explored | tried | practice
 */
window.CEC = window.CEC || {};

window.CEC.progress = (function () {
  const KEY = "crece-en-casa:progreso";
  const STATES = {
    explored: "Exploré esta idea",
    tried: "La intenté en casa",
    practice: "Quiero volver a practicar",
  };

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch (error) {
      return {};
    }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  function isAvailable() {
    try {
      localStorage.getItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function entryKey(type, id) {
    return `${type}:${id}`;
  }

  function get(type, id) {
    return read()[entryKey(type, id)] || null;
  }

  function set(type, id, { state, moment } = {}) {
    if (!STATES[state]) return false;
    const data = read();
    const key = entryKey(type, id);
    data[key] = {
      state,
      moment: moment || null,
      updatedAt: new Date().toISOString(),
    };
    return write(data);
  }

  return { STATES, isAvailable, get, set };
})();
