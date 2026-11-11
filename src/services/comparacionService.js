
const {
    validarUbigeo,
    consultarUbigeo
} = require('./territorialService');

function compararDistritos(ubigeoA, ubigeoB) {

    // Validar ambos códigos
    if (!validarUbigeo(ubigeoA) ||
        !validarUbigeo(ubigeoB)) {
        throw new Error(
            'Ambos UBIGEO deben contener 6 dígitos'
        );
    }

    if (ubigeoA === ubigeoB) {
        throw new Error(
            'Selecciona dos distritos diferentes'
        );
    }

    // Recuperar datos oficiales del INEI
    const distritoA = consultarUbigeo(ubigeoA);
    const distritoB = consultarUbigeo(ubigeoB);

    if (!distritoA || !distritoB) {
        throw new Error(
            'Uno de los distritos no existe en el catálogo INEI'
        );
    }

    const poblacionA = distritoA.poblacion?.proyectada2026;
    const poblacionB = distritoB.poblacion?.proyectada2026;

    const disponibles =
        Number.isFinite(poblacionA) &&
        Number.isFinite(poblacionB);

    // Comparar la evolución anual
    const serieA = distritoA.poblacion?.serieAnual || {};
    const serieB = distritoB.poblacion?.serieAnual || {};

    const evolucionAnual = Object.keys(serieA)
        .filter(anio =>
            Number.isFinite(serieA[anio]) &&
            Number.isFinite(serieB[anio])
        )
        .sort()
        .map(anio => ({
            anio,
            poblacionA: serieA[anio],
            poblacionB: serieB[anio]
        }));

    return {
        estado: disponibles ? 'COMPLETA' : 'PARCIAL',
        fuente: 'INEI - Proyecciones de población',

        distritoA: {
            ubigeo: distritoA.ubigeo,
            departamento: distritoA.departamento,
            provincia: distritoA.provincia,
            distrito: distritoA.distrito,
            poblacion2026: poblacionA ?? null
        },

        distritoB: {
            ubigeo: distritoB.ubigeo,
            departamento: distritoB.departamento,
            provincia: distritoB.provincia,
            distrito: distritoB.distrito,
            poblacion2026: poblacionB ?? null
        },

        comparacion: {
            diferenciaHabitantes2026: disponibles
                ? poblacionA - poblacionB
                : null,
            evolucionAnual
        }
    };
}

module.exports = {
    compararDistritos
};
