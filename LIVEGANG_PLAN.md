# 🚀 Livegang-Plan: Word of Choice auf BASE Mainnet

## 📋 Voraussetzungen

### 1. Umgebungsvariablen (.env)
```bash
# Private Key des Deployer-Wallets (NICHT committen!)
PRIVATE_KEY=0x...

# BASE Mainnet RPC URL
BASE_RPC_URL=https://mainnet.base.org

# BaseScan API Key für Contract Verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Alchemy/Infura für bessere Performance
# BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. Wallet-Vorbereitung
- **Deployer-Wallet**: Mindestens 0.1 ETH auf BASE Mainnet
- **Gas-Fees**: ~0.01-0.05 ETH für Deployment + Verification
- **Test-Wallet**: Für Post-Deployment Tests

## 🔄 Deployment-Prozess

### Schritt 1: Finale Tests
```bash
cd contracts
npm run test
```

### Schritt 2: Kompilierung
```bash
npm run compile
```

### Schritt 3: Deployment auf BASE Mainnet
```bash
npm run deploy:base
```

**Erwartete Ausgabe:**
```
WordOfChoiceLife deployed to: 0x...
Verifying contract on BaseScan...
Contract verified successfully
```

### Schritt 4: Contract-Adresse dokumentieren
Die deployte Contract-Adresse wird für Frontend-Integration benötigt.

## 🧪 Post-Deployment Tests

### 1. Contract-Verification prüfen
- BaseScan: https://basescan.org/address/[CONTRACT_ADDRESS]
- Contract-Code sollte sichtbar sein

### 2. Erste NFT minten
```bash
# Mit Hardhat Console oder direktem Contract-Call
npx hardhat console --network base
```

```javascript
// In Hardhat Console
const contract = await ethers.getContractAt("WordOfChoiceLife", "CONTRACT_ADDRESS");
const tx = await contract.express(true, "FIRST", { value: ethers.parseEther("0.0069") });
await tx.wait();
console.log("First NFT minted!");
```

### 3. Token URI testen
```javascript
const tokenURI = await contract.tokenURI(1);
console.log("Token URI:", tokenURI);
```

## 🌐 Frontend-Integration

### 1. Contract-Adresse in Frontend eintragen
```javascript
// In script.js oder entsprechender Config-Datei
const CONTRACT_ADDRESS = "0x..."; // Deployte Adresse
const NETWORK_ID = 8453; // BASE Mainnet
```

### 2. RPC-Provider konfigurieren
```javascript
// Empfohlene RPC-Provider für BASE Mainnet:
// - https://mainnet.base.org (öffentlich)
// - https://base-mainnet.g.alchemy.com/v2/YOUR_KEY (Alchemy)
// - https://base.blockpi.network/v1/rpc/public (BlockPI)
```

### 3. Wallet-Connection testen
- MetaMask mit BASE Mainnet
- WalletConnect
- Coinbase Wallet

## 📊 Monitoring & Analytics

### 1. BaseScan Monitoring
- Contract-Interaktionen verfolgen
- Gas-Usage überwachen
- Event-Logs analysieren

### 2. Analytics Setup
```javascript
// Google Analytics für NFT-Mints
// Optional: Custom Analytics für User-Interaktionen
```

## 🔒 Sicherheits-Checkliste

### Pre-Deployment
- [ ] Smart Contract auditiert
- [ ] Tests bestanden
- [ ] Gas-Optimierung getestet
- [ ] Private Key sicher gespeichert
- [ ] Backup-Wallet vorbereitet

### Post-Deployment
- [ ] Contract-Verification erfolgreich
- [ ] Erste NFT erfolgreich gemint
- [ ] Token URI korrekt generiert
- [ ] Frontend funktioniert
- [ ] Wallet-Connections getestet

## 💰 Kosten-Schätzung

### Deployment-Kosten (BASE Mainnet)
- **Contract-Deployment**: ~0.02-0.05 ETH
- **Contract-Verification**: ~0.01-0.02 ETH
- **Test-Mints**: ~0.01-0.03 ETH
- **Gesamt**: ~0.05-0.1 ETH

### Laufende Kosten
- **Gas pro Mint**: ~0.001-0.003 ETH
- **Mint-Preis**: 0.0069 ETH (vom Contract definiert)

## 🚨 Rollback-Plan

### Falls Probleme auftreten:
1. **Contract-Pause**: Falls implementiert
2. **Mint-Price-Änderung**: Über `setMintPrice()`
3. **Neues Deployment**: Mit angepasstem Contract

## 📞 Support & Monitoring

### Post-Launch Monitoring
- **24/7 Contract-Monitoring** für erste 48h
- **User-Support** vorbereiten
- **Community-Management** aktivieren

### Kontakte
- **Developer**: Für technische Issues
- **Community Manager**: Für User-Support
- **Marketing**: Für Launch-Announcements

## 🎯 Launch-Checkliste

### Pre-Launch (24h vorher)
- [ ] Finale Tests abgeschlossen
- [ ] Deployment-Skripte getestet
- [ ] Umgebungsvariablen konfiguriert
- [ ] Team-Briefing durchgeführt

### Launch-Day
- [ ] Contract deployed
- [ ] Verification erfolgreich
- [ ] Erste Test-Mints durchgeführt
- [ ] Frontend live geschaltet
- [ ] Social Media Announcements
- [ ] Community aktiviert

### Post-Launch (48h)
- [ ] Monitoring aktiv
- [ ] User-Feedback gesammelt
- [ ] Performance optimiert
- [ ] Support-Requests bearbeitet

---

**⚠️ Wichtig**: Bewahre deine Private Keys sicher auf und teste alles auf Base Sepolia Testnet vor dem Mainnet-Deployment! 