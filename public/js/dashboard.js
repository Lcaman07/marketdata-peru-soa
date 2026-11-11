
/**
 * MarketData Perú
 * Indicadores dinámicos del dashboard
 */

// Consultar nuestras APIs REST
async function obtenerDatos(url) {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
}

// Mostrar los valores en las tarjetas
function mostrarNumero(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento && valor !== null &&
        valor !== undefined && Number.isFinite(Number(valor))) {

        elemento.textContent =
            new Intl.NumberFormat('es-PE').format(Number(valor));
    }
}

// Cargar los indicadores desde nuestros servicios
async function cargarIndicadores() {

    const estado = document.getElementById('estado-indicadores');

    const resultados = await Promise.allSettled([
        obtenerDatos('/api/dashboard/indicadores'),
        obtenerDatos('/api/dashboard/territorio')
    ]);

    // Indicadores empresariales - SUNAT
    if (resultados[0].status === 'fulfilled') {
        const datos = resultados[0].value.datos;

        mostrarNumero(
            'total-contribuyentes',
            datos.contribuyentesImportados
        );

        mostrarNumero('total-activos', datos.activos);
        mostrarNumero('total-habidos', datos.habidos);
        mostrarNumero('total-ubigeo', datos.conUbigeo);
    }

    // Indicadores territoriales - INEI
    if (resultados[1].status === 'fulfilled') {
        const datos = resultados[1].value.datos;

        mostrarNumero(
            'total-departamentos',
            datos.departamentosYCallao
        );
    }

    const errores = resultados.filter(
        resultado => resultado.status === 'rejected'
    );

    estado.textContent = errores.length === 0
        ? 'Indicadores actualizados correctamente.'
        : 'Algunos indicadores no pudieron cargarse.';
}

// Ejecutar cuando abra la página
document.addEventListener('DOMContentLoaded', cargarIndicadores);
