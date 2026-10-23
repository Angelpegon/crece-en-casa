/*
 * Perfil local en este navegador (sin servidor ni cuenta en la nube).
 * Sirve como “sesión” provisional para Mi camino / Mi álbum.
 */
window.CEC = window.CEC || {};

window.CEC.session = (function () {
  const KEY = "crece-en-casa:sesion";

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      return data && typeof data === "object" ? data : null;
    } catch (error) {
      return null;
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

  function clear() {
    try {
      localStorage.removeItem(KEY);
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

  function get() {
    return read();
  }

  function isSignedIn() {
    const data = read();
    return Boolean(data && data.name);
  }

  function signIn({ name, mode } = {}) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return false;
    return write({
      name: trimmed.slice(0, 60),
      mode: mode === "registro" ? "registro" : "entrar",
      updatedAt: new Date().toISOString(),
    });
  }

  function signOut() {
    return clear();
  }

  return { isAvailable, get, isSignedIn, signIn, signOut };
})();
