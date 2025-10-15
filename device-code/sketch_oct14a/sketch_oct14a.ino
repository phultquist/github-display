/******************************************************
 * GithubDisplay ESP32 Provision + Display (All-in-One)
 * - Always attempts WiFi auto-connect, fallback to AP
 * - Captive portal includes Device ID field
 * - Fetches API_URL/<DEVICE_ID> JSON and displays it
 ******************************************************/

#include <Adafruit_NeoPixel.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>

// ---------- Pins / LEDs ----------
static const int STATUS_LED = 2;
static const int STRIP_PIN = 5;
static const int NUM_LEDS = 256;
static const int STRIP_BRIGHTNESS = 5;

Adafruit_NeoPixel strip(NUM_LEDS, STRIP_PIN, NEO_GRB + NEO_KHZ800);

// ---------- Server ----------
const char *API_BASE = "https://github-display-server.vercel.app/api";

// ---------- Device ID storage ----------
Preferences prefs;
String DEVICE_ID = "";
const char *NVS_NS = "gd";
const char *NVS_KEY_DEVICE_ID = "device_id";

// ---------- Helpers ----------
void statusBlink(int times, int on_ms = 150, int off_ms = 150) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(on_ms);
    digitalWrite(STATUS_LED, LOW);
    delay(off_ms);
  }
}

void stripClear() {
  for (int i = 0; i < NUM_LEDS; i++)
    strip.setPixelColor(i, 0);
  strip.show();
}

void stripShowGreenGrid(const JsonArray &rows) {
  int idx = 0;
  for (JsonArray row : rows) {
    for (JsonVariant v : row) {
      if (idx >= NUM_LEDS)
        break;
      int g = constrain((int)v.as<int>(), 0, 255);
      strip.setPixelColor(idx, strip.Color(0, g, 0));
      idx++;
    }
    if (idx >= NUM_LEDS)
      break;
  }
  for (int i = idx; i < NUM_LEDS; i++)
    strip.setPixelColor(i, 0);
  strip.show();
}

bool fetchAndDisplay() {
  if (DEVICE_ID.isEmpty()) {
    Serial.println("❌ No DEVICE_ID stored!");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();

  String url = String(API_BASE) + "/" + DEVICE_ID;
  Serial.printf("🌐 Fetching: %s\n", url.c_str());

  HTTPClient https;
  if (!https.begin(client, url)) {
    Serial.println("HTTPS begin() failed");
    return false;
  }

  https.addHeader("User-Agent", "ESP32-GithubDisplay");
  int code = https.GET();
  if (code != HTTP_CODE_OK) {
    Serial.printf("HTTP error: %d\n", code);
    https.end();
    return false;
  }

  String payload = https.getString();
  https.end();

  DynamicJsonDocument doc(12288);
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.print("JSON parse error: ");
    Serial.println(err.f_str());
    return false;
  }

  JsonArray rows = doc["data"].as<JsonArray>();
  if (rows.isNull()) {
    Serial.println("❌ No 'data' array in payload.");
    return false;
  }

  stripShowGreenGrid(rows);
  Serial.println("✅ Display updated.");
  return true;
}

bool runProvisioningPortal() {
  Serial.println("🚪 Starting WiFiManager captive portal...");
  WiFi.mode(WIFI_AP_STA);
  WiFiManager wm;

  prefs.begin(NVS_NS, false);
  DEVICE_ID = prefs.getString(NVS_KEY_DEVICE_ID, "");
  prefs.end();

  WiFiManagerParameter p_dev("device_id", "Device ID", DEVICE_ID.c_str(), 32);
  wm.addParameter(&p_dev);

  wm.setConfigPortalBlocking(true);
  wm.setConnectTimeout(10);
  wm.setConfigPortalTimeout(180); // 3 minutes max open

  bool res = wm.autoConnect("GithubDisplay-Setup");
  if (!res) {
    Serial.println("❌ AutoConnect failed — user likely timed out.");
    return false;
  }

  String newId = p_dev.getValue();
  newId.trim();
  if (newId.length()) {
    prefs.begin(NVS_NS, false);
    prefs.putString(NVS_KEY_DEVICE_ID, newId);
    prefs.end();
    DEVICE_ID = newId;
    Serial.printf("💾 Saved Device ID: %s\n", DEVICE_ID.c_str());
  }

  Serial.printf("✅ Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  digitalWrite(STATUS_LED, HIGH);
  return true;
}

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== GithubDisplay Boot ===");

  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  strip.begin();
  strip.setBrightness(STRIP_BRIGHTNESS);
  stripClear();

  // Always start clean
  WiFi.disconnect(true, true);
  delay(500);
  WiFi.mode(WIFI_AP_STA);
  WiFi.setSleep(false);

  // Try to connect automatically — if fails, AP starts
  if (!runProvisioningPortal()) {
    Serial.println("Portal or connection failed. Rebooting in 5s...");
    statusBlink(10, 100, 100);
    delay(5000);
    ESP.restart();
  }

  prefs.begin(NVS_NS, false);
  DEVICE_ID = prefs.getString(NVS_KEY_DEVICE_ID, "");
  prefs.end();
  Serial.printf("Device ID: %s\n", DEVICE_ID.c_str());

  if (!fetchAndDisplay()) {
    Serial.println("Initial fetch failed; clearing LEDs.");
    stripClear();
    statusBlink(3, 150, 150);
  }
}

// ---------- Loop ----------
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.reconnect();
    delay(3000);
    return;
  }

  if (!fetchAndDisplay()) {
    statusBlink(3, 80, 120);
  }

  delay(10000); // update every 10s
}
