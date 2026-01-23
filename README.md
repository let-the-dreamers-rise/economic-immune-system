# 🤖 Agentic Finance: AI-Powered Economic Control System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-success.svg)
![Blockchain](https://img.shields.io/badge/blockchain-Arc_Testnet-64748b.svg)
![AI](https://img.shields.io/badge/AI-Gemini_Pro-8e44ad.svg)

**Agentic Finance** is a cutting-edge autonomous financial agent that uses **Google Gemini AI** to act as an "Economic Immune System" for autonomous wallets. It intelligently evaluates, authorizes, or rejects transactions on the **Arc Blockchain** using **Circle's Developer Controlled Wallets**.

> 🏆 **Submitted for Circle & Google Cloud Agentic Hackathon**

---

## 🚀 Features

- **🧠 Economic Reasoning Engine**: Uses Gemini 1.5 Pro to evaluate every transaction request against budget policies, spending patterns, and risk assessments.
- **🛡️ Economic Immune System**: A self-protecting mechanism that rejects unsafe transactions and assigns threat scores (Low, Medium, Critical) to spending behaviors.
- **💳 Cicle Programmable Wallets**: Full integration with Circle's Web3 Services for non-custodial wallet management on the Arc Testnet.
- **⚡ Real-Time Dashboard**: A beautiful, dark-mode UI built with React & Tailwind to monitor wallet health, resilience scores, and transaction timelines.
- **🕸️ Arc Blockchain Integration**: Executes verifiable on-chain transactions with low latency.

---

## 🏗️ Architecture

The system consists of three intelligence layers:

1.  **Perception Layer**: Subscribes to wallet inputs via Circle SDK.
2.  **Cognition Layer (Gemini)**: Analyzes the *intent* and *impact* of a transaction.
    *   *Example*: "Is spending 50 USDC for 'Coffee' reasonable given my $1000 monthly budget?"
3.  **Action Layer**: Executes approved transactions on-chain or blocks rejected ones.

### Tech Stack

*   **AI**: Google Gemini 2.5 Pro
*   **Blockchain**: Arc Testnet
*   **Wallet**: Circle Developer Controlled Wallets SDK
*   **Backend**: Node.js / Express / TypeScript
*   **Frontend**: React / Vite / TailwindCSS
*   **Deployment**: Google App Engine

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js v18+
*   Circle Developer Account
*   Google Cloud Project with Gemini API enabled

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/agentic-finance.git
cd agentic-finance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy the example environment files and add your API keys:
```bash
cp .env.example .env
cp app.yaml.example app.yaml
```

> **Security Note**: Never commit your real `.env` or `app.yaml` to GitHub!

### 4. Create a Wallet
Use the included script to generate a new wallet on Arc Testnet:
```bash
node scripts/create-arc-wallet.js
```
Copy the `WALLET_ID` and `WALLET_ADDRESS` into your `.env`.

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 🧪 Testing the Agent

1.  **Fund your wallet**: Use [Circle Faucet](https://faucet.circle.com) to send USDC to your displayed address on Arc Testnet.
2.  **Submit a Proposal**:
    *   Recipient: (Any Arc Address)
    *   Amount: `0.000001`
    *   Purpose: "Micro-payment test"
3.  **Watch the AI**:
    *   Gemini will analyze the request.
    *   If safe, it approves.
    *   If risky (e.g., "Send $5000" when balance is $10), it **rejects**.
4.  **Execute**: Click "Authorize" to sign and broadcast the transaction.

---

## 🛡️ Economic Immune System

The **Resilience Score** (0-100) on the dashboard indicates agent health:

*   **🟢 90-100 (Excellent)**: Conservative spending, high budget adherence.
*   **🟡 70-89 (Good)**: Minor deviations or risky proposals detected.
*   **🔴 <70 (Critical)**: Frequent unsafe requests or depleted liquidity.

---

## 📜 License

MIT License. Built for the future of Agentic Commerce.
