// Función para cargar contenido dinámico
function loadContent(page) {
    // Selecciona el contenedor donde se reemplazará el contenido
    const container = document.getElementById('dynamic-content');

    // Carga el archivo HTML especificado
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el contenido.');
            }
            return response.text(); // Devuelve el contenido en texto
        })
        .then(data => {
            // Parsear el contenido HTML cargado
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');

            // Extraer el contenedor dinámico del nuevo contenido
            const newContent = doc.querySelector('.js');

            if (newContent) {
                // Reemplazar el contenido en el contenedor principal
                container.innerHTML = newContent.outerHTML;
            } else {
                console.error('No se encontró contenido dinámico.');
                container.innerHTML = '<p>No se pudo cargar el contenido deseado.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Ocurrió un error al cargar el contenido.</p>';
        });
}
