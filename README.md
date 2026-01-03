# Flashloan Bot Demo

A deterministic multi-DEX monitoring and flashloan-capable arbitrage system used to analyze real-time execution viability across DEX protocols.

## ⚠️ Disclaimer
This is a simplified, educational demonstration of flashloan arbitrage concepts. This code is not intended for production use and lacks many critical security features and error handling mechanisms required for real trading.

## 🚀 Features

🎯 What This Demonstrates
This project focuses on:
- Correct fee-aware execution price calculation
- Real-time on-chain data ingestion via WebSockets
- Deterministic behavior under non-profitable conditions
- Accurate modeling of DEX mechanics and flashloan constraints

While profitable execution is not enabled in this demo, all monitoring and calculations are executed against live on-chain data.

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
3. If profitable conditions are detected, the system demonstrates the execution path. In this demo version, execution is intentionally disabled to ensure safety and reproducibility.
4. The loan is repaid within the same transaction

## 📊 Proof of Execution
Example runtime output from live monitoring:

```
[2025-12-25T23:16:24.227Z] [USDC] Path=USDC -[QuickSwapV3(0.0001%)]-> USDC.e -[UniswapV3(0.01%)]-> USDC
In=1000.00 USDC -> Out=999.845295 USDC
RoundTripSpread≈-0.0155% | Net=$-0.154705
```

This output demonstrates correct fee application, reserve-based pricing, and deterministic logging under real market conditions.

## 🔒 Security Notice

This is a demo application. Never use your mainnet private keys or real funds with this code. Always test thoroughly on testnets before considering any production use.

## 📝 License

MIT
