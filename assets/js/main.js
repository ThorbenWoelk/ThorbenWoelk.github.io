import { imageCollections } from './imageList.js';
import { Modal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentGrid = document.getElementById('current').querySelector('.grid');
    const archiveGrid = document.getElementById('archive').querySelector('.grid');
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');
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

    function switchSection(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`nav a[href="#${targetId}"]`).classList.add('active');

        // Hide all sections
        document.getElementById('current').style.display = 'none';
        document.getElementById('archive').style.display = 'none';
        aboutSection.style.display = 'none';
        contactSection.style.display = 'none';

        // Show target section
        document.getElementById(targetId).style.display = 'block';

        // Update URL
        history.pushState({}, '', `#${targetId}`);
    }

    // Initial render
    renderCollection('current', currentGrid);

    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            switchSection(targetId);
            if (['current', 'archive'].includes(targetId)) {
                renderCollection(targetId, targetId === 'current' ? currentGrid : archiveGrid);
            }
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const currentHash = window.location.hash.substring(1) || 'current';
        switchSection(currentHash);
        if (['current', 'archive'].includes(currentHash)) {
            renderCollection(currentHash, currentHash === 'current' ? currentGrid : archiveGrid);
        }
    });

    // Initial section based on URL hash
    const initialHash = window.location.hash.substring(1) || 'current';
    switchSection(initialHash);
    if (['current', 'archive'].includes(initialHash)) {
        renderCollection(initialHash, initialHash === 'current' ? currentGrid : archiveGrid);
    }
});