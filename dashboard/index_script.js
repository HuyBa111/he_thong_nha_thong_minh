function navigateToPage(page) {
    window.location.href = `js/${page}`;
}

const ctx = document.getElementById('sensorChart').getContext('2d');
const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Nhiệt độ (°C)',
                borderColor: 'rgb(255, 99, 132)',
                data: []
            },
            {
                label: 'Độ ẩm (%)',
                borderColor: 'rgb(54, 162, 235)',
                data: []
            },
            {
                label: 'Cường độ sáng (Lux)',
                borderColor: 'rgb(75, 192, 192)',
                data: []
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function toggleLED(ledId, state) {
    const ledState = state ? 'on' : 'off';
    fetch(`http://localhost:4000/led/${ledId}/${ledState}`)
        .then(response => {
            if (response.ok) {
                console.log(`LED ${ledId} đã được chuyển sang ${ledState}`);
            } else {
                console.error('Không thể gửi trạng thái LED đến backend.');
            }
        })
        .catch(error => console.error('Lỗi:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('light_control').addEventListener('change', function () {
        toggleLED('led1', this.checked);
    });

    document.getElementById('fan').addEventListener('change', function () {
        toggleLED('led2', this.checked);
    });

    document.getElementById('ac').addEventListener('change', function () {
        toggleLED('led3', this.checked);
    });
});

function fetchSensorData() {
    fetch('http://localhost:3000/api/sensors')
        .then(response => response.json())
        .then(data => {
            document.getElementById('temperature').innerText = `${data[0].temperature}°C`;
            document.getElementById('humidity').innerText = `${data[0].humidity}%`;
            document.getElementById('light').innerText = `${data[0].light} Lux`;

            const time = new Date(data[0].timestamp).toLocaleTimeString();
            sensorChart.data.labels.push(time);
            sensorChart.data.datasets[0].data.push(data[0].temperature);
            sensorChart.data.datasets[1].data.push(data[0].humidity);
            sensorChart.data.datasets[2].data.push(data[0].light);
            if (sensorChart.data.labels.length > 15) {
                sensorChart.data.labels.shift();
                sensorChart.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }
            sensorChart.update();
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu cảm biến:', error));
}

setInterval(() => {
    fetchSensorData();
}, 2000);

fetchSensorData();
