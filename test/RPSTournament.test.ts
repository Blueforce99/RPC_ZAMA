import { expect } from "chai";
import { ethers } from "hardhat";
import { RPSTournament } from "../typechain-types";

describe("RPSTournament", function () {
  let tournament: RPSTournament;
  let owner: any;
  let player1: any;
  let player2: any;
  let mockUsdc: any;

  const ENTRY_FEE = ethers.parseUnits("10", 6); // 10 USDC (6 decimals)

  before(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUsdc = await MockERC20.deploy("USDC", "USDC", 6);
    await mockUsdc.waitForDeployment();

    // Mint tokens to players
    await mockUsdc.mint(player1.address, ethers.parseUnits("1000", 6));
    await mockUsdc.mint(player2.address, ethers.parseUnits("1000", 6));

    // Deploy tournament contract
    const Tournament = await ethers.getContractFactory("RPSTournament");
    tournament = await Tournament.deploy(await mockUsdc.getAddress());
    await tournament.waitForDeployment();
  });

  describe("Tournament Creation", function () {
    it("Should create a tournament", async function () {
      const tx = await tournament.createTournament(ENTRY_FEE);
      await tx.wait();

      const tournamentData = await tournament.getTournament(0);
      expect(tournamentData.entryFee).to.equal(ENTRY_FEE);
      expect(tournamentData.state).to.equal(0); // REGISTRATION
    });
  });

  describe("Tournament Joining", function () {
    it("Should allow player to join tournament", async function () {
      // Approve USDC spending
      await mockUsdc.connect(player1).approve(await tournament.getAddress(), ENTRY_FEE);

      // Join tournament
      const tx = await tournament.connect(player1).joinTournament(0);
      await tx.wait();

      const tournamentData = await tournament.getTournament(0);
      expect(tournamentData.players.length).to.equal(1);
      expect(tournamentData.totalPrizePool).to.equal(ENTRY_FEE);
    });

    it("Should prevent duplicate entries", async function () {
      await mockUsdc.connect(player1).approve(await tournament.getAddress(), ENTRY_FEE);

      await expect(
        tournament.connect(player1).joinTournament(0)
      ).to.be.revertedWith("Already joined this tournament");
    });
  });

  describe("Tournament Start", function () {
    it("Should allow owner to start tournament with multiple players", async function () {
      // Add second player
      await mockUsdc.connect(player2).approve(await tournament.getAddress(), ENTRY_FEE);
      await tournament.connect(player2).joinTournament(0);

      // Start tournament
      const tx = await tournament.startTournament(0);
      await tx.wait();

      const tournamentData = await tournament.getTournament(0);
      expect(tournamentData.state).to.equal(1); // ACTIVE
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to create tournaments", async function () {
      await expect(
        tournament.connect(player1).createTournament(ENTRY_FEE)
      ).to.be.revertedWithCustomError(tournament, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to start tournaments", async function () {
      const tx = await tournament.createTournament(ENTRY_FEE);
      await tx.wait();

      await expect(
        tournament.connect(player1).startTournament(1)
      ).to.be.revertedWithCustomError(tournament, "OwnableUnauthorizedAccount");
    });
  });
});
