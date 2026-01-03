const { ethers } = require('ethers');
const config = require('./config');
const logger = require('./utils/logger');
const DexService = require('./services/dex.service');

class Monitor {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
    this.dexService = new DexService(this.provider);
    this.isRunning = false;
  }

  async initialize() {
    try {
      logger.info('Initializing Monitor...');
      await this.dexService.initializeTokens();
      logger.info('Monitor initialized successfully');
    } catch (error) {
      logger.error(`Monitor initialization failed: ${error.message}`);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Monitor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Monitor...');

    await this.initialize();

    // Monitor loop
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        logger.info('Scanning for arbitrage opportunities...');

        // Example: Check price of DAI/USDC
        const daiUsdcPrice = await this.dexService.getPrice('DAI', 'USDC');
        logger.info(`DAI/USDC Price: 1 DAI = ${daiUsdcPrice.price} USDC (Path: ${daiUsdcPrice.path})`);

        // Example: Check price of WETH/DAI
        const wethDaiPrice = await this.dexService.getPrice('WETH', 'DAI');
        logger.info(`WETH/DAI Price: 1 WETH = ${wethDaiPrice.price} DAI (Path: ${wethDaiPrice.path})`);

        // Simulate finding an opportunity
        if (Math.random() < 0.2) { // 20% chance to "find" an opportunity
          logger.info('Simulated arbitrage opportunity found! (This would be sent to the bot)');
        }

      } catch (error) {
        logger.error(`Error during monitoring: ${error.message}`);
      }
    }, config.monitor.interval); // Check every X milliseconds
  }

  stop() {
    this.isRunning = false;
    logger.info('Stopping Monitor...');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down monitor gracefully...');
  if (monitor) {
    monitor.stop();
  }
  process.exit(0);
});

const monitor = new Monitor();
monitor.start().catch(error => {
  logger.error(`Failed to start monitor: ${error.message}`);
  process.exit(1);
});
