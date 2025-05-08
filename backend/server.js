const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Kết nối MySQL
const db = mysql.createConnection({
     host: 'localhost',
  user: 'root',
  password: '9723',
  database: 'esp32_data'
});

db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối đến MySQL');
});

// Middleware
app.use(cors());
app.use(express.json());

// API để lấy dữ liệu cảm biến
app.get('/api/sensors', (req, res) => {
    const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 500'; // Lấy 10 bản ghi mới nhất
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu cảm biến:', err);
            res.status(500).send('Lỗi máy chủ');
            return;
        }
        res.json(results);
    });
});

// API để lấy lịch sử trạng thái LED
app.get('/api/led_history', (req, res) => {
    // Truy vấn dữ liệu từ bảng led_history
    const query = 'SELECT * FROM led_control_history ORDER BY timestamp DESC LIMIT 500'; // Lấy 500 bản ghi mới nhất
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu lịch sử LED:', err);
            res.status(500).send('Lỗi máy chủ');
            return;
        }
        res.json(results); // Trả về dữ liệu dưới dạng JSON
    });
});

// Khởi chạy server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
