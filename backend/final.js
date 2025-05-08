const mqtt = require('mqtt');
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

// cau hinh MQTT
const mqttServer = 'mqtt://192.168.0.193:2003';
const mqttOptions = {
    username: 'bahuy',
    password: '9723',
};

const mqttClient = mqtt.connect(mqttServer, mqttOptions);

mqttClient.on('connect', () => {
    console.log('Đã kết nối đến MQTT Broker');
    mqttClient.subscribe('sensor_data');
    mqttClient.subscribe('led_control_history');
});

mqttClient.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === 'sensor_data') {
        const { temperature, humidity, light, wind_speed = 0 } = data;
        const sql = 'INSERT INTO sensor_data (temperature, humidity, light, wind_speed) VALUES (?, ?, ?, ?)';
        db.query(sql, [temperature, humidity, light, wind_speed], (err) => {
            if (err) throw err;
            console.log('Dữ liệu cảm biến đã được lưu!');
        });
    }

    if (topic === 'led_control_history') {
        const { led_id, status } = data;
        const sql = 'INSERT INTO led_control_history (led_id, status) VALUES (?, ?)';
        db.query(sql, [led_id, status], (err) => {
            if (err) throw err;
            console.log('Lịch sử LED đã được lưu!');
        });
    }
});

// cau hinh MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '9723',
    database: 'esp32_data',
});

db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối đến MySQL');
});

// cau hinh express
const app = express();
const apiPort = 3000;
const controlPort = 4000; 

app.use(cors());
app.use(express.json());

// API lay du lieu cam bie
app.get('/api/sensors', (req, res) => {
    const query = 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 500';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu cảm biến:', err);
            res.status(500).send('Lỗi máy chủ');
            return;
        }
        res.json(results);
    });
});

// API lay lich su dieu khien LED
app.get('/api/led_history', (req, res) => {
    const query = 'SELECT * FROM led_control_history ORDER BY timestamp DESC LIMIT 500';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu lịch sử LED:', err);
            res.status(500).send('Lỗi máy chủ');
            return;
        }
        res.json(results);
    });
});

// API đieu khien LED
const ledApp = express();

ledApp.get('/led/:ledId/:state', (req, res) => {
    const { ledId, state } = req.params;

    if (!['led1', 'led2', 'led3'].includes(ledId)) {
        return res.status(400).json({ message: 'Invalid LED ID' });
    }

    const message = `${ledId}_${state === 'on' ? 'on' : 'off'}`;

    mqttClient.publish('control_led', message, (err) => {
        if (err) {
            console.error('Lỗi gửi MQTT:', err);
            return res.status(500).json({ message: 'Lỗi điều khiển LED' });
        }
        res.json({ message: `LED ${ledId} đã chuyển sang trạng thái ${state}` });
    });
});

// Khoi chay server API
app.listen(apiPort, () => {
    console.log(`API server đang chạy tại http://localhost:${apiPort}`);
});

// Khoi chay server dieu khien LED
ledApp.listen(controlPort, () => {
    console.log(`Server điều khiển LED đang chạy tại http://localhost:${controlPort}`);
});
