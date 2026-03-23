import { expect } from "chai";
import { ethers } from "hardhat";
import type { FundShareToken } from "../typechain-types/contracts/FundShareToken";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FundShareToken", function () {
  async function deployFixture() {
    const [admin, investor1, investor2, system1, system2, outsider] =
      await ethers.getSigners();

    const token = (await ethers.deployContract("FundShareToken", [
      admin.address,
    ])) as FundShareToken;
    await token.waitForDeployment();

    return {
      token,
      admin,
      investor1,
      investor2,
      system1,
      system2,
      outsider,
    };
  }

  async function setWhitelists(
    token: FundShareToken,
    admin: HardhatEthersSigner,
    investors: HardhatEthersSigner[] = [],
    systems: HardhatEthersSigner[] = []
  ) {
    for (const investor of investors) {
      await token.connect(admin).setInvestorWhitelist(investor.address, true);
    }

    for (const system of systems) {
      await token.connect(admin).setSystemWhitelist(system.address, true);
    }
  }

  describe("deployment", function () {
    it("should set admin roles correctly", async function () {
      const { token, admin } = await deployFixture();

      const defaultAdminRole = await token.DEFAULT_ADMIN_ROLE();
      const minterRole = await token.MINTER_ROLE();
      const complianceRole = await token.COMPLIANCE_ROLE();
      const pauserRole = await token.PAUSER_ROLE();
      const burnerRole = await token.BURNER_ROLE();

      expect(await token.hasRole(defaultAdminRole, admin.address)).to.equal(true);
      expect(await token.hasRole(minterRole, admin.address)).to.equal(true);
      expect(await token.hasRole(complianceRole, admin.address)).to.equal(true);
      expect(await token.hasRole(pauserRole, admin.address)).to.equal(true);
      expect(await token.hasRole(burnerRole, admin.address)).to.equal(true);
    });

    it("should not automatically whitelist admin as investor or system", async function () {
      const { token, admin } = await deployFixture();

      expect(await token.isInvestorWhitelisted(admin.address)).to.equal(false);
      expect(await token.isSystemWhitelisted(admin.address)).to.equal(false);
    });
  });

  describe("whitelist management", function () {
    it("admin with COMPLIANCE_ROLE can add/remove investor whitelist", async function () {
      const { token, admin, investor1 } = await deployFixture();

      await token.connect(admin).setInvestorWhitelist(investor1.address, true);
      expect(await token.isInvestorWhitelisted(investor1.address)).to.equal(true);

      await token.connect(admin).setInvestorWhitelist(investor1.address, false);
      expect(await token.isInvestorWhitelisted(investor1.address)).to.equal(false);
    });

    it("admin with COMPLIANCE_ROLE can add/remove system whitelist", async function () {
      const { token, admin, system1 } = await deployFixture();

      await token.connect(admin).setSystemWhitelist(system1.address, true);
      expect(await token.isSystemWhitelisted(system1.address)).to.equal(true);

      await token.connect(admin).setSystemWhitelist(system1.address, false);
      expect(await token.isSystemWhitelisted(system1.address)).to.equal(false);
    });

    it("zero address should revert when setting investor whitelist", async function () {
      const { token, admin } = await deployFixture();

      await expect(
        token
          .connect(admin)
          .setInvestorWhitelist(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });

    it("zero address should revert when setting system whitelist", async function () {
      const { token, admin } = await deployFixture();

      await expect(
        token.connect(admin).setSystemWhitelist(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });
  });

  describe("minting", function () {
    let token: FundShareToken;
    let admin: HardhatEthersSigner;
    let investor1: HardhatEthersSigner;
    let system1: HardhatEthersSigner;
    let outsider: HardhatEthersSigner;

    beforeEach(async function () {
      ({ token, admin, investor1, system1, outsider } = await deployFixture());

      await setWhitelists(token, admin, [investor1], [system1]);
    });

    it("mint to investor-whitelisted address succeeds", async function () {
      const amount = 1000n;

      expect(await token.totalSupply()).to.equal(0n);
      expect(await token.balanceOf(investor1.address)).to.equal(0n);

      await token.connect(admin).mint(investor1.address, amount);

      expect(await token.balanceOf(investor1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("mint to system-whitelisted address succeeds", async function () {
      const amount = 2500n;

      await token.connect(admin).mint(system1.address, amount);

      expect(await token.balanceOf(system1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("mint to outsider should revert", async function () {
      await expect(
        token.connect(admin).mint(outsider.address, 100n)
      ).to.be.revertedWithCustomError(token, "AddressNotAllowed");
    });

    it("mint with zero amount should revert", async function () {
      await expect(
        token.connect(admin).mint(investor1.address, 0)
      ).to.be.revertedWithCustomError(token, "InvalidAmount");
    });
  });

  describe("transfer routing", function () {
    let token: FundShareToken;
    let admin: HardhatEthersSigner;
    let investor1: HardhatEthersSigner;
    let investor2: HardhatEthersSigner;
    let system1: HardhatEthersSigner;
    let system2: HardhatEthersSigner;
    let outsider: HardhatEthersSigner;

    beforeEach(async function () {
      ({ token, admin, investor1, investor2, system1, system2, outsider } =
        await deployFixture());

      await setWhitelists(token, admin, [investor1, investor2], [system1, system2]);
    });

    it("investor -> investor transfer succeeds", async function () {
      await token.connect(admin).mint(investor1.address, 100n);

      await token.connect(investor1).transfer(investor2.address, 30n);

      expect(await token.balanceOf(investor1.address)).to.equal(70n);
      expect(await token.balanceOf(investor2.address)).to.equal(30n);
    });

    it("investor -> system transfer succeeds", async function () {
      await token.connect(admin).mint(investor1.address, 100n);

      await token.connect(investor1).transfer(system1.address, 40n);

      expect(await token.balanceOf(investor1.address)).to.equal(60n);
      expect(await token.balanceOf(system1.address)).to.equal(40n);
    });

    it("system -> investor transfer succeeds", async function () {
      await token.connect(admin).mint(system1.address, 100n);

      await token.connect(system1).transfer(investor1.address, 25n);

      expect(await token.balanceOf(system1.address)).to.equal(75n);
      expect(await token.balanceOf(investor1.address)).to.equal(25n);
    });

    it("system -> system transfer reverts", async function () {
      await token.connect(admin).mint(system1.address, 100n);

      await expect(
        token.connect(system1).transfer(system2.address, 10n)
      )
        .to.be.revertedWithCustomError(token, "InvalidTransferRoute")
        .withArgs(system1.address, system2.address);
    });

    it("investor -> outsider reverts", async function () {
      await token.connect(admin).mint(investor1.address, 100n);

      await expect(
        token.connect(investor1).transfer(outsider.address, 10n)
      )
        .to.be.revertedWithCustomError(token, "InvalidTransferRoute")
        .withArgs(investor1.address, outsider.address);
    });

    it("outsider -> investor reverts if outsider somehow has tokens", async function () {
      await token.connect(admin).setInvestorWhitelist(outsider.address, true);
      await token.connect(admin).mint(outsider.address, 100n);
      await token.connect(admin).setInvestorWhitelist(outsider.address, false);

      await expect(
        token.connect(outsider).transfer(investor1.address, 10n)
      )
        .to.be.revertedWithCustomError(token, "InvalidTransferRoute")
        .withArgs(outsider.address, investor1.address);
    });
  });

  describe("burning", function () {
    let token: FundShareToken;
    let admin: HardhatEthersSigner;
    let investor1: HardhatEthersSigner;

    beforeEach(async function () {
      ({ token, admin, investor1 } = await deployFixture());
      await setWhitelists(token, admin, [investor1], []);
      await token.connect(admin).mint(investor1.address, 500n);
    });

    it("burn by admin succeeds when admin has BURNER_ROLE", async function () {
      const burnAmount = 120n;
      const supplyBefore = await token.totalSupply();
      const balanceBefore = await token.balanceOf(investor1.address);

      await token.connect(admin).burn(investor1.address, burnAmount);

      expect(await token.balanceOf(investor1.address)).to.equal(
        balanceBefore - burnAmount
      );
      expect(await token.totalSupply()).to.equal(supplyBefore - burnAmount);
    });

    it("burn with zero amount reverts", async function () {
      await expect(
        token.connect(admin).burn(investor1.address, 0)
      ).to.be.revertedWithCustomError(token, "InvalidAmount");
    });

    it("burn from zero address reverts", async function () {
      await expect(
        token.connect(admin).burn(ethers.ZeroAddress, 1n)
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });

    it("burn should reduce totalSupply", async function () {
      const burnAmount = 50n;
      const supplyBefore = await token.totalSupply();

      await token.connect(admin).burn(investor1.address, burnAmount);

      expect(await token.totalSupply()).to.equal(supplyBefore - burnAmount);
    });
  });

  describe("pausing", function () {
    let token: FundShareToken;
    let admin: HardhatEthersSigner;
    let investor1: HardhatEthersSigner;
    let investor2: HardhatEthersSigner;

    beforeEach(async function () {
      ({ token, admin, investor1, investor2 } = await deployFixture());
      await setWhitelists(token, admin, [investor1, investor2], []);
      await token.connect(admin).mint(investor1.address, 100n);
    });

    it("pause by admin succeeds", async function () {
      await token.connect(admin).pause();
      expect(await token.paused()).to.equal(true);
    });

    it("while paused: transfer should revert", async function () {
      await token.connect(admin).pause();

      await expect(
        token.connect(investor1).transfer(investor2.address, 10n)
      ).to.be.reverted;
    });

    it("while paused: mint should revert", async function () {
      await token.connect(admin).pause();

      await expect(
        token.connect(admin).mint(investor2.address, 10n)
      ).to.be.reverted;
    });

    it("while paused: burn should revert", async function () {
      await token.connect(admin).pause();

      await expect(
        token.connect(admin).burn(investor1.address, 10n)
      ).to.be.reverted;
    });

    it("unpause restores normal behavior", async function () {
      await token.connect(admin).pause();
      await token.connect(admin).unpause();

      await token.connect(investor1).transfer(investor2.address, 10n);

      expect(await token.balanceOf(investor1.address)).to.equal(90n);
      expect(await token.balanceOf(investor2.address)).to.equal(10n);
    });
  });

  describe("access control", function () {
    let token: FundShareToken;
    let admin: HardhatEthersSigner;
    let investor1: HardhatEthersSigner;
    let outsider: HardhatEthersSigner;

    beforeEach(async function () {
      ({ token, admin, investor1, outsider } = await deployFixture());
      await setWhitelists(token, admin, [investor1], []);
    });

    it("non-admin/non-role account cannot mint", async function () {
      const minterRole = await token.MINTER_ROLE();

      await expect(token.connect(outsider).mint(investor1.address, 1n))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, minterRole);
    });

    it("non-compliance account cannot update whitelists", async function () {
      const complianceRole = await token.COMPLIANCE_ROLE();

      await expect(
        token.connect(outsider).setInvestorWhitelist(investor1.address, true)
      )
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, complianceRole);

      await expect(
        token.connect(outsider).setSystemWhitelist(investor1.address, true)
      )
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, complianceRole);
    });

    it("non-pauser account cannot pause", async function () {
      const pauserRole = await token.PAUSER_ROLE();

      await expect(token.connect(outsider).pause())
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, pauserRole);
    });

    it("non-burner account cannot burn", async function () {
      const burnerRole = await token.BURNER_ROLE();

      await expect(token.connect(outsider).burn(investor1.address, 1n))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, burnerRole);
    });
  });
});
