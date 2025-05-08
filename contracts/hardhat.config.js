require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.17',
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [ process.env.PRIVATE_KEY ]
    }
  }
};