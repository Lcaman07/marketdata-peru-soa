
/**
 * MarketData Perú
 * Bitácora de integración del Servicio Empresarial
 */

document.addEventListener('DOMContentLoaded', () => {

    const cuerpo = document.getElementById(
        'tabla-bitacora-cuerpo'
    );

    const boton = document.getElementById(
        'btn-actualizar-bitacora'
    );

    const estado = document.getElementById(
        'estado-bitacora'
    );

    if (!cuerpo || !boton || !estado) return;

    function mostrarValor(id, valor) {
        document.getElementById(id).textContent = valor;
    }

    function formatearFecha(fecha) {
        if (!fecha) return '—';

        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) return '—';

        return new Intl.DateTimeFormat('es-PE', {
            timeZone: 'America/Lima',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(valor);
    }

    function crearCelda(fila, valor) {
        const celda = document.createElement('td');

        celda.textContent =
            valor === null ||
            valor === undefined ||
            valor === ''
                ? '—'
                : String(valor);

        fila.appendChild(celda);
    }

    // Mostrar los registros en la tabla
    function mostrarRegistros(registros) {
        cuerpo.replaceChildren();

        if (registros.length === 0) {
            const fila = document.createElement('tr');
            const celda = document.createElement('td');

            celda.colSpan = 10;
            celda.textContent =
                'No hay operaciones registradas.';

            fila.appendChild(celda);
            cuerpo.appendChild(fila);
            return;
        }

        registros.forEach(registro => {
            const fila = document.createElement('tr');

            crearCelda(fila, registro.id_bitacora);
            crearCelda(fila, registro.servicio);
            crearCelda(fila, registro.operacion);
            crearCelda(fila, registro.ruc);
            crearCelda(fila, registro.tipo_acceso);
            crearCelda(fila, registro.estado);
            crearCelda(fila, registro.codigo_http);

            crearCelda(
                fila,
                registro.tiempo_respuesta_ms == null
                    ? '—'
                    : `${registro.tiempo_respuesta_ms} ms`
            );

            crearCelda(
                fila,
                formatearFecha(registro.fecha_evento)
            );

            crearCelda(fila, registro.mensaje);

            cuerpo.appendChild(fila);
        });
    }

    // Actualizar los indicadores
    function mostrarIndicadores(registros) {

        const total = registros.length;

        const exitos = registros.filter(
            item => item.estado === 'EXITO'
        ).length;

        const errores = registros.filter(
            item => item.estado === 'ERROR'
        ).length;

        // Promedio calculado solo con tiempos válidos
        const tiempos = registros
            .map(item => Number(item.tiempo_respuesta_ms))
            .filter((valor, indice) =>
                registros[indice].tiempo_respuesta_ms != null &&
                Number.isFinite(valor) &&
                valor >= 0
            );

        const promedio = tiempos.length > 0
            ? tiempos.reduce((suma, valor) => suma + valor, 0)
                / tiempos.length
            : null;

        mostrarValor('bitacora-total', total);
        mostrarValor('bitacora-exitos', exitos);
        mostrarValor('bitacora-errores', errores);

        mostrarValor(
            'bitacora-tiempo',
            promedio === null
                ? '—'
                : `${promedio.toFixed(1)} ms`
        );
    }

    // Recuperar los registros desde MySQL
    async function cargarBitacora() {

        boton.disabled = true;
        boton.textContent = 'Actualizando...';

        estado.textContent =
            'Cargando operaciones desde MySQL...';

        try {
            const respuesta = await fetch(
                '/api/empresas/bitacora'
            );

            if (!respuesta.ok) {
                throw new Error(
                    `Error HTTP ${respuesta.status}`
                );
            }

            const resultado = await respuesta.json();

            if (!Array.isArray(resultado.datos)) {
                throw new Error(
                    'La API no devolvió una lista válida.'
                );
            }

            const registros = resultado.datos;

            mostrarIndicadores(registros);
            mostrarRegistros(registros);

            estado.textContent =
                `${registros.length} operaciones cargadas correctamente.`;

        } catch (error) {
            console.error('Error al cargar bitácora:', error);

            estado.textContent =
                'No se pudo cargar la bitácora de integración.';

            ['bitacora-total', 'bitacora-exitos',
             'bitacora-errores', 'bitacora-tiempo']
                .forEach(id => mostrarValor(id, '—'));

            mostrarRegistros([]);

        } finally {
            boton.disabled = false;
            boton.textContent = 'Actualizar bitácora';
        }
    }

    boton.addEventListener('click', cargarBitacora);

    // Cargar automáticamente al abrir la página
    cargarBitacora();

});
