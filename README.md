# Flashloan Bot Demo

A demonstration of a multi-DEX monitoring and flashloan arbitrage bot for educational purposes.

## ⚠️ Disclaimer
This is a simplified, educational demonstration of flashloan arbitrage concepts. This code is not intended for production use and lacks many critical security features and error handling mechanisms required for real trading.

## 🚀 Features

- Monitor multiple DEXes for price discrepancies
- Simulate flashloan arbitrage opportunities
- Support for multiple DEX protocols (Uniswap V2/V3, SushiSwap, etc.)
- Configurable token pairs and trading parameters

## 📦 Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your configuration

## ⚙️ Configuration

Rename `.env.example` to `.env` and configure the following variables:

```
# Node provider (Infura, Alchemy, etc.)
RPC_URL=your_ethereum_node_url

# Private key (for demo purposes only - use a testnet wallet)
PRIVATE_KEY=your_testnet_private_key

# Flashloan provider (Aave, dYdX, etc.)
FLASHLOAN_PROVIDER=0xYourFlashloanProviderAddress
```

## 🏃‍♂️ Usage

1. Start monitoring for arbitrage opportunities:
   ```bash
   node src/monitor.js
   ```

2. In a separate terminal, run the demo bot:
   ```bash
   node src/bot.js
   ```

## 📚 How It Works

1. The monitor scans multiple DEXes for price differences in token pairs
2. When an opportunity is found, it calculates potential profit after fees
3. If profitable, it executes a flashloan to perform the arbitrage
4. The loan is repaid within the same transaction

## 🔒 Security Notice

This is a demo application. Never use your mainnet private keys or real funds with this code. Always test thoroughly on testnets before considering any production use.

## 📝 License

MIT
