document.addEventListener('DOMContentLoaded', () => {
    const imageFiles = [
        'TLW_3858_edit.jpg',
        'TLW_3889_edit.jpg',
        'TLW_3891_edit.jpg',
        'TLW_3895_edit.jpg',
        'TLW_3909_edit.jpg',
        'TLW_3913_edit.jpg',
        'TLW_3922_edit.jpg',
        'TLW_3925_edit.jpg',
        'TLW_3930_edit.jpg',
        'TLW_3934_edit.jpg',
        'TLW_3936_edit.jpg',
        'TLW_3946_edit.jpg'
    ];

    const grid = document.querySelector('.grid');
    grid.innerHTML = imageFiles.map(filename => `
        <div class="photo-item">
            <img 
                src="./assets/images/grid/${filename}"
                data-full="./assets/images/large/${filename}"
                alt="Photo"
                loading="lazy"
            >
        </div>
    `).join('');

    new Modal();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(anchor.getAttribute('href'))
                .scrollIntoView({ behavior: 'smooth' });
        });
    });
});