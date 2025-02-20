#include <ESP8266WiFi.h>
#include <Servo.h>

const char* ssid = "iPhone";         // Replace with your Wi-Fi SSID
const char* password = "supremegg"; // Replace with your Wi-Fi password
const char* serverIP = "192.0.0.2"; // Laptop IP address
const int serverPort = 8080;            // Port on laptop

WiFiClient client;
Servo myServo;
Servo myServo2;

void setup() {
    Serial.begin(115200);
    myServo.attach(4);
    myServo2.attach(5);
    
    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi...");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
    Serial.println(WiFi.localIP());

    // Connect to Laptop Server
    if (client.connect(serverIP, serverPort)) {
        Serial.println("Connected to server!");
    } else {
        Serial.println("Connection to server failed!");
    }
}

void loop() {
    // Send test data (simulate video stream or sensor data)
    const char testData[] = "ESP8266 Frame Data";
    client.write(testData, sizeof(testData));

    // Receive command from the server
    if (client.available()) {
        String command = client.readStringUntil('\n');
        Serial.println("Received Command: " + command);

        // Control servo based on command
        if (command == "TURN_SERVO") {
            myServo.write(90);  // Turn servo to 90 degrees
            myServo2.write(90);
            delay(500);         // Wait for servo to reach position
            myServo.write(0);   // Return to starting position
            myServo2.write(0);
        }
    }

    delay(100); // Simulate frame delay
}