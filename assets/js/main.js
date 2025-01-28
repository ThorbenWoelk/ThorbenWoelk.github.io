document.addEventListener('DOMContentLoaded', async () => {
    // Get image list
    const response = await fetch('./assets/images/grid/');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imageFiles = Array.from(doc.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.match(/\.(jpg|jpeg|png)$/i))
        .map(href => href.split('/').pop());

    // Generate grid items
    const grid = document.querySelector('.grid');
    grid.innerHTML = imageFiles.map(filename => `
        <div class="photo-item">
            <img 
                src="./assets/images/grid/${filename}"
                data-full="./assets/images/large/${filename}"
                alt="${filename.split('.')[0]}"
                loading="lazy"
            >
            <div class="photo-info">
                <h3>${filename.split('.')[0]}</h3>
            </div>
        </div>
    `).join('');

    // Initialize modal
    new Modal();

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(anchor.getAttribute('href'))
                .scrollIntoView({ behavior: 'smooth' });
        });
    });
});