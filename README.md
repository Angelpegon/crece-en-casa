# Crece en Casa

Sitio estático (HTML, CSS y JavaScript sin frameworks) para acompañar la comunicación y el lenguaje de niños de 2 a 5 años.

## Estructura

```
index.html            Página principal (reproduce el mockup)
actividades.html      Catálogo con búsqueda y filtros por edad y área (?edad=, ?area=, ?q=)
actividad.html        Ficha de actividad (?id=)
mi-espacio.html       Actividades guardadas en este navegador (localStorage)
guia.html             Guía para cuidadores (contenido de ejemplo)
sobre.html            Sobre Crece en Casa
css/styles.css        Variables de diseño, base y componentes compartidos
css/home.css          Secciones de la página principal
css/pages.css         Páginas internas
js/data.js            Edades, áreas y actividades (fuente única de contenido)
js/ui.js              Utilidades de presentación (tarjetas, iconos)
js/saved.js           Almacenamiento local de "Mi espacio"
js/main.js            Menú móvil y pie de página
js/catalog.js         Lógica del catálogo
js/activity.js        Lógica de la ficha
js/my-space.js        Lógica de "Mi espacio"
assets/icons/         Sprite SVG de iconos y favicon
assets/img/temporal/  Imágenes TEMPORALES (ver abajo)
```

## Ejecutar en local

Los iconos usan un sprite SVG externo, que los navegadores no cargan desde `file://`. Sirve la carpeta con cualquier servidor estático:

```
python3 -m http.server 5173
```

y abre `http://localhost:5173`.

## Publicar en Render (Static Site)

1. Sube la carpeta a un repositorio Git (GitHub, GitLab o Bitbucket).
2. En Render: **New → Static Site** y conecta el repositorio.
3. **Build Command:** déjalo vacío (no hay compilación).
4. **Publish Directory:** `.` (la raíz del repositorio).

No se necesitan variables de entorno, redirecciones ni servidor.

Pendiente antes de publicar en serio:

- No hay `404.html` propia. Si se añade, debe usar rutas absolutas (`/css/styles.css`), porque puede servirse desde cualquier ruta.
- Con «Publish Directory: `.`» también se publica este `README.md`. Para evitarlo, mueve el sitio a una subcarpeta (por ejemplo `public/`) y usa esa carpeta como Publish Directory.

## Contenido temporal pendiente de sustituir

- **Logotipo:** `.brand` muestra el texto "Crece en Casa" en un recuadro punteado, como el marcador del mockup.
- **Imágenes de `assets/img/temporal/`:** son recortes de baja resolución del propio mockup. Hay que reemplazarlas por fotografías e ilustraciones definitivas con licencia. Al sustituir `hero-familia-lectura.webp`, conviene mantener una proporción horizontal parecida (unos 1.1:1), porque las burbujas del hero se posicionan en porcentajes sobre la imagen.
- **Actividades y guía:** contenido de ejemplo, pendiente de revisión por profesionales. No debe presentarse como revisado clínicamente.
- **Videos, descargables y códigos QR:** no se incluyeron porque no existen recursos reales. Se mencionan como "en preparación" en `sobre.html`.

## Decisiones de diseño

- **Contraste:** el coral y el lavanda del mockup no alcanzan el contraste mínimo con texto blanco (2.4:1 y 3.5:1). Los botones usan `#e05e45` (con texto grande en negrita) y `#7f5cc8`. Los tonos pastel originales se conservan en fondos y decoraciones. Las palabras multicolor también usan versiones más intensas de la paleta.
- **Encabezado fijo:** el mockup no lo indica. Se dejó fijo (sticky) para mantener la navegación accesible.
- **Mi espacio:** el mockup muestra el acceso, pero no hay cuentas de usuario. Por eso guarda actividades solo en el navegador, y la página lo explica.
- **Pie de página:** no aparece en el mockup. Se añadió con el aviso de que las orientaciones no sustituyen una valoración fonoaudiológica.
- **Carrito y catálogo de productos:** no aparecen en el mockup, así que no se implementaron en esta fase.
- **Tipografías:** Baloo 2, Nunito y Patrick Hand, cargadas desde Google Fonts.
