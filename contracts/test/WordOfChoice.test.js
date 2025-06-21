const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WordOfChoiceLife", function () {
  let wordOfChoiceLife;
  let owner;
  let user;
  const mintPrice = ethers.parseEther("0.0069");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const WordOfChoiceLife = await ethers.getContractFactory("WordOfChoiceLife");
    wordOfChoiceLife = await WordOfChoiceLife.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wordOfChoiceLife.owner()).to.equal(owner.address);
    });

    it("Should set the correct mint price", async function () {
      expect(await wordOfChoiceLife.mintPrice()).to.equal(mintPrice);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT with expression", async function () {
      const isBest = true;
      const word = "TEST";
      const tx = await wordOfChoiceLife.connect(user).express(isBest, word, { value: mintPrice });
      const receipt = await tx.wait();
      
      // Check event was emitted (2 logs: Transfer + ExpressionMinted)
      expect(receipt.logs).to.have.length(2);
      
      expect(await wordOfChoiceLife.ownerOf(1)).to.equal(user.address);
      const expression = await wordOfChoiceLife.expressions(1);
      expect(expression.word).to.equal(word);
      expect(expression.isBest).to.equal(isBest);
    });

    it("Should fail if payment is insufficient", async function () {
      const isBest = false;
      const word = "TEST";
      await expect(
        wordOfChoiceLife.connect(user).express(isBest, word, { value: ethers.parseEther("0.0005") })
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "InsufficientPayment");
    });

    it("Should fail if word is empty", async function () {
      await expect(
        wordOfChoiceLife.connect(user).express(true, "", { value: mintPrice })
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "WordEmptyOrTooLong");
    });

    it("Should fail if word is too long", async function () {
      const longWord = "TOOLONGWORD";
      await expect(
        wordOfChoiceLife.connect(user).express(true, longWord, { value: mintPrice })
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "WordEmptyOrTooLong");
    });

    it("Should fail if word has invalid characters", async function () {
      await expect(
        wordOfChoiceLife.connect(user).express(true, "test", { value: mintPrice })
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "WordHasInvalidChars");
    });

    it("Should fail if word is already used", async function () {
      const word = "TEST";
      await wordOfChoiceLife.connect(user).express(true, word, { value: mintPrice });
      await expect(
        wordOfChoiceLife.connect(user).express(false, word, { value: mintPrice })
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "WordAlreadyUsed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change mint price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await wordOfChoiceLife.setMintPrice(newPrice);
      expect(await wordOfChoiceLife.mintPrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to change mint price", async function () {
      const newPrice = ethers.parseEther("0.002");
      await expect(
        wordOfChoiceLife.connect(user).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(wordOfChoiceLife, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw funds", async function () {
      // Mint an NFT to add funds to contract
      await wordOfChoiceLife.connect(user).express(true, "TEST", { value: mintPrice });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await wordOfChoiceLife.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
}); 