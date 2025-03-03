import { imageMetadata } from './imageMetadata.js';

export class Modal {
    constructor() {
        this.modal = document.querySelector('.modal');
        this.modalImg = this.modal.querySelector('img');
        this.currentItem = null;
        this.currentIndex = 0;
        this.allItems = [];

        // Touch handling
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Create loading indicator
        this.loader = document.createElement('div');
        this.loader.className = 'modal-loader';
        this.modal.appendChild(this.loader);

        // Create info panel for metadata
        this.createInfoPanel();

        // Create navigation
        this.createNavigation();
        this.bindEvents();

        // Log metadata availability for debugging
        console.log('Metadata available:',
            imageMetadata ? 'Yes' : 'No',
            imageMetadata ? `(${Object.keys(imageMetadata).length} collections)` : '');
    }

    createInfoPanel() {
        // Create info panel if it doesn't exist
        if (!this.modal.querySelector('.modal-info')) {
            this.infoPanel = document.createElement('div');
            this.infoPanel.className = 'modal-info';
            this.modal.appendChild(this.infoPanel);
        } else {
            this.infoPanel = this.modal.querySelector('.modal-info');
        }

        // Add a toggle button for the info panel
        this.infoToggle = document.createElement('button');
        this.infoToggle.className = 'modal-info-toggle';
        this.infoToggle.innerHTML = 'ⓘ';
        this.infoToggle.title = 'Toggle photo info';
        this.infoToggle.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 1100;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 24px;
        `;
        this.modal.appendChild(this.infoToggle);

        this.infoToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleInfoPanel();
        });
    }

    toggleInfoPanel() {
        if (this.infoPanel.classList.contains('visible')) {
            this.infoPanel.classList.remove('visible');
        } else {
            this.infoPanel.classList.add('visible');
        }
    }

    createNavigation() {
        this.prevBtn = document.createElement('button');
        this.nextBtn = document.createElement('button');
        this.prevBtn.className = 'modal-nav prev';
        this.nextBtn.className = 'modal-nav next';
        this.prevBtn.innerHTML = '←';
        this.nextBtn.innerHTML = '→';
        this.modal.appendChild(this.prevBtn);
        this.modal.appendChild(this.nextBtn);

        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigate(-1);
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigate(1);
        });

        // Add close button
        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'modal-close';
        this.closeBtn.innerHTML = '✕';
        this.closeBtn.style.cssText = `
            position: absolute; 
            top: 10px; 
            right: 10px; 
            z-index: 1100; 
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
        `;
        this.modal.appendChild(this.closeBtn);

        this.closeBtn.addEventListener('click', () => this.close());
    }

    bindEvents() {
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            switch(e.key) {
                case 'Escape': this.close(); break;
                case 'ArrowLeft': this.navigate(-1); break;
                case 'ArrowRight': this.navigate(1); break;
                case 'i': this.toggleInfoPanel(); break; // 'i' key to toggle info
            }
        });

        // Touch events
        this.modal.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.modal.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        // Image click handler
        document.addEventListener('click', (e) => {
            const photoItem = e.target.closest('.photo-item');
            if (photoItem) this.open(photoItem);
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.navigate(1);  // Swipe left
            } else {
                this.navigate(-1); // Swipe right
            }
        }
    }

    getImageMetadata(photoItem) {
        // Extract image filename and collection
        const img = photoItem.querySelector('img');
        const fullSrc = img.dataset.full || img.src;
        const category = photoItem.dataset.category;

        // Extract the filename from the path
        const filename = fullSrc.split('/').pop();

        // Log for debugging
        console.log(`Looking for metadata: ${category}/${filename}`);

        // Look up metadata from our imported object
        if (imageMetadata &&
            imageMetadata[category] &&
            imageMetadata[category][filename]) {
            console.log('Found metadata:', imageMetadata[category][filename]);
            return imageMetadata[category][filename];
        }

        // If not found, try to extract details from filename
        const nameParts = filename.split('_');
        const dummyData = {
            Filename: filename,
            IsDummyData: true
        };

        // Try to determine location from filename
        if (filename.includes('bkk')) {
            dummyData.Location = 'Bangkok, Thailand';
        } else if (filename.includes('chiang_mai')) {
            dummyData.Location = 'Chiang Mai, Thailand';
        } else {
            dummyData.Location = 'Southeast Asia';
        }

        console.log('Using generated metadata from filename');
        return dummyData;
    }

    updateInfoPanel(photoItem) {
        const metadata = this.getImageMetadata(photoItem);

        if (!metadata) {
            this.infoPanel.innerHTML = '<p class="metadata-notice">No metadata available</p>';
            return;
        }

        // Format the metadata HTML
        let html = '<div class="metadata-content">';

        // Top section with camera info
        if (metadata.Make || metadata.Model) {
            html += '<div class="metadata-camera">';
            if (metadata.Make && metadata.Model) {
                html += `<h3>${metadata.Make} ${metadata.Model}</h3>`;
            } else {
                html += `<h3>${metadata.Make || metadata.Model}</h3>`;
            }
            html += '</div>';
        }

        // Main exposure settings in a row
        html += '<div class="metadata-exposure">';
        const mainSettings = [];
        if (metadata.FocalLength) mainSettings.push(metadata.FocalLength);
        if (metadata.FNumber) mainSettings.push(metadata.FNumber);
        if (metadata.ExposureTime) mainSettings.push(metadata.ExposureTime);
        if (metadata.ISO) mainSettings.push(metadata.ISO);

        if (mainSettings.length > 0) {
            html += mainSettings.join(' | ');
        } else if (metadata.Location) {
            html += `<strong>${metadata.Location}</strong>`;
        }
        html += '</div>';

        // Additional details in a grid or columns
        html += '<div class="metadata-details">';

        if (metadata.LensModel) {
            html += `<div class="metadata-item"><span>Lens:</span> ${metadata.LensModel}</div>`;
        }

        if (metadata.ExposureProgram) {
            html += `<div class="metadata-item"><span>Mode:</span> ${metadata.ExposureProgram}</div>`;
        }

        if (metadata.MeteringMode) {
            html += `<div class="metadata-item"><span>Metering:</span> ${metadata.MeteringMode}</div>`;
        }

        if (metadata.ExposureBiasValue) {
            html += `<div class="metadata-item"><span>Exposure Comp:</span> ${metadata.ExposureBiasValue}</div>`;
        }

        if (metadata.Flash) {
            html += `<div class="metadata-item"><span>Flash:</span> ${metadata.Flash}</div>`;
        }

        if (metadata.WhiteBalance) {
            html += `<div class="metadata-item"><span>White Balance:</span> ${metadata.WhiteBalance}</div>`;
        }

        if (metadata.FocalLengthIn35mmFormat) {
            html += `<div class="metadata-item"><span>35mm Equivalent:</span> ${metadata.FocalLengthIn35mmFormat}</div>`;
        }

        if (metadata.Location && !mainSettings.length) {
            html += `<div class="metadata-item"><span>Location:</span> ${metadata.Location}</div>`;
        }

        if (metadata.UserComment) {
            html += `<div class="metadata-item metadata-comment">${metadata.UserComment}</div>`;
        }

        html += '</div>'; // Close metadata-details

        // Date if available
        if (metadata.DateTimeOriginal) {
            const dateObj = new Date(metadata.DateTimeOriginal);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            html += `<div class="metadata-date">${formattedDate}</div>`;
        } else if (metadata.Year) {
            html += `<div class="metadata-date">${metadata.Year}</div>`;
        }

        if (metadata.IsDummyData) {
            html += '<div class="metadata-notice">Limited metadata available</div>';
        }

        html += '</div>'; // Close metadata-content

        this.infoPanel.innerHTML = html;
    }

    async open(photoItem) {
        this.currentItem = photoItem;
        this.allItems = Array.from(document.querySelectorAll('.photo-item'));
        this.currentIndex = this.allItems.indexOf(photoItem);

        const img = photoItem.querySelector('img');
        const fullRes = img.dataset.full || img.src;

        this.modal.classList.add('active', 'loading');
        document.body.style.overflow = 'hidden';
        // Clear previous image immediately
        this.modalImg.src = '';
        this.modalImg.alt = '';  // Clear alt text

        // Update the metadata display
        this.updateInfoPanel(photoItem);

        // Show the info panel by default for the first viewing
        if (!this.hasOpenedBefore) {
            this.infoPanel.classList.add('visible');
            this.hasOpenedBefore = true;
        }

        try {
            await this.preloadImage(fullRes);
            this.modalImg.src = fullRes;
        } finally {
            this.modal.classList.remove('loading');
        }
    }

    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            this.modalImg.src = '';
        }, 300);
    }

    async navigate(direction) {
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) newIndex = this.allItems.length - 1;
        if (newIndex >= this.allItems.length) newIndex = 0;

        await this.open(this.allItems[newIndex]);
    }
}