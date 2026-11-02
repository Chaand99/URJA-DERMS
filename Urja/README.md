# Urja DERMS
**Smart IoT-based Distributed Energy Resource Management System**

A real-time energy monitoring and management platform for microgrids with solar generation, battery storage, P2P energy trading, and AI-powered predictive analytics.

---

## 🌟 Features

- **Live Telemetry Dashboard**: Real-time monitoring of voltage, current, power, energy, frequency, and power factor
- **Multi-Node Architecture**: Manage multiple distributed energy nodes (solar arrays, battery banks, EV charging hubs)
- **Solar & Battery Monitoring**: Track solar generation, battery state-of-charge, and energy flows
- **Advanced Analytics**: Historical data visualization with energy consumption, generation, and cost analysis
- **Cortex AI**: Predictive insights for energy optimization, fault detection, and anomaly alerts
- **P2P Energy Trading**: Peer-to-peer energy transfer between producer and consumer nodes
- **Real-time Alerts**: System health monitoring with automated fault detection
- **Detailed Reporting**: Comprehensive energy reports with cost breakdowns and performance metrics

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript ES6 Modules (SPA)
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth (integration in progress)
- **Charts**: Chart.js
- **UI**: Custom CSS with glassmorphism design system

### Project Structure
```
Urja/
├── index.html              # Main SPA shell
├── login.html              # Authentication page
├── pages/                  # SPA page modules
│   ├── dashboard.html
│   ├── analytics.html
│   ├── cortex.html
│   ├── p2p.html
│   ├── reports.html
│   ├── alerts.html
│   └── settings.html
├── js/
│   ├── router.js           # SPA routing engine
│   ├── firebase.js         # Firebase initialization
│   ├── auth.js             # Authentication service
│   ├── dashboard.js        # Dashboard controller
│   ├── analytics.js        # Analytics controller
│   ├── cortex.js           # AI insights controller
│   ├── p2p.js              # P2P trading controller
│   ├── reports.js          # Reports controller
│   ├── settings.js         # Settings controller
│   ├── utils.js            # Utility functions
│   ├── config/
│   │   ├── firebaseConfig.js   # Firebase credentials
│   │   └── constants.js        # App constants
│   ├── services/
│   │   ├── telemetryService.js     # Live data streaming
│   │   ├── chartService.js         # Chart rendering
│   │   ├── analyticsService.js     # Analytics calculations
│   │   ├── cortexService.js        # AI insights generation
│   │   ├── cortexSync.js           # Cortex data sync
│   │   ├── alertService.js         # Alert management
│   │   ├── faultService.js         # Fault detection
│   │   ├── loggerService.js        # Event logging
│   │   ├── simulatorService.js     # Node simulation
│   │   └── eventBus.js             # Event pub/sub system
│   └── components/
│       ├── alerts.js       # Alert components
│       ├── cards.js        # Card components
│       ├── timeline.js     # Timeline components
│       └── ui.js           # UI utilities
├── css/
│   ├── style.css           # Global styles
│   ├── dashboard.css       # Dashboard-specific styles
│   ├── login.css           # Login page styles
│   ├── cortex.css          # Cortex page styles
│   ├── analytics.css       # Analytics page styles
│   ├── settings.css        # Settings page styles
│   ├── components.css      # Reusable component styles
│   ├── theme.css           # Theme variables
│   ├── layout.css          # Layout utilities
│   └── responsive.css      # Mobile responsiveness
├── assets/                 # Images and icons
├── firmware/               # ESP8266 firmware (stubs)
│   └── esp8266/
│       ├── main.ino
│       ├── config.h
│       ├── firebase_manager.h
│       └── wifi_manager.h
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Firebase project with Realtime Database enabled
- Local web server (Python, Node.js, or VS Code Live Server)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd Urja
   ```

2. **Configure Firebase**
   - Open `js/config/firebaseConfig.js`
   - Replace with your Firebase project credentials:
     ```javascript
     export const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

3. **Set up Firebase Realtime Database**
   - Import the schema from `urja_structure.json`
   - Configure security rules (see Security section below)

4. **Run a local web server**
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (with http-server)
   npx http-server -p 8000

   # VS Code Live Server extension
   # Right-click index.html → Open with Live Server
   ```

5. **Open the application**
   - Navigate to `http://localhost:8000`
   - Login page appears first (currently mock auth)
   - Default test credentials: any email/password

---

## 🔥 Firebase Database Schema

```
urja-derms/
├── devices/
│   ├── node04A/              # Main Substation Hub
│   │   ├── info/             # Static node information
│   │   ├── live/             # Real-time telemetry (voltage, current, power, etc.)
│   │   ├── solar/            # Solar generation data
│   │   ├── battery/          # Battery SoC and power
│   │   ├── environment/      # Temperature, humidity
│   │   ├── history/          # Historical data points
│   │   ├── logs/             # Event logs
│   │   ├── alerts/           # Active alerts
│   │   └── status/           # Node health status
│   ├── node01/               # Home 1 - Solar Array
│   ├── node02/               # Home 2 / EV Hub
│   └── node03/               # BESS Storage Bank (planned)
├── p2p_market/
│   ├── active_transfer/      # Current P2P transaction
│   └── history/              # P2P transaction history
├── cortex/
│   └── events/               # AI-generated insights
└── users/
    └── {uid}/                # User profiles
        ├── email
        ├── role
        ├── assignedNode
        └── createdAt
```

---

## 🎯 Features by Page

### Dashboard
- Live KPI cards (Voltage, Current, Power, Energy)
- Real-time power flow chart (rolling 60-second window)
- Solar generation and battery SoC gauges
- System health indicators
- Recent events timeline

### Analytics
- 7 key metrics: Total Energy, Peak Power, Solar Gen, Grid Import/Export, Battery Cycles, Cost
- 4 historical charts: Energy Trends, Solar vs Load, Battery Performance, Cost Analysis
- Date range filtering
- Export capabilities

### Cortex AI
- Real-time system health monitoring
- Predictive fault detection
- Energy optimization recommendations
- Anomaly detection alerts
- AI-powered insights based on historical patterns

### P2P Trading Hub
- Energy transfer between producer/consumer nodes
- Real-time transaction monitoring
- Transaction history ledger
- Automated pricing (₹8/kWh default)

### Reports
- Comprehensive performance statistics
- Detailed transaction ledger
- Cost breakdowns
- Export to PDF/CSV (planned)

### Alerts
- System fault notifications
- Battery health warnings
- Grid anomaly detection
- Configurable alert thresholds

### Settings
- Node configuration
- User preferences
- System parameters
- Firmware management interface

---

## 🔐 Security

### Firebase Security Rules (IMPORTANT)
**Current Status**: Database has no security rules (open read/write). Before deploying to production, configure Firebase Realtime Database rules:

```json
{
  "rules": {
    "devices": {
      "$nodeId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('assignedNode').val() === $nodeId)"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "p2p_market": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cortex": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

### Authentication
- Firebase Authentication integration (in progress)
- Current implementation: Mock login (bypasses authentication)
- Planned: Email/password, Google OAuth

---

## 🛠️ Development

### Node Simulator
The `simulatorService.js` runs in-browser simulation for testing:
- Simulates `node02`, `node03`, `node04A` every 3 seconds
- Generates realistic telemetry variations
- `node01` reserved for real ESP8266 hardware

**Enable/Disable Simulator:**
```javascript
// In js/router.js
import { initSimulator, stopSimulator } from './services/simulatorService.js';

// Start simulation
initSimulator();

// Stop simulation
stopSimulator();
```

### Adding a New Node
1. Add node entry in Firebase under `devices/{nodeId}`
2. Update node switcher in `index.html` (lines 109-136)
3. Add to `simulatorService.js` if simulated

### Extending Analytics
Add new metrics in `js/services/analyticsService.js`:
```javascript
export function calculateCustomMetric(historyData) {
  // Your calculation logic
  return result;
}
```

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Mock authentication (no real Firebase Auth integration)
- Node #03 appears in UI but has no data schema
- Some charts use hardcoded sample data
- Firmware files are empty stubs
- No input sanitization on localStorage values

### Planned Improvements
- [ ] Implement real Firebase Authentication
- [ ] Add Firebase Security Rules
- [ ] Complete ESP8266 firmware integration
- [ ] Add export functionality (PDF/CSV)
- [ ] Implement push notifications
- [ ] Add mobile app (React Native/Flutter)
- [ ] WebSocket support for sub-second telemetry
- [ ] Multi-language support (i18n)
- [ ] Dark/Light theme toggle
- [ ] Advanced data analytics with ML models

---

## 📊 Performance

- **Initial Load**: ~2.5s (including Firebase SDK)
- **Page Transitions**: <200ms (SPA routing)
- **Real-time Updates**: 3-second Firebase sync interval
- **Chart Rendering**: <100ms for 100 data points

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Email: support@urja-energy.com (example)
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

## 🙏 Acknowledgments

- Firebase for real-time database infrastructure
- Chart.js for data visualization
- Font Awesome for icons
- Inter font family

---

**Built with ⚡ by the Urja Team**  
*Empowering the energy transition, one microgrid at a time.*
