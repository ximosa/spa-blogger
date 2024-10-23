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
            <div class="page">
                <h1>Bienvenidos a mi sitio</h1>
                <p>Esta es la página principal donde podrás encontrar información sobre mí y mis últimos artículos.</p>
            </div>
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
            <div class="page">
                <h1>Sobre Mí</h1>
                <p>Aquí puedes escribir información sobre ti y tu experiencia.</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
    }

    showContact() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="page">
                <h1>Contacto</h1>
                <form class="contact-form" onsubmit="event.preventDefault();">
                    <input type="text" placeholder="Nombre" required>
                    <input type="email" placeholder="Email" required>
                    <textarea placeholder="Mensaje" rows="5" required></textarea>
                    <button type="submit">Enviar Mensaje</button>
                </form>
            </div>
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
