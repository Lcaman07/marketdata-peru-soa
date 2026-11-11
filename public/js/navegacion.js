
/**
 * MarketData Perú
 * Navegación dinámica del menú lateral
 */

document.addEventListener('DOMContentLoaded', () => {

    const enlaces = document.querySelectorAll(
        '.sidebar-nav a[href^="#"]'
    );

    function actualizarMenu() {

        const seccionActual =
            window.location.hash || '#dashboard';

        enlaces.forEach(enlace => {

            const activo =
                enlace.getAttribute('href') === seccionActual;

            // Resaltar la opción seleccionada
            enlace.classList.toggle('activo', activo);

            // Mejorar la accesibilidad del menú
            if (activo) {
                enlace.setAttribute('aria-current', 'location');
            } else {
                enlace.removeAttribute('aria-current');
            }

        });
    }

    // Actualizar al abrir la página
    actualizarMenu();

    // Actualizar cuando cambie la sección
    window.addEventListener('hashchange', actualizarMenu);

});
