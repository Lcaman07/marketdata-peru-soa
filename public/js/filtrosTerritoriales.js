
/**
 * MarketData Perú
 * Filtros territoriales con información del INEI
 */

document.addEventListener('DOMContentLoaded', async () => {

    const departamento =
        document.getElementById('filtro-departamento');

    const provincia =
        document.getElementById('filtro-provincia');

    const distrito =
        document.getElementById('filtro-distrito');

    if (!departamento || !provincia || !distrito) return;

    // Ubicación inicial: Chachapoyas, Amazonas
    const ubicacionInicial = {
        departamento: '01',
        provincia: '010100',
        distrito: '010101'
    };

    // Consultar los servicios territoriales
    async function consultarAPI(url) {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        return respuesta.json();
    }

    // Llenar un selector con información real
    function llenarSelector(
        selector,
        elementos,
        mensaje,
        valorInicial = ''
    ) {
        selector.replaceChildren(new Option(mensaje, ''));

        elementos.forEach(elemento => {
            const opcion = new Option(
                elemento.nombre,
                elemento.codigo
            );

            selector.add(opcion);
        });

        selector.disabled = elementos.length === 0;

        if (elementos.some(
            elemento => elemento.codigo === valorInicial
        )) {
            selector.value = valorInicial;
        }
    }

    // Cargar las provincias de un departamento
    async function cargarProvincias(
        codigoDepartamento,
        valorInicial = ''
    ) {
        llenarSelector(
            provincia, [], 'Cargando provincias...'
        );

        llenarSelector(
            distrito, [], 'Selecciona una provincia'
        );

        if (!codigoDepartamento) return;

        try {
            const resultado = await consultarAPI(
                `/api/territorio/departamentos/${codigoDepartamento}/provincias`
            );

            // Evitar mostrar una respuesta de otra selección
            if (departamento.value !== codigoDepartamento) return;

            llenarSelector(
                provincia,
                resultado.provincias,
                'Selecciona una provincia',
                valorInicial
            );

        } catch (error) {
            console.error('Error al cargar provincias:', error);

            if (departamento.value === codigoDepartamento) {
                llenarSelector(
                    provincia, [], 'Error al cargar provincias'
                );
            }
        }
    }

    // Cargar distritos de una provincia
    async function cargarDistritos(
        codigoProvincia,
        valorInicial = ''
    ) {
        llenarSelector(
            distrito, [], 'Cargando distritos...'
        );

        if (!codigoProvincia) return;

        try {
            const resultado = await consultarAPI(
                `/api/territorio/provincias/${codigoProvincia}/distritos`
            );

            if (provincia.value !== codigoProvincia) return;

            llenarSelector(
                distrito,
                resultado.distritos,
                'Selecciona un distrito',
                valorInicial
            );

        } catch (error) {
            console.error('Error al cargar distritos:', error);

            if (provincia.value === codigoProvincia) {
                llenarSelector(
                    distrito, [], 'Error al cargar distritos'
                );
            }
        }
    }

    // Cuando cambia el departamento
    departamento.addEventListener('change', async () => {
        await cargarProvincias(departamento.value);
    });

    // Cuando cambia la provincia
    provincia.addEventListener('change', async () => {
        await cargarDistritos(provincia.value);
    });

    // Cuando cambia el distrito, actualizar el gráfico
    distrito.addEventListener('change', () => {
        if (distrito.value) {
            cargarGraficoPoblacion(distrito.value);
        }
    });

    // Cargar departamentos al abrir el dashboard
    try {
        const resultado = await consultarAPI(
            '/api/territorio/departamentos'
        );

        llenarSelector(
            departamento,
            resultado.departamentos,
            'Selecciona un departamento',
            ubicacionInicial.departamento
        );

        // Mantener Chachapoyas seleccionado inicialmente
        await cargarProvincias(
            ubicacionInicial.departamento,
            ubicacionInicial.provincia
        );

        await cargarDistritos(
            ubicacionInicial.provincia,
            ubicacionInicial.distrito
        );

    } catch (error) {
        console.error('Error al cargar departamentos:', error);

        llenarSelector(
            departamento, [], 'Error al cargar departamentos'
        );
    }

});
