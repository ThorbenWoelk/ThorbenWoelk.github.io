document.addEventListener('DOMContentLoaded', () => {
    const imageFiles = [
        'TLW_3858_edit.jpg',
        'TLW_3909_edit.jpg',
        'TLW_3889_edit.jpg',
        'TLW_3890_edit.jpg',
        'TLW_3891_edit.jpg',
        'TLW_3892_edit.jpg',
        'TLW_3893_edit.jpg',
        'TLW_3894_edit.jpg',
        'TLW_3895_edit.jpg',
        'TLW_3896_edit.jpg',
        'TLW_3897_edit.jpg',
        'TLW_3898_edit.jpg',
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
        'TLW_3890_edit.jpg': 'Mountain view',
        'TLW_3891_edit.jpg': 'Traditional roof',
        'TLW_3892_edit.jpg': 'Haad Tien Beach',
        'TLW_3893_edit.jpg': 'Koh Tao hills',
        'TLW_3894_edit.jpg': 'Chalok bay',
        'TLW_3895_edit.jpg': 'Apartment view',
        'TLW_3896_edit.jpg': 'Solitude',
        'TLW_3897_edit.jpg': 'Granite rocks',
        'TLW_3898_edit.jpg': 'The observer',
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