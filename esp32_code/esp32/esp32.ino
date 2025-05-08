#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <BH1750FVI.h>

#define LED1 2
#define LED2 4
#define LED3 15
#define LED4 16 
#define DHTPIN 5
#define DHTTYPE DHT11

const char* ssid = "Tenda_501DB0";
const char* password = "airwaybill";
const char* mqtt_server = "192.168.0.193";
const char* mqtt_user = "bahuy";
const char* mqtt_password = "9723";

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
BH1750FVI LightSensor(BH1750FVI::k_DevModeContLowRes);

int windSpeed = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT); 
  dht.begin();
  LightSensor.begin();
  setup_wifi();
  client.setServer(mqtt_server, 2003);
  client.setCallback(mqttCallback);
}

void setup_wifi() {
  delay(10);
  Serial.print("Kết nối đến WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối đến WiFi");
  Serial.print("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Đang kết nối đến MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
      Serial.println("Đã kết nối!");
      client.subscribe("control_led");
    } else {
      Serial.print("Lỗi, rc=");
      Serial.print(client.state());
      Serial.println(" Đợi 5 giây để thử lại");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Nhận tin nhắn: ");
  Serial.println(message);

  if (message.startsWith("led1_")) {
    bool ledStatus = message.endsWith("on") ? HIGH : LOW;
    digitalWrite(LED1, ledStatus);
    publishLedControlHistory(1, ledStatus ? "Bật" : "Tắt");
  } else if (message.startsWith("led2_")) {
    bool ledStatus = message.endsWith("on") ? HIGH : LOW;
    digitalWrite(LED2, ledStatus);
    publishLedControlHistory(2, ledStatus ? "Bật" : "Tắt");
  } else if (message.startsWith("led3_")) {
    bool ledStatus = message.endsWith("on") ? HIGH : LOW;
    digitalWrite(LED3, ledStatus);
    publishLedControlHistory(3, ledStatus ? "Bật" : "Tắt");
  } else if (message.startsWith("led4_")) {
    bool ledStatus = message.endsWith("on") ? HIGH : LOW;
    digitalWrite(LED4, ledStatus);
    publishLedControlHistory(4, ledStatus ? "Bật" : "Tắt");
  }
}

void publishSensorData() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("Không thể đọc dữ liệu từ DHT!");
    return;
  }
  uint16_t lightIntensity = LightSensor.GetLightIntensity();
  String jsonData = "{\"temperature\":" + String(t) + 
                    ", \"humidity\":" + String(h) + 
                    ", \"light\":" + String(lightIntensity) + 
                    ", \"wind_speed\":" + String(windSpeed) + "}";
  client.publish("sensor_data", jsonData.c_str());
  Serial.println("Dữ liệu đã gửi: " + jsonData);
}


void publishLedControlHistory(int led_id, String status) {
  String command = "{\"led_id\":" + String(led_id) + ", \"status\":\"" + status + "\"}";
  client.publish("led_control_history", command.c_str());
  Serial.println("Đã gửi lịch sử điều khiển LED: " + command);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  windSpeed = random(0, 101);
  publishSensorData();
  if (windSpeed > 50) {
    blinkLED4(3);
  }

  delay(2000);
}

void blinkLED4(int times) {
  publishLedControlHistory(4, "Bật");
  for (int i = 0; i < times; i++) {
    digitalWrite(LED4, HIGH); 
    delay(200);                
    digitalWrite(LED4, LOW);  
    delay(200);               
  }
  publishLedControlHistory(4, "Tắt");
}
