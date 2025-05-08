let ledHistoryCache = [];
let filteredHistoryCache = [];
let currentPage = 1;
const rowsPerPage = 50;
let totalPages = 1;

// Fetch LED history data và cập nhật bộ nhớ cache nếu có thay đổi
function fetchAndUpdateLedHistory() {
    fetch('http://localhost:3000/api/led_history') // Điều chỉnh endpoint nếu cần
        .then(response => response.json())
        .then(data => {
            if (JSON.stringify(data) !== JSON.stringify(ledHistoryCache)) {
                ledHistoryCache = data; // Cập nhật bộ nhớ cache
                filteredHistoryCache = [...ledHistoryCache]; // Cập nhật dữ liệu lọc
                totalPages = Math.ceil(filteredHistoryCache.length / rowsPerPage);
                displayPage(currentPage); // Hiển thị lại trang hiện tại
            }
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu lịch sử LED:', error));
}

// Hiển thị dữ liệu của một trang cụ thể
function displayPage(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = filteredHistoryCache.slice(startIndex, endIndex);

    // Xóa dữ liệu bảng hiện tại
    const tableBody = document.getElementById('ledHistoryTable');
    tableBody.innerHTML = '';

    // Thêm dữ liệu vào bảng
    pageData.forEach(item => {
        let deviceName = '';
        switch (item.led_id) {
            case 1:
                deviceName = 'Đèn';
                break;
            case 2:
                deviceName = 'Điều hòa';
                break;
            case 3:
                deviceName = 'Quạt';
                break;
            case 4:
                deviceName = 'Cảnh báo gió';
                break;
            default:
                deviceName = 'Không xác định';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${new Date(item.timestamp).toLocaleString()}</td>
            <td>${deviceName}</td>
            <td>${item.status}</td>
        `;
        tableBody.appendChild(row);
    });

    // Cập nhật thông tin trang
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
}

// Chuyển trang khi người dùng nhấn "Tiếp" hoặc "Trước"
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPage(currentPage);
    }
}

// Tìm kiếm theo tiêu chí
function searchByCriteria() {
    const searchValue = document.getElementById('search-value').value.toLowerCase();
    const searchCriteria = document.getElementById('search-criteria').value;

    filteredHistoryCache = ledHistoryCache.filter(item => {
        switch (searchCriteria) {
            case 'time':
                return new Date(item.timestamp).toLocaleString().toLowerCase().includes(searchValue);
            case 'status':
                return item.status.toLowerCase().includes(searchValue);
            case 'device':
                let deviceName = '';
                switch (item.led_id) {
                    case 1:
                        deviceName = 'Đèn';
                        break;
                    case 2:
                        deviceName = 'Điều hòa';
                        break;
                    case 3:
                        deviceName = 'Quạt';
                        break;
                    case 4:
                        deviceName = 'Cảnh báo gió';
                        break;
                    default:
                        deviceName = 'Không xác định';
                }
                return deviceName.toLowerCase().includes(searchValue);
            default:
                return false;
        }
    });

    totalPages = Math.ceil(filteredHistoryCache.length / rowsPerPage);
    currentPage = 1;
    displayPage(currentPage);
}

// Hiển thị lại toàn bộ dữ liệu
function resetSearch() {
    filteredHistoryCache = [...ledHistoryCache];
    totalPages = Math.ceil(filteredHistoryCache.length / rowsPerPage);
    currentPage = 1;
    displayPage(currentPage);
}

// Gọi hàm fetchAndUpdateLedHistory định kỳ
window.onload = () => {
    fetchAndUpdateLedHistory();
    setInterval(fetchAndUpdateLedHistory, 2000); // Cập nhật mỗi 5 giây
};
