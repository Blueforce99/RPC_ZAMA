# Encrypted Hand vs Hand - Project Documentation

## Overview

This project builds an **Encrypted Rock-Paper-Scissors Tournament** using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). It demonstrates practical use of FHE for gaming where:

- Players encrypt their moves client-side before submission
- Smart contract computes match results using encrypted comparisons
- Nobody (not even the contract) knows moves until the game ends
- Results are cryptographically verifiable and tamper-proof

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Farcaster Frame UI                 │
│            (Planned integration point)              │
└────────────────────┬────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────┐
│               React Frontend (Next.js)              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │ TournamentUI │  │  Match UI    │  │ Leaderboard ││
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘│
└─────────────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────────┐      ┌──────▼───────┐
    │Zama Relayer │      │  Contract    │
    │   (Encrypt) │      │  Calls       │
    └────┬────────┘      └──────┬───────┘
         │                      │
    ┌────▼──────────────────────▼────┐
    │   FHEVM Testnet RPC Endpoint   │
    │   (fhevm-testnet.zama.ai)      │
    └───────────────────────────────┘
                  │
         ┌────────▼────────┐
         │ Smart Contract  │
         │  (Encrypted Ops)│
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Zama Gateway   │
         │  (Decryption)   │
         └─────────────────┘
```

## Smart Contract (`RPSTournament.sol`)

### Key Components

**Tournament Struct**
- Stores tournament state, player list, prize pool
- Tracks tournament phase (Registration → Active → Completed)

**Match Struct**
- Encrypted moves from both players
- Match state tracking
- Winner determination

**Encrypted Types (FHEVM)**
- `euint8` for encrypted moves (0=Rock, 1=Paper, 2=Scissors)
- `ebool` for comparison results

### Core Functions

| Function | Purpose | Access |
|----------|---------|--------|
| `createTournament` | Initialize new tournament | Owner |
| `joinTournament` | Players pay entry fee and join | Public |
| `startTournament` | Begin tournament, create matches | Owner |
| `commitMove` | Submit encrypted move | Players |
| `resolveMatch` | Compute winner from encrypted data | Public |
| `payoutMatch` | Distribute winnings | Public |

### Encryption Flow

```
1. Player selects move (Rock/Paper/Scissors)
   ↓
2. Frontend calls Zama Relayer to encrypt
   ↓
3. Relayer returns (encryptedValue, ZKproof)
   ↓
4. Frontend submits to contract: commitMove(matchId, encrypted, proof)
   ↓
5. Contract verifies proof via FHE.fromExternal()
   ↓
6. Encrypted value stored in match state
   ↓
7. No decryption happens until game end
```

## Frontend Services

### `fhevm.ts` - Encryption Service

```typescript
// Encrypts move and gets proof
encryptMove(move: number) → { encrypted: string, proof: string }

// Submits encrypted move to contract
commitMove(contractAddress, matchId, encrypted, proof) → txHash

// Resolves match result
resolveMatch(contractAddress, matchId) → txHash
```

## Game Logic

### Move Comparison

Implemented using encrypted boolean operations:

```solidity
// Player 1 wins if:
// (Rock beats Scissors)     OR
// (Paper beats Rock)        OR  
// (Scissors beats Paper)

ebool p1Wins = FHE.or(
  FHE.or(
    FHE.and(eq(p1, ROCK), eq(p2, SCISSORS)),
    FHE.and(eq(p1, PAPER), eq(p2, ROCK))
  ),
  FHE.and(eq(p1, SCISSORS), eq(p2, PAPER))
);
```

All operations happen on **encrypted data** - values never decrypted during computation.

## Tournament Flow

### Phase 1: Registration
```
Owner creates tournament with entry fee
     ↓
Players join tournament
  - Approve USDC spending
  - Pay entry fee
  - Added to player roster
     ↓
Players accumulate in tournament
```

### Phase 2: Active Tournament
```
Owner calls startTournament()
     ↓
Contract auto-generates bracket
  - Pairs up players
  - Creates matches
     ↓
Players compete in matches
  - Each player selects move
  - Encrypts move locally
  - Submits encrypted move
     ↓
Both players have committed
     ↓
resolveMatch() computes winner
  - Encrypted comparison
  - Winner determined
     ↓
payoutMatch() distributes prizes
```

### Phase 3: Completed
```
All matches resolved
     ↓
Final bracket determined
     ↓
Tournament completed
```

## Security Model

### What's Protected?
- **Move Privacy**: Encrypted until end of game
- **Proof Verification**: ZK proofs ensure sender encrypted the value
- **Immutable Results**: Contract-verified outcome

### What's Public?
- Wallet addresses of participants
- Tournament entry and winnings
- Final match results
- Prize distributions

### Attack Prevention

1. **Move Changing**: Can't modify encrypted value post-submission (cryptographic binding)
2. **Front-running**: Moves encrypted before submission to network
3. **Collusion**: No way to prove what you encrypted before game
4. **Sybil Attacks**: Entry fee required (can be adjusted for threshold)

## Development Phases

### Phase 1 ✅ (2 Days - Current)
- Core FHEVM smart contract
- Tournament logic
- Match resolution
- Basic React components

### Phase 2 (3-5 Days - Planned)
- Farcaster frame integration
- Complete frontend UI
- Leaderboard system
- Test suite

### Phase 3 (1-2 Weeks - Future)
- Production deployment
- Frontend on Vercel
- Seasonal tournaments
- NFT badges/rewards

### Phase 4 (Ongoing)
- Spectator mode
- Advanced match visualization
- Cross-tournament rankings
- Creator program integration

## Testing Strategy

### Unit Tests
- Tournament creation
- Player joining
- Match creation
- Entry validation

### Integration Tests (Planned)
- Full tournament flow
- Encrypted move submission
- Match resolution
- Payout distribution

### Manual Testing Steps

1. **Deploy locally**
   ```bash
   npm run deploy:local
   ```

2. **Create tournament**
   ```bash
   npx hardhat console --network hardhat
   > const tournament = await ethers.getContractAt("RPSTournament", deployedAddress)
   > await tournament.createTournament(ethers.parseUnits("10", 6))
   ```

3. **Simulate players joining**
   - Use different signers
   - Approve USDC
   - Join tournament

4. **Start tournament**
   - Owner starts tournament
   - Verify matches created

## Configuration

### Environment Variables

```
# Private key for deployment
PRIVATE_KEY=0x...

# RPC Endpoints
SEPOLIA_RPC_URL=https://rpc.sepolia.org
FHEVM_RPC_URL=https://fhevm-testnet.zama.ai

# Zama Services
FHEVM_GATEWAY_URL=https://gateway.fhevm-testnet.zama.ai

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8545
```

### Network Configuration

**FHEVM Testnet**
- RPC: https://fhevm-testnet.zama.ai
- Chain ID: 8545
- Gas: ~30 gwei
- Status: https://status.zama.ai

## Deployment Checklist

- [ ] Contracts compiled and tested
- [ ] USDC address verified for network
- [ ] Environment variables set
- [ ] Private key secured
- [ ] Frontend contract address updated
- [ ] Farcaster frame endpoints configured
- [ ] Monitoring/alerting setup
- [ ] Documentation reviewed

## Cost Analysis

### Gas Costs (Estimates)
- Tournament creation: ~50k gas
- Join tournament: ~100k gas (includes USDC approval)
- Commit move: ~80k gas
- Resolve match: ~120k gas
- Payout: ~60k gas

**Total per tournament (2 players, 1 round): ~410k gas**

At 30 gwei: ~0.0123 ETH (~$50 depending on gas)

## Future Enhancement Ideas

### Gameplay
- Time-based move submission windows
- Best-of-3 matches
- Tournament brackets (16, 32 player)
- Streaming integration

### Social
- Farcaster native tournament creation
- Share match results as casts
- Friend challenges
- Tournament seasons

### Economics
- Rake/platform fee (e.g., 5%)
- Sponsorship/prize pools
- Betting on matches
- Tournament franchising

### Technical
- Automated tournament scheduling
- Dispute resolution mechanism
- Replay/spectator mode
- Mobile app

## References & Resources

- **Zama Docs**: https://docs.zama.org/protocol
- **FHEVM GitHub**: https://github.com/zama-ai/fhevm
- **Solidity Guides**: https://docs.zama.org/protocol/solidity-guides/
- **Developer Hub**: https://www.zama.org/developer-hub

## License & Attribution

- Contract: BSD-3-Clause-Clear (Zama requirement)
- Code: MIT
- Built with Zama FHEVM v0.7

## Contact & Support

- **Questions**: Check Zama Discord/docs first
- **Bug Reports**: Create GitHub issue
- **Feature Requests**: Discussions section
- **Deployment Help**: Reach out to Zama team
