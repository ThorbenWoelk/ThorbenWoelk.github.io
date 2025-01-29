import { imageCollections } from './imageList.js';
import { Modal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentGrid = document.getElementById('current');
    const archiveGrid = document.getElementById('archive');
    const navLinks = document.querySelectorAll('nav a');

    function renderCollection(collectionName, gridElement) {
        const collectionImages = imageCollections[collectionName];
        const html = collectionImages.map((filename, index) => `
            <div class="photo-item">
                <img 
                    src="/processed/images/grid/${filename}"
                    data-full="/processed/images/large/${filename}"
                    alt="Photo ${index + 1}"
                    loading="lazy"
                >
            </div>
        `).join('');

        gridElement.innerHTML = html;
        new Modal();
    }

    function switchCollection(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`nav a[href="#${targetId}"]`).classList.add('active');

        currentGrid.style.display = targetId === 'current' ? 'grid' : 'none';
        archiveGrid.style.display = targetId === 'archive' ? 'grid' : 'none';
    }

    // Initial render
    renderCollection('current', currentGrid);

    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('href').substring(1);
            if (['current', 'archive'].includes(targetId)) {
                switchCollection(targetId);
                renderCollection(targetId, targetId === 'current' ? currentGrid : archiveGrid);
            }
        });
    });
});