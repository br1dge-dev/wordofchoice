# 🔧 Umgebungsvariablen Setup

## 📁 Dateistruktur

```
wordofchoice/
├── .env                    # Zentrale Umgebungsvariablen (nicht in Git)
├── .env.example           # Template für andere Entwickler
├── contracts/
│   └── hardhat.config.js  # Verwendet ../.env
└── frontend/
    └── script.js          # Kann VITE_ Variablen verwenden
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

### **Frontend Variablen (VITE_ Prefix)**
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
   
   # Root Dependencies (falls vorhanden)
   cd .. && npm install
   ```

## 🔒 Sicherheit

- **`.env`** ist in `.gitignore` und wird nicht committed
- **`.env.example`** enthält keine echten Secrets
- **VITE_ Variablen** sind im Frontend sichtbar (nur öffentliche Daten)
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

### **Frontend mit Vite (falls gewünscht)**
```bash
# VITE_ Variablen sind automatisch verfügbar
console.log(import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA);
```

## 🔄 Migration von alter Struktur

Die alte `.env` Datei in `contracts/` kann gelöscht werden:
```bash
rm contracts/.env
```

Alle Skripte verwenden jetzt die zentrale `.env` Datei im Root-Verzeichnis. 