// Basic script for Emelagudev site
console.log('Script loaded for Emelagudev site');

function loadNavigation() {
    fetch('/nav.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const header = doc.querySelector('header');
            if (header) {
                // Adjust href based on current path
                const isInPages = window.location.pathname.includes('/pages/');
                const links = header.querySelectorAll('a');
                links.forEach(link => {
                    let href = link.getAttribute('href');
                    if (isInPages && !href.startsWith('http')) {
                        if (href === 'index.html') {
                            link.setAttribute('href', '../index.html');
                        } else if (href.startsWith('pages/')) {
                            link.setAttribute('href', '../' + href);
                        }
                    }
                });
                // Insert header at the beginning of body
                document.body.insertBefore(header, document.body.firstChild);
                // Set active link based on current URL
                setActiveLink();
            }
        })
        .catch(error => console.error('Error loading navigation:', error));
}

// Function to set active link based on current URL
function setActiveLink() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname;
    let found = false;

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
            found = true;
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    if (!found && navLinks.length > 0) {
        navLinks[0].classList.add('active');
        navLinks[0].setAttribute('aria-current', 'page');
    }
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Load navigation first
    loadNavigation();

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all
            navLinks.forEach(l => l.classList.remove('active'));
            // Add to clicked
            this.classList.add('active');
        });
    });

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.card, section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Function to generate HTML for a project
    function generateProjectHTML(project) {
        const isInPages = window.location.pathname.includes('/pages/');
        let techStackHTML = '';
        if (project.techStack) {
            project.techStack.forEach(categoryObj => {
                const category = Object.keys(categoryObj)[0];
                const techs = categoryObj[category];
                techStackHTML += `<div class="tech-category"><h4>${category}</h4><div class="tech-items">${techs.map(tech => `<span class="chip">${tech}</span>`).join(' ')}</div></div>`;
            });
        }
        let featuresHTML = '';
        if (project.features) {
            featuresHTML = '<div class="features-list">';
            project.features.forEach(feature => {
                featuresHTML += `<h4>${feature.name}:</h4> ${feature.description}<br>`;
            });
            featuresHTML += '</div>';
        }
        const images = project.images ? project.images.slice(0, 3) : [];
        let carouselHTML = '';

        if (images.length <= 3) {
            carouselHTML = `<div class="carousel-flex">${images.map((img, index) => `<img src="${img}" alt="Screenshot ${index + 1} of ${project.name}" class="carousel-image">`).join('')}</div>`;
        } else {
            carouselHTML = `
                <div class="carousel">
                    <div class="carousel-images">
                        ${images.map((img, index) => `<img src="${img}" alt="Screenshot ${index + 1} of ${project.name}" class="carousel-image">`).join('')}
                    </div>
                    <button class="carousel-prev">‹</button>
                    <button class="carousel-next">›</button>
                </div>
            `;
        }

        let showcaseHTML = '';
        if (project.showcase) {
            showcaseHTML = `<img src="${project.showcase}" alt="Showcase for ${project.name}" class="showcase-image">`;
        }

        return `
            <article class="card project">
                <h2>${project.name}</h2>
                <p>${project.description}</p>
                ${showcaseHTML}
                ${carouselHTML}
                <div class="project-content" style="display: flex; gap: 20px; align-items: flex-start;">
                    <div>
                        <h3>Tech Stack</h3>
                        <div class="tech-stack">${techStackHTML}</div>
                        <h3>Features</h3>
                        ${featuresHTML}
                        ${!isInPages ? '<p><a href="pages/projects.html" class="btn">more</a></p>' : ''}
                        <p><a href="${project.link.url}" target="_blank" class="btn">${project.link.label}</a></p>
                    </div>
                </div>
            </article>
        `;
    }
    // Load projects from JSON
    const container = document.getElementById('projects-container');
    if (container) {
        const isInPages = window.location.pathname.includes('/pages/');
        const projectsPath = isInPages ? '../projects.json' : 'projects.json';
        fetch(projectsPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(projects => {
                projects
                .filter(p => p.show !== false)
                .forEach(project => {
                    const html = generateProjectHTML(project);
                    container.innerHTML += html;
                });

                // Initialize carousels
                function initCarousel(carousel) {
                    const images = carousel.querySelectorAll('.carousel-image');
                    let currentIndex = 0;
                    const prevBtn = carousel.querySelector('.carousel-prev');
                    const nextBtn = carousel.querySelector('.carousel-next');

                    function showImage(index) {
                        images.forEach((img, i) => {
                            img.style.display = i === index ? 'block' : 'none';
                        });
                    }

                    // Initialize first image
                    showImage(0);

                    prevBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        showImage(currentIndex);
                    });

                    nextBtn.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % images.length;
                        showImage(currentIndex);
                    });
                }

                document.querySelectorAll('.carousel').forEach(initCarousel);
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                container.innerHTML = '<p>Error loading projects. Please try again later.</p>';
            });
    }

    // Load about_me.json and update hero and skills sections
    fetch('about_me.json')
        .then(response => response.json())
        .then(data => {
            // Update hero section
            const heroH1 = document.querySelector('#hero h1');
            const heroPs = document.querySelectorAll('#hero p');
            if (heroH1) heroH1.textContent = data.name;
            if (heroPs.length >= 1) heroPs[0].textContent = data.description;

            // Update skills section
            const skillsCard = document.querySelector('#skills .card');
            if (skillsCard && data.techStack) {
                let skillsHTML = '';
                data.techStack.forEach(categoryObj => {
                    const category = categoryObj.category;
                    const techs = categoryObj.technologies;
                    skillsHTML += `<div class="tech-category"><h4>${category}</h4><div class="tech-items">${techs.map(tech => `<span class="chip">${tech}</span>`).join(' ')}</div></div>`;
                });
                skillsCard.innerHTML = `<div class="tech-stack">${skillsHTML}</div>`;
            }
        })
        .catch(error => console.error('Error loading about_me.json:', error));
});