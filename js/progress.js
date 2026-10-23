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

  function list() {
    const data = read();
    return Object.entries(data)
      .map(([key, value]) => {
        const [type, ...rest] = key.split(":");
        return {
          key,
          type,
          id: rest.join(":"),
          state: value && value.state,
          moment: value && value.moment,
          updatedAt: value && value.updatedAt,
        };
      })
      .filter((item) => item.state && STATES[item.state])
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  function weekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - diff);
    return d;
  }

  function weeklyTriedCount(limit = 5) {
    const start = weekStart(new Date()).getTime();
    const tried = list().filter((item) => {
      if (item.state !== "tried") return false;
      const t = Date.parse(item.updatedAt || "");
      return Number.isFinite(t) && t >= start;
    });
    return { count: Math.min(tried.length, limit), total: limit, items: tried.slice(0, limit) };
  }

  return { STATES, isAvailable, get, set, list, weeklyTriedCount };
})();
