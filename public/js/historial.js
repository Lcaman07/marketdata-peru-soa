
/**
 * MarketData Perú
 * Historial empresarial y del orquestador SOA
 */

document.addEventListener('DOMContentLoaded', () => {

    const cuerpo = document.getElementById(
        'tabla-historial-cuerpo'
    );

    const boton = document.getElementById(
        'btn-actualizar-historial'
    );

    const estado = document.getElementById(
        'estado-historial'
    );

const filtroTipo = document.getElementById(
    'filtro-tipo-historial'
);

const filtroEstado = document.getElementById(
    'filtro-estado-historial'
);

if (!cuerpo || !boton || !estado || !filtroTipo || !filtroEstado) return;
// Conservar los registros para filtrarlos sin consultar la API

let registrosCargados = [];

    // Mostrar cantidades en las tarjetas
    function mostrarCantidad(id, cantidad) {
        document.getElementById(id).textContent =
            new Intl.NumberFormat('es-PE').format(cantidad);
    }

    // Formato de fecha y hora de Perú
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

    // Consultar nuestras APIs
    async function consultar(url) {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        if (!Array.isArray(resultado.datos)) {
            throw new Error('Respuesta de historial inválida');
        }

        return resultado.datos;
    }

    // Crear una celda sin insertar HTML inseguro
    function crearCelda(fila, valor) {
        const celda = document.createElement('td');

        celda.textContent =
            valor === null || valor === undefined || valor === ''
                ? '—'
                : String(valor);

        fila.appendChild(celda);
    }

    // Dibujar los registros en la tabla
    function mostrarRegistros(registros) {
        cuerpo.replaceChildren();

        if (registros.length === 0) {
            const fila = document.createElement('tr');
            const celda = document.createElement('td');

            celda.colSpan = 7;
            celda.textContent = 'No hay registros disponibles.';

            fila.appendChild(celda);
            cuerpo.appendChild(fila);
            return;
        }

        registros.forEach(registro => {
            const fila = document.createElement('tr');

            crearCelda(fila, registro.id_consulta);
            crearCelda(fila, registro.tipo);
            crearCelda(fila, registro.ruc);
            crearCelda(fila, registro.ubigeo);
            crearCelda(fila, registro.estado);
            crearCelda(
                fila,
                formatearFecha(registro.fecha_consulta)
            );

            crearCelda(
                fila,
                registro.tiempo_respuesta_ms == null
                    ? '—'
                    : `${registro.tiempo_respuesta_ms} ms`
            );

            cuerpo.appendChild(fila);
        });
    }



function aplicarFiltro() {

    const tipoSeleccionado = filtroTipo.value;
    const estadoSeleccionado = filtroEstado.value;

    // Aplicar ambos filtros al mismo tiempo
    const registrosFiltrados = registrosCargados.filter(registro => {

        const coincideTipo =
            tipoSeleccionado === 'todos' ||
            registro.tipo === tipoSeleccionado;

        const coincideEstado =
            estadoSeleccionado === 'todos' ||
            registro.estado === estadoSeleccionado;

        return coincideTipo && coincideEstado;
    });

    // Actualizar la tabla
    mostrarRegistros(registrosFiltrados);

    // Mostrar cantidad de registros visibles
    estado.textContent =
        `Mostrando ${registrosFiltrados.length} de ` +
        `${registrosCargados.length} registros consultados.`;
}


    // Cargar y combinar ambos historiales
    async function cargarHistorial() {
        boton.disabled = true;
        boton.textContent = 'Actualizando...';

        estado.textContent = 'Cargando registros desde MySQL...';

        const resultados = await Promise.allSettled([
            consultar('/api/empresas/historial'),
            consultar('/api/orquestador/historial')
        ]);

        const empresarial = resultados[0];
        const orquestador = resultados[1];

        const registros = [];

        // Consultas empresariales
        if (empresarial.status === 'fulfilled') {
            empresarial.value.forEach(item => {
                registros.push({
                    ...item,
                    tipo: 'Empresarial',
                    ubigeo: null,
                    tiempo_respuesta_ms: null
                });
            });

            mostrarCantidad(
                'historial-empresariales',
                empresarial.value.length
            );
        } else {
            document.getElementById(
                'historial-empresariales'
            ).textContent = '—';

            console.error(
                'Error historial empresarial:',
                empresarial.reason
            );
        }

        // Análisis integrados del orquestador
        if (orquestador.status === 'fulfilled') {
            orquestador.value.forEach(item => {
                registros.push({
                    ...item,
                    tipo: 'Orquestador SOA'
                });
            });

            mostrarCantidad(
                'historial-orquestador',
                orquestador.value.length
            );
        } else {
            document.getElementById(
                'historial-orquestador'
            ).textContent = '—';

            console.error(
                'Error historial SOA:',
                orquestador.reason
            );
        }

        // Ordenar del registro más reciente al más antiguo
        registros.sort((a, b) =>
            new Date(b.fecha_consulta).getTime() -
            new Date(a.fecha_consulta).getTime()
        );

registrosCargados = registros;
aplicarFiltro();

        const errores = resultados.filter(
            resultado => resultado.status === 'rejected'
        ).length;

        if (errores === 0) {
            mostrarCantidad('historial-total', registros.length);
        } else {
            document.getElementById(
                'historial-total'
            ).textContent = '—';

            estado.textContent = errores === 2
                ? 'No se pudieron cargar los historiales.'
                : 'Historial parcialmente disponible. ' +
                  'Uno de los servicios no respondió.';
        }

        boton.disabled = false;
        boton.textContent = 'Actualizar historial';
    }

    // Actualizar sin recargar toda la página
    boton.addEventListener('click', cargarHistorial);
// Filtrar sin realizar otra consulta a MySQL
filtroTipo.addEventListener('change', aplicarFiltro);
// Filtrar también por estado
filtroEstado.addEventListener('change', aplicarFiltro);

// Actualizar al seleccionar Historial en el menú lateral
const enlaceHistorial = document.querySelector(
    '.sidebar-nav a[href="#historial"]'
);

if (enlaceHistorial) {
    enlaceHistorial.addEventListener('click', () => {
        cargarHistorial();
    });
}

    // Primera carga automática
    cargarHistorial();

});
