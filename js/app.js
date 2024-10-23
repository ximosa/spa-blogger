document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el router
    window.router = new Router();

    // Manejar clicks en enlaces
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-navigo]');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            console.log('Navegando a:', href);
            window.router.router.navigate(href);
        }
    });

    // Manejar navegación con el botón atrás del navegador
    window.addEventListener('popstate', () => {
        console.log('Navegación popstate');
        window.router.router.resolve();
    });
});
