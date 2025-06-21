# 🔧 Umgebungsvariablen Setup

## 📁 Dateistruktur

```
wordofchoice/
├── .env                    # Zentrale Umgebungsvariablen (nicht in Git)
├── .env.example           # Template für andere Entwickler
├── contracts/
│   └── hardhat.config.js  # Verwendet ../.env
└── frontend/
    ├── index.html         # Einfaches HTML/CSS/JS Setup
    ├── script.js          # Vanilla JavaScript
    └── styles.css         # CSS Styles
```

## 🔐 Umgebungsvariablen

### **Contract-Deployment Variablen**
```bash
# Privater Schlüssel für Contract-Deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# BaseScan API Key für Contract-Verifizierung
BASESCAN_API_KEY=your_basescan_api_key_here
```

### **Frontend-Variablen (Optional für zukünftige Verwendung)**
```bash
# Contract Addresses
VITE_CONTRACT_ADDRESS_SEPOLIA=0xB9D9372a4A54133Bd2543bc3c8458025F224d616
VITE_CONTRACT_ADDRESS_MAINNET=0x... # TODO: Nach Mainnet-Deployment

# Network Configuration
VITE_NETWORK_ID_SEPOLIA=84532
VITE_NETWORK_ID_MAINNET=8453

# RPC URLs für Frontend
VITE_RPC_URL_SEPOLIA=https://sepolia.base.org
VITE_RPC_URL_MAINNET=https://mainnet.base.org

# Explorer URLs
VITE_EXPLORER_URL_SEPOLIA=https://sepolia.basescan.org
VITE_EXPLORER_URL_MAINNET=https://basescan.org

# Mint Configuration
VITE_MINT_PRICE=0.0069
```

## 🚀 Setup für neue Entwickler

1. **Repository klonen**
   ```bash
   git clone https://github.com/br1dge-dev/wordofchoice.git
   cd wordofchoice
   ```

2. **Umgebungsvariablen einrichten**
   ```bash
   cp .env.example .env
   # .env bearbeiten und eigene Werte eintragen
   ```

3. **Dependencies installieren**
   ```bash
   # Contract Dependencies
   cd contracts && npm install
   ```

## 🔒 Sicherheit

- **`.env`** ist in `.gitignore` und wird nicht committed
- **`.env.example`** enthält keine echten Secrets
- **VITE_ Variablen** sind für zukünftige Vite-Integration vorbereitet
- **PRIVATE_KEY** nur für Contract-Deployment, nie im Frontend

## 📝 Verwendung

### **Contract-Deployment**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network base-sepolia
```

### **Frontend-Entwicklung**
```bash
cd frontend
python3 -m http.server 8000
```

### **Aktuelles Frontend**
Das Frontend verwendet **Vanilla JavaScript** und ist direkt in `script.js` konfiguriert:
```javascript
// Contract address (Sepolia, Stand Januar 2025)
const contractAddress = "0xB9D9372a4A54133Bd2543bc3c8458025F224d616";
```

### **Zukünftige Vite-Integration (Optional)**
Falls das Frontend später auf Vite umgestellt wird, sind die VITE_ Variablen bereits vorbereitet:
```javascript
// In einem zukünftigen Vite-Setup
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA;
```

## 🔄 Migration von alter Struktur

Die alte `.env` Datei in `contracts/` wurde entfernt:
```bash
rm contracts/.env  # Bereits erledigt
```

Alle Skripte verwenden jetzt die zentrale `.env` Datei im Root-Verzeichnis. 