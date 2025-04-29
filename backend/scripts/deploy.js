async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from", deployer.address);

  const Factory = await ethers.getContractFactory("DocumentRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();
  console.log("DocumentRegistry deployed to:", await registry.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});