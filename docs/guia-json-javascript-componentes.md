# Del HTML estático a un sitio alimentado por JSON

Guía docente de Taller de Diseño Digital 1 — Universidad Católica Boliviana San Pablo.

Esta guía explica el trabajo de la rama `feature/cards-estudiantes-json`. Está pensada para estudiantes que conocen HTML y CSS y comienzan a conectar datos, JavaScript y el DOM. Los fragmentos breves son ejemplos didácticos; los archivos enlazados contienen la implementación completa, incluidos los controles de errores.

## 1. Qué construimos y por qué

Al comienzo, cada card estaba escrita directamente en el HTML. Para cambiar un estudiante o añadir un recurso era necesario editar la estructura de la página. Además, la cabecera y el pie se repetían en varios archivos.

Separamos las responsabilidades:

| Responsabilidad | Tecnología | Ejemplo del sitio |
| --- | --- | --- |
| Guardar información | JSON | Nombre, subcultura, descripción o URL |
| Definir la estructura | HTML | Cabecera, sección y contenedor de cards |
| Presentar la información | CSS | Tipografía, colores, cuadrícula y foco |
| Cargar y transformar datos | JavaScript | `fetch()`, recorrido del arreglo y creación de elementos |
| Responder a las acciones | JavaScript | Buscar, filtrar, guardar o marcar como completado |

El recorrido general es:

```text
Archivo JSON
    ↓ petición HTTP con fetch()
Respuesta del servidor
    ↓ respuesta.json()
Objetos y arreglos de JavaScript
    ↓ recorrido y creación de elementos
DOM de la página
    ↓ CSS
Cards visibles
    ↓ eventos del usuario
Búsqueda, filtros, favoritos y progreso
```

El sitio continúa siendo estático: no añadimos un servidor de aplicación, cuentas de usuario ni una base de datos. El servidor local entrega archivos. Los favoritos y el progreso se guardan en el navegador.

## 2. Mapa de los archivos

| Archivo | Función |
| --- | --- |
| [`index.html`](../index.html) | Inicio: descripción, estudiantes y accesos a proyectos y recursos |
| [`data/estudiantes.json`](../data/estudiantes.json) | 25 estudiantes y los datos conocidos de sus proyectos |
| [`data/ejemplos_codepen.json`](../data/ejemplos_codepen.json) | 6 ejemplos CodePen |
| [`data/tutoriales.json`](../data/tutoriales.json) | 3 tutoriales |
| [`data/librerias.json`](../data/librerias.json) | 8 librerías |
| [`data/vinculos_interes.json`](../data/vinculos_interes.json) | 7 vínculos de interés |
| [`assets/js/main.js`](../assets/js/main.js) | Menú, sección activa y cards de estudiantes/proyectos cuando existe su contenedor |
| [`assets/js/layout.js`](../assets/js/layout.js) | Carga de cabecera y pie compartidos |
| [`assets/js/recursos.js`](../assets/js/recursos.js) | Carga de catálogos, generación de cards e interacciones de Recursos |
| [`components/header.html`](../components/header.html) | Contenido compartido de la cabecera |
| [`components/footer.html`](../components/footer.html) | Contenido compartido del pie |
| [`assets/css/styles.css`](../assets/css/styles.css) | Estilos generales y estructura original |
| [`assets/css/site.css`](../assets/css/site.css) | Acabado compacto cargado solo por el inicio y Recursos |

Las cantidades describen este punto de trabajo; cambiarán cuando se amplíen los datos. Las dos portadas `pages/recursos/index.html` y `pages/recursos/recursos.html` siguen mostrando los cuatro accesos a categorías. Las cuatro páginas de detalle cargan sus respectivos JSON.

En el inicio ya no aparece la lista de proyectos: se conserva el botón que lleva a `pages/proyecto/proyectos.html`. El generador compartido solo crea cards de proyectos si encuentra `.projects-grid` en la página abierta.

## 3. JSON: estructura de datos, no código ejecutable

JSON representa información mediante objetos, arreglos y valores. Un objeto utiliza llaves `{}`; un arreglo utiliza corchetes `[]`.

Este es un registro real del catálogo de estudiantes:

```json
{
  "estudiantes": [
    {
      "id": "vadhir-aguilar",
      "nombre": "Vadhir Aguilar",
      "pagina": "vadhir-aguilar",
      "proyecto": {
        "titulo": "",
        "subcultura": "bikers",
        "rutaProyecto": "vadhir-aguilar-bikers"
      }
    }
  ]
}
```

El objeto exterior contiene la propiedad `estudiantes`. Su valor es un arreglo. Cada elemento del arreglo es un objeto y su propiedad `proyecto` contiene otro objeto.

- `id` identifica al estudiante de forma estable y única.
- `nombre` es el texto que mostramos.
- `pagina` es el nombre real de su carpeta personal.
- `proyecto.titulo` guarda el título cuando se conoce.
- `proyecto.subcultura` guarda la temática investigada.
- `proyecto.rutaProyecto` guarda el nombre exacto de la carpeta del proyecto.

Los identificadores no tienen que coincidir siempre con las carpetas. Helen conserva `id: "helen-chambi"`, pero su `pagina` es `"helen_chambi"`. Jhoan Azuga y Ana Condarco tienen rutas de proyecto que utilizan sus segundos nombres. Por eso guardamos las rutas expresamente, en vez de construirlas a partir del nombre visible.

Completamos los 25 registros en el orden acordado. Los datos de 19 proyectos se obtuvieron de las carpetas locales; los desconocidos quedaron como cadenas vacías. Vadhir ocupa la primera posición por la decisión docente de sustituir a Gael.

Reglas para editar JSON:

1. Las claves y los textos llevan comillas dobles.
2. Los elementos se separan con comas.
3. No se coloca una coma después del último elemento.
4. No se escriben comentarios dentro del archivo.
5. Una cadena vacía `""` es distinta de `null` o de una propiedad inexistente.

El JSON guardado en disco es texto. Después de analizarlo con JavaScript obtenemos objetos y arreglos sobre los que podemos trabajar.

## 4. Cómo organizamos los recursos

Los cuatro catálogos de recursos comparten una estructura con secciones. Esto permite añadir tanto nuevas cards como nuevos grupos sin modificar el HTML.

Ejemplo reducido con un recurso real:

```json
{
  "secciones": [
    {
      "titulo": "CSS, componentes e iconos",
      "descripcion": "",
      "recursos": [
        {
          "id": "bootstrap",
          "titulo": "Bootstrap",
          "etiqueta": "CSS y componentes",
          "descripcion": "Framework con una cuadrícula responsive, estilos y componentes de interfaz. Algunos componentes interactivos utilizan su JavaScript.",
          "fuente": "",
          "temas": ["CSS"],
          "url": "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
          "textoEnlace": "Consultar Bootstrap"
        }
      ]
    }
  ]
}
```

`etiqueta` es el texto breve que aparece sobre el título. `temas` es un arreglo que alimenta el filtro; un recurso puede pertenecer a varios temas. `fuente` conserva el autor o canal, cuando corresponde. `textoEnlace` describe la acción del enlace.

El orden de secciones y recursos en el JSON determina el orden de presentación. El archivo [data/README.md](../data/README.md) contiene las reglas de administración.

El cargador valida la estructura, los tipos de los campos, los identificadores únicos y los enlaces HTTP/HTTPS antes de insertar las cards. Esta validación no comprueba que un sitio externo esté disponible: comprueba que sus datos tienen la forma esperada.

## 5. Servidor local y atributo defer

Para practicar, abre una terminal en la raíz del repositorio y ejecuta:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Visita `http://localhost:8000/`. Finaliza el servidor con `Ctrl+C` cuando termines.

Abrir el archivo directamente usa el protocolo `file://`. Los navegadores restringen las peticiones a archivos locales; por eso los JSON y componentes deben probarse mediante HTTP. Un servidor local no publica el sitio en Internet.

Las páginas incluyen los scripts así:

```html
<script src="../../assets/js/layout.js" defer></script>
<script src="../../assets/js/main.js" defer></script>
<script src="../../assets/js/recursos.js" defer></script>
```

`defer` permite descargar estos scripts mientras se analiza el HTML y ejecutarlos después de construir el DOM inicial. Los scripts clásicos externos con `defer` mantienen su orden de ejecución.

Esto no significa que las peticiones `fetch()` del primer script hayan terminado cuando comienza el siguiente. Por eso necesitaremos una promesa adicional para esperar a la cabecera compartida.

## 6. Cargar el archivo con fetch()

El primer ejercicio fue mostrar los datos en la consola:

```javascript
fetch('./data/estudiantes.json')
  .then(function (respuesta) {
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar: ' + respuesta.status);
    }
    return respuesta.json();
  })
  .then(function (datos) {
    console.log(datos);
    console.table(datos.estudiantes);
  })
  .catch(function (error) {
    console.error(error);
  });
```

Paso por paso:

1. `fetch()` solicita una URL y devuelve una promesa.
2. El primer `.then()` recibe un objeto `Response`, no el arreglo de estudiantes.
3. `respuesta.ok` comprueba que el estado HTTP sea exitoso. Una respuesta 404 no rechaza automáticamente la promesa de `fetch()`.
4. `respuesta.json()` lee el cuerpo y analiza su texto como JSON. También devuelve una promesa.
5. El segundo `.then()` recibe los datos ya convertidos.
6. `.catch()` atiende errores de red, los errores HTTP que lanzamos y errores al analizar el JSON.

El `return` delante de `respuesta.json()` permite que el siguiente `.then()` espere el resultado. Sin ese `return`, recibiría `undefined`.

`async` y `await` expresan el mismo flujo de otra manera. El cargador de recursos utiliza esta forma:

```javascript
async function cargar() {
  try {
    const respuesta = await fetch('data/librerias.json');
    if (!respuesta.ok) throw new Error('Error HTTP: ' + respuesta.status);
    const datos = await respuesta.json();
    console.log(datos.secciones);
  } catch (error) {
    console.error(error);
  }
}
```

`await` pausa esa función hasta que se resuelve la promesa; no bloquea toda la página. Los ejemplos de rutas anteriores se ejecutan desde el inicio; la implementación compartida utiliza la raíz calculada que veremos a continuación.

## 7. Rutas desde distintas páginas

Una ruta relativa de `fetch()` se resuelve respecto de la URL base del documento, no de la carpeta del archivo JavaScript. Desde `pages/recursos/tutoriales.html`, `./data/tutoriales.json` apuntaría a una carpeta equivocada.

En nuestros scripts clásicos calculamos la raíz mientras se están ejecutando:

```javascript
const raiz = new URL('../../', document.currentScript.src);
const urlDatos = new URL('data/tutoriales.json', raiz);
```

El script se encuentra en `assets/js/`; subir dos niveles llega a la raíz del sitio. `document.currentScript.src` contiene su URL completa. Guardamos este dato antes de esperar operaciones asíncronas, porque después `document.currentScript` puede ser `null`.

Si el sitio está bajo `/ejemplorepositorio/`, ese prefijo se conserva. Esto evita rutas que funcionan en localhost pero fallan cuando el sitio se sirve dentro de un subdirectorio.

## 8. Acceder a los datos y recorrer un arreglo

```javascript
const estudiante = datos.estudiantes[0];
console.log(estudiante.nombre);
console.log(estudiante.proyecto.subcultura);
```

Los índices comienzan en cero: `[0]` obtiene el primer estudiante. El punto accede a una propiedad; cada punto adicional entra en el objeto correspondiente.

Para trabajar con todos:

```javascript
datos.estudiantes.forEach(function (estudiante, indice) {
  console.log(indice + 1, estudiante.nombre);
});
```

`forEach()` ejecuta la función una vez por elemento. `estudiante` es una variable local que recibe el objeto de esa vuelta. En los catálogos hay dos niveles: recorremos `datos.secciones` y después `seccion.recursos`.

Un `return` dentro de la función de `forEach()` termina solo esa vuelta. Lo utilizamos para omitir proyectos sin ruta o sin un título/subcultura que mostrar.

## 9. Crear cards en el DOM

El DOM es la representación de la página como objetos y nodos. Una card creada con JavaScript puede tener la misma estructura que una escrita en HTML:

```javascript
const card = document.createElement('article');
card.className = 'student-card';

const enlace = document.createElement('a');
enlace.className = 'student-link';
enlace.href = new URL(`pages/estudiantes/${estudiante.pagina}/`, raiz);

const nombre = document.createElement('h3');
nombre.textContent = estudiante.nombre;

enlace.appendChild(nombre);
card.appendChild(enlace);
```

`createElement()` crea un elemento, pero todavía no lo muestra. `className` conecta el elemento con las clases CSS existentes. `textContent` inserta texto; no interpreta etiquetas incluidas en los datos. `appendChild()` establece la relación padre-hijo.

Los acentos graves permiten escribir plantillas de texto. `${estudiante.pagina}` inserta el valor de la propiedad dentro de la ruta.

Reunimos las cards en un fragmento:

```javascript
const fragmento = document.createDocumentFragment();
fragmento.appendChild(card);
contenedor.replaceChildren(fragmento);
```

Un fragmento es un contenedor temporal. Al insertarlo, sus hijos pasan al DOM; el fragmento no añade una caja HTML visible. `replaceChildren()` reemplaza el contenido anterior y evita acumular duplicados.

Retiramos las cards estáticas del inicio y de las cuatro páginas de detalle de recursos. El HTML conserva los contenedores y el contenido editorial; el JSON pasa a ser la fuente de las listas.

## 10. El cargador de recursos y sus estados

Cada página de detalle indica qué archivo necesita:

```html
<div data-recursos-json="data/tutoriales.json">
    <!-- Las secciones y cards se generan desde el JSON. -->
</div>
```

El atributo `data-recursos-json` se lee con `elemento.dataset.recursosJson`. El script sigue este orden:

1. Encuentra el contenedor.
2. Muestra «Cargando recursos…» y activa `aria-busy`.
3. Solicita y analiza el JSON.
4. Valida todo el catálogo.
5. Crea secciones y cards fuera del contenido visible.
6. Reemplaza el contenido del contenedor.
7. Activa búsqueda, favoritos y progreso.
8. Retira el aviso de carga.

Si algo falla, muestra un mensaje y «Reintentar». El botón se desactiva durante la petición para evitar solicitudes simultáneas. Un catálogo vacío tiene un mensaje propio. Al reintentar con éxito, el foco vuelve al buscador.

## 11. Header y footer como componentes compartidos

Antes, cambiar un enlace del menú exigía modificar siete archivos. Ahora el inicio y las seis páginas de Recursos contienen marcadores:

```html
<header class="site-header" data-component="header" data-section="recursos">
    <a class="site-title" href="../../index.html">Taller de Diseño Digital 1</a>
</header>
<footer class="site-footer" data-component="footer"></footer>
```

`layout.js` solicita los fragmentos de `components/`. A diferencia del JSON, aquí usa `respuesta.text()`, porque necesita texto HTML.

Crea un elemento `<template>`, coloca el fragmento en él y resuelve sus enlaces e imágenes desde la raíz del sitio antes de insertarlo. El HTML de estos componentes es contenido local controlado por nosotros. Los datos de los catálogos se insertan con `textContent`.

La cabecera tiene pequeñas variantes: en el inicio usa el título principal; en Recursos conserva el título de la página en su contenido y marca la navegación correspondiente con `aria-current`.

### Por qué esperamos antes de configurar el menú

`main.js` necesita encontrar el botón del menú, que llega mediante `fetch()`. Consultarlo demasiado pronto devolvería `null`.

```javascript
Promise.resolve(window.componentesListos).then(inicializarCabecera);
```

`layout.js` publica una promesa que agrupa las cargas. También emite el evento `componente:cargado` al insertar un componente, para poder inicializar la cabecera después de un reintento sin esperar al pie.

Un `WeakSet` registra los botones ya inicializados. Así, la promesa y el evento no añaden dos veces los mismos listeners. `ResizeObserver` actualiza el espacio reservado para la cabecera fija cuando cambia su altura.

## 12. Construir un buscador

El buscador actual trabaja sobre los recursos de la página abierta, no sobre todo Internet ni sobre todos los catálogos a la vez.

### Escuchar lo que escribe la persona

```javascript
buscar.addEventListener('input', actualizar);
```

El evento `input` se produce al editar el campo: escribir, borrar o pegar. `actualizar` es una referencia a una función; no escribimos `actualizar()` aquí, porque queremos que se ejecute cuando ocurra el evento.

### Preparar los textos para comparar

```javascript
const normalizar = texto => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();
```

`normalize('NFD')` separa letras y marcas combinadas; la expresión regular elimina esas marcas y `toLowerCase()` convierte a minúsculas. De esta forma «INTRODUCCIÓN» coincide con «introduccion». Esta normalización también equipara `ñ` con `n`.

Se captura el texto de la card antes de añadir botones para no buscar accidentalmente dentro de «Guardar» o «Completado».

### Separar la consulta y decidir qué mostrar

```javascript
const palabras = normalizar(buscar.value.trim())
  .split(/\s+/)
  .filter(Boolean);

const coincide = palabras.every(palabra => texto.includes(palabra));
card.hidden = !coincide;
```

`trim()` quita espacios de los extremos. `split()` separa palabras por espacios. `filter(Boolean)` elimina cadenas vacías. `every()` exige que todas las palabras estén presentes, aunque no necesariamente juntas ni en el mismo orden.

Una consulta vacía produce un arreglo vacío; `every()` devuelve `true`, por lo que no excluye cards. La propiedad `hidden` oculta los elementos que no coinciden. La regla CSS `[hidden]` garantiza que un `display: flex` de la card no anule ese estado.

La búsqueda actualiza el contador, muestra un mensaje si no hay resultados y oculta secciones que se quedan sin cards visibles. «Limpiar filtros» restaura los controles y devuelve el foco al campo.

## 13. Combinar búsqueda, tema y favoritos

Una card debe cumplir las tres condiciones:

```javascript
const visible = coincideTexto && coincideTema && coincideFavorito;
```

El filtro de temas se construye desde `temas` en los datos. `flatMap()` reúne los temas de todos los recursos; un `Set` elimina repeticiones y `sort()` ordena las opciones.

Al añadir un tema al JSON, aparece automáticamente en el selector. El filtro de guardados también se limita a la página abierta, como indica su etiqueta. El número de tutoriales completados, en cambio, representa todo el catálogo de tutoriales, aunque una búsqueda oculte algunos.

## 14. Guardar favoritos y progreso

`localStorage` conserva cadenas de texto en el navegador entre recargas. No guarda objetos directamente:

```javascript
localStorage.setItem(clave, JSON.stringify([...favoritos]));
const valores = JSON.parse(localStorage.getItem(clave) || '[]');
```

Utilizamos un `Set` en memoria para que una URL no se repita. `[...favoritos]` convierte el conjunto en un arreglo serializable. Las claves incluyen el prefijo del sitio para separar proyectos servidos bajo distintos directorios.

Los favoritos y el progreso continúan identificándose por URL para conservar las selecciones que existían antes de migrar las cards a JSON. El `id` del recurso identifica su registro y se valida, pero no es la clave actual de `localStorage`. Cambiar una URL produce una referencia nueva para estos estados.

«Guardar» alterna `aria-pressed`; «Completado» utiliza un checkbox. Ambos son controles nativos y se pueden utilizar con teclado. El evento `storage` sincroniza cambios entre pestañas del mismo origen.

Limitaciones que deben conocer los estudiantes:

- Los datos son locales a ese navegador y origen: no se sincronizan entre dispositivos.
- Otro puerto del servidor local es otro origen y puede tener otro almacenamiento.
- Borrar los datos del sitio elimina las selecciones.
- Si el almacenamiento está bloqueado o falla, las acciones funcionan en memoria durante la visita y aparece un aviso.
- Marcar un tutorial como completado es una decisión del usuario; no comprobamos si vio el video.

## 15. Menú, sección activa y accesibilidad

El menú móvil alterna `aria-expanded`, se cierra con Escape, al elegir un enlace o al pulsar fuera de la cabecera. Al cerrar con Escape se devuelve el foco al botón.

En el inicio, `IntersectionObserver` observa las secciones y actualiza `aria-current` en el menú. Su margen se calcula en píxeles a partir de la altura de la ventana y se recalcula al redimensionarla.

Los mensajes de carga y resultados utilizan `role="status"`; los controles tienen etiquetas. Los estados no dependen solo del color: existen textos, atributos y checkboxes. Los botones de reintento indican claramente qué acción está disponible.

El enlace «Saltar al contenido» permite evitar recorrer todo el menú con el teclado. Se mantiene un contorno visible para el foco y se respetan las preferencias de movimiento reducido.

## 16. La última revisión visual

El inicio y Recursos cargan `site.css` después de `styles.css`. La cascada permite ajustar la presentación de esas páginas sin cargar el acabado nuevo en las páginas personales o de proyectos.

Los cambios principales son:

- Título de cabecera de aproximadamente 18–20 px y títulos de página de 26–32 px.
- Títulos de sección de aproximadamente 22–25 px y cards de 16–18 px según su contexto.
- Texto de lectura con interlineado mayor y la tipografía original Montserrat Alternates.
- Paleta original viva: azul `#3d8eff`, amarillo `#fed257` y celeste `#94c1ff`, combinada con superficies blancas y bordes suaves. El azul identifica las cabeceras y el pie; el amarillo destaca acciones y selecciones.
- Eliminación de alturas mínimas excesivas y grandes bloques vacíos.
- Cuadrículas que se adaptan al ancho y controles que se apilan en móvil.
- Menú de escritorio visible a partir de 901 px; menú compacto por debajo.

CSS define la apariencia. JavaScript actualiza estados, contenido y atributos. Mantener esa separación facilita explicar y modificar cada parte.

## 17. Secuencia sugerida para una clase

1. **Leer un registro.** Localizar objeto, arreglo, propiedad y valor en `estudiantes.json`.
2. **Cargarlo.** Abrir el servidor local y observar la petición en la pestaña Network del navegador.
3. **Verlo en consola.** Explicar la diferencia entre `Response`, `datos` y `datos.estudiantes`.
4. **Acceder a un estudiante.** Comparar `[0]`, `[1]` y las propiedades anidadas.
5. **Recorrer.** Mostrar todos los nombres con `forEach()`.
6. **Crear una card.** Construir `article > a > h3` y añadirla al contenedor.
7. **Generar la lista.** Usar un fragmento y comprobar que no se duplican elementos.
8. **Cambiar un dato.** Editar un texto del JSON y recargar sin tocar el HTML.
9. **Reutilizar componentes.** Cambiar un texto del pie y comprobar su actualización en inicio y Recursos.
10. **Buscar.** Conectar `input`, normalización y `hidden`.
11. **Combinar filtros.** Probar texto, tema y favoritos simultáneamente.
12. **Persistir.** Guardar un recurso, recargar y observar `localStorage` en las herramientas de desarrollo.

Ejercicio final: duplicar temporalmente un recurso en su catálogo, asignarle un ID único y una URL real diferente, cambiar su tema y comprobar la nueva card y la nueva opción del filtro. Revertir ese ejemplo al terminar si no debe formar parte del catálogo real.

## 18. Depuración y comprobación

| Síntoma | Qué revisar |
| --- | --- |
| `fetch()` falla al abrir el HTML | Que la dirección use HTTP y el servidor esté activo |
| Estado 404 | Ruta y nombre exacto del archivo; mayúsculas, guiones y subrayados |
| Error al analizar JSON | Comillas, comas y cierre de llaves/corchetes |
| Error de validación | Campos requeridos, tipos, IDs repetidos y protocolo de la URL |
| Cards duplicadas | Si se está añadiendo contenido sin reemplazar o inicializando eventos dos veces |
| Menú sin respuesta | Que el componente exista antes de buscar el botón |
| Búsqueda sin resultados | Texto escrito y combinación de filtros activos |
| Favoritos no aparecen tras recargar | Origen/puerto, permisos de almacenamiento y URL del recurso |
| Enlace a proyecto sin contenido | Existencia de la carpeta y de su página de entrada; una ruta guardada no crea archivos |

Para comprobar sintaxis sin ejecutar el navegador:

```bash
node --check assets/js/main.js
node --check assets/js/layout.js
node --check assets/js/recursos.js
python3 -m json.tool data/estudiantes.json > /dev/null
python3 -m json.tool data/tutoriales.json > /dev/null
```

Se hicieron pruebas de integración con jsdom sobre los HTML reales: conteos de cards, búsqueda con tildes, filtros combinados, favoritos y progreso entre cargas, almacenamiento bloqueado, errores y reintentos. La migración de recursos se comparó con sus textos y enlaces anteriores. Las herramientas de prueba se instalaron temporalmente fuera del repositorio; no son dependencias necesarias para publicar este sitio.

También se revisaron las siete páginas en Chromium a 320, 390, 768 y 1280 px: ausencia de desbordes horizontales, tamaños de títulos, menú, búsqueda, filtros y persistencia de favoritos.

## 19. Guardar el punto de trabajo en Git

La rama de este trabajo es `feature/cards-estudiantes-json`. Un commit guarda una instantánea de los archivos seleccionados en esa rama. No cambia `main`, no fusiona ramas y no publica en GitHub.

```bash
git branch --show-current
git status
git diff --cached --stat
git log -1 --oneline
```

El commit debe incluir los datos, scripts, componentes, HTML y estilos necesarios para reproducir el sitio, junto con esta guía. Los clones de repositorios individuales y la configuración personal del IDE no son dependencias que deban añadirse automáticamente.

Un push es una operación diferente. Para enseñar la separación, conviene comparar el estado del directorio de trabajo, el área preparada y el historial de la rama antes de publicar o abrir un Pull Request.
