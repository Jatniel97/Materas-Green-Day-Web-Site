document.getElementById('replace-content-btn').addEventListener('click', () => {
    // Ruta del archivo Velas.html
    const url = 'Velas.html';

    // Cargar el contenido del archivo HTML
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el contenido.');
            }
            return response.text();
        })
        .then(html => {
            // Crear un elemento temporal para extraer la sección específica
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Seleccionar la sección dinámica de Velas.html
            const newContent = doc.querySelector('#dynamic-section').innerHTML;

            // Reemplazar el contenido de la sección dinámica en index.html
            document.getElementById('dynamic-section').innerHTML = newContent;
        })
        .catch(error => console.error('Error:', error));
});
