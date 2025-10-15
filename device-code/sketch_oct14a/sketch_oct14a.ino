#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ---- LED strip ----
#define LED_PIN 5
#define NUM_LEDS 256
#define BRIGHTNESS 5
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// ---- Status LED (optional onboard) ----
#define STATUS_LED 2

// ---- WiFi & API ----
const char* WIFI_SSID = "Alon iPhone";
const char* WIFI_PASS = "12345678";
const char* API_URL   = "https://github-display-server.vercel.app/api/phultquist";

// ---- Helpers ----
void setStatusBlink(int times, int on_ms = 150, int off_ms = 150) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(on_ms);
    digitalWrite(STATUS_LED, LOW);
    delay(off_ms);
  }
}

bool connectWiFi() {
  Serial.println("\nConnecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  for (int i = 0; i < 30; i++) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf("✅ WiFi connected: %s\n", WiFi.localIP().toString().c_str());
      digitalWrite(STATUS_LED, HIGH);
      return true;
    }
    setStatusBlink(1, 100, 200);
  }
  Serial.println("❌ WiFi connect failed.");
  return false;
}

void clearStrip() {
  for (int i = 0; i < NUM_LEDS; i++) strip.setPixelColor(i, 0);
  strip.show();
}

bool fetchAndDisplay() {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  Serial.printf("Fetching: %s\n", API_URL);
  if (!https.begin(client, API_URL)) {
    Serial.println("Failed to start HTTPS.");
    return false;
  }

  https.addHeader("User-Agent", "ESP32");
  int code = https.GET();
  if (code != HTTP_CODE_OK) {
    Serial.printf("HTTP error: %d\n", code);
    https.end();
    return false;
  }

  String payload = https.getString();
  https.end();

  // Parse JSON: {"username":"...","data":[[...32...], ... 8 rows ...]}
  DynamicJsonDocument doc(12288);
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.print("JSON parse error: ");
    Serial.println(err.f_str());
    return false;
  }

  JsonArray rows = doc["data"].as<JsonArray>();
  if (rows.isNull()) {
    Serial.println("No 'data' array found.");
    return false;
  }

  // Flatten and write ONLY GREEN channel; brightness varies by 0-255 value.
  int idx = 0;
  for (JsonArray row : rows) {
    for (JsonVariant v : row) {
      if (idx >= NUM_LEDS) break;
      int g = constrain((int)v.as<int>(), 0, 255);
      strip.setPixelColor(idx, strip.Color(0, g, 0)); // green only
      idx++;
    }
    if (idx >= NUM_LEDS) break;
  }

  // Zero any remaining pixels if provided data < NUM_LEDS
  for (int i = idx; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, 0);
  }

  strip.show();
  Serial.printf("Updated %d pixels from API data (green intensity).\n", idx);
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  strip.begin();
  strip.setBrightness(BRIGHTNESS); // keep brightness at 5
  strip.show();

  connectWiFi();
  if (!fetchAndDisplay()) {
    Serial.println("Initial fetch failed, clearing strip.");
    clearStrip();
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(STATUS_LED, LOW);
    connectWiFi();
  }

  if (!fetchAndDisplay()) {
    setStatusBlink(3, 80, 120);
  }

  delay(10000); // fetch every 10 seconds
}
