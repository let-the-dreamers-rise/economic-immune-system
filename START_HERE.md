# 🚀 START HERE

## Everything is ready. Execute these commands:

### 1️⃣ Register Entity Secret
```bash
npm run circle:register
```
- Copy the 64-character secret that prints
- Paste it when prompted
- Script will register with Circle

### 2️⃣ Update .env
Open `.env` and replace:
```bash
CIRCLE_ENTITY_SECRET=your_entity_secret_here
```
With the secret from step 1.

### 3️⃣ Backup Recovery File
**CRITICAL:** Backup `circle-recovery.dat` to your password manager NOW!

### 4️⃣ Create Wallet
```bash
npm run circle:create-wallet
```
Copy the Wallet ID that prints.

### 5️⃣ Update .env Again
Open `.env` and replace:
```bash
AGENT_WALLET_ID=your_wallet_id_here
```
With the Wallet ID from step 4.

### 6️⃣ Fund Wallet
Go to: https://faucet.circle.com
- Select "Arc Testnet"
- Paste your wallet address
- Request testnet USDC

### 7️⃣ Verify
```bash
npm run circle:verify
```
Should show all green checkmarks.

### 8️⃣ Start App
```bash
npm run dev:all
```
Open: http://localhost:5173

---

## Need More Details?
Read: `EXECUTE_NOW.md`

## Need Help?
Read: `CIRCLE_SETUP.md`

---

**Start with step 1 above. Do it now! 👆**
