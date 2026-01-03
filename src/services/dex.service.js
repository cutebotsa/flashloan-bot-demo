const { ethers } = require('ethers');
const { Token, CurrencyAmount, Route, Trade, TradeType, Percent } = require('@uniswap/sdk-core');
const { AlphaRouter } = require('@uniswap/smart-order-router');
const { UniswapMulticallProvider } = require('@uniswap/smart-order-router/build/main/providers/multicall-uniswap-provider');
const config = require('../config');
const logger = require('../utils/logger');

class DexService {
  constructor(provider) {
    this.provider = provider || new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
    const multicall2Provider = new UniswapMulticallProvider(config.network.chainId, this.provider, 375000, config.network.multicallAddress);
    this.router = new AlphaRouter({ chainId: config.network.chainId, provider: this.provider, multicall2Provider });
    this.tokens = {};
    this.pairs = {};
  }

  /**
   * Initialize token instances
   */
  async initializeTokens() {
    try {
      // Initialize common tokens
      this.tokens.WETH = new Token(
        config.network.chainId,
        config.tokens.WETH,
        18, // Decimals for WETH
        'WETH',
        'Wrapped Ether'
      );
      
      this.tokens.DAI = new Token(
        config.network.chainId,
        config.tokens.DAI,
        18, // Decimals for DAI
        'DAI',
        'Dai Stablecoin'
      );
      
      this.tokens.USDC = new Token(
        config.network.chainId,
        config.tokens.USDC,
        6, // Decimals for USDC
        'USDC',
        'USD Coin'
      );
      
      this.tokens.USDT = new Token(
        config.network.chainId,
        config.tokens.USDT,
        6, // Decimals for USDT
        'USDT',
        'Tether USD'
      );
      
      logger.info('Tokens initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Failed to initialize tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get token by symbol
   * @param {string} symbol - Token symbol (e.g., 'WETH', 'DAI')
   * @returns {Token} - Token instance
   */
  getToken(symbol) {
    const token = this.tokens[symbol];
    if (!token) {
      throw new Error(`Token ${symbol} not initialized`);
    }
    return token;
  }

  /**
   * Get the best trade route between two tokens
   * @param {string} fromToken - Symbol of the token to sell
   * @param {string} toToken - Symbol of the token to buy
   * @param {string} amountIn - Amount to sell (in wei)
   * @returns {Promise<Object>} - Trade details
   */
  async getBestTrade(fromToken, toToken, amountIn) {
    try {
      const tokenIn = this.getToken(fromToken);
      const tokenOut = this.getToken(toToken);
      
      // Convert amount to CurrencyAmount
      const amount = CurrencyAmount.fromRawAmount(tokenIn, amountIn);
      
      // Get the best trade using Uniswap's router
      const route = await this.router.route(
        amount,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          recipient: config.wallet.address,
          slippageTolerance: new Percent(config.bot.maxSlippage * 100, 10_000), // 0.5% = 50 / 10,000
          deadline: Math.floor(Date.now() / 1000 + 1800) // 30 minutes from now
        }
      );

      if (!route) {
        throw new Error('No route found');
      }

      return {
        amountIn: route.quote.rawAmount.toString(),
        amountOut: route.quote.rawAmount.toString(),
        path: route.route.path.map(t => t.symbol).join(' -> '),
        priceImpact: route.quotePriceImpact.toSignificant(4) + '%',
        gasEstimate: route.estimatedGasUsed.toString(),
        trade: route
      };
    } catch (error) {
      logger.error(`Failed to get best trade from ${fromToken} to ${toToken}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the current price of a token in terms of another token
   * @param {string} fromToken - Symbol of the token to sell
   * @param {string} toToken - Symbol of the token to buy
   * @param {string} amount - Amount to sell (in wei)
   * @returns {Promise<string>} - Amount of toToken received (in wei)
   */
  async getPrice(fromToken, toToken, amount = '1000000000000000000') { // Default 1 token
    try {
      const trade = await this.getBestTrade(fromToken, toToken, amount);
      return {
        fromToken,
        toToken,
        amountIn: amount,
        amountOut: trade.amountOut,
        price: parseFloat(ethers.utils.formatUnits(trade.amountOut, this.getToken(toToken).decimals)) /
               parseFloat(ethers.utils.formatUnits(amount, this.getToken(fromToken).decimals)),
        path: trade.path
      };
    } catch (error) {
      logger.error(`Failed to get price from ${fromToken} to ${toToken}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a trade
   * @param {Object} trade - Trade object from getBestTrade
   * @param {Object} options - Additional options
   * @param {string} options.slippage - Slippage tolerance (e.g., '0.5' for 0.5%)
   * @returns {Promise<Object>} - Transaction receipt
   */
  async executeTrade(trade, options = {}) {
    try {
      const { slippage = config.bot.maxSlippage } = options;
      
      // Get the transaction parameters
      const tx = await this.router.swapCallParameters(trade.trade, {
        recipient: config.wallet.address,
        slippageTolerance: new Percent(Math.floor(slippage * 100), 10_000),
        deadline: Math.floor(Date.now() / 1000 + 1800) // 30 minutes from now
      });

      // Send the transaction
      const txResponse = await this.provider.sendTransaction({
        ...tx,
        gasPrice: ethers.utils.parseUnits(config.bot.gasPriceGwei.toString(), 'gwei'),
        gasLimit: Math.floor(Number(tx.gasLimit) * 1.2) // Add 20% buffer
      });

      logger.info(`Trade executed: ${txResponse.hash}`);
      
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
      
      return {
        success: true,
        transactionHash: txResponse.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error(`Trade execution failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = DexService;
