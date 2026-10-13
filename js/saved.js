/*
 * Actividades guardadas en "Mi espacio".
 * Se almacenan solo en este navegador (localStorage); no hay cuentas ni servidor.
 */
window.CEC = window.CEC || {};

window.CEC.saved = (function () {
  const KEY = "crece-en-casa:mi-espacio";

  function read() {
    try {
      const ids = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === "string"))] : [];
    } catch (error) {
      return [];
    }
  }

  function write(ids) {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Solo comprueba la lectura: si el almacenamiento está lleno, lo guardado sigue visible y add() informa del fallo. */
  function isAvailable() {
    try {
      localStorage.getItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function list() {
    return read();
  }

  function has(id) {
    return read().includes(id);
  }

  function add(id) {
    const ids = read();
    if (ids.includes(id)) return true;
    return write([...ids, id]);
  }

  function remove(id) {
    return write(read().filter((savedId) => savedId !== id));
  }

  function clear() {
    return write([]);
  }

  return { isAvailable, list, has, add, remove, clear };
})();
