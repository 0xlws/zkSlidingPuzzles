// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { Contract } from "ethers";
import { ethers } from "hardhat";
import { task, types } from "hardhat/config";

task("deploy")
.addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
.setAction(async ({ logs }, { ethers }): Promise<Contract> => {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy


  const VerifierContract = await ethers.getContractFactory("Verifier");
  const Verifier = await VerifierContract.deploy();

  await Verifier.deployed();

  console.log("Verifier deployed to:", Verifier.address);
  
  
  const zk15 = await ethers.getContractFactory("zk15");
  const Zk15 = await zk15.deploy(Verifier.address);

  await Verifier.deployed();

  console.log("zk15 deployed to:", Zk15.address);
  
  return Verifier
})

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
