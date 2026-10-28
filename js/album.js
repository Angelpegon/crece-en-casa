/*
 * Álbum de momentos: recuerdos locales en este navegador (foto opcional).
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

  function add({ title, note, momentId, photo } = {}) {
    const rawTitle = String(title || "").trim().slice(0, 80);
    const cleanNote = String(note || "").trim().slice(0, 350);
    const cleanPhoto =
      typeof photo === "string" && photo.startsWith("data:image/") && photo.length < 900000
        ? photo
        : null;
    if (!rawTitle && !cleanNote && !cleanPhoto) return null;

    const items = read();
    const entry = {
      id: `m-${Date.now().toString(36)}`,
      title: rawTitle || "Un momento para recordar",
      note: cleanNote,
      momentId: momentId || null,
      photo: cleanPhoto,
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
