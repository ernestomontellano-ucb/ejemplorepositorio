// El menú necesita que la cabecera compartida ya esté en el DOM.
const botonesInicializados = new WeakSet();
function inicializarCabecera() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('#main-navigation');
    const siteHeader = document.querySelector('.site-header');
    if (!menuToggle || botonesInicializados.has(menuToggle)) return;
    botonesInicializados.add(menuToggle);

    const updateHeaderHeight = () => {
        if (siteHeader) {
            document.documentElement.style.setProperty(
                '--header-height', `${siteHeader.getBoundingClientRect().height}px`
            );
        }
    };

    if (menuToggle && navigation) {
        const setMenuOpen = (open) => {
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            updateHeaderHeight();
        };

        setMenuOpen(false);
        menuToggle.addEventListener('click', () => {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });
        navigation.addEventListener('click', (event) => {
            if (event.target.closest('a')) setMenuOpen(false);
        });
        document.addEventListener('click', (event) => {
            if (!siteHeader.contains(event.target) && menuToggle.getAttribute('aria-expanded') === 'true') {
                const focoEnMenu = navigation.contains(document.activeElement);
                setMenuOpen(false);
                if (focoEnMenu) menuToggle.focus();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });
    }

    if (siteHeader) {
        updateHeaderHeight();
        new ResizeObserver(updateHeaderHeight).observe(siteHeader);
    }

    // Solo el inicio tiene secciones que se siguen durante el desplazamiento.
    if (siteHeader.dataset.section === 'inicio' && 'IntersectionObserver' in window) {
        const enlaces = [...navigation.querySelectorAll('a')];
        const destinos = { materia: 'inicio', estudiantes: 'estudiantes', proyecto: 'proyecto', recursos: 'recursos' };
        function marcar(id) {
            enlaces.forEach(enlace => {
                const destino = enlace.dataset.nav || new URL(enlace.href).hash.slice(1);
                if (destino === id) enlace.setAttribute('aria-current', 'location');
                else enlace.removeAttribute('aria-current');
            });
        }
        marcar('inicio');
        let observador;
        function observarSecciones() {
            if (observador) observador.disconnect();
            // Usamos píxeles: los porcentajes de rootMargin se calculan sobre el ancho.
            const arriba = Math.round(window.innerHeight * 0.25);
            const abajo = Math.round(window.innerHeight * 0.65);
            observador = new IntersectionObserver(entradas => {
                entradas.filter(entrada => entrada.isIntersecting).forEach(entrada => marcar(destinos[entrada.target.id]));
            }, { rootMargin: `-${arriba}px 0px -${abajo}px 0px`, threshold: 0 });
            Object.keys(destinos).forEach(id => {
                const seccion = document.getElementById(id);
                if (seccion) observador.observe(seccion);
            });
        }
        observarSecciones();
        window.addEventListener('resize', observarSecciones);
    }
}

document.addEventListener('componente:cargado', evento => {
    if (evento.detail === 'header') inicializarCabecera();
});
Promise.resolve(window.componentesListos).then(inicializarCabecera);

// Calculamos la raíz desde assets/js/main.js, independientemente de la página abierta.
const raizSitio = new URL('../../', document.currentScript.src);

// Las páginas de recursos no necesitan cargar los datos de las cards.
if (document.querySelector('.students-grid, .projects-grid')) {
    const rejillas = [...document.querySelectorAll('.students-grid, .projects-grid')];
    const avisos = rejillas.map(rejilla => {
        const bloque = document.createElement('div');
        bloque.className = 'load-feedback';
        const mensaje = document.createElement('p');
        mensaje.setAttribute('role', 'status');
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'action-button';
        boton.textContent = 'Reintentar';
        boton.hidden = true;
        boton.addEventListener('click', cargarCards);
        bloque.append(mensaje, boton);
        rejilla.before(bloque);
        return { rejilla, mensaje, boton };
    });
    let cargando = false;
    function cargarCards() {
        if (cargando) return;
        cargando = true;
        const focoReintento = avisos.find(aviso => aviso.boton === document.activeElement);
        avisos.forEach(({ rejilla, mensaje, boton }) => {
            rejilla.setAttribute('aria-busy', 'true');
            mensaje.textContent = 'Cargando…';
            boton.disabled = true;
        });
        return fetch(new URL('data/estudiantes.json', raizSitio))
            .then(function (respuesta) {
                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar el JSON: " + respuesta.status);
                }

                return respuesta.json();
            })
            .then(function (datos) {
                if (!Array.isArray(datos.estudiantes)) throw new Error('El JSON no contiene una lista de estudiantes.');
                // Seleccionamos el contenedor y preparamos las cards fuera del DOM visible.
                const contenedor = document.querySelector('.students-grid');
                if (contenedor) {
                    const cards = document.createDocumentFragment();

                    datos.estudiantes.forEach(function (estudiante) {
                        const enlacePersonal = `pages/estudiantes/${estudiante.pagina}/`;

                        // Creamos la estructura: article > a > h3.
                        const card = document.createElement('article');
                        card.className = 'student-card';

                        const enlace = document.createElement('a');
                        enlace.className = 'student-link';
                        enlace.href = new URL(enlacePersonal, raizSitio).href;

                        const nombre = document.createElement('h3');
                        nombre.textContent = estudiante.nombre;

                        // Unimos los elementos para formar una card.
                        enlace.appendChild(nombre);
                        card.appendChild(enlace);
                        cards.appendChild(card);

                        console.log(estudiante.nombre);
                        console.log("Página personal:", enlacePersonal);

                        if (estudiante.proyecto.rutaProyecto !== "") {
                            const enlaceProyecto =
                                `pages/proyecto/${estudiante.proyecto.rutaProyecto}/`;

                            console.log("Proyecto:", enlaceProyecto);
                        } else {
                            console.log("Proyecto pendiente");
                        }
                    });

                    // Sustituimos las cards anteriores solo después de preparar las nuevas.
                    contenedor.replaceChildren(cards);
                }

                // 1. Buscamos el contenedor de proyectos y preparamos sus cards.
                const contenedorProyectos = document.querySelector('.projects-grid');
                if (contenedorProyectos) {

                    const cardsProyectos = document.createDocumentFragment();

                    datos.estudiantes.forEach(function (estudiante) {
                        const proyecto = estudiante.proyecto;

                        // 2. Omitimos proyectos sin ruta o sin texto para su encabezado.
                        const tituloProyecto = proyecto.titulo || proyecto.subcultura;
                        if (proyecto.rutaProyecto === "" || tituloProyecto === "") return;

                        // 3. Creamos una card con enlace, título y autor.
                        const cardProyecto = document.createElement('article');
                        cardProyecto.className = 'project-card';

                        const enlaceProyecto = document.createElement('a');
                        enlaceProyecto.className = 'project-link';
                        enlaceProyecto.href = new URL(`pages/proyecto/${proyecto.rutaProyecto}/`, raizSitio).href;

                        const titulo = document.createElement('h3');
                        titulo.textContent = tituloProyecto;

                        const autor = document.createElement('p');
                        autor.textContent = estudiante.nombre;

                        // 4. Unimos los elementos y guardamos la card en el fragmento.
                        enlaceProyecto.appendChild(titulo);
                        enlaceProyecto.appendChild(autor);
                        cardProyecto.appendChild(enlaceProyecto);
                        cardsProyectos.appendChild(cardProyecto);
                    });

                    // 5. Insertamos todas las cards de proyectos en la página.
                    const cantidadProyectos = cardsProyectos.childElementCount;
                    contenedorProyectos.replaceChildren(cardsProyectos);

                    const estadoProyectos = document.querySelector('#estado-proyectos');
                    if (estadoProyectos) {
                        estadoProyectos.textContent = cantidadProyectos > 0
                            ? `${cantidadProyectos} proyectos disponibles.`
                            : 'Todavía no hay proyectos para mostrar.';
                    }
                }
                avisos.forEach(({ rejilla, mensaje, boton }) => {
                    mensaje.textContent = `${rejilla.childElementCount} ${rejilla.matches('.students-grid') ? 'estudiantes' : 'proyectos'} disponibles.`;
                    boton.hidden = true;
                });
                if (focoReintento) {
                    focoReintento.mensaje.tabIndex = -1;
                    focoReintento.mensaje.focus();
                }
            })
            .catch(function (error) {
                console.error("Error al cargar estudiantes:", error);
                avisos.forEach(({ mensaje, boton }) => {
                    mensaje.textContent = 'No se pudo cargar la lista. Intenta de nuevo.';
                    boton.hidden = false;
                });
                const estadoProyectos = document.querySelector('#estado-proyectos');
                if (estadoProyectos) {
                    estadoProyectos.textContent = 'No se pudieron cargar los proyectos. Intenta recargar la página.';
                }
            })
            .finally(() => {
                cargando = false;
                avisos.forEach(({ rejilla, boton }) => {
                    rejilla.setAttribute('aria-busy', 'false');
                    boton.disabled = false;
                });
            });
    }
    cargarCards();
}
