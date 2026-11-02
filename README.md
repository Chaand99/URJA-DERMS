# URJA – Smart Energy Management System

### IoT-Based Distributed Energy Resource Management System (DERMS)

URJA is an IoT-based Smart Energy Management System designed to monitor and manage distributed energy resources such as solar power, battery storage, electrical loads, and grid connections through a unified web platform.

The project combines IoT devices, cloud connectivity, real-time data monitoring, and energy analytics to demonstrate intelligent energy management in a smart microgrid environment.

---

## Project Overview

Modern energy systems integrate multiple energy sources, including renewable energy, battery storage, and conventional grid supply. Monitoring these resources efficiently requires a connected and intelligent platform.

URJA aims to provide a centralized platform where energy-related data can be collected, stored, visualized, and analyzed.

The system uses an ESP8266-based IoT architecture with Firebase Cloud integration and a web-based dashboard.

## Key Features

- **Real-Time Energy Monitoring:** Monitor voltage, current, power, and other electrical parameters.
- **IoT Connectivity:** Connect ESP8266-based devices to the internet using Wi-Fi.
- **Firebase Integration:** Store and synchronize energy-related data using Firebase Realtime Database.
- **Web Dashboard:** Visualize energy information through an interactive dashboard.
- **Energy Analytics:** View energy consumption, solar generation, and battery-related information.
- **Battery Monitoring:** Track battery status and charging-related parameters.
- **AI-Based Insights:** Demonstrate intelligent energy recommendations and system insights.
- **Multi-Node Architecture:** Support a scalable architecture for multiple energy-monitoring nodes.

## System Architecture

The project follows a layered IoT architecture:

1. **Energy Layer:** Solar panels, battery storage, electrical loads, and grid supply.
2. **Sensing Layer:** Sensors for measuring electrical parameters.
3. **Edge Processing Layer:** ESP8266 microcontroller for collecting and processing sensor data.
4. **Communication Layer:** Wi-Fi connectivity for transmitting data.
5. **Cloud Layer:** Firebase Realtime Database for data storage and synchronization.
6. **Application Layer:** URJA web dashboard for monitoring and analytics.

## Technologies Used

| Category | Technologies |
|---|---|
| Microcontroller | ESP8266 NodeMCU |
| Sensors | INA219 |
| Communication | Wi-Fi |
| Cloud Database | Firebase Realtime Database |
| Frontend | HTML, CSS, JavaScript |
| IoT Platform | Firebase |
| Hardware Interface | Arduino IDE |
| Development | VS Code, GitHub |

## Hardware Components

- ESP8266 NodeMCU
- INA219 Voltage and Current Sensor
- OLED Display (SSD1306)
- Relay Module
- Battery Pack
- LEDs and supporting electronic components

## Software Modules

- Energy Monitoring Dashboard
- Live Energy Flow Visualization
- Energy Analytics
- Battery Monitoring
- Firebase Cloud Integration
- Intelligent Energy Insights
- Multi-Node Monitoring Architecture

## Project Status

URJA was developed primarily as a **software-based DERMS prototype**, with partial hardware implementation and validation.

The ESP8266 connectivity, sensor interfacing, OLED display, relay operation, and Firebase integration were explored during development. Software simulation was used to demonstrate energy data visualization and multi-node monitoring.

The project provides a foundation for future development involving physical renewable energy integration, predictive analytics, battery optimization, and intelligent energy management.

## Future Scope

- Integration with physical solar panels and charge controllers.
- Advanced energy consumption forecasting using Machine Learning.
- Intelligent battery charging and discharging optimization.
- Automated energy scheduling.
- Peer-to-peer energy trading.
- Enhanced multi-node microgrid monitoring.
- Integration of real-time hardware telemetry.

## Installation and Setup

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Configure the Firebase project and Realtime Database.
4. Add your Firebase configuration securely.
5. Run the frontend using a local development server.
6. Connect the ESP8266 hardware after configuring the required Wi-Fi and Firebase settings.

For a static frontend, you can also deploy the website using GitHub Pages.

## Repository Structure

The repository contains the frontend application, supporting JavaScript files, stylesheets, assets, and project documentation.

*Note: The exact folder structure depends on the files included in the repository.*

## Developed As

An IoT and Embedded Systems project focused on smart energy monitoring, cloud integration, and distributed energy resource management.

**Project Name:** URJA  
**Domain:** Internet of Things (IoT) & Embedded Systems  
**Platform:** ESP8266 + Firebase + Web Dashboard

---

*URJA – Connecting Energy Resources through IoT and Intelligent Monitoring.*
