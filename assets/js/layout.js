// Las rutas de los componentes se escriben desde la raíz del sitio.
(() => {
    const raiz = new URL('../../', document.currentScript.src);

    async function cargarComponente(contenedor) {
        const nombre = contenedor.dataset.component;
        if (contenedor.dataset.loading === 'true') return;
        contenedor.dataset.loading = 'true';
        contenedor.setAttribute('aria-busy', 'true');
        const reintento = contenedor.querySelector('.component-retry');
        const devolverFoco = reintento === document.activeElement;
        if (reintento) reintento.disabled = true;
        try {
            const respuesta = await fetch(new URL(`components/${nombre}.html`, raiz));
            if (!respuesta.ok) {
                throw new Error(`No se pudo cargar ${nombre}: ${respuesta.status}`);
            }

            const plantilla = document.createElement('template');
            plantilla.innerHTML = await respuesta.text();

            // Resolvemos enlaces e imágenes antes de insertar el HTML compartido.
            plantilla.content.querySelectorAll('[href], [src]').forEach(function (elemento) {
                ['href', 'src'].forEach(function (atributo) {
                    if (elemento.hasAttribute(atributo)) {
                        const ruta = elemento.getAttribute(atributo);
                        elemento.setAttribute(atributo, new URL(ruta, raiz).href);
                    }
                });
            });

            if (nombre === 'header') {
                if (contenedor.dataset.section === 'inicio') {
                    const titulo = plantilla.content.querySelector('.site-title');
                    const encabezado = document.createElement('h1');
                    encabezado.className = 'site-title';
                    encabezado.textContent = titulo.textContent;
                    titulo.replaceWith(encabezado);
                } else if (contenedor.dataset.section === 'recursos') {
                    plantilla.content.querySelector('[data-nav="recursos"]')
                        .setAttribute('aria-current', 'location');
                }
            }

            contenedor.replaceChildren(plantilla.content);
            document.dispatchEvent(new CustomEvent('componente:cargado', { detail: nombre }));
            if (devolverFoco) {
                const menu = contenedor.querySelector('.menu-toggle');
                const destino = menu && getComputedStyle(menu).display !== 'none'
                    ? menu : contenedor.querySelector('a');
                if (destino) destino.focus();
            }
        } catch (error) {
            console.error('Error al cargar un componente:', error);
            let aviso = contenedor.querySelector('.component-error');
            if (!aviso) {
                aviso = document.createElement('div');
                aviso.className = 'component-error';
                const mensaje = document.createElement('p');
                mensaje.setAttribute('role', 'alert');
                mensaje.textContent = `No se pudo cargar ${nombre === 'header' ? 'el menú' : 'el pie de página'}.`;
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'action-button component-retry';
                boton.textContent = 'Reintentar';
                boton.addEventListener('click', () => cargarComponente(contenedor));
                aviso.append(mensaje, boton);
                contenedor.appendChild(aviso);
            }
            aviso.querySelector('button').disabled = false;
        } finally {
            contenedor.dataset.loading = 'false';
            contenedor.setAttribute('aria-busy', 'false');
        }
    }

    // main.js espera esta promesa antes de configurar el menú.
    window.componentesListos = Promise.all(
        Array.from(document.querySelectorAll('[data-component]'), cargarComponente)
    );
})();
