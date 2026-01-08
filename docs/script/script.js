// Función para cargar contenido dinámico (con rutas de fallback)
function loadContent(page) {
    const container = document.getElementById('dynamic-content');
    if (!container) return; // nada que hacer

    const normalized = page.trim();
    const lower = normalized.toLowerCase();
    const candidates = [
        normalized,
        './' + normalized,
        lower,
        './' + lower,
        'Home/' + normalized,
        '/Home/' + normalized,
        '/docs/Home/' + normalized,
        '../' + normalized,
        '../Home/' + normalized,
        '../../' + normalized
    ];

    let tried = 0;

    function tryFetch(i) {
        if (i >= candidates.length) {
            console.error('No se encontró el recurso en ninguna ruta candidata.');
            container.innerHTML = '<p>Ocurrió un error al cargar el contenido.</p>';
            return;
        }
        const path = candidates[i];
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    // intentar siguiente candidato
                    tryFetch(i + 1);
                    return null;
                }
                return response.text();
            })
            .then(data => {
                if (!data) return;
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newContent = doc.querySelector('.js');
                if (newContent) {
                    container.innerHTML = newContent.outerHTML;
                } else if (doc.body) {
                    // Si no hay .js, insertar el body (fallback)
                    container.innerHTML = doc.body.innerHTML;
                } else {
                    tryFetch(i + 1);
                    return;
                }

                // Después de insertar el contenido, actualizamos los botones y re-aplicamos estados
                if (typeof updateContainerButtons === 'function') {
                    try {
                        updateContainerButtons(normalized);
                    } catch (e) {
                        console.warn('updateContainerButtons fallo', e);
                    }
                }

                // Limpiar clases previas y aplicar "return-button" donde corresponda
                try {
                    ['materas','velas','combos'].forEach(role => {
                        const el = document.querySelector('#container-button [data-role="' + role + '"]');
                        if (el) {
                            const btn = el.querySelector('button');
                            if (btn) {
                                btn.classList.remove('return-button','active');
                            }
                        }
                    });

                    if (normalized.toLowerCase().includes('velas')) {
                        const el = document.querySelector('#container-button [data-role="materas"]');
                        if (el) {
                            const btn = el.querySelector('button');
                            if (btn) btn.classList.add('return-button');
                        }
                    }


                } catch (ex) {
                    console.warn('Error aplicando clases a los botones', ex);
                }

                // Re-inicializar listeners de botones (por si el DOM cambió)
                if (typeof initContainerButtons === 'function') {
                    try { initContainerButtons(); } catch(e) { console.warn('initContainerButtons fallo', e); }
                }
            })
            .catch(err => {
                console.warn('Intento fallido en', path, err);
                tryFetch(i + 1);
            });
    }

    tryFetch(0);
}

// Evitar scroll cuando se abre el menú lateral
function toggleScroll() {
    document.body.classList.toggle('no-scroll', document.getElementById('btn-menu').checked);
}

// Inicializar listeners para los botones del contenedor principal
function initContainerButtons() {
    const map = { materas: 'index.html', velas: 'pages/velas/Velas.html' };
    const container = document.getElementById('container-button');
    if (!container) return;

    ['materas','velas'].forEach(role => {
        const el = container.querySelector('[data-role="' + role + '"]');
        if (!el) return;
        const btn = el.querySelector('button');
        if (!btn) return;

        // Reemplazamos listener antiguo para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = el.querySelector('button');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = map[role];
            if (typeof loadContent === 'function') {
                loadContent(page);
            }
            // Estado visual
            container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
        });
    });
}

// Registrar listener al cargar la página (si existe el elemento)
document.addEventListener('DOMContentLoaded', function() {
    const btnMenu = document.getElementById('btn-menu');
    if (btnMenu) {
        btnMenu.addEventListener('change', toggleScroll);
    }

    // Inicializar estado de botones al cargar la página
    if (typeof updateContainerButtons === 'function') {
        updateContainerButtons('index.html');
    }

    // Inicializamos listeners de botones para asegurar comportamiento
    initContainerButtons();
});

// Actualiza qué botones se muestran en la barra principal según la sección
function updateContainerButtons(page) {
    const container = document.getElementById('container-button');
    if (!container) return;
    container.style.display = 'flex'; // aseguramos que sea visible
    const roles = {
        materas: container.querySelector('[data-role="materas"]'),
        velas: container.querySelector('[data-role="velas"]'),
        combos: container.querySelector('[data-role="combos"]')
    };

    // Limpiar clases y restaurar visibilidad por defecto
    ['materas','velas'].forEach(r => {
        const el = container.querySelector('[data-role="' + r + '"]');
        if (el) {
            el.style.display = 'inline-block';
            const btn = el.querySelector('button');
            if (btn) {
                btn.classList.remove('return-button','active');
            }
        }
    });

    const p = (page || '').toLowerCase();

    if (p.includes('velas')) {
        // estamos en Velas: ocultar velas, mostrar materas y combos; marcar materas como botón de retorno
        if (roles.velas) roles.velas.style.display = 'none';
        if (roles.materas) roles.materas.style.display = 'inline-block';
        if (roles.combos) roles.combos.style.display = 'inline-block';
        const btn = roles.materas && roles.materas.querySelector('button'); if (btn) btn.classList.add('return-button');
    } else if (p.includes('combos')) {
        // estamos en Combos: ocultar combos, mostrar materas y velas; marcar materas como retorno
        if (roles.combos) roles.combos.style.display = 'none';
        if (roles.materas) roles.materas.style.display = 'inline-block';
        if (roles.velas) roles.velas.style.display = 'inline-block';
        const btn = roles.materas && roles.materas.querySelector('button'); if (btn) btn.classList.add('return-button');
    } else {
        // por defecto estamos en Materas (index): ocultamos materas, mostramos velas y combos (sin marcar retorno)
        if (roles.materas) roles.materas.style.display = 'none';
        if (roles.velas) roles.velas.style.display = 'inline-block';
        if (roles.combos) roles.combos.style.display = 'inline-block';
    }
}

// Carousel (legacy app.js) — inicialización segura y localizada
function initCarousel() {
    const container = document.querySelector('.slide-container');
    if (!container) return;

    const slideImages = container.querySelectorAll('.slides img');
    const next = container.querySelector('.next');
    const prev = container.querySelector('.prev');
    const dots = container.querySelectorAll('.dot');
    if (!slideImages.length) return;

    let counter = 0;
    let deletInterval = null;

    function indicators() {
        dots.forEach(d => d.classList.remove('active'));
        if (dots[counter]) dots[counter].classList.add('active');
    }

    function slideNext(){
        slideImages[counter].style.animation = 'next1 0.5s ease-in forwards';
        if(counter >= slideImages.length-1) counter = 0; else counter++;
        slideImages[counter].style.animation = 'next2 0.5s ease-in forwards';
        indicators();
    }

    function slidePrev(){
        slideImages[counter].style.animation = 'prev1 0.5s ease-in forwards';
        if(counter == 0) counter = slideImages.length-1; else counter--;
        slideImages[counter].style.animation = 'prev2 0.5s ease-in forwards';
        indicators();
    }

    if (next) next.addEventListener('click', slideNext);
    if (prev) prev.addEventListener('click', slidePrev);

    function autoSliding(){
        deletInterval = setInterval(function(){ slideNext(); indicators(); }, 5000);
    }
    autoSliding();

    container.addEventListener('mouseover', function(){ clearInterval(deletInterval); });
    container.addEventListener('mouseout', autoSliding);

    // indicators click handler
    function switchImage(currentImage){
        if (!currentImage) return;
        const imageId = parseInt(currentImage.getAttribute('attr'));
        if (isNaN(imageId)) return;
        if (imageId > counter){
            slideImages[counter].style.animation = 'next1 0.5s ease-in forwards';
            counter = imageId;
            slideImages[counter].style.animation = 'next2 0.5s ease-in forwards';
        } else if (imageId === counter) {
            return;
        } else {
            slideImages[counter].style.animation = 'prev1 0.5s ease-in forwards';
            counter = imageId;
            slideImages[counter].style.animation = 'prev2 0.5s ease-in forwards';
        }
        indicators();
    }

    // attach click handlers to dots
    dots.forEach(d => d.addEventListener('click', function(){ switchImage(this); }));
}

// Initialize carousel on DOMContentLoaded and after dynamic content loads
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
});

// Re-init carousel when dynamic content is injected
if (typeof initCarousel === 'function') {
    // expose for calls after dynamic loads
}

