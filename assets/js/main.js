document.addEventListener('DOMContentLoaded', () => {
    const imageFiles = [
  "TLW_3482_edit.jpg",
  "TLW_3496_edit.jpg",
  "TLW_3510_edit.jpg",
  "TLW_3529_edit.jpg",
  "TLW_3532_edit.jpg",
  "TLW_3541_edit.jpg",
  "TLW_3555_edit.jpg",
  "TLW_3557_edit.jpg",
  "TLW_3563_edit.jpg",
  "TLW_3586_edit.jpg",
  "TLW_3588_edit.jpg",
  "TLW_3618_edit.jpg",
  "TLW_3644_edit.jpg",
  "TLW_3654_edit.jpg",
  "TLW_3668_edit.jpg",
  "TLW_3674_edit.jpg",
  "TLW_3676_edit.jpg",
  "TLW_3683_edit.jpg",
  "TLW_3687_edit.jpg",
  "TLW_3689_edit.jpg",
  "TLW_3702_edit.jpg",
  "TLW_3709_edit.jpg",
  "TLW_3710_edit.jpg",
  "TLW_3715_edit.jpg",
  "TLW_3720_edit.jpg",
  "TLW_3764_edit.jpg",
  "TLW_3793_edited.jpg",
  "TLW_3804_edit.jpg",
  "TLW_3858_edit.jpg",
  "TLW_3889_edit.jpg",
  "TLW_3891_edit.jpg",
  "TLW_3895_edit.jpg",
  "TLW_3909_edit.jpg",
  "TLW_3913_edit.jpg",
  "TLW_3922_edit.jpg",
  "TLW_3925_edit.jpg",
  "TLW_3930_edit.jpg",
  "TLW_3934_edit.jpg",
  "TLW_3936_edit.jpg",
  "TLW_3946_edit.jpg"
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