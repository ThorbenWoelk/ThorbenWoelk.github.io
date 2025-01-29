import { imageCollections } from './imageList.js';
import { Modal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentSection = document.getElementById('current');
    const archiveSection = document.getElementById('archive');
    const currentGrid = currentSection.querySelector('.grid');
    const archiveGrid = archiveSection.querySelector('.grid');
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');
    const navLinks = document.querySelectorAll('nav a');

    function renderCollection(collectionName, gridElement) {
        const collectionImages = imageCollections[collectionName];
        const html = collectionImages.map((filename, index) => `
            <div class="photo-item">
                <img 
                    src="/processed/${collectionName}/grid/${filename}"
                    srcset="/processed/${collectionName}/thumb/${filename} 600w,
                            /processed/${collectionName}/grid/${filename} 1200w"
                    sizes="(max-width: 768px) 100vw,
                           400px"
                    data-full="/processed/${collectionName}/large/${filename}"
                    alt="Photo ${index + 1}"
                    loading="lazy"
                    width="400"
                    height="500"
                >
            </div>
        `).join('');

        gridElement.innerHTML = html;
        new Modal();
    }

    function switchSection(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`nav a[href="#${targetId}"]`).classList.add('active');

        currentSection.style.display = 'none';
        archiveSection.style.display = 'none';
        aboutSection.style.display = 'none';
        contactSection.style.display = 'none';

        if (targetId === 'current') {
            currentSection.style.display = 'block';
            renderCollection('current', currentGrid);
        } else if (targetId === 'archive') {
            archiveSection.style.display = 'block';
            renderCollection('archive', archiveGrid);
        } else {
            document.getElementById(targetId).style.display = 'block';
        }

        history.pushState({}, '', `#${targetId}`);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    window.addEventListener('popstate', () => {
        const currentHash = window.location.hash.substring(1) || 'current';
        switchSection(currentHash);
    });

    const initialHash = window.location.hash.substring(1) || 'current';
    switchSection(initialHash);
});