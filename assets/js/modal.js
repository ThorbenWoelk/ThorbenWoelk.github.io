class Modal {
    constructor() {
        this.modal = document.querySelector('.modal');
        this.modalImg = this.modal.querySelector('img');
        this.photoItems = document.querySelectorAll('.photo-item');
        this.bindEvents();
    }

    bindEvents() {
        this.photoItems.forEach(photo => {
            photo.addEventListener('click', () => this.open(photo));
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(photo) {
        const img = photo.querySelector('img');
        const fullRes = img.dataset.full || img.src;
        this.modalImg.src = fullRes;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}