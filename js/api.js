class BloggerAPI {
    constructor() {
        this.API_KEY = CONFIG.BLOGGER.API_KEY;
        this.BLOG_ID = CONFIG.BLOGGER.BLOG_ID;
        this.BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${this.BLOG_ID}`;
        this.POSTS_PER_PAGE = 10;
        this.cache = new Map();
        this.pageTokens = [''];  // Primer token vacío para la primera página
        this.previousState = null; // Almacena el estado anterior
    }

    saveCurrentState() {
        this.previousState = {
            cache: new Map(this.cache),
            pageTokens: [...this.pageTokens]
        };
    }

    rollbackToPreviousState() {
        if (this.previousState) {
            this.cache = new Map(this.previousState.cache);
            this.pageTokens = [...this.previousState.pageTokens];
            return true;
        }
        return false;
    }

    async getPosts(page = 1) {
        const cacheKey = `posts_page_${page}`;
        
        // Guardar estado actual antes de hacer cambios
        this.saveCurrentState();
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Asegurarnos de tener el token para la página solicitada
            await this.ensurePageToken(page);
            
            const pageToken = this.pageTokens[page - 1];
            const url = `${this.BASE_URL}/posts?key=${this.API_KEY}&maxResults=${this.POSTS_PER_PAGE}${pageToken ? '&pageToken=' + pageToken : ''}`;
            
            console.log('Fetching posts from:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            
            const data = await response.json();
            
            if (!data.items && page === 1) {
                throw new Error('No se encontraron posts');
            }

            // Guardar el token para la siguiente página
            if (data.nextPageToken && !this.pageTokens.includes(data.nextPageToken)) {
                this.pageTokens.push(data.nextPageToken);
            }

            const result = {
                items: data.items || [],
                totalItems: data.items?.length || 0,
                currentPage: page,
                totalPages: this.pageTokens.length,
                hasNextPage: !!data.nextPageToken
            };
            
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error fetching posts:', error);
            // Intentar rollback al estado anterior
            if (this.rollbackToPreviousState()) {
                console.log('Rollback exitoso al estado anterior');
                return this.cache.get(cacheKey) || {
                    items: [],
                    totalItems: 0,
                    currentPage: page,
                    totalPages: 1,
                    hasNextPage: false,
                    error: error.message
                };
            }
            return {
                items: [],
                totalItems: 0,
                currentPage: page,
                totalPages: 1,
                hasNextPage: false,
                error: error.message
            };
        }
    }

    async ensurePageToken(targetPage) {
        if (this.pageTokens.length >= targetPage) {
            return;
        }

        let currentPage = this.pageTokens.length;
        let lastToken = this.pageTokens[currentPage - 1];

        while (currentPage < targetPage) {
            const url = `${this.BASE_URL}/posts?key=${this.API_KEY}&maxResults=${this.POSTS_PER_PAGE}${lastToken ? '&pageToken=' + lastToken : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.nextPageToken) {
                break;
            }

            this.pageTokens.push(data.nextPageToken);
            lastToken = data.nextPageToken;
            currentPage++;
        }
    }

    extractFirstImage(content) {
        if (!content) return 'https://via.placeholder.com/800x400';
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const match = content.match(imgRegex);
        return match ? match[1] : 'https://via.placeholder.com/800x400';
    }

    createExcerpt(content, length = 150) {
        if (!content) return '';
        const div = document.createElement('div');
        div.innerHTML = content;
        const text = div.textContent || div.innerText;
        return text.substring(0, length) + '...';
    }
}
