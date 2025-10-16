# GitHub Display

An ESP32-powered LED matrix display that shows your GitHub contribution graph in real-time.

## Features

- 256 LED (16x16) matrix display
- Automatic WiFi connection with captive portal setup
- Fetches data from custom API every 10 seconds
- Hard-coded Device ID: "1"
- WiFi credential reset functionality

## Initial Setup

### First Time Power-On

1. **Power on the device** - The ESP32 will boot up
2. **Wait 3 seconds** - The device will attempt to connect to WiFi (will fail on first boot)
3. **Connect to AP** - A WiFi access point named `GithubDisplay-Setup` will appear
4. **Join the network** - Connect your phone/computer to `GithubDisplay-Setup`
5. **Configure WiFi** - A captive portal should open automatically (if not, navigate to `192.168.4.1`)
6. **Enter credentials** - Select your WiFi network and enter the password
7. **Save** - Click "Save" and the device will connect to your WiFi
8. **Display starts** - The LED matrix will begin displaying your GitHub data

### What Happens Next

- WiFi credentials are **saved automatically** in the ESP32's flash memory
- On every subsequent boot, the device will **auto-connect** to your WiFi
- The display updates every **10 seconds** with fresh data from the API

## Resetting WiFi Credentials

If you need to connect to a different WiFi network or clear the stored credentials:

### Reset Procedure

1. **Press the RESET button** (don't hold any other buttons)
2. **Watch the Serial Monitor** - You'll see: `💡 Press and hold BOOT button now to clear WiFi (3 sec window)...`
3. **Quickly press and hold BOOT** - You have 3 seconds to press the BOOT button
4. **Keep holding for 2 seconds** - The status LED will blink rapidly to show progress
5. **Wait for confirmation** - After 2 seconds, you'll see 3 slow blinks = WiFi cleared!
6. **Device restarts in AP mode** - The `GithubDisplay-Setup` AP will appear again
7. **Repeat initial setup** - Follow the "First Time Power-On" steps above

### Visual Feedback

- **Rapid blinking** (during 2-second hold) = Counting down
- **3 slow blinks** = WiFi credentials successfully cleared
- **Solid LED** = Device connected and running normally

## Troubleshooting

### Device stuck in download mode (red light only)

If you accidentally held BOOT while pressing RESET, the device enters bootloader mode:

**Solution:** Simply press the RESET button once (without holding BOOT) to recover

### WiFi not connecting

1. Check that your WiFi credentials are correct
2. Make sure your WiFi network is 2.4GHz (ESP32 doesn't support 5GHz)
3. Try resetting WiFi credentials and setting up again

### Display not updating

1. Check Serial Monitor for error messages
2. Verify the device has internet access
3. Confirm the API endpoint is accessible: `https://github-display-server.vercel.app/api/1`

### Serial Monitor shows JSON parse errors

The API might be returning invalid data - check the API endpoint directly in a browser

## Hardware

- **ESP32 Development Board**
- **LED Strip:** 256 LEDs (WS2812B/NeoPixel compatible) on GPIO 5
- **Status LED:** GPIO 2 (built-in on most ESP32 boards)
- **BOOT Button:** GPIO 0 (built-in on most ESP32 boards)
- **RESET Button:** EN pin (built-in on most ESP32 boards)

## API Endpoint

The device fetches data from:
```
https://github-display-server.vercel.app/api/1
```

Expected JSON format:
```json
{
  "data": [
    [0, 255, 128, ...],  // Row 1: 16 values (0-255)
    [0, 0, 255, ...],    // Row 2: 16 values (0-255)
    // ... 16 rows total
  ]
}
```

Each value represents the green intensity (0-255) for that LED.

## Development

### Arduino IDE Setup

1. Install the Arduino IDE
2. Install ESP32 board support
3. Install required libraries:
   - Adafruit NeoPixel
   - ArduinoJson
   - WiFiManager

### Uploading Code

1. Connect ESP32 via USB
2. Select your board and port in Arduino IDE
3. Click Upload
4. Wait for compilation and upload to complete

## Configuration

All configuration is at the top of `sketch_oct14a.ino`:

```cpp
const char *API_BASE = "https://github-display-server.vercel.app/api";
const String DEVICE_ID = "1";
const int NUM_LEDS = 256;
const int STRIP_BRIGHTNESS = 5;
```

Adjust `STRIP_BRIGHTNESS` (0-255) if the display is too bright or too dim.

