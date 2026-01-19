# Circle Setup Scripts

## Available Scripts

### 1. Register Entity Secret
```bash
npm run circle:register
```

**Purpose:** One-time registration of your Entity Secret with Circle.

**What it does:**
- Generates a 32-byte cryptographic key
- Encrypts it with Circle's RSA public key
- Registers the ciphertext with Circle's API
- Downloads recovery file (`circle-recovery.dat`)

**When to run:** Once during initial setup.

---

### 2. Verify Setup
```bash
npm run circle:verify
```

**Purpose:** Verify your Circle SDK configuration is correct.

**What it checks:**
- ✅ Environment variables are set
- ✅ Circle SDK can connect
- ✅ API credentials are valid
- ✅ Wallet is accessible

**When to run:** After registration, before starting the app.

---

## Setup Flow

```
1. npm install
   ↓
2. npm run circle:register
   ↓
3. Update .env with CIRCLE_ENTITY_SECRET
   ↓
4. Create wallet (via Circle Console or SDK)
   ↓
5. Update .env with AGENT_WALLET_ID
   ↓
6. npm run circle:verify
   ↓
7. npm run dev:all
```

---

## Security Notes

- **Entity Secret:** Never commit to Git. Store in `.env` only.
- **Recovery File:** Backup to password manager immediately.
- **API Key:** Rotate if compromised.

---

## Troubleshooting

### "Missing required environment variables"
→ Check `.env` file has all required values

### "Invalid Entity Secret"
→ Must be 64 hex characters (32 bytes)

### "Entity Secret already registered"
→ You can only register once. Use recovery file to reset.

### "Wallet not found"
→ Create wallet first via Circle Console or SDK

---

## Resources

- [Circle Docs](https://developers.circle.com/wallets/dev-controlled)
- [Setup Guide](../CIRCLE_SETUP.md)
