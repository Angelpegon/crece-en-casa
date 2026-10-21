# Crece en Casa

Sitio estático (HTML, CSS y JavaScript sin frameworks) para acompañar la comunicación y el lenguaje de niños de 2 a 5 años.

## Estructura

```
index.html                 Inicio (edades, áreas, momentos, guía, destacada)
actividades.html           Biblioteca con filtros (?edad=, ?area=, ?momento=, ?duracion=, ?materiales=, ?q=)
actividad.html             Ficha de actividad (?id=)
guia.html                  Hub: ruta de estrategias y retos cotidianos
estrategia.html            Ficha de estrategia (?id=)
reto.html                  Reto interactivo (?id=)
sobre.html                 Sobre Crece en Casa
familias.html              Hub de comunidad
experiencias.html          Relatos autorizados (vacío hasta haber contenido)
preguntas-frecuentes.html  Acceso a FAQ (contenido pendiente)
css/styles.css             Variables, base y componentes compartidos
css/home.css               Secciones de la página principal
css/pages.css              Páginas internas
js/data.js                 Edades, áreas, momentos, estrategias, retos y actividades
js/ui.js                   Utilidades de presentación
js/progress.js             Progreso opcional en este navegador
js/main.js                 Menú móvil y submenús
js/catalog.js              Catálogo
js/activity.js             Ficha de actividad
js/guide.js                Listados de la guía
js/strategy.js             Ficha de estrategia
js/challenge.js            Reto interactivo
assets/icons/              Sprite SVG y favicon
assets/brand/              Logo e iconos de marca (pendientes de cablear en el HTML)
assets/img/temporal/       Imágenes temporales
```

## Ejecutar en local

Los iconos usan un sprite SVG externo, que los navegadores no cargan desde `file://`. Sirve la carpeta con cualquier servidor estático:

```
python3 -m http.server 5173
```

y abre `http://localhost:5173`.

## Contenido del MVP

- 6 actividades oficiales con plantilla común
- 8 estrategias basadas en principios de EMT (adaptados; no es tratamiento)
- 4 retos interactivos de decisión
- Progreso opcional de 3 estados, solo en el navegador (por ficha; sin panel central)
- Comunidad: hub + páginas de acceso; experiencias y FAQ aún sin listado de contenido

## Contenido temporal pendiente de sustituir

- **Logotipo:** `.brand` muestra el texto "Crece en Casa" en un recuadro punteado; hay archivos en `assets/brand/` listos para integrar.
- **Imágenes de `assets/img/temporal/`:** recortes temporales del mockup (varias actividades aún sin imagen propia).
- **Videos e imprimibles:** fuera de alcance de esta versión.
