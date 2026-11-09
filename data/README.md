# Datos de recursos

Para explicar el proceso en clase, consulta la [guía de JSON, JavaScript y componentes](../docs/guia-json-javascript-componentes.md).

Cada página carga su catálogo correspondiente:

| Página | Archivo | Recursos actuales |
| --- | --- | --- |
| Ejemplos CodePen | `ejemplos_codepen.json` | 6 |
| Tutoriales | `tutoriales.json` | 3 |
| Librerías | `librerias.json` | 8 |
| Vínculos de interés | `vinculos_interes.json` | 7 |

Los cuatro archivos comparten la estructura `secciones`, con `titulo`, `descripcion` y una lista `recursos` por sección. El orden del JSON es el orden de la página. Se pueden añadir secciones sin modificar el HTML ni JavaScript.

Cada recurso tiene estos campos:

- `id`: identificador único dentro del archivo; conviene conservarlo al editar.
- `titulo`: nombre de la card.
- `etiqueta`: texto breve que aparece sobre el título.
- `descripcion`: explicación del recurso.
- `fuente`: autor o canal, con su etiqueta; usar `""` cuando no corresponda.
- `temas`: arreglo de textos, por ejemplo `["CSS", "Grid"]`. Alimenta automáticamente el filtro. No utilizar `|` dentro de un tema.
- `url`: enlace completo, con `https://` o `http://`.
- `textoEnlace`: texto del enlace para abrir el recurso.

Para añadir un recurso, copia un objeto existente dentro de `recursos`, asigna un `id` único y completa sus campos. Separa los objetos con comas, sin poner coma después del último. Conserva todos los campos; los textos opcionales pueden quedar como cadenas vacías. Los valores son texto, no HTML.

`titulo`, `id`, `url` y `textoEnlace` no pueden estar vacíos. El catálogo se valida antes de mostrarse. Si contiene errores, la página muestra un aviso y permite reintentar; la consola ofrece el detalle.

Los favoritos y tutoriales completados existentes se conservan porque continúan identificándose por su URL. Cambiar esa URL crea una referencia nueva para el almacenamiento del navegador. Añadir tutoriales actualiza automáticamente el total del progreso.

Para probar cambios, abre el sitio mediante el servidor local y recarga la página correspondiente. No hace falta editar sus cards en HTML.

`estudiantes.json` conserva su estructura independiente y no forma parte de estos catálogos.
