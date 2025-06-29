from machine import Pin, I2C
import network
import time
import socket
from ssd1306 import SSD1306_I2C
import ure
import ujson


# Setup I2C OLED Display
i2c = I2C(0, sda=Pin(21), scl=Pin(22), freq=400000)
oled = SSD1306_I2C(128, 32, i2c)

def display_message(line1="", line2="", line3=""):
    oled.fill(0)
    oled.text(line1, 0, 0)
    if line2:
        oled.text(line2, 0, 10)
    if line3:
        oled.text(line3, 0, 20)
    oled.show()

# Boot screen
display_message("Booting...")

# Connect to Wi-Fi
def connect_to_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    print("Connecting to Wi-Fi SSID:", ssid)

    for _ in range(15):
        if wlan.isconnected():
            ip = wlan.ifconfig()[0]
            print("Connected! IP:", ip)
            display_message("Connected!", ip)
            return ip
        time.sleep(1)

    display_message("Wi-Fi Failed!")
    return None

# Credentials
ip = connect_to_wifi("swift_1989", "11111111")
if ip is None:
    raise RuntimeError("Wi-Fi connection failed")

# API Web Server Setup
addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
server = socket.socket()
server.bind(addr)
server.listen(1)

display_message("API Server Ready", ip)
print("Server running at http://" + ip)

def parse_headers_and_body(request):
    parts = request.split('\r\n\r\n', 1)
    return parts if len(parts) == 2 else (request, "")



while True:
    cl, addr = server.accept()
    request = cl.recv(2048).decode()
    print("Request:", request)

    headers, body = parse_headers_and_body(request)
    response = "Unknown Command"

    # Handle CORS preflight request
    if "OPTIONS" in headers:
        cl.send("HTTP/1.1 204 No Content\r\n")
        cl.send("Access-Control-Allow-Origin: *\r\n")
        cl.send("Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n")
        cl.send("Access-Control-Allow-Headers: Content-Type\r\n")
        cl.send("\r\n")
        cl.close()
        continue  # Skip rest of loop

    if "POST /lamp-status" in headers:
        try:
            data = ujson.loads(body)
            oled.fill(0)
            oled.text("Switch States:", 0, 0)

            for i, lamp in enumerate(data[:3]):  # only show 3 due to 32px OLED
                lamp_id = lamp.get("id", "")[:12]
                state = "ON" if lamp.get("status") == "on" else "OFF"
                oled.text(f"{lamp_id}:{state}", 0, 10 + i * 8)

            oled.show()
            response = "Switch states updated"
        except Exception as e:
            oled.fill(0)
            oled.text("JSON Error", 0, 0)
            oled.show()
            response = "JSON error"

    cl.send("HTTP/1.1 200 OK\r\n")
    cl.send("Access-Control-Allow-Origin: *\r\n")
    cl.send("Content-Type: text/plain\r\n\r\n")
    cl.send(response)
    cl.close()

