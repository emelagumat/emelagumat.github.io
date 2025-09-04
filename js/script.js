// Basic script for Emelagudev site
console.log('Script loaded for Emelagudev site');

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
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
        const techStack = project.techStack ? project.techStack.join(', ') : '';
        const features = project.features ? project.features.join(', ') : '';
        return `
            <article class="card project">
                <h2>${project.name}</h2>
                <div class="project-content" style="display: flex; gap: 20px; align-items: flex-start;">
                    <img src="${project.image}" alt="Screenshot of ${project.name}" style="width:200px; height:auto;">
                    <div>
                        <p>${project.description}</p>
                        <p><strong>Tech Stack:</strong> ${techStack}</p>
                        <p><strong>Features:</strong> ${features}</p>
                        <p><a href="${project.link}" target="_blank">View Project</a></p>
                    </div>
                </div>
            </article>
        `;
    }
    // Load projects from JSON
    const container = document.getElementById('projects-container');
    if (container) {
        fetch('../projects.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(projects => {
                projects.forEach(project => {
                    const html = generateProjectHTML(project);
                    container.innerHTML += html;
                });
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                container.innerHTML = '<p>Error loading projects. Please try again later.</p>';
            });
    }
});