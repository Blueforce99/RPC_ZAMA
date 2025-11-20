/**
 * FHEVM Encryption Service
 * Handles encryption of RPS moves using Zama Relayer SDK
 * Updated for new smart contract with externalEuint8 support
 * 
 * Integrates with Zama Protocol using:
 * - Host Chain ID: 11155111 (Ethereum Sepolia)
 * - Gateway Chain ID: 55815
 * - Relayer URL: https://relayer.testnet.zama.cloud
 */

import { BrowserProvider, Contract, AbiCoder } from "ethers";

// Dynamically import Zama SDK (avoid build-time issues)
let zamaInstance: any = null;

// Zama Protocol Configuration
export const ZAMA_CONFIG = {
  // FHEVM Host chain (where smart contracts run)
  hostChainId: 11155111, // Ethereum Sepolia
  hostChainRpc: "https://eth-sepolia.public.blastapi.io",
  
  // Gateway chain (off-chain computation)
  gatewayChainId: 55815,
  
  // Relayer service
  relayerUrl: "https://relayer.testnet.zama.cloud",
  
  // Contract addresses on Host chain (Sepolia)
  contracts: {
    aclAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
    kmsAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    inputVerifierAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  },
  
  // Contract addresses on Gateway chain
  gatewayContracts: {
    decryptionAddress: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
    inputVerificationAddress: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  },
};

export enum RPSMove {
  ROCK = 0,
  PAPER = 1,
  SCISSORS = 2,
}

export interface EncryptedMove {
  encryptedValue: string;
  inputProof: string;
}

/**
 * Initialize Zama Relayer instance
 */
export async function initializeZama() {
  if (zamaInstance) return zamaInstance;

  try {
    const { createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk");
    
    zamaInstance = await createInstance(SepoliaConfig);
    console.log("✅ Zama Relayer initialized on Sepolia testnet");
    console.log(`   Host Chain ID: ${ZAMA_CONFIG.hostChainId}`);
    console.log(`   Gateway Chain ID: ${ZAMA_CONFIG.gatewayChainId}`);
    console.log(`   Relayer URL: ${ZAMA_CONFIG.relayerUrl}`);
    
    return zamaInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Zama:", error);
    throw new Error(
      `Zama initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }. Make sure to install: npm install @zama-fhe/relayer-sdk`
    );
  }
}

/**
 * Encrypts an RPS move using Zama FHE
 * Returns encrypted bytes and input proof for on-chain verification
 */
export async function encryptMove(move: RPSMove): Promise<EncryptedMove> {
  try {
    const zama = await initializeZama();

    // Convert move to bytes for encryption
    const moveBuffer = Buffer.from([move]);

    // Encrypt the move using Zama's FHE
    const encrypted = await zama.encrypt(moveBuffer, "euint8");

    console.log("✅ Move encrypted successfully");

    return {
      encryptedValue: encrypted.ciphertext.toString(),
      inputProof: encrypted.inputProof.toString(),
    };
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error(
      `Failed to encrypt move: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Mock encryption for development (NOT FOR PRODUCTION)
 */
export async function encryptMoveMock(move: RPSMove): Promise<EncryptedMove> {
  console.warn("⚠️ Using mock encryption - NOT FOR PRODUCTION");

  const mockCiphertext = "0x" + Buffer.from([move]).toString("hex").padStart(64, "0");
  const mockProof = "0x" + "00".repeat(256);

  return {
    encryptedValue: mockCiphertext,
    inputProof: mockProof,
  };
}

/**
 * Submits an encrypted move to the smart contract
 * New signature: commitMove(uint256 _matchId, externalEuint8 _encryptedMove, bytes calldata _inputProof)
 */
export async function submitEncryptedMove(
  contractAddress: string,
  matchId: number,
  encryptedMove: EncryptedMove,
  provider: BrowserProvider
): Promise<string> {
  try {
    const signer = await provider.getSigner();

    // Updated ABI for new contract with externalEuint8 support
    const contractABI = [
      "function commitMove(uint256 _matchId, bytes calldata _encryptedMove, bytes calldata _inputProof) external",
    ];

    const contract = new Contract(contractAddress, contractABI, signer);

    // Submit encrypted move with input proof for ZK verification
    const tx = await contract.commitMove(
      matchId,
      encryptedMove.encryptedValue,
      encryptedMove.inputProof,
      {
        gasLimit: 500000,
      }
    );

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Transaction failed");

    console.log("✅ Encrypted move submitted successfully:", receipt.transactionHash);
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Move submission failed:", error);
    throw new Error(
      `Failed to submit move: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Resolve match using on-chain FHE comparison
 * New signature: resolveMatch(uint256 _matchId)
 * This performs encrypted computation without decryption
 */
export async function resolveMatchOnChain(
  contractAddress: string,
  matchId: number,
  provider: BrowserProvider
): Promise<string> {
  try {
    const signer = await provider.getSigner();

    const contractABI = [
      "function resolveMatch(uint256 _matchId) external",
    ];

    const contract = new Contract(contractAddress, contractABI, signer);

    const tx = await contract.resolveMatch(matchId, {
      gasLimit: 500000,
    });

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Transaction failed");

    console.log("✅ Match resolved with FHE comparison:", receipt.transactionHash);
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Match resolution failed:", error);
    throw new Error(
      `Failed to resolve match: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Approves USDC spending for tournament entry
 */
export async function approveUSDC(
  usdcAddress: string,
  spenderAddress: string,
  amount: string,
  provider: BrowserProvider
): Promise<string> {
  try {
    const signer = await provider.getSigner();

    const usdcABI = [
      "function approve(address spender, uint256 amount) returns (bool)",
    ];

    const usdc = new Contract(usdcAddress, usdcABI, signer);

    const tx = await usdc.approve(spenderAddress, amount);
    const receipt = await tx.wait();

    if (!receipt) throw new Error("Approval transaction failed");

    console.log("✅ USDC approved successfully");
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ USDC approval failed:", error);
    throw new Error(
      `Failed to approve USDC: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Joins a tournament by paying entry fee
 */
export async function joinTournament(
  contractAddress: string,
  tournamentId: number,
  provider: BrowserProvider
): Promise<string> {
  try {
    const signer = await provider.getSigner();

    const tournamentABI = [
      "function joinTournament(uint256 _tournamentId) external",
    ];

    const tournament = new Contract(contractAddress, tournamentABI, signer);

    const tx = await tournament.joinTournament(tournamentId, {
      gasLimit: 200000,
    });

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Join transaction failed");

    console.log("✅ Tournament joined successfully");
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Tournament join failed:", error);
    throw new Error(
      `Failed to join tournament: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Payout match winner
 */
export async function payoutMatch(
  contractAddress: string,
  matchId: number,
  provider: BrowserProvider
): Promise<string> {
  try {
    const signer = await provider.getSigner();

    const contractABI = [
      "function payoutMatch(uint256 _matchId) external",
    ];

    const contract = new Contract(contractAddress, contractABI, signer);

    const tx = await contract.payoutMatch(matchId, {
      gasLimit: 300000,
    });

    const receipt = await tx.wait();
    if (!receipt) throw new Error("Payout transaction failed");

    console.log("✅ Match payout successful");
    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Match payout failed:", error);
    throw new Error(
      `Failed to payout match: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Converts move enum to display emoji
 */
export function getMoveDisplay(move: RPSMove): string {
  const displays = {
    [RPSMove.ROCK]: "✊",
    [RPSMove.PAPER]: "✋",
    [RPSMove.SCISSORS]: "✌️",
  };
  return displays[move] || "?";
}

/**
 * Converts move enum to name string
 */
export function getMoveName(move: RPSMove): string {
  const names = {
    [RPSMove.ROCK]: "Rock",
    [RPSMove.PAPER]: "Paper",
    [RPSMove.SCISSORS]: "Scissors",
  };
  return names[move] || "Unknown";
}

/**
 * Determines winner of RPS match (for UI display only)
 */
export function determineWinner(
  move1: RPSMove,
  move2: RPSMove
): "player1" | "player2" | "tie" {
  if (move1 === move2) return "tie";

  if (move1 === RPSMove.ROCK && move2 === RPSMove.SCISSORS) return "player1";
  if (move1 === RPSMove.PAPER && move2 === RPSMove.ROCK) return "player1";
  if (move1 === RPSMove.SCISSORS && move2 === RPSMove.PAPER) return "player1";

  return "player2";
}
