const mqtt = require('mqtt');
const mysql = require('mysql2');

// Kết nối MQTT
const client = mqtt.connect('mqtt://192.168.0.193:2003', {
  username: 'bahuy',
  password: '9723',
});

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '9723',
  database: 'esp32_data',
});

// Kết nối MQTT và lắng nghe các chủ đề
client.on('connect', () => {
  console.log('Đã kết nối đến MQTT Broker');
  client.subscribe('sensor_data');
  client.subscribe('led_control_history');
});

// Xử lý tin nhắn nhận được từ MQTT
client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());

  if (topic === 'sensor_data') {
    const { temperature, humidity, light } = data;
    const windSpeed = data.wind_speed || 0; // Thêm tốc độ gió nếu có
    const sql = 'INSERT INTO sensor_data (temperature, humidity, light, wind_speed) VALUES (?, ?, ?, ?)';
    db.query(sql, [temperature, humidity, light, windSpeed], (err) => {
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
