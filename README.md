# Crece en Casa

Sitio estático (HTML, CSS y JavaScript sin frameworks) para acompañar la comunicación y el lenguaje de niños de 2 a 5 años.

> **Nota de producto:** el home y la navegación siguen el mockup “El lenguaje sucede”. Aún no hay cuentas en la nube: Mi camino, Mi álbum y Mi espacio usan almacenamiento local del navegador.

## Estructura

```
index.html                      Inicio
actividades.html                Hub de Actividades
experiencias.html               Momentos / experiencias
explorar-actividades.html       Catálogo con filtros
actividad.html                  Ficha (?id=)

guia-cuidadores.html            Hub de la guía
ver-la-guia.html                Cómo usar la guía
ideas-que-acompanan.html        Lista de ideas
cada-dia-una-oportunidad.html   Lista de oportunidades
estrategia.html / reto.html     Fichas (?id=)

nuestro-rincon.html             Hub
mi-camino.html / mi-album.html  Progreso y álbum locales

nuestra-comunidad.html          Hub
comunidad.html / experiencias-familias.html / preguntas-frecuentes.html

mi-espacio.html                 Espacio local
sobre.html

guia.html / familias.html / acceso.html   Redirecciones a las rutas nuevas

js/chrome.js                    Cabecera, pie y barra lateral
js/data.js / ui.js / progress.js / session.js / album.js …
assets/brand/                   Marca (icon-mark en nav)
assets/img/temporal/            Imágenes temporales del mockup
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
- Comunidad / experiencias: acceso listo; contenido editorial pendiente
