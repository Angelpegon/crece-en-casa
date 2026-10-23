/*
 * Álbum de momentos: notas locales en este navegador (sin fotos en servidor).
 */
window.CEC = window.CEC || {};

window.CEC.album = (function () {
  const KEY = "crece-en-casa:album";

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
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

  function list() {
    return read().slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function add({ title, note, momentId } = {}) {
    const cleanTitle = String(title || "").trim().slice(0, 80);
    const cleanNote = String(note || "").trim().slice(0, 280);
    if (!cleanTitle) return null;
    const items = read();
    const entry = {
      id: `m-${Date.now().toString(36)}`,
      title: cleanTitle,
      note: cleanNote,
      momentId: momentId || null,
      createdAt: new Date().toISOString(),
    };
    items.push(entry);
    return write(items) ? entry : null;
  }

  function remove(id) {
    const next = read().filter((item) => item.id !== id);
    return write(next);
  }

  return { isAvailable, list, add, remove };
})();
