
/**
 * MarketData Perú
 * Integración de los servicios territoriales y empresariales
 * mediante el orquestador SOA
 */

document.addEventListener('DOMContentLoaded', () => {

    const formulario = document.getElementById('form-analisis-soa');
    const inputUbigeo = document.getElementById('soa-ubigeo');
    const inputRuc = document.getElementById('soa-ruc');
    const boton = document.getElementById('btn-analizar-soa');
    const estado = document.getElementById('estado-analisis-soa');
    const contenedor = document.getElementById('resultado-analisis-soa');

    if (!formulario || !inputUbigeo || !inputRuc ||
        !boton || !estado || !contenedor) {
        return;
    }

    // Mostrar valores numéricos
    function formatoNumero(valor) {
        if (valor === null || valor === undefined) {
            return 'No disponible';
        }

        const numero = Number(valor);

        return Number.isFinite(numero)
            ? numero.toLocaleString('es-PE')
            : 'No disponible';
    }

    // Mostrar resultados sin insertar HTML dinámico
    function mostrarTexto(id, valor) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // Procesar la respuesta del orquestador
    function mostrarResultado(resultado) {

        const datosTerritoriales =
            resultado.territorial?.datos?.datos;

        const respuestaEmpresarial =
            resultado.empresarial;

        const datosEmpresariales =
            respuestaEmpresarial?.datos?.datos;

        // Estado general del análisis
        mostrarTexto(
            'soa-estado',
            resultado.estado || 'No disponible'
        );

        // Distrito recuperado del INEI
        mostrarTexto(
            'soa-distrito',
            datosTerritoriales?.distrito || 'No disponible'
        );

        // Población proyectada
        mostrarTexto(
            'soa-poblacion',
            formatoNumero(
                datosTerritoriales?.poblacion?.proyectada2026
            )
        );

        // Estado del contribuyente
        let estadoEmpresarial = 'No disponible';

        if (respuestaEmpresarial?.codigoHttp === 404) {
            estadoEmpresarial = 'No encontrado en muestra local';
        } else if (datosEmpresariales?.estado) {
            estadoEmpresarial = datosEmpresariales.estado;
        }

        mostrarTexto('soa-empresa', estadoEmpresarial);

        // Resultado de la comparación geográfica
        const mensaje = resultado.comparacion?.mensaje ||
            'No hay información de comparación disponible.';

        mostrarTexto('soa-mensaje', mensaje);

// Resultado del servicio oficial INEI WFS
const respuestaIneiWfs = resultado.ineiEnLinea;

const datosIneiWfs =
    respuestaIneiWfs?.datos?.datos;

const consultaWfsCorrecta =
    respuestaIneiWfs?.codigoHttp === 200 &&
    datosIneiWfs?.ubigeo === resultado.consulta?.ubigeo;

let mensajeIneiWfs;

if (consultaWfsCorrecta) {
    mensajeIneiWfs =
        `INEI WFS en línea: ${datosIneiWfs.nombre} ` +
        `(UBIGEO ${datosIneiWfs.ubigeo}). ` +
        'Consulta oficial realizada correctamente.';
} else {
    mensajeIneiWfs =
        'INEI WFS en línea: información no disponible ' +
        'para este análisis.';
}

mostrarTexto('soa-inei-wfs', mensajeIneiWfs);


        // Mostrar las tarjetas
        contenedor.hidden = false;
    }

    // Ejecutar análisis desde el formulario
    formulario.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const ubigeo = inputUbigeo.value.trim();
        const ruc = inputRuc.value.trim();

        // Validación de UBIGEO
        if (!/^\d{6}$/.test(ubigeo)) {
            estado.textContent =
                'El UBIGEO debe contener 6 dígitos.';

            contenedor.hidden = true;
            return;
        }

        // Validación de RUC
        if (!/^\d{11}$/.test(ruc)) {
            estado.textContent =
                'El RUC debe contener 11 dígitos.';

            contenedor.hidden = true;
            return;
        }

        // Preparar la consulta
        boton.disabled = true;
        boton.textContent = 'Analizando...';

        estado.textContent =
            'Consultando los servicios territoriales y empresariales...';

        contenedor.hidden = true;

        try {
            const respuesta = await fetch(
                `/api/orquestador/analisis/${encodeURIComponent(ubigeo)}/${encodeURIComponent(ruc)}`
            );


// Actualizar el historial y la bitácora después del análisis SOA
document.getElementById('btn-actualizar-historial')?.click();
document.getElementById('btn-actualizar-bitacora')?.click();

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje ||
                    'No se pudo completar el análisis integrado.'
                );
            }

            mostrarResultado(resultado);

if (resultado.estado === 'COMPLETA') {
    estado.textContent =
        'Los tres servicios respondieron correctamente.';
} else if (resultado.estado === 'PARCIAL') {
    estado.textContent =
        'Análisis parcial: al menos uno de los tres ' +
        'servicios no devolvió información completa.';
            } else {
                estado.textContent =
                    'El análisis finalizó con estado: ' +
                    resultado.estado;
            }

        } catch (error) {
            console.error('Error de integración SOA:', error);

            contenedor.hidden = true;

            estado.textContent =
                error.message || 'Error al consultar el orquestador.';

        } finally {
            boton.disabled = false;
            boton.textContent = 'Ejecutar análisis';
        }
    });

});
