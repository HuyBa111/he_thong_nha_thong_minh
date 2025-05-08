const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = 4000;

// MQTT connection details
const mqttServer = 'mqtt://192.168.0.193:2003';
const mqttOptions = {
    username: 'bahuy',
    password: '9723',
};

const client = mqtt.connect(mqttServer, mqttOptions);

client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

// Topic to control LEDs
const controlLedTopic = 'control_led';

// API endpoint to control LEDs
app.get('/led/:ledId/:state', (req, res) => {
    const { ledId, state } = req.params;

    if (!['led1', 'led2', 'led3'].includes(ledId)) {
        return res.status(400).json({ message: 'Invalid LED ID' });
    }

const message = `${ledId}_${state === 'on' ? 'on' : 'off'}`;



    client.publish(controlLedTopic, message, (err) => {
        if (err) {
            console.error('Lỗi gửi MQTT:', err);
            return res.status(500).json({ message: 'Lỗi điều khiển LED' });
        }
        res.json({ message: `LED ${ledId} đã chuyển sang trạng thái ${state}` });

    });
});

// Start the server
app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);

});