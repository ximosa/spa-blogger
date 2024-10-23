class Router {
    constructor() {
        this.router = new Navigo(null, true);
        this.setupRoutes();
    }

    setupRoutes() {
        this.router
            .on({
                '/': () => {
                    console.log('Ruta: Home');
                    this.showHome();
                    this.scrollToTop();
                },
                '/blog': () => {
                    console.log('Ruta: Blog');
                    this.showBlog(1);
                    this.scrollToTop();
                },
                '/blog/pagina/:page': (params) => {
                    console.log('Ruta: Blog página', params.page);
                    this.showBlog(parseInt(params.page));
                    this.scrollToTop();
                },
                '/blog/:slug': (params) => {
                    console.log('Ruta: Post', params.slug);
                    this.showPost(params.slug);
                    this.scrollToTop();
                },
                '/sobre-mi': () => {
                    console.log('Ruta: Sobre mí');
                    this.showAbout();
                    this.scrollToTop();
                },
                '/contacto': () => {
                    console.log('Ruta: Contacto');
                    this.showContact();
                    this.scrollToTop();
                }
            })
            .resolve();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showHome() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
        <section class="hero-section">
        <div class="hero-background"></div>
        <div class="hero-stars"></div>
        <div class="hero-content">
            <h1 class="hero-title">Let's build from here</h1>
            <p class="hero-subtitle">
                El hogar de más de 100 millones de desarrolladores que trabajan juntos para dar forma al futuro del software.
            </p>
            <div class="hero-form">
                <input type="email" class="hero-input" placeholder="Email address">
                <button class="hero-button">Sign up for GitHub</button>
            </div>
            <div class="hero-stats">
                <div class="stat">100+ millones de repositorios</div>
                <div class="stat">90+ millones de desarrolladores</div>
                <div class="stat">4+ millones de organizaciones</div>
            </div>
        </div>
    </section>
        `;
        document.getElementById('pagination').innerHTML = '';
    }

    async showBlog(page = 1) {
        console.log('Cargando blog página:', page);
        const api = new BloggerAPI();
        const data = await api.getPosts(page);
        
        console.log('Posts recibidos:', data);
        
        const content = document.getElementById('page-content');
        const paginationContainer = document.getElementById('pagination');
        
        // Mostrar contenido
        if (!data.items || data.items.length === 0) {
            content.innerHTML = `
                <div class="page">
                    <h1>Blog</h1>
                    <p>No hay artículos disponibles en este momento.</p>
                </div>
            `;
            paginationContainer.innerHTML = '';
            return;
        }

        content.innerHTML = `
            <div class="blog-posts">
                ${data.items.map(post => `
                    <article class="post-card">
                        <img src="${api.extractFirstImage(post.content)}" alt="${post.title}">
                        <h2><a href="#/blog/${utils.slugify(post.title)}" data-navigo>${post.title}</a></h2>
                        <div class="post-meta">${utils.formatDate(post.published)}</div>
                        <div class="post-excerpt">${api.createExcerpt(post.content)}</div>
                    </article>
                `).join('')}
            </div>
        `;

        // Mostrar paginación
        let paginationHTML = '<div class="pagination">';
        
        // Botón Anterior
        if (page > 1) {
            paginationHTML += `
                <button onclick="window.router.router.navigate('/blog/pagina/${page - 1}')" 
                        class="pagination-link">← Anterior</button>
            `;
        }

        // Página actual
        paginationHTML += `
            <span class="pagination-link active">${page}</span>
        `;

        // Botón Siguiente
        if (data.hasNextPage) {
            paginationHTML += `
                <button onclick="window.router.router.navigate('/blog/pagina/${page + 1}')" 
                        class="pagination-link">Siguiente →</button>
            `;
        }

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;

        // Actualizar los enlaces después de cargar el contenido
        this.router.updatePageLinks();
    }

    async showPost(slug) {
        console.log('Cargando post con slug:', slug);
        const api = new BloggerAPI();
        let post = null;
        let page = 1;
        
        // Buscar el post en todas las páginas hasta encontrarlo
        while (!post) {
            const posts = await api.getPosts(page);
            if (!posts.items || posts.items.length === 0) break;
            
            post = posts.items.find(p => utils.slugify(p.title) === slug);
            if (!post && !posts.hasNextPage) break;
            page++;
        }

        const content = document.getElementById('page-content');
        document.getElementById('pagination').innerHTML = '';
        
        if (!post) {
            this.show404();
            return;
        }

        content.innerHTML = `
            <article class="single-post">
                <h1>${post.title}</h1>
                <div class="post-meta">${utils.formatDate(post.published)}</div>
                <div class="post-content">${post.content}</div>
                <p><button onclick="window.router.router.navigate('/blog')" class="pagination-link">← Volver al blog</button></p>
            </article>
        `;
    }

    showAbout() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
        <section class="about-section">
        <div class="background-grid"></div>
        <div class="about-container">
            <div class="section-header">
                <h2 class="section-title">Sobre Mí</h2>
            </div>

            <div class="about-grid">
                <div class="about-content">
                    <p class="about-text">
                        Soy un <span class="highlight">desarrollador web apasionado</span> con más de 5 años de experiencia 
                        en la creación de experiencias digitales únicas. Mi enfoque combina creatividad técnica 
                        con soluciones prácticas para construir aplicaciones web que no solo funcionan 
                        perfectamente, sino que también cautivan a los usuarios.
                    </p>

                    <p class="about-text">
                        Mi viaje en el desarrollo web comenzó con curiosidad y se convirtió en una 
                        pasión por crear soluciones innovadoras. Me especializo en arquitecturas frontend 
                        modernas y tengo un profundo interés en la <span class="highlight">experiencia de usuario</span>.
                    </p>

                    <div class="skills-grid">
                        <div class="skill-item">
                            Frontend Development
                        </div>
                        <div class="skill-item">
                            UI/UX Design
                        </div>
                        <div class="skill-item">
                            React & Next.js
                        </div>
                        <div class="skill-item">
                            Node.js
                        </div>
                    </div>

                    <div class="experience-list">
                        <div class="experience-item">
                            <h3 class="experience-title">Senior Frontend Developer</h3>
                            <div class="experience-date">2020 - Presente</div>
                            <p>Liderando el desarrollo de aplicaciones web escalables y mantenibles.</p>
                        </div>

                        <div class="experience-item">
                            <h3 class="experience-title">UI/UX Designer</h3>
                            <div class="experience-date">2018 - 2020</div>
                            <p>Diseño de interfaces intuitivas y experiencias de usuario memorables.</p>
                        </div>
                    </div>
                </div>

                <div class="about-image-container">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo7KPRp_aP1IEf7xGDxapy3cQMh46THb9HG-5PYkwnomKrXlerQE9JozfiTJRUOiP7Fp5XIeKwTKSXPEvyoXftgcRjak59f_s_EATeBQTRKWg5l_DzUrx8nP_RLlR7PTrwRsziNrdROjBrbMwnB6L3yh4eK0NUpSF4sYiybIn7q5u8sBUcaNrJe3Z3XPw/s650-rw/E-meeting%20with%20team@1x_resized.png" alt="Profile" class="about-image">
                    <div class="image-border"></div>
                </div>
            </div>
        </div>
    </section>
        `;
        document.getElementById('pagination').innerHTML = '';
    }

    showContact() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
        <section class="contact-section">
        <div class="contact-grid">
            <div class="contact-info">
                <h2 class="section-title">Contacto</h2>
                <p class="section-subtitle">
                    ¿Tienes un proyecto en mente? Ponte en contacto conmigo 
                    y hagamos algo increíble juntos.
                </p>

                <div class="contact-details">
                    <div class="contact-item">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        <div class="contact-text">
                            <a href="mailto:hello@ejemplo.com">hello@ejemplo.com</a>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <div class="contact-text">
                            123 Calle Ejemplo<br>
                            Ciudad, País 12345
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <div class="contact-text">
                            <a href="tel:+123456789">+1 (234) 567-89</a>
                        </div>
                    </div>
                </div>

                <div class="social-links">
                    <a href="#" class="social-link">Instagram</a>
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">LinkedIn</a>
                </div>
            </div>

            <div class="contact-form">
                <form>
                    <div class="form-group">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Asunto</label>
                        <input type="text" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Mensaje</label>
                        <textarea class="form-textarea" required></textarea>
                    </div>

                    <button type="submit" class="form-button">Enviar mensaje</button>
                </form>
            </div>
        </div>
    </section>
        `;
        document.getElementById('pagination').innerHTML = '';
    }

    show404() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page">
                <h1>Página no encontrada</h1>
                <p>Lo sentimos, la página que buscas no existe.</p>
                <p><button onclick="window.router.router.navigate('/')" class="pagination-link">Volver al inicio</button></p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
    }
}
