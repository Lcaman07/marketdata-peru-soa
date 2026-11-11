
/**
 * MarketData Perú
 * Comparación de dos distritos con datos del INEI
 */

document.addEventListener('DOMContentLoaded', () => {

    const zonaA = {
        departamento: document.getElementById('comparar-departamento-a'),
        provincia: document.getElementById('comparar-provincia-a'),
        distrito: document.getElementById('comparar-distrito-a')
    };

    const zonaB = {
        departamento: document.getElementById('comparar-departamento-b'),
        provincia: document.getElementById('comparar-provincia-b'),
        distrito: document.getElementById('comparar-distrito-b')
    };

    const boton = document.getElementById('btn-comparar');
    const estado = document.getElementById('estado-comparacion');
    const canvas = document.getElementById('grafico-comparacion');

    if (!boton || !estado || !canvas) return;

    let versionConsulta = 0;

    const numero = valor =>
        Number(valor).toLocaleString('es-PE');

    async function consultar(url) {
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        return respuesta.json();
    }

    function llenar(selector, elementos, mensaje, seleccionado = '') {
        selector.replaceChildren(new Option(mensaje, ''));

        elementos.forEach(elemento => {
            selector.add(new Option(elemento.nombre, elemento.codigo));
        });

        selector.disabled = elementos.length === 0;

        if (seleccionado &&
            elementos.some(elemento => elemento.codigo === seleccionado)) {
            selector.value = seleccionado;
        }
    }

    function limpiarResultados() {
        versionConsulta++;

        document.getElementById('comparar-nombre-a').textContent =
            'Población Zona A';

        document.getElementById('comparar-nombre-b').textContent =
            'Población Zona B';

        document.getElementById('comparar-valor-a').textContent = '—';
        document.getElementById('comparar-valor-b').textContent = '—';
        document.getElementById('comparar-diferencia').textContent = '—';

        const anterior = Chart.getChart(canvas);

        if (anterior) anterior.destroy();
    }

    function actualizarBoton() {
        const codigoA = zonaA.distrito.value;
        const codigoB = zonaB.distrito.value;

        const valido = codigoA && codigoB && codigoA !== codigoB;

        boton.disabled = !valido;

        estado.textContent = valido
            ? 'Distritos seleccionados. Puedes realizar la comparación.'
            : 'Selecciona dos distritos diferentes para comparar.';
    }

    async function cargarDistritos(zona, codigoProvincia, inicial = '') {
        llenar(zona.distrito, [], 'Cargando distritos...');

        if (!codigoProvincia) return;

        try {
            const resultado = await consultar(
                `/api/territorio/provincias/${codigoProvincia}/distritos`
            );

            if (zona.provincia.value !== codigoProvincia) return;

            llenar(
                zona.distrito,
                resultado.distritos,
                'Selecciona un distrito',
                inicial
            );
        } catch (error) {
            console.error('Error al cargar distritos:', error);
            llenar(zona.distrito, [], 'Error al cargar distritos');
        }

        actualizarBoton();
    }

    async function cargarProvincias(
        zona, codigoDepartamento, inicialProvincia = '',
        inicialDistrito = ''
    ) {
        llenar(zona.provincia, [], 'Cargando provincias...');
        llenar(zona.distrito, [], 'Selecciona una provincia');

        if (!codigoDepartamento) return;

        try {
            const resultado = await consultar(
                `/api/territorio/departamentos/${codigoDepartamento}/provincias`
            );

            if (zona.departamento.value !== codigoDepartamento) return;

            llenar(
                zona.provincia,
                resultado.provincias,
                'Selecciona una provincia',
                inicialProvincia
            );

            if (inicialProvincia) {
                await cargarDistritos(
                    zona, inicialProvincia, inicialDistrito
                );
            }
        } catch (error) {
            console.error('Error al cargar provincias:', error);
            llenar(zona.provincia, [], 'Error al cargar provincias');
        }

        actualizarBoton();
    }

    function configurarEventos(zona) {
        zona.departamento.addEventListener('change', () => {
            limpiarResultados();
            actualizarBoton();
            cargarProvincias(zona, zona.departamento.value);
        });

        zona.provincia.addEventListener('change', () => {
            limpiarResultados();
            actualizarBoton();
            cargarDistritos(zona, zona.provincia.value);
        });

        zona.distrito.addEventListener('change', () => {
            limpiarResultados();
            actualizarBoton();
        });
    }

    async function iniciarZona(zona, inicial) {
        const resultado = await consultar(
            '/api/territorio/departamentos'
        );

        llenar(
            zona.departamento,
            resultado.departamentos,
            'Selecciona un departamento',
            inicial.departamento
        );

        await cargarProvincias(
            zona,
            inicial.departamento,
            inicial.provincia,
            inicial.distrito
        );
    }

    configurarEventos(zonaA);
    configurarEventos(zonaB);

    // Ejemplo inicial con distritos reales de Amazonas
    Promise.allSettled([
        iniciarZona(zonaA, {
            departamento: '01',
            provincia: '010100',
            distrito: '010101'
        }),
        iniciarZona(zonaB, {
            departamento: '01',
            provincia: '010100',
            distrito: '010108'
        })
    ]).then(resultados => {
        if (resultados.some(r => r.status === 'rejected')) {
            estado.textContent =
                'No se pudieron cargar todos los filtros territoriales.';
        } else {
            actualizarBoton();
        }
    });

    // Consultar el servicio REST de comparación
    boton.addEventListener('click', async () => {

        const codigoA = zonaA.distrito.value;
        const codigoB = zonaB.distrito.value;

        if (!codigoA || !codigoB || codigoA === codigoB) return;

        const consultaActual = ++versionConsulta;

        boton.disabled = true;
        estado.textContent = 'Comparando distritos...';

        try {
            const datos = await consultar(
                `/api/dashboard/comparar/${codigoA}/${codigoB}`
            );

            if (consultaActual !== versionConsulta) return;

            if (datos.estado !== 'COMPLETA') {
                throw new Error('La comparación no está completa');
            }

            document.getElementById('comparar-nombre-a').textContent =
                datos.distritoA.distrito;

            document.getElementById('comparar-nombre-b').textContent =
                datos.distritoB.distrito;

            document.getElementById('comparar-valor-a').textContent =
                numero(datos.distritoA.poblacion2026);

            document.getElementById('comparar-valor-b').textContent =
                numero(datos.distritoB.poblacion2026);

            document.getElementById('comparar-diferencia').textContent =
                numero(datos.comparacion.diferenciaHabitantes2026);

            const serie = datos.comparacion.evolucionAnual;

            const anterior = Chart.getChart(canvas);
            if (anterior) anterior.destroy();

            new Chart(canvas, {
                type: 'line',

                data: {
                    labels: serie.map(item => item.anio),
                    datasets: [
                        {
                            label: datos.distritoA.distrito,
                            data: serie.map(item => item.poblacionA),
                            borderColor: '#2563eb',
                            backgroundColor: '#2563eb',
                            borderWidth: 3,
                            tension: 0.25
                        },
                        {
                            label: datos.distritoB.distrito,
                            data: serie.map(item => item.poblacionB),
                            borderColor: '#f59e0b',
                            backgroundColor: '#f59e0b',
                            borderWidth: 3,
                            tension: 0.25
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: contexto =>
                                    `${contexto.dataset.label}: ` +
                                    `${numero(contexto.parsed.y)} habitantes`
                            }
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: valor => numero(valor)
                            }
                        }
                    }
                }
            });

            estado.textContent =
                'Comparación realizada con datos del INEI.';

        } catch (error) {
            console.error('Error en comparación:', error);

            if (consultaActual === versionConsulta) {
                limpiarResultados();
                estado.textContent =
                    'No se pudo completar la comparación. ' +
                    'Verifica que ambos distritos tengan datos poblacionales.';
            }
        } finally {
            if (consultaActual === versionConsulta) {
                boton.disabled = false;
            }
        }
    });

});
