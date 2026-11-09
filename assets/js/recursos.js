// Los catálogos se cargan desde JSON; las interacciones se activan después de crear las cards.
(() => {
    const shell = document.querySelector('.resource-shell');
    if (!shell) return;
    const raiz = new URL('../../', document.currentScript.src);

    // Validamos el catálogo completo antes de modificar la página.
    function validarCatalogo(datos) {
        if (!datos || !Array.isArray(datos.secciones)) throw new Error('Falta la lista de secciones.');
        const ids = new Set();
        datos.secciones.forEach(seccion => {
            if (!seccion || typeof seccion.titulo !== 'string' || !seccion.titulo.trim() ||
                typeof seccion.descripcion !== 'string' || !Array.isArray(seccion.recursos)) {
                throw new Error('Una sección tiene una estructura incorrecta.');
            }
            seccion.recursos.forEach(recurso => {
                const campos = ['id', 'titulo', 'etiqueta', 'descripcion', 'fuente', 'url', 'textoEnlace'];
                if (!recurso || campos.some(campo => typeof recurso[campo] !== 'string') ||
                    ['id', 'titulo', 'url', 'textoEnlace'].some(campo => !recurso[campo].trim()) ||
                    !Array.isArray(recurso.temas) || recurso.temas.some(tema => typeof tema !== 'string' || !tema.trim() || tema.includes('|'))) {
                    throw new Error('Un recurso tiene campos incorrectos.');
                }
                if (ids.has(recurso.id)) throw new Error(`ID repetido: ${recurso.id}`);
                ids.add(recurso.id);
                if (!['https:', 'http:'].includes(new URL(recurso.url).protocol)) {
                    throw new Error(`El enlace de ${recurso.id} debe usar HTTP o HTTPS.`);
                }
            });
        });
    }

    function crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase) elemento.className = clase;
        if (texto) elemento.textContent = texto;
        return elemento;
    }

    function crearSecciones(datos) {
        const fragmento = document.createDocumentFragment();
        datos.secciones.forEach(seccion => {
            if (seccion.recursos.length === 0) return;
            const bloque = crearElemento('section', 'resource-section');
            bloque.appendChild(crearElemento('h2', '', seccion.titulo));
            if (seccion.descripcion) bloque.appendChild(crearElemento('p', '', seccion.descripcion));
            const grid = crearElemento('div', 'resource-grid');
            seccion.recursos.forEach(recurso => {
                const card = crearElemento('article', 'resource-card');
                card.dataset.recursoId = recurso.id;
                card.dataset.temas = recurso.temas.join('|');
                card.append(
                    crearElemento('p', 'eyebrow', recurso.etiqueta),
                    crearElemento('h3', '', recurso.titulo),
                    crearElemento('p', '', recurso.descripcion)
                );
                if (recurso.fuente) card.appendChild(crearElemento('p', 'source-note', recurso.fuente));
                const enlace = crearElemento('a', 'text-link', recurso.textoEnlace);
                enlace.href = recurso.url;
                card.appendChild(enlace);
                grid.appendChild(card);
            });
            bloque.appendChild(grid);
            fragmento.appendChild(bloque);
        });
        return fragmento;
    }

    const catalogo = shell.querySelector('[data-recursos-json]');
    if (catalogo) {
        const avisoCarga = crearElemento('div', 'resource-tools');
        const mensaje = crearElemento('p', '', 'Cargando recursos…');
        mensaje.setAttribute('role', 'status');
        const reintentar = crearElemento('button', 'action-button', 'Reintentar');
        reintentar.type = 'button';
        reintentar.hidden = true;
        avisoCarga.append(mensaje, reintentar);
        catalogo.before(avisoCarga);
        let cargando = false;

        async function cargarRecursos() {
            if (cargando) return;
            cargando = true;
            const devolverFoco = document.activeElement === reintentar;
            catalogo.setAttribute('aria-busy', 'true');
            reintentar.disabled = true;
            mensaje.textContent = 'Cargando recursos…';
            try {
                const respuesta = await fetch(new URL(catalogo.dataset.recursosJson, raiz));
                if (!respuesta.ok) throw new Error(`No se pudo cargar el catálogo: ${respuesta.status}`);
                const datos = await respuesta.json();
                validarCatalogo(datos);
                catalogo.replaceChildren(crearSecciones(datos));
                inicializarInteracciones();
                avisoCarga.remove();
                if (devolverFoco) shell.querySelector('#buscar-recurso').focus();
            } catch (error) {
                console.error('Error al cargar recursos:', error);
                mensaje.textContent = 'No se pudieron cargar los recursos. Intenta de nuevo.';
                reintentar.hidden = false;
            } finally {
                cargando = false;
                reintentar.disabled = false;
                catalogo.setAttribute('aria-busy', 'false');
            }
        }
        reintentar.addEventListener('click', cargarRecursos);
        cargarRecursos();
    } else {
        // Las dos portadas mantienen sus cuatro enlaces a categorías.
        inicializarInteracciones();
    }

    function inicializarInteracciones() {
        const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const tutoriales = document.body.dataset.recursos === 'tutoriales';
        const claveFavoritos = `taller:${raiz.pathname}:favoritos`;
        const claveProgreso = `taller:${raiz.pathname}:completados`;

        if (shell.querySelector('#buscar-recurso')) return;

        const controles = document.createElement('div');
        controles.className = 'resource-tools';
        controles.innerHTML = `
            <div class="resource-filters" role="search" aria-label="Buscar recursos de esta página">
                <label>Buscar en esta página
                    <input id="buscar-recurso" type="search" placeholder="Título, tema o descripción…">
                </label>
                <label>Tema
                    <select id="tema-recurso"><option value="">Todos los temas</option></select>
                </label>
                <label class="check-control"><input id="solo-favoritos" type="checkbox"> Solo guardados de esta página</label>
                <button class="action-button" id="limpiar-recursos" type="button">Limpiar filtros</button>
            </div>
            <p id="resultados-recursos" role="status" aria-atomic="true"></p>
            <p id="progreso-recursos" role="status" aria-atomic="true" hidden></p>
            <p id="aviso-almacenamiento" role="status" hidden>Los cambios funcionan durante esta visita, pero no se pueden guardar en este navegador.</p>`;
        shell.querySelector('.resource-navigation').after(controles);

        const buscar = controles.querySelector('#buscar-recurso');
        const tema = controles.querySelector('#tema-recurso');
        const soloFavoritos = controles.querySelector('#solo-favoritos');
        const resultados = controles.querySelector('#resultados-recursos');
        const progreso = controles.querySelector('#progreso-recursos');
        const aviso = controles.querySelector('#aviso-almacenamiento');

        function leer(clave) {
            try {
                const datos = JSON.parse(localStorage.getItem(clave) || '[]');
                return new Set(Array.isArray(datos) ? datos.filter(valor => typeof valor === 'string') : []);
            } catch {
                aviso.hidden = false;
                return new Set();
            }
        }
        function guardar(clave, valores) {
            try {
                localStorage.setItem(clave, JSON.stringify([...valores]));
            } catch {
                aviso.hidden = false;
            }
        }
        let favoritos = leer(claveFavoritos);
        let completados = leer(claveProgreso);

        const recursos = Array.from(shell.querySelectorAll('.resource-card'), card => {
            const enlace = card.querySelector('a.text-link');
            const titulo = card.querySelector('h3').textContent;
            // Capturamos el texto antes de añadir controles para no buscar en sus etiquetas.
            const texto = normalizar(card.textContent);
            const temas = (card.dataset.temas || card.querySelector('.eyebrow').textContent).split('|').filter(Boolean);
            const id = enlace.href;
            const acciones = document.createElement('div');
            acciones.className = 'resource-actions';
            const favorito = document.createElement('button');
            favorito.type = 'button';
            favorito.className = 'action-button favorite-button';
            favorito.addEventListener('click', () => {
                if (favoritos.has(id)) favoritos.delete(id);
                else favoritos.add(id);
                guardar(claveFavoritos, favoritos);
                actualizar();
                if (card.hidden) soloFavoritos.focus();
            });
            acciones.appendChild(favorito);

            let completado;
            if (tutoriales) {
                const etiqueta = document.createElement('label');
                etiqueta.className = 'check-control';
                completado = document.createElement('input');
                completado.type = 'checkbox';
                completado.setAttribute('aria-label', `Marcar como completado: ${titulo}`);
                completado.addEventListener('change', () => {
                    if (completado.checked) completados.add(id);
                    else completados.delete(id);
                    guardar(claveProgreso, completados);
                    actualizar();
                });
                etiqueta.append(completado, ' Completado');
                acciones.appendChild(etiqueta);
            }
            card.appendChild(acciones);
            return { card, titulo, texto, temas, id, favorito, completado };
        });

        [...new Set(recursos.flatMap(recurso => recurso.temas))].sort((a, b) => a.localeCompare(b, 'es')).forEach(nombre => {
            const opcion = document.createElement('option');
            opcion.value = nombre;
            opcion.textContent = nombre;
            tema.appendChild(opcion);
        });

        function actualizar() {
            const palabras = normalizar(buscar.value.trim()).split(/\s+/).filter(Boolean);
            let visibles = 0;
            recursos.forEach(recurso => {
                const guardado = favoritos.has(recurso.id);
                recurso.favorito.textContent = guardado ? 'Guardado' : 'Guardar';
                recurso.favorito.setAttribute('aria-pressed', String(guardado));
                recurso.favorito.setAttribute('aria-label', `${guardado ? 'Quitar de guardados' : 'Guardar'}: ${recurso.titulo}`);
                recurso.card.hidden = !(
                    palabras.every(palabra => recurso.texto.includes(palabra)) &&
                    (!tema.value || recurso.temas.includes(tema.value)) &&
                    (!soloFavoritos.checked || guardado)
                );
                if (!recurso.card.hidden) visibles++;
                if (recurso.completado) recurso.completado.checked = completados.has(recurso.id);
            });
            shell.querySelectorAll('.resource-section').forEach(seccion => {
                const cards = [...seccion.querySelectorAll('.resource-card')];
                seccion.hidden = cards.length > 0 && cards.every(card => card.hidden);
            });
            resultados.textContent = recursos.length === 0
                ? 'Todavía no hay recursos en este catálogo.'
                : visibles
                ? `${visibles} de ${recursos.length} recursos en esta página.`
                : 'No hay resultados. Prueba otra búsqueda o limpia los filtros.';
            if (tutoriales) {
                progreso.hidden = false;
                progreso.textContent = `${recursos.filter(recurso => completados.has(recurso.id)).length} de ${recursos.length} tutoriales completados.`;
            }
        }

        buscar.addEventListener('input', actualizar);
        tema.addEventListener('change', actualizar);
        soloFavoritos.addEventListener('change', actualizar);
        controles.querySelector('#limpiar-recursos').addEventListener('click', () => {
            buscar.value = '';
            tema.value = '';
            soloFavoritos.checked = false;
            actualizar();
            buscar.focus();
        });
        window.addEventListener('storage', evento => {
            if (evento.key === null || evento.key === claveFavoritos || evento.key === claveProgreso) {
                favoritos = leer(claveFavoritos);
                completados = leer(claveProgreso);
                actualizar();
            }
        });
        actualizar();
    }
})();
