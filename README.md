# Crece en Casa

Sitio estático (HTML, CSS y JavaScript sin frameworks) para acompañar la comunicación y el lenguaje de niños de 2 a 5 años.

> **Nota de producto:** el progreso (Mi camino, Mi álbum, Mi espacio) se guarda solo en este navegador. No hay cuentas en la nube.

## Estructura

```
index.html                      Inicio

actividades.html                Hub de Actividades
experiencias.html               Momentos / experiencias
explorar-actividades.html       Catálogo con filtros
actividad.html                  Ficha (?id=)

ver-la-guia.html                Guía para cuidadores (entrada)
ideas-que-acompanan.html        Lista de ideas
estrategia.html                 Ficha de idea (?id=)
cada-dia-una-oportunidad.html   Oportunidades cotidianas

mi-camino.html / mi-album.html  Nuestro rincón (progreso y álbum)
nuestro-rincon.html → mi-camino.html

nuestra-comunidad.html          Comunidad (publicaciones locales de sesión)

mi-espacio.html                 Espacio local
sobre.html

# Redirecciones (compatibilidad)
acceso.html → mi-espacio.html
guia.html / guia-cuidadores.html → ver-la-guia.html
familias.html / comunidad.html / experiencias-familias.html /
preguntas-frecuentes.html → nuestra-comunidad.html
reto.html → cada-dia-una-oportunidad.html (?id=)

js/chrome.js                    Cabecera, pie y barra lateral
js/data.js / ui.js / progress.js / session.js / album.js …
css/styles.css / pages.css / home.css
assets/brand/                   Marca
assets/img/                     Imágenes del sitio
```

## Ejecutar en local

```
python3 -m http.server 5173
```

Abre `http://localhost:5173`.

## Contenido del MVP

- 6 actividades, 8 ideas, 4 oportunidades
- 5 momentos de exploración
- Progreso y álbum solo en este navegador
- Comunidad: prototipo de publicaciones en la sesión actual
