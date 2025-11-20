# Zama Protocol Integration Guide

## Overview

Your Rock-Paper-Scissors Tournament now integrates with the **Zama Protocol** for fully homomorphic encryption (FHE) on-chain. This guide explains the key components, chain IDs, relayer configuration, and how everything works together.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Frontend (React/Next.js)            │
│  (Player encrypts moves locally in browser)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Zama Relayer Service                                 │
│  https://relayer.testnet.zama.cloud                         │
│  - Receives encrypted inputs from browser                    │
│  - Forwards to Gateway for processing                        │
│  - Returns encrypted proofs                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌─────────────────────┐  ┌──────────────────────┐
│  Host Chain         │  │  Gateway Chain       │
│  (Sepolia)          │  │  (Off-chain compute) │
│  Chain ID: 11155111 │  │  Chain ID: 55815     │
│                     │  │                      │
│ Smart Contracts:    │  │ Coprocessors & KMS   │
│ - RPSTournament.sol │  │ - Verify inputs      │
│ - Access Control    │  │ - Manage encryption  │
│ - State management  │  │ - Handle decryption  │
└─────────────────────┘  └──────────────────────┘
          ▲
          │
          └─ Your RPS Matches happen here
```

---

## Key Identifiers & Configuration

### 1. Host Chain (Ethereum Sepolia)
**Purpose**: Where your smart contracts run and game state is managed

| Property | Value |
|----------|-------|
| **Chain ID** | 11155111 |
| **Network Name** | Ethereum Sepolia |
| **RPC URL** | https://eth-sepolia.public.blastapi.io |
| **Purpose** | Smart contract execution, tournament management |

### 2. Gateway Chain (Zama Gateway)
**Purpose**: Off-chain computation layer for FHE operations

| Property | Value |
|----------|-------|
| **Chain ID** | 55815 |
| **Network Type** | Off-chain Coprocessor Network |
| **Purpose** | Encryption/decryption, FHE computation |

### 3. Relayer Service
**Purpose**: User-facing API that bridges frontend and gateway

| Property | Value |
|----------|-------|
| **Relayer URL** | https://relayer.testnet.zama.cloud |
| **Type** | HTTP REST API |
| **Function** | Encrypts moves, handles proofs, verifies inputs |
| **Trust Model** | Stateless & untrusted (all data is verifiable) |

---

## Smart Contract Addresses

### On Host Chain (Sepolia - 11155111)

These are Zama's infrastructure contracts on Sepolia:

```typescript
// Access Control List - tracks who can decrypt what
ACL_ADDRESS = 0x687820221192C5B662b25367F70076A37bc79b6c

// Key Management Service - manages FHE keys
KMS_ADDRESS = 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC

// Input Verifier - verifies encrypted inputs
INPUT_VERIFIER_ADDRESS = 0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
```

### On Gateway Chain (55815)

These handle decryption and verification off-chain:

```typescript
// Decryption verification
DECRYPTION_ADDRESS = 0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1

// Input verification
INPUT_VERIFICATION_ADDRESS = 0x7048C39f048125eDa9d678AEbaDfB22F7900a29F
```

---

## How It Works: Step-by-Step

### When a Player Makes a Move:

```
1. Player clicks "Rock", "Paper", or "Scissors" in React UI
                 ↓
2. Frontend calls encryptMove(RPSMove.ROCK)
                 ↓
3. encryptMove() initializes Zama Relayer
   - Connects to: https://relayer.testnet.zama.cloud
   - Uses Host Chain ID: 11155111
                 ↓
4. Relayer encrypts the move using FHE
   - Move is encrypted as euint8 (8-bit encrypted unsigned int)
   - Generates input proof showing encryption is valid
   - All done client-side (relayer doesn't see plaintext)
                 ↓
5. Returns encrypted move & proof to frontend
                 ↓
6. Frontend submits to RPSTournament.sol smart contract
   - Contract call: commitMove(matchId, encryptedMove, inputProof)
   - Uses Sepolia RPC (11155111)
                 ↓
7. Smart contract stores encrypted moves (still encrypted!)
                 ↓
8. resolveMatch() compares encrypted moves using FHE
   - No decryption needed
   - Winner determined on encrypted data
   - Only decrypts final result
```

---

## Integration Files Updated

### 1. `frontend/src/services/fhevm.ts`
**What was added**:
- Import of `@zama-fhe/relayer-sdk`
- `ZAMA_CONFIG` object with all chain IDs and addresses
- `initializeZama()` function that sets up the relayer
- Updated `encryptMove()` to use real Zama encryption

**Key function**:
```typescript
export const ZAMA_CONFIG = {
  hostChainId: 11155111,           // Sepolia
  gatewayChainId: 55815,           // Zama Gateway
  relayerUrl: "https://relayer.testnet.zama.cloud",
  // ... contract addresses
};

export async function encryptMove(move: RPSMove): Promise<EncryptedMove> {
  const zama = await initializeZama();
  const encrypted = await zama.encrypt(Buffer.from([move]), "euint8");
  return {
    encryptedValue: encrypted.ciphertext.toString(),
    inputProof: encrypted.inputProof.toString(),
  };
}
```

### 2. `frontend/.env.local.example`
**What was added**:
Environment variables for all Zama configuration:
- `NEXT_PUBLIC_ZAMA_HOST_CHAIN_ID=11155111`
- `NEXT_PUBLIC_ZAMA_GATEWAY_CHAIN_ID=55815`
- `NEXT_PUBLIC_ZAMA_RELAYER_URL=https://relayer.testnet.zama.cloud`
- All contract addresses

### 3. Smart Contract (`contracts/RPSTournament.sol`)
**Already compatible!** The contract:
- Extends `EthereumConfig` from FHEVM
- Uses `externalEuint8` for encrypted moves
- Accepts `inputProof` for zero-knowledge verification
- Performs FHE comparisons without decryption

---

## Environment Setup

### Step 1: Install Zama Relayer SDK

```bash
cd frontend
npm install @zama-fhe/relayer-sdk
```

### Step 2: Create `.env.local`

Copy from `.env.local.example` and update:

```bash
# Copy the example
cp .env.local.example .env.local

# Update with your deployed contract addresses
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0x...  # Your deployed RPSTournament
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x... # Your deployed MockERC20
```

### Step 3: Verify Configuration

The app will automatically log when Zama initializes:

```
✅ Zama Relayer initialized on Sepolia testnet
   Host Chain ID: 11155111
   Gateway Chain ID: 55815
   Relayer URL: https://relayer.testnet.zama.cloud
```

---

## Testing the Integration

### Test 1: Encrypt a Move

```typescript
import { encryptMove, RPSMove } from '@/services/fhevm';

// This should work after npm install @zama-fhe/relayer-sdk
const encrypted = await encryptMove(RPSMove.ROCK);
console.log("Encrypted:", encrypted.encryptedValue);
console.log("Proof:", encrypted.inputProof);
```

### Test 2: Submit to Contract

```typescript
import { submitEncryptedMove } from '@/services/fhevm';

const txHash = await submitEncryptedMove(
  contractAddress,
  matchId,
  encrypted,
  provider
);
console.log("Move submitted:", txHash);
```

### Test 3: Full Tournament Flow

1. Create tournament
2. Join tournament (pay entry fee)
3. Encrypt and submit move
4. Opponent submits move
5. Resolve match (FHE computation)
6. Winner receives payout

---

## Important Notes

### About the Relayer

The Relayer is stateless and untrusted—all data flows are signed and auditable by the user. Users can always run their own relayer or interact with the Gateway directly if needed.

### Security Properties

- **Encryption**: Happens in your browser, relayer never sees plaintext
- **Proof**: Generated client-side, verifiable on-chain
- **Computation**: Performed by Zama's KMS using FHE, no decryption
- **Privacy**: Moves remain encrypted throughout tournament

### Testnet Disclaimer

This is deployed on **testnet only**. From the Zama docs:
> The Zama Protocol Testnet is not audited and is not intended for production use. Do not publish any critical or sensitive data.

---

## Troubleshooting

### Error: "Zama initialization failed"

**Solution**:
```bash
npm install @zama-fhe/relayer-sdk
npm run dev  # Restart dev server
```

### Error: "Relayer unreachable"

**Possible causes**:
- Internet connection issue
- Relayer service down (check Zama status)
- Using wrong relayer URL

**Solution**: Try alternative relayer or check Zama Discord

### Gas Limit Exceeded

**Solution**: Increase gas limit in `fhevm.ts`:
```typescript
{
  gasLimit: 1000000,  // Increase from 500000
}
```

---

## References

- **Zama Protocol Docs**: https://docs.zama.org/protocol
- **Relayer SDK Docs**: https://docs.zama.org/protocol/relayer-sdk-guides
- **Smart Contract Addresses**: https://docs.zama.org/protocol/solidity-guides/smart-contract/configure/contract_addresses

---

## Next Steps

1. ✅ Install `@zama-fhe/relayer-sdk`
2. ✅ Create `.env.local` with configuration
3. ✅ Deploy smart contract to Sepolia
4. ✅ Run `npm run dev` to start frontend
5. ✅ Test tournament flow with encrypted moves
6. ✅ Deploy frontend to Vercel (optional)

Your encrypted RPS tournament is now fully integrated with Zama FHE! 🚀
