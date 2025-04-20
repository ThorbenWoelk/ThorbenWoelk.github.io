/**
 * Main JavaScript for Thorben Woelk CV website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Scroll fade-in effect using Intersection Observer API
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1 // When 10% of the element is visible
        });

        // Observe all sections
        document.querySelectorAll('.fade-in-section').forEach(section => {
            observer.observe(section);
        });
    };

    // Fallback for browsers that don't support Intersection Observer
    const fallbackFadeIn = () => {
        document.querySelectorAll('.fade-in-section').forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (sectionTop < windowHeight * 0.85) {
                section.classList.add('visible');
            }
        });
    };

    // Initialize either the Intersection Observer or fallback
    if ('IntersectionObserver' in window) {
        observeElements();
    } else {
        window.addEventListener('scroll', fallbackFadeIn);
        fallbackFadeIn(); // Run on page load
    }

    // Smooth scroll for down arrow
    const downArrow = document.querySelector('.down-arrow');
    if (downArrow) {
        downArrow.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('.social-links a, .footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Only apply smooth scroll for in-page links
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add active state to navigation when scrolling
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.social-links a');

    const updateActiveLink = () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Run on page load

    // Add dark mode toggle functionality
    const addDarkModeToggle = () => {
        const footer = document.querySelector('footer .container');

        if (footer) {
            // Create toggle button
            const darkModeToggle = document.createElement('button');
            darkModeToggle.className = 'dark-mode-toggle';
            darkModeToggle.innerHTML = '🌓';
            darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');

            // Insert button into the page
            document.body.appendChild(darkModeToggle);

            // Check for saved preference or system preference
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedTheme = localStorage.getItem('theme');

            if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme)) {
                document.body.classList.add('dark-mode');
            }

            // Toggle dark mode on click
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');

                // Save preference
                if (document.body.classList.contains('dark-mode')) {
                    localStorage.setItem('theme', 'dark');
                } else {
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    };

    // Add dark mode toggle
    addDarkModeToggle();
});

// Handle print action
document.querySelector('.download-btn')?.addEventListener('click', function(e) {
    // Check if there's a PDF file attached to the link
    const hasPdf = this.getAttribute('href')?.endsWith('.pdf');

    // If no PDF, show print dialog instead
    if (!hasPdf) {
        e.preventDefault();
        window.print();
    }
});