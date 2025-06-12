const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WordOfChoice", function () {
  let wordOfChoice;
  let owner;
  let user;
  const mintPrice = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const WordOfChoice = await ethers.getContractFactory("WordOfChoice");
    wordOfChoice = await WordOfChoice.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wordOfChoice.owner()).to.equal(owner.address);
    });

    it("Should set the correct mint price", async function () {
      expect(await wordOfChoice.mintPrice()).to.equal(mintPrice);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT with expression", async function () {
      const expression = "The best thing about life is chocolate";
      await expect(wordOfChoice.connect(user).mintExpression(expression, { value: mintPrice }))
        .to.emit(wordOfChoice, "ExpressionMinted")
        .withArgs(user.address, 1, expression);

      expect(await wordOfChoice.ownerOf(1)).to.equal(user.address);
      expect(await wordOfChoice.getExpression(1)).to.equal(expression);
    });

    it("Should fail if payment is insufficient", async function () {
      const expression = "Test expression";
      await expect(
        wordOfChoice.connect(user).mintExpression(expression, { value: ethers.parseEther("0.0005") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if expression is empty", async function () {
      await expect(
        wordOfChoice.connect(user).mintExpression("", { value: mintPrice })
      ).to.be.revertedWith("Expression cannot be empty");
    });

    it("Should fail if expression is too long", async function () {
      const longExpression = "a".repeat(281);
      await expect(
        wordOfChoice.connect(user).mintExpression(longExpression, { value: mintPrice })
      ).to.be.revertedWith("Expression too long");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change mint price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await wordOfChoice.setMintPrice(newPrice);
      expect(await wordOfChoice.mintPrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to change mint price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await expect(
        wordOfChoice.connect(user).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(wordOfChoice, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw funds", async function () {
      // Mint an NFT to add funds to contract
      await wordOfChoice.connect(user).mintExpression("Test", { value: mintPrice });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await wordOfChoice.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
}); 