import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("zkSlidePuzzle", function () {
  let zk15: Contract;
  before(async () => {
    
    // const VerifierContract = await ethers.getContractFactory("Verifier");
    // const verifier = await VerifierContract.deploy();

    // await verifier.deployed();

    // console.log("Verifier deployed to:", verifier.address);

    const Zk15 = await ethers.getContractFactory("zk15");
    // const zk15 = await Zk15.deploy(verifier.address);
    zk15 = await Zk15.deploy();

    await zk15.deployed();
    console.log("Zk15 deployed to:", zk15.address);
  });
  describe("zk15", function () {
    const r = Math.random;
    const f = Math.floor;

    it("should", async function () {
      // const arr = await zk15.get();
      
      const arr = await zk15.getRandomBoard();  });
      // const arr = await zk15.getRandomBoard(f((r() * 10) ** 5));  });
      it("should", async function () {
        // const arr = await zk15.get();
        const arr = await zk15.getRandomBoard();  });
      // const arr = await zk15.getRandomBoard(f((r() * 10) ** 5));  });

    it("should", async function () {
      // const arr = await zk15.get();
      const arr = await zk15.getRandomBoard();  });
      // const arr = await zk15.getRandomBoard(f((r() * 10) ** 5));  });

    
      // console.log(arr); 

      // expect(await greeter.greet()).to.equal("Hello, world!");

      // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

      // wait until the transaction is mined
      // await setGreetingTx.wait();

      // expect(await greeter.greet()).to.equal("Hola, mundo!");
    });
  });

