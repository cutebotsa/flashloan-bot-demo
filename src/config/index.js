require('dotenv').config();

const config = {
  // Network configuration
  network: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 80002, // Default to Polygon Amoy
    multicallAddress: process.env.MULTICALL_ADDRESS || '0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4',
  },

  // Wallet configuration
  wallet: {
    // Generate a test private key if none is provided
    privateKey: process.env.PRIVATE_KEY || (() => {
      if (process.env.NODE_ENV !== 'test') {
        const { Wallet } = require('ethers');
        const testWallet = Wallet.createRandom();
        console.warn('⚠️  No PRIVATE_KEY provided. Using a random test wallet for demo purposes only.');
        console.warn(`Test Wallet Address: ${testWallet.address}`);
        console.warn('This wallet has no funds and should only be used for testing.');
        return testWallet.privateKey;
      }
      return null;
    })(),
    address: null, // Will be derived from private key
  },

  // Flashloan provider configuration
  flashloan: {
    provider: process.env.FLASHLOAN_PROVIDER || '0x1C4A1C06538C9510eB9DDBB77272cCFb26c79549', // Aave V2
    fee: 0.0009, // 0.09% flashloan fee
  },

  // DEX configuration
  dex: {
    uniswapV2: {
      router: process.env.UNISWAP_V2_ROUTER || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    },
    sushiswap: {
      router: process.env.SUSHISWAP_ROUTER || '0xd9e1cE17f2641f24aE83637abE66c2e473330935',
      factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    },
  },

  // Token addresses (Mainnet for demo - use testnet in practice)
  tokens: {
    WETH: process.env.WETH || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: process.env.DAI || '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    USDC: process.env.USDC || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: process.env.USDT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },

  // Bot configuration
  bot: {
    minProfitEth: parseFloat(process.env.MIN_PROFIT_ETH) || 0.01,
    gasPriceGwei: parseFloat(process.env.GAS_PRICE_GWEI) || 10,
    maxSlippage: parseFloat(process.env.MAX_SLIPPAGE) || 0.5, // 0.5% max slippage
    maxGasPriceGwei: parseFloat(process.env.MAX_GAS_PRICE_GWEI) || 50,
    maxLoanAmountEth: parseFloat(process.env.MAX_LOAN_AMOUNT_ETH) || 10,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/bot.log',
    console: process.env.LOG_CONSOLE !== 'false',
  },

  // Monitor configuration
  monitor: {
    interval: parseInt(process.env.MONITOR_INTERVAL) || 5000, // Default to 5 seconds
  },
};

// Derive wallet address from private key if provided
if (config.wallet.privateKey) {
  const { Wallet } = require('ethers');
  const wallet = new Wallet(config.wallet.privateKey);
  config.wallet.address = wallet.address;
}

module.exports = config;
