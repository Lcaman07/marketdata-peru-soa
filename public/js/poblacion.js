
/**
 * MarketData Perú
 * Gráfico poblacional con datos oficiales del INEI
 */

async function cargarGraficoPoblacion(ubigeo = '010101') {

    const nombreDistrito =
        document.getElementById('nombre-distrito');

    const poblacion2026 =
        document.getElementById('poblacion-2026');

    const canvas =
        document.getElementById('grafico-poblacion');

    if (!canvas) return;

    try {
        // Consultar la población del distrito seleccionado
        const respuesta = await fetch(
            `/api/dashboard/poblacion/${encodeURIComponent(ubigeo)}`
        );

        if (!respuesta.ok) {
            throw new Error('No se pudo consultar la API del INEI');
        }

        const resultado = await respuesta.json();
        const datos = resultado.datos;
        const poblacion = datos.poblacion;

        // Mostrar información del distrito
        nombreDistrito.textContent =
            `${datos.distrito}, ${datos.departamento}`;

        poblacion2026.textContent =
            Number(poblacion.proyectada2026)
                .toLocaleString('es-PE');

        // Preparar la serie anual
        const serie = Object.entries(poblacion.serieAnual)
            .sort(([anioA], [anioB]) =>
                Number(anioA) - Number(anioB)
            );

        const anios = serie.map(([anio]) => anio);

        const habitantes = serie.map(
            ([, cantidad]) => Number(cantidad)
        );

        // Eliminar el gráfico anterior antes de actualizarlo
        const graficoAnterior = Chart.getChart(canvas);

        if (graficoAnterior) {
            graficoAnterior.destroy();
        }

        // Crear el gráfico interactivo
        new Chart(canvas, {
            type: 'line',

            data: {
                labels: anios,
                datasets: [{
                    label: 'Población proyectada',
                    data: habitantes,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.10)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#2563eb',
                    tension: 0.3,
                    fill: true
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: 'index'
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(contexto) {
                                const valor =
                                    contexto.parsed.y.toLocaleString('es-PE');

                                return `${valor} habitantes`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(valor) {
                                return Number(valor)
                                    .toLocaleString('es-PE');
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error gráfico INEI:', error);

        nombreDistrito.textContent =
            'No se pudo cargar la información poblacional.';

        poblacion2026.textContent = '—';

        const graficoAnterior = Chart.getChart(canvas);

        if (graficoAnterior) {
            graficoAnterior.destroy();
        }
    }
}

// Mostrar Chachapoyas al abrir inicialmente el dashboard
document.addEventListener(
    'DOMContentLoaded',
    () => cargarGraficoPoblacion()
);
