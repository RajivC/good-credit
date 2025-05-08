require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const Registry = await ethers.getContractFactory('DocumentRegistry');
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log('DocumentRegistry deployed to:', registry.address);
}

main().catch(e => { console.error(e); process.exit(1); });