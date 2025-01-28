class Modal {
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

        // Create navigation
        this.createNavigation();
        this.bindEvents();
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

    async open(photoItem) {
        this.currentItem = photoItem;
        this.allItems = Array.from(document.querySelectorAll('.photo-item'));
        this.currentIndex = this.allItems.indexOf(photoItem);

        const img = photoItem.querySelector('img');
        const fullRes = img.dataset.full || img.src;

        this.modal.classList.add('active', 'loading');
        document.body.style.overflow = 'hidden';

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