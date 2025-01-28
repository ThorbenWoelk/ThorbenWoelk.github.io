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

    const titleMap = {
        'TLW_3858_edit.jpg': 'Temple maintenance',
        'TLW_3909_edit.jpg': 'Vista bungalows',
        'TLW_3889_edit.jpg': 'Tropical Paradise Garden bungalows',
        'TLW_3891_edit.jpg': 'Traditional roof',
        'TLW_3895_edit.jpg': 'Apartment view',
        'TLW_3913_edit.jpg': 'Vista beach',
        'TLW_3922_edit.jpg': 'Vista hills',
        'TLW_3925_edit.jpg': 'Vista Ko Tao beach',
        'TLW_3930_edit.jpg': 'Sunset Ko Tao I',
        'TLW_3934_edit.jpg': 'Sunset Ko Tao II',
        'TLW_3936_edit.jpg': 'Rocks',
        'TLW_3946_edit.jpg': 'Sunset Ko Tao III'
    };

    const grid = document.querySelector('.grid');
    grid.innerHTML = imageFiles.map(filename => `
        <div class="photo-item">
            <img 
                src="./assets/images/grid/${filename}"
                data-full="./assets/images/large/${filename}"
                alt="${titleMap[filename]}"
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