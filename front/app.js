// Function to load content dynamically
function loadContent(page) {
    fetch(`${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Page not found');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => {
            document.getElementById('main-content').innerHTML = `<p>${error.message}</p>`;
        });
}

// Event listener for navigation links
document.getElementById('nav-links').addEventListener('click', event => {
    event.preventDefault();
    const page = event.target.getAttribute('data-page');
    if (page) {
        loadContent(page);
    }
});

// Load default page
document.addEventListener('DOMContentLoaded', () => loadContent('home'));
