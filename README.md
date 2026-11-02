# URJA — Smart Energy Management System

<p align="center">
  <img src="https://img.shields.io/badge/URJA-DERMS-12b8a6?style=for-the-badge" alt="URJA DERMS">
  <img src="https://img.shields.io/badge/IoT-ESP8266-3478a8?style=for-the-badge" alt="ESP8266">
  <img src="https://img.shields.io/badge/Cloud-Firebase-ffb000?style=for-the-badge" alt="Firebase">
  <img src="https://img.shields.io/badge/Status-Prototype-6c8ebf?style=for-the-badge" alt="Prototype">
</p>

<p align="center"><b>A connected energy community — where homes, solar stations, batteries and the grid work together.</b></p>

<p align="center">
  <a href="microgrid-3d.html"><b>⚡ EXPLORE THE INTERACTIVE 3D MICROGRID</b></a>
  &nbsp; | &nbsp;
  <a href="index.html"><b>OPEN URJA DASHBOARD</b></a>
</p>

---

## 🌐 About URJA

URJA is an **IoT-based Distributed Energy Resource Management System (DERMS) prototype)** designed to demonstrate monitoring and coordination of energy resources such as solar generation, battery storage, electrical loads and grid supply through a connected web platform.

The project combines an ESP8266-based IoT concept, electrical sensing, Firebase cloud connectivity, simulated telemetry and a web dashboard.

## 🏙️ Interactive 3D Microgrid

Open [`microgrid-3d.html`](microgrid-3d.html) to explore a schematic smart-energy community.

- Rotate the 3D scene by dragging and zoom using the mouse wheel.
- Explore connected homes with rooftop solar panels.
- Inspect the solar generation, battery storage and grid stations.
- Toggle animated energy-flow paths.
- View illustrative generation, load and battery indicators.

> **Demo clarification:** The 3D scene and its displayed values are illustrative simulation data. They are not live measurements from physical houses or hardware.

## ✨ Key Features

| Feature | Description |
|---|---|
| Energy monitoring | Visualize solar, battery, load and grid information |
| IoT architecture | ESP8266-based sensing and connectivity concept |
| Sensor interfacing | INA219 voltage/current measurement concept |
| Firebase integration | Cloud database synchronization |
| Web dashboard | Centralized monitoring and analytics interface |
| Simulation | JavaScript-generated energy telemetry for demonstration |
| 3D microgrid | Interactive visualization of a connected energy community |

## 🧱 System Architecture

```text
Energy Resources
(Solar · Battery · Loads · Grid)
          |
          v
Sensors / Measurement
(INA219 · electrical parameters)
          |
          v
ESP8266 IoT Controller
          | Wi-Fi
          v
Firebase Realtime Database
          |
          v
URJA Web Dashboard
(Monitoring · Analytics · Insights)
```

For the current software demonstration, JavaScript generates simulated telemetry and synchronizes the values with Firebase. The physical multi-node microgrid is a future development scope.

## 🛠️ Technology Stack

- **Microcontroller / IoT:** ESP8266 NodeMCU
- **Sensor:** INA219
- **Cloud database:** Firebase Realtime Database
- **Authentication:** Firebase Email/Password
- **Frontend:** HTML, CSS, JavaScript
- **3D visualization:** Three.js
- **Embedded development:** Arduino IDE

## 🚀 Run the Project

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Run the project using a local web server, such as the VS Code Live Server extension.
4. Open `index.html` for the URJA dashboard.
5. Open `microgrid-3d.html` for the interactive 3D microgrid.

The 3D page loads Three.js from a CDN and therefore requires an internet connection.

## 🔐 Security Note

Never commit Firebase user passwords, Wi-Fi passwords, service-account private keys or other credentials. Configure Firebase Authentication and Realtime Database Security Rules appropriately. A Firebase web API key is not a substitute for database security rules.

## 📌 Project Status

URJA is primarily a **software-based DERMS prototype with partial hardware validation**. ESP8266 connectivity, sensor interfacing, OLED display, relay operation and Firebase integration were explored during development. The dashboard and multi-node community microgrid visualization use simulated data for demonstration; this is not a fully deployed physical microgrid.

## 🔭 Future Scope

- Physical solar PV and battery integration
- Live telemetry from multiple hardware nodes
- Machine-learning-based energy forecasting
- Battery charge/discharge optimization
- Intelligent energy scheduling
- Peer-to-peer energy sharing
- Enhanced fault detection and cybersecurity

---

<p align="center"><b>URJA — Connecting energy resources through IoT and intelligent monitoring.</b></p>
