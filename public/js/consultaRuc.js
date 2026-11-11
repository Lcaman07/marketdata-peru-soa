
/**
 * MarketData Perú
 * Consulta empresarial del padrón reducido SUNAT
 */

document.addEventListener('DOMContentLoaded', () => {

    const formulario =
        document.getElementById('form-consulta-ruc');

    const input =
        document.getElementById('input-ruc');

    const boton =
        document.getElementById('btn-consultar-ruc');

    const estadoConsulta =
        document.getElementById('estado-consulta-ruc');

    const ficha =
        document.getElementById('resultado-ruc');

    if (!formulario || !input || !boton ||
        !estadoConsulta || !ficha) return;

    // Mostrar un dato o indicar que no está disponible
    function valorDisponible(valor) {
        return valor === null ||
               valor === undefined ||
               String(valor).trim() === ''
            ? 'No disponible'
            : String(valor);
    }

    // Completar la ficha con información de nuestra API
    function mostrarEmpresa(datos) {

        document.getElementById('ruc-razon-social').textContent =
            valorDisponible(datos.razon_social);

        document.getElementById('ruc-numero').textContent =
            `RUC: ${valorDisponible(datos.ruc)}`;

        document.getElementById('ruc-estado').textContent =
            valorDisponible(datos.estado);

        document.getElementById('ruc-detalle').textContent =
            valorDisponible(datos.ruc);

        document.getElementById('ruc-estado-detalle').textContent =
            valorDisponible(datos.estado);

        document.getElementById('ruc-condicion').textContent =
            valorDisponible(datos.condicion);

        document.getElementById('ruc-ubigeo').textContent =
            valorDisponible(datos.ubigeo);

        ficha.hidden = false;
    }

    // Consultar el RUC ingresado
    formulario.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const ruc = input.value.trim();

        // Validar que tenga exactamente 11 dígitos
        if (!/^\d{11}$/.test(ruc)) {
            estadoConsulta.textContent =
                'Ingresa un RUC de 11 dígitos numéricos.';

            ficha.hidden = true;
            return;
        }

        ficha.hidden = true;
        boton.disabled = true;
        boton.textContent = 'Consultando...';

        estadoConsulta.textContent =
            'Buscando información en nuestra base de datos...';

        try {
            const respuesta = await fetch(
                `/api/empresas/ruc/${encodeURIComponent(ruc)}`
            );

            if (respuesta.status === 400) {
                throw new Error(
                    'El número de RUC no es válido.'
                );
            }

            if (respuesta.status === 404) {
                throw new Error(
                    'El RUC no se encuentra en los registros ' +
                    'importados en MySQL. Esto no significa ' +
                    'que no exista en SUNAT.'
                );
            }

            if (!respuesta.ok) {
                throw new Error(
                    'No se pudo completar la consulta empresarial.'
                );
            }

            const resultado = await respuesta.json();

            if (!resultado.datos) {
                throw new Error(
                    'El servicio no devolvió información empresarial.'
                );
            }

            mostrarEmpresa(resultado.datos);

            estadoConsulta.textContent =
                'Consulta realizada correctamente ' +
                'con la información local de SUNAT.';

        } catch (error) {
            console.error('Error en consulta RUC:', error);

            ficha.hidden = true;

            estadoConsulta.textContent =
                error.message;
        } finally {
            boton.disabled = false;
            boton.textContent = 'Consultar RUC';
        }
    });

});
