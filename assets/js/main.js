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

    function getImageMetadata(filename) {
        // Extract location from filename (customize based on your naming convention)
        const nameParts = filename.split('_');
        let location = '';

        if (filename.includes('bkk')) {
            location = 'Bangkok, Thailand';
        } else if (filename.includes('chiang_mai')) {
            location = 'Chiang Mai, Thailand';
        }

        // You can expand this with more locations based on your naming convention

        return {
            location: location || 'Southeast Asia',
            // Add date based on file modification or EXIF data if available
            date: '2024'
        };
    }

    function renderCollection(collectionName, gridElement) {
        const collectionImages = imageCollections[collectionName];
        const html = collectionImages.map((filename, index) => {
            const metadata = getImageMetadata(filename);

            // Removed the isFeatured variable and class assignment

            return `
                <div class="photo-item" 
                     data-category="${collectionName}">
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
                    <div class="photo-item-metadata">
                        <div class="photo-location">${metadata.location}</div>
                        <div class="photo-date">${metadata.date}</div>
                    </div>
                </div>
            `;
        }).join('');

        gridElement.innerHTML = html;
        new Modal();
    }

    // Scroll animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    function switchSection(targetId) {
        // Update navigation active state
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`nav a[href="#${targetId}"]`).classList.add('active');

        // Hide all sections first
        [currentSection, archiveSection, aboutSection, contactSection].forEach(section => {
            section.style.display = 'none';
        });

        // Show and handle the target section
        if (targetId === 'current') {
            currentSection.style.display = 'block';
            renderCollection('current', currentGrid);
        } else if (targetId === 'archive') {
            archiveSection.style.display = 'block';
            renderCollection('archive', archiveGrid);
        } else {
            const targetSection = document.getElementById(targetId);
            targetSection.style.display = 'block';
            // Ensure the section is visible immediately
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'none';
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

    // Smooth loading animation for images
    function handleImageLoad(img) {
        img.style.opacity = '0';
        img.addEventListener('load', () => {
            img.style.transition = 'opacity 0.5s ease';
            img.style.opacity = '1';
        });
    }

    // Apply to existing images
    document.querySelectorAll('.photo-item img').forEach(handleImageLoad);
});