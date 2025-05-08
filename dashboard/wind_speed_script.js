const windSpeedElement = document.getElementById('windSpeed');
const ledIndicator = document.getElementById('ledIndicator');
const ctx = document.getElementById('windSpeedChart').getContext('2d');

// Initialize the Chart.js chart
const windSpeedChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'Tốc độ gió (m/s)',
            data: [],
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Tốc độ gió (m/s)'
                },
                beginAtZero: true
            }
        }
    }
});

// Fetch data from the API and update the UI
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/sensors');
        const sensorData = await response.json();

        // Assuming the data is an array, use the latest record
        const latestData = sensorData[sensorData.length - 1];
        const windSpeed = latestData.wind_speed;
        const timestamp = new Date(latestData.timestamp).toLocaleTimeString();

        // Update the displayed wind speed
        windSpeedElement.textContent = `Tốc độ gió: ${windSpeed} m/s`;

        // Update the chart
        windSpeedChart.data.labels.push(timestamp);
        windSpeedChart.data.datasets[0].data.push(windSpeed);
        windSpeedChart.update();

        // Update LED indicator
        if (windSpeed > 50) { // Example condition for LED status
            ledIndicator.classList.add('led-on');
            ledIndicator.classList.remove('led-off');
        } else {
            ledIndicator.classList.add('led-off');
            ledIndicator.classList.remove('led-on');
        }

        // Keep the chart data limited to 10 points
        if (windSpeedChart.data.labels.length > 10) {
            windSpeedChart.data.labels.shift();
            windSpeedChart.data.datasets[0].data.shift();
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch data every 2 seconds
setInterval(fetchData, 2000);
