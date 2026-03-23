import { expect } from "chai";
import { ethers } from "hardhat";
import type { FundShareToken } from "../typechain-types/contracts/FundShareToken";
import type { RedemptionManager } from "../typechain-types/contracts/RedemptionManager";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const STATUS_REQUESTED = 0n;
const STATUS_APPROVED = 1n;
const STATUS_REJECTED = 2n;
const STATUS_PROCESSED = 3n;

describe("RedemptionManager", function () {
  async function deployFixture(options?: {
    whitelistManager?: boolean;
    grantBurnerToManager?: boolean;
    mintAmount?: bigint;
  }) {
    const whitelistManager = options?.whitelistManager ?? true;
    const grantBurnerToManager = options?.grantBurnerToManager ?? true;
    const mintAmount = options?.mintAmount ?? 1_000n;

    const [admin, investor1, investor2, outsider] = await ethers.getSigners();

    const token = (await ethers.deployContract("FundShareToken", [
      admin.address,
    ])) as FundShareToken;
    await token.waitForDeployment();

    const manager = (await ethers.deployContract("RedemptionManager", [
      admin.address,
      await token.getAddress(),
    ])) as RedemptionManager;
    await manager.waitForDeployment();

    await token.connect(admin).setInvestorWhitelist(investor1.address, true);
    await token.connect(admin).setInvestorWhitelist(investor2.address, true);

    if (whitelistManager) {
      await token
        .connect(admin)
        .setSystemWhitelist(await manager.getAddress(), true);
    }

    if (grantBurnerToManager) {
      const burnerRole = await token.BURNER_ROLE();
      await token
        .connect(admin)
        .grantRole(burnerRole, await manager.getAddress());
    }

    await token.connect(admin).mint(investor1.address, mintAmount);

    return {
      token,
      manager,
      admin,
      investor1,
      investor2,
      outsider,
      mintAmount,
    };
  }

  async function request(
    manager: RedemptionManager,
    token: FundShareToken,
    investor: HardhatEthersSigner,
    amount: bigint
  ) {
    await token.connect(investor).approve(await manager.getAddress(), amount);
    await manager.connect(investor).requestRedemption(amount);
  }

  describe("deployment", function () {
    it("RedemptionManager should store FundShareToken address correctly", async function () {
      const { token, manager } = await deployFixture();

      expect(await manager.fundShareToken()).to.equal(await token.getAddress());
    });

    it("admin should have REDEMPTION_OPERATOR_ROLE", async function () {
      const { manager, admin } = await deployFixture();

      const role = await manager.REDEMPTION_OPERATOR_ROLE();
      expect(await manager.hasRole(role, admin.address)).to.equal(true);
    });

    it("next request id should start at 1", async function () {
      const { manager } = await deployFixture();

      expect(await manager.getNextRequestId()).to.equal(1n);
    });
  });

  describe("requestRedemption", function () {
    it("request with zero amount reverts", async function () {
      const { manager, investor1 } = await deployFixture();

      await expect(
        manager.connect(investor1).requestRedemption(0)
      ).to.be.revertedWithCustomError(manager, "InvalidAmount");
    });

    it("request with insufficient balance reverts", async function () {
      const { manager, token, investor1, mintAmount } = await deployFixture();
      const amount = mintAmount + 1n;

      await token.connect(investor1).approve(await manager.getAddress(), amount);

      await expect(manager.connect(investor1).requestRedemption(amount))
        .to.be.revertedWithCustomError(manager, "InsufficientBalance")
        .withArgs(investor1.address, amount, mintAmount);
    });

    it("request without enough allowance reverts", async function () {
      const { manager, token, investor1 } = await deployFixture();

      await token.connect(investor1).approve(await manager.getAddress(), 50n);

      await expect(manager.connect(investor1).requestRedemption(100n))
        .to.be.revertedWithCustomError(manager, "InsufficientAllowance")
        .withArgs(investor1.address, 100n, 50n);
    });

    it("request succeeds when balance and allowance are enough", async function () {
      const { manager, token, investor1 } = await deployFixture();
      const amount = 300n;

      const investorBefore = await token.balanceOf(investor1.address);
      const managerBefore = await token.balanceOf(await manager.getAddress());

      await token.connect(investor1).approve(await manager.getAddress(), amount);
      await manager.connect(investor1).requestRedemption(amount);

      expect(await token.balanceOf(investor1.address)).to.equal(investorBefore - amount);
      expect(await token.balanceOf(await manager.getAddress())).to.equal(
        managerBefore + amount
      );
    });

    it("on success: request struct is stored correctly, status Requested, and next request id increments", async function () {
      const { manager, token, investor1 } = await deployFixture();
      const amount = 200n;
      const nextBefore = await manager.getNextRequestId();

      await token.connect(investor1).approve(await manager.getAddress(), amount);
      await manager.connect(investor1).requestRedemption(amount);

      const req = await manager.getRequest(1n);
      expect(req.id).to.equal(1n);
      expect(req.requester).to.equal(investor1.address);
      expect(req.amount).to.equal(amount);
      expect(req.requestedAt).to.be.gt(0n);
      expect(req.status).to.equal(STATUS_REQUESTED);
      expect(await manager.getNextRequestId()).to.equal(nextBefore + 1n);
    });

    it("after requestRedemption, RedemptionManager balance should equal escrowed amount", async function () {
      const { manager, token, investor1 } = await deployFixture();
      const amount = 111n;

      expect(await token.balanceOf(await manager.getAddress())).to.equal(0n);

      await request(manager, token, investor1, amount);

      expect(await token.balanceOf(await manager.getAddress())).to.equal(amount);
    });

    it("should support multiple redemption requests from the same investor", async function () {
      const { manager, token, investor1 } = await deployFixture();

      await token.connect(investor1).approve(await manager.getAddress(), 500n);
      await manager.connect(investor1).requestRedemption(120n);
      await manager.connect(investor1).requestRedemption(180n);

      const req1 = await manager.getRequest(1n);
      const req2 = await manager.getRequest(2n);

      expect(req1.requester).to.equal(investor1.address);
      expect(req2.requester).to.equal(investor1.address);
      expect(req1.amount).to.equal(120n);
      expect(req2.amount).to.equal(180n);
    });

    it("should support multiple request ids incrementing correctly", async function () {
      const { manager, token, investor1 } = await deployFixture();

      await token.connect(investor1).approve(await manager.getAddress(), 300n);
      await manager.connect(investor1).requestRedemption(100n);
      await manager.connect(investor1).requestRedemption(100n);
      await manager.connect(investor1).requestRedemption(100n);

      expect((await manager.getRequest(1n)).id).to.equal(1n);
      expect((await manager.getRequest(2n)).id).to.equal(2n);
      expect((await manager.getRequest(3n)).id).to.equal(3n);
      expect(await manager.getNextRequestId()).to.equal(4n);
    });
  });

  describe("approveRedemption", function () {
    it("operator can approve a Requested request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_APPROVED);
    });

    it("non-operator cannot approve", async function () {
      const { manager, token, outsider, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);

      const role = await manager.REDEMPTION_OPERATOR_ROLE();
      await expect(manager.connect(outsider).approveRedemption(1n))
        .to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, role);
    });

    it("approving non-existent request reverts", async function () {
      const { manager, admin } = await deployFixture();

      await expect(manager.connect(admin).approveRedemption(999n))
        .to.be.revertedWithCustomError(manager, "RequestNotFound")
        .withArgs(999n);
    });

    it("approving already approved request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);

      await expect(manager.connect(admin).approveRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_APPROVED);
    });

    it("approving rejected request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).rejectRedemption(1n);

      await expect(manager.connect(admin).approveRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_REJECTED);
    });

    it("approving processed request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).processRedemption(1n);

      await expect(manager.connect(admin).approveRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_PROCESSED);
    });

    it("approving one request should not affect another request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await token.connect(investor1).approve(await manager.getAddress(), 300n);
      await manager.connect(investor1).requestRedemption(100n);
      await manager.connect(investor1).requestRedemption(200n);

      await manager.connect(admin).approveRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_APPROVED);
      expect((await manager.getRequest(2n)).status).to.equal(STATUS_REQUESTED);
    });
  });

  describe("rejectRedemption", function () {
    it("operator can reject a Requested request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).rejectRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_REJECTED);
    });

    it("operator can reject an Approved request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).rejectRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_REJECTED);
    });

    it("on reject: escrowed tokens are returned to requester and status becomes Rejected", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();
      const amount = 120n;

      const investorBefore = await token.balanceOf(investor1.address);
      await request(manager, token, investor1, amount);

      expect(await token.balanceOf(investor1.address)).to.equal(investorBefore - amount);
      expect(await token.balanceOf(await manager.getAddress())).to.equal(amount);

      await manager.connect(admin).rejectRedemption(1n);

      expect(await token.balanceOf(investor1.address)).to.equal(investorBefore);
      expect(await token.balanceOf(await manager.getAddress())).to.equal(0n);
      expect((await manager.getRequest(1n)).status).to.equal(STATUS_REJECTED);
    });

    it("non-operator cannot reject", async function () {
      const { manager, token, outsider, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);

      const role = await manager.REDEMPTION_OPERATOR_ROLE();
      await expect(manager.connect(outsider).rejectRedemption(1n))
        .to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, role);
    });

    it("rejecting non-existent request reverts", async function () {
      const { manager, admin } = await deployFixture();

      await expect(manager.connect(admin).rejectRedemption(88n))
        .to.be.revertedWithCustomError(manager, "RequestNotFound")
        .withArgs(88n);
    });

    it("rejecting already rejected request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).rejectRedemption(1n);

      await expect(manager.connect(admin).rejectRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_REJECTED);
    });

    it("rejecting processed request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).processRedemption(1n);

      await expect(manager.connect(admin).rejectRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_PROCESSED);
    });

    it("after rejectRedemption, RedemptionManager balance decreases and investor balance is restored", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      const investorBefore = await token.balanceOf(investor1.address);

      await request(manager, token, investor1, 90n);

      const managerAfterRequest = await token.balanceOf(await manager.getAddress());
      expect(managerAfterRequest).to.equal(90n);

      await manager.connect(admin).rejectRedemption(1n);

      expect(await token.balanceOf(await manager.getAddress())).to.equal(0n);
      expect(await token.balanceOf(investor1.address)).to.equal(investorBefore);
    });

    it("rejecting one request should not affect another request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await token.connect(investor1).approve(await manager.getAddress(), 300n);
      await manager.connect(investor1).requestRedemption(100n);
      await manager.connect(investor1).requestRedemption(200n);

      await manager.connect(admin).approveRedemption(2n);
      await manager.connect(admin).rejectRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_REJECTED);
      expect((await manager.getRequest(2n)).status).to.equal(STATUS_APPROVED);
    });
  });

  describe("processRedemption", function () {
    it("operator can process an Approved request", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).processRedemption(1n);

      expect((await manager.getRequest(1n)).status).to.equal(STATUS_PROCESSED);
    });

    it("on process: escrowed tokens are burned from RedemptionManager, requester does not receive tokens back, status becomes Processed, totalSupply decreases", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();
      const amount = 150n;

      const investorBefore = await token.balanceOf(investor1.address);
      const supplyBefore = await token.totalSupply();

      await request(manager, token, investor1, amount);
      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).processRedemption(1n);

      expect(await token.balanceOf(await manager.getAddress())).to.equal(0n);
      expect(await token.balanceOf(investor1.address)).to.equal(investorBefore - amount);
      expect(await token.totalSupply()).to.equal(supplyBefore - amount);
      expect((await manager.getRequest(1n)).status).to.equal(STATUS_PROCESSED);
    });

    it("processing a Requested request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);

      await expect(manager.connect(admin).processRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_REQUESTED);
    });

    it("processing a Rejected request reverts", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).rejectRedemption(1n);

      await expect(manager.connect(admin).processRedemption(1n))
        .to.be.revertedWithCustomError(manager, "InvalidRedemptionStatus")
        .withArgs(1n, STATUS_REJECTED);
    });

    it("processing a non-existent request reverts", async function () {
      const { manager, admin } = await deployFixture();

      await expect(manager.connect(admin).processRedemption(777n))
        .to.be.revertedWithCustomError(manager, "RequestNotFound")
        .withArgs(777n);
    });

    it("non-operator cannot process", async function () {
      const { manager, token, admin, outsider, investor1 } = await deployFixture();

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);

      const role = await manager.REDEMPTION_OPERATOR_ROLE();
      await expect(manager.connect(outsider).processRedemption(1n))
        .to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, role);
    });

    it("after processRedemption, RedemptionManager balance decreases and totalSupply decreases", async function () {
      const { manager, token, admin, investor1 } = await deployFixture();

      const supplyBefore = await token.totalSupply();

      await request(manager, token, investor1, 80n);
      expect(await token.balanceOf(await manager.getAddress())).to.equal(80n);

      await manager.connect(admin).approveRedemption(1n);
      await manager.connect(admin).processRedemption(1n);

      expect(await token.balanceOf(await manager.getAddress())).to.equal(0n);
      expect(await token.totalSupply()).to.equal(supplyBefore - 80n);
    });
  });

  describe("integration failures", function () {
    it("if RedemptionManager is not added to FundShareToken system whitelist, requestRedemption should fail", async function () {
      const { manager, token, investor1 } = await deployFixture({
        whitelistManager: false,
      });

      await token.connect(investor1).approve(await manager.getAddress(), 100n);

      await expect(manager.connect(investor1).requestRedemption(100n))
        .to.be.revertedWithCustomError(token, "InvalidTransferRoute")
        .withArgs(investor1.address, await manager.getAddress());
    });

    it("if RedemptionManager is not granted BURNER_ROLE, processRedemption should fail", async function () {
      const { manager, token, admin, investor1 } = await deployFixture({
        grantBurnerToManager: false,
      });

      await request(manager, token, investor1, 100n);
      await manager.connect(admin).approveRedemption(1n);

      const burnerRole = await token.BURNER_ROLE();
      await expect(manager.connect(admin).processRedemption(1n))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(await manager.getAddress(), burnerRole);
    });
  });
});
