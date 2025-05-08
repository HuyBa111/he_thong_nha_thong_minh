let sensorDataCache = [];
let filteredDataCache = [];
let currentPage = 1;
const rowsPerPage = 50;
let isSearching = false;

function fetchAndDisplaySensorData() {
    if (isSearching) return; 

    fetch('http://localhost:3000/api/sensors')
        .then(response => response.json())
        .then(data => {
            sensorDataCache = data; 
            filteredDataCache = [...sensorDataCache]; 
            displayDataForPage(currentPage); 
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayDataForPage(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const dataToDisplay = filteredDataCache.slice(startIndex, endIndex);

    const tableBody = document.getElementById('sensorDataTable');
    tableBody.innerHTML = '';

    if (dataToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Không tìm thấy dữ liệu phù hợp</td></tr>';
    } else {
        dataToDisplay.forEach(row => {
            const tr = document.createElement('tr');

            const formattedTime = new Date(row.timestamp).toLocaleString();
            tr.innerHTML = `
                <td>${formattedTime}</td>
                <td>${row.temperature}</td>
                <td>${row.humidity}</td>
                <td>${row.light}</td>
                <td>${row.wind_speed}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    const totalPages = Math.ceil(filteredDataCache.length / rowsPerPage);
    document.getElementById('pageInfo').textContent = `Trang ${currentPage}/${totalPages}`;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredDataCache.length / rowsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayDataForPage(currentPage);
    }
}

function searchByCriteria() {
    const searchValue = document.getElementById('search-value').value;
    const searchCriteria = document.getElementById('search-criteria').value;

    isSearching = true;

    filteredDataCache = sensorDataCache.filter(row => {
        switch (searchCriteria) {
            case 'time':
                return new Date(row.timestamp).toLocaleString().includes(searchValue);
            case 'temperature':
                return row.temperature.toString().includes(searchValue);
            case 'humidity':
                return row.humidity.toString().includes(searchValue);
            case 'light':
                return row.light.toString().includes(searchValue);
            case 'wind_speed':
                return row.wind_speed.toString().includes(searchValue);
            default:
                return false;
        }
    });

    currentPage = 1;
    displayDataForPage(currentPage);
}

function stopSearch() {
    isSearching = false; 
    fetchAndDisplaySensorData(); 
}

function startPolling() {
    fetchAndDisplaySensorData();
    setInterval(fetchAndDisplaySensorData, 2000); 
}

window.onload = startPolling;
