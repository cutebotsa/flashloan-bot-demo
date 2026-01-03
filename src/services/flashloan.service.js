const { ethers } = require('ethers');
const config = require('../config');
const logger = require('../utils/logger');

class FlashloanService {
  constructor(provider, wallet) {
    this.provider = provider || new ethers.providers.JsonRpcProvider(config.network.rpcUrl);
    this.wallet = wallet || new ethers.Wallet(config.wallet.privateKey, this.provider);
    this.flashloanProvider = config.flashloan.provider;
    
    // ABI for the flashloan provider (simplified for demo)
    this.flashloanAbi = [
      'function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata modes, address onBehalfOf, bytes calldata params, uint16 referralCode) external',
      'event FlashLoan(address indexed target, address indexed initiator, address indexed asset, uint256 amount, uint256 premium, uint16 referralCode)'
    ];
    
    this.flashloanContract = new ethers.Contract(
      this.flashloanProvider,
      this.flashloanAbi,
      this.wallet
    );
  }

  /**
   * Execute a flashloan
   * @param {Object} params - Flashloan parameters
   * @param {string} params.asset - The address of the asset to borrow
   * @param {string} params.amount - The amount to borrow (in wei)
   * @param {Function} params.callback - The callback function to execute with the loan
   * @returns {Promise<Object>} - Transaction receipt and result
   */
  async executeFlashloan({ asset, amount, callback }) {
    try {
      logger.info(`Initiating flashloan for ${ethers.utils.formatEther(amount)} of asset ${asset}`);
      
      // Prepare flashloan parameters
      const assets = [asset];
      const amounts = [amount];
      const modes = [0]; // 0 = no debt, 1 = stable, 2 = variable
      const onBehalfOf = this.wallet.address;
      const params = '0x';
      const referralCode = 0;

      // Estimate gas for the flashloan
      const gasEstimate = await this.flashloanContract.estimateGas.flashLoan(
        this.wallet.address, // receiverAddress
        assets,
        amounts,
        modes,
        onBehalfOf,
        params,
        referralCode
      );

      // Execute the flashloan
      const tx = await this.flashloanContract.flashLoan(
        this.wallet.address, // receiverAddress
        assets,
        amounts,
        modes,
        onBehalfOf,
        params,
        referralCode,
        { gasLimit: gasEstimate.mul(12).div(10) } // Add 20% buffer
      );

      logger.info(`Flashloan transaction sent: ${tx.hash}`);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // Execute the callback with the borrowed amount
      const result = await callback(amount);
      
      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        result
      };
    } catch (error) {
      logger.error(`Flashloan execution failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simulate a flashloan (for testing and demo purposes)
   * @param {Object} params - Flashloan parameters
   * @param {string} params.asset - The address of the asset to borrow
   * @param {string} params.amount - The amount to borrow (in wei)
   * @param {Function} params.callback - The callback function to execute with the loan
   * @returns {Promise<Object>} - Simulation result
   */
  async simulateFlashloan({ asset, amount, callback }) {
    try {
      logger.info(`Simulating flashloan for ${ethers.utils.formatEther(amount)} of asset ${asset}`);
      
      // Calculate the fee
      const fee = ethers.BigNumber.from(amount).mul(Math.floor(config.flashloan.fee * 10000)).div(10000);
      const totalRepayment = ethers.BigNumber.from(amount).add(fee);
      
      // Execute the callback with the borrowed amount
      const result = await callback(amount);
      
      // Check if the callback has enough to repay the loan
      const profit = ethers.BigNumber.from(result.amountOut).sub(totalRepayment);
      const isProfitable = profit.gt(0);
      
      return {
        success: true,
        isProfitable,
        profit: profit.toString(),
        fee: fee.toString(),
        totalRepayment: totalRepayment.toString(),
        result
      };
    } catch (error) {
      logger.error(`Flashloan simulation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = FlashloanService;
