const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreamCredit", function () {
  let streamCredit;
  let usdc;
  let verifier;
  let owner;
  let borrower;
  let lender;

  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // Deploy MockVerifier
    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    verifier = await MockVerifier.deploy();

    // Deploy StreamCredit
    const StreamCredit = await ethers.getContractFactory("StreamCredit");
    streamCredit = await StreamCredit.deploy(
      await verifier.getAddress(),
      await usdc.getAddress()
    );

    // Setup initial liquidity
    const liquidityAmount = ethers.parseUnits("100000", 6);
    await usdc.approve(await streamCredit.getAddress(), liquidityAmount);
    await streamCredit.addLiquidity(liquidityAmount);

    // Give borrower some USDC for repayment tests
    await usdc.transfer(borrower.address, ethers.parseUnits("10000", 6));
  });

  describe("Credit Verification", function () {
    it("Should verify proof and update credit limit", async function () {
      const revenue = 50000; // $50k revenue
      const creditLimit = (revenue * 30) / 100; // 30% = $15k

      // Mock proof data
      const proof = {
        a: [0, 0],
        b: [[0, 0], [0, 0]],
        c: [0, 0],
        input: [1] // isValid = 1
      };

      await streamCredit.connect(borrower).verifyAndUpdateCredit(
        proof.a,
        proof.b,
        proof.c,
        proof.input,
        revenue
      );

      const limit = await streamCredit.creditLimit(borrower.address);
      expect(limit).to.equal(creditLimit);
    });

    it("Should reject invalid proof", async function () {
      await verifier.setAlwaysPass(false);

      const proof = {
        a: [0, 0],
        b: [[0, 0], [0, 0]],
        c: [0, 0],
        input: [0] // isValid = 0
      };

      await expect(
        streamCredit.connect(borrower).verifyAndUpdateCredit(
          proof.a,
          proof.b,
          proof.c,
          proof.input,
          50000
        )
      ).to.be.revertedWith("Proof validation failed");
    });
  });

  describe("Borrowing", function () {
    beforeEach(async function () {
      // Setup credit limit
      const proof = {
        a: [0, 0],
        b: [[0, 0], [0, 0]],
        c: [0, 0],
        input: [1]
      };
      await streamCredit.connect(borrower).verifyAndUpdateCredit(
        proof.a, proof.b, proof.c, proof.input, 50000
      );
    });

    it("Should allow borrowing within credit limit", async function () {
      const borrowAmount = ethers.parseUnits("5000", 6);
      
      await streamCredit.connect(borrower).borrow(borrowAmount);
      
      const borrowed = await streamCredit.borrowed(borrower.address);
      expect(borrowed).to.equal(borrowAmount);
    });

    it("Should reject borrowing exceeding credit limit", async function () {
      const borrowAmount = ethers.parseUnits("20000", 6); // Exceeds 15k limit
      
      await expect(
        streamCredit.connect(borrower).borrow(borrowAmount)
      ).to.be.revertedWith("Exceeds credit limit");
    });

    it("Should reject borrowing without credit limit", async function () {
      const borrowAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        streamCredit.connect(lender).borrow(borrowAmount)
      ).to.be.revertedWith("No credit limit");
    });
  });

  describe("Repayment", function () {
    beforeEach(async function () {
      // Setup and borrow
      const proof = {
        a: [0, 0],
        b: [[0, 0], [0, 0]],
        c: [0, 0],
        input: [1]
      };
      await streamCredit.connect(borrower).verifyAndUpdateCredit(
        proof.a, proof.b, proof.c, proof.input, 50000
      );
      
      const borrowAmount = ethers.parseUnits("5000", 6);
      await streamCredit.connect(borrower).borrow(borrowAmount);
    });

    it("Should allow repayment", async function () {
      const repayAmount = ethers.parseUnits("2000", 6);
      
      await usdc.connect(borrower).approve(
        await streamCredit.getAddress(),
        repayAmount
      );
      await streamCredit.connect(borrower).repay(repayAmount);
      
      const borrowed = await streamCredit.borrowed(borrower.address);
      expect(borrowed).to.equal(ethers.parseUnits("3000", 6));
    });
  });

  describe("Liquidity Management", function () {
    it("Should allow adding liquidity", async function () {
      const amount = ethers.parseUnits("10000", 6);
      
      await usdc.connect(lender).approve(
        await streamCredit.getAddress(),
        amount
      );
      
      // Mint to lender first
      await usdc.mint(lender.address, amount);
      
      await usdc.connect(lender).approve(
        await streamCredit.getAddress(),
        amount
      );
      await streamCredit.connect(lender).addLiquidity(amount);
      
      const provided = await streamCredit.liquidityProvided(lender.address);
      expect(provided).to.equal(amount);
    });

    it("Should allow removing liquidity", async function () {
      const amount = ethers.parseUnits("10000", 6);
      
      // Add liquidity first
      await usdc.mint(lender.address, amount);
      await usdc.connect(lender).approve(
        await streamCredit.getAddress(),
        amount
      );
      await streamCredit.connect(lender).addLiquidity(amount);
      
      // Remove liquidity
      await streamCredit.connect(lender).removeLiquidity(amount);
      
      const provided = await streamCredit.liquidityProvided(lender.address);
      expect(provided).to.equal(0);
    });
  });
});
