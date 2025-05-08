Tổng quan:
Hệ thống sử dụng esp32 để đọc giá trị các cảm biến DHT11, BH1750 và gửi dữ liệu tới giao diện và lưu trữ với mysql.
Chi tiết:
1. Nạp code từ file esp32
2. cài đặt mosquitto để gửi dữ liệu bằng giao thức mqtt
3. thiết lập mysql để lưu trữ dữ liệu từ esp32
4. chạy file frontend để mở giao diện hiển thị dữ liệu, điều khiển các thiết bị được cài đặt trên code esp32
5. chạy các file backend để kết nối các phần
6. 
