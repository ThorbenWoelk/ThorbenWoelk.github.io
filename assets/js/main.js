import { imageFiles } from './imageList.js';
import { Modal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Import validation
    console.group('Initialization');
    console.log('Script loaded, checking imports...');
    if (!imageFiles) {
        console.error('imageFiles import failed:', imageFiles);
        throw new Error('imageFiles not imported');
    }
    console.log('imageFiles imported:', imageFiles.length, 'items');
    console.groupEnd();

    // DOM validation
    console.group('DOM Elements');
    const grid = document.querySelector('.grid');
    if (!grid) {
        console.error('Grid element not found');
        throw new Error('Grid element missing');
    }
    console.log('Grid element found:', grid);
    console.groupEnd();

    // HTML generation
    console.group('HTML Generation');
    try {
        const html = imageFiles.map((filename, index) => {
            console.debug(`Processing image ${index + 1}/${imageFiles.length}:`, filename);
            return `
                <div class="photo-item">
                    <img 
                        src="/assets/images/grid/${filename}"
                        data-full="/assets/images/large/${filename}"
                        alt="Photo"
                        loading="lazy"
                    >
                </div>
            `;
        }).join('');
        console.log('HTML generated, length:', html.length);
        console.log('First item sample:', html.slice(0, 200));
        grid.innerHTML = html;
    } catch (error) {
        console.error('HTML generation failed:', error);
        throw error;
    }
    console.groupEnd();

    // Modal initialization
    console.group('Modal');
    try {
        new Modal();
        console.log('Modal initialized');
    } catch (error) {
        console.error('Modal initialization failed:', error);
        throw error;
    }
    console.groupEnd();
});