# Encrypted Hand vs Hand - Rock Paper Scissors Tournament

A privacy-preserving Rock-Paper-Scissors tournament built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). Players encrypt their moves on-chain, preventing cheating while maintaining complete privacy of strategies.

## 🎮 Features

- **Encrypted Moves**: Players encrypt their RPS moves using Zama FHE before submitting
- **Tournament Bracket**: Automatic tournament management with round progression
- **USDC Payments**: Entry fees and prize pool management via USDC
- **Verifiable Outcomes**: Match results computed on encrypted data without revealing moves
- **Farcaster Integration**: Built to be deployed as a Farcaster frame for social sharing

## 🏗️ Project Structure

```
encrypted-rps-tournament/
├── contracts/
│   └── RPSTournament.sol       # Main FHEVM smart contract
├── frontend/
│   └── src/
│       ├── components/         # React components
│       │   ├── RPSMatch.tsx     # Match UI with move selection
│       │   └── TournamentJoin.tsx # Tournament join UI
│       └── services/
│           └── fhevm.ts        # FHEVM encryption utilities
├── scripts/
│   └── deploy.ts               # Deployment script
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or similar Web3 wallet

### Installation

1. Clone and navigate to project:
```bash
cd encrypted-rps-tournament
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

4. Compile contracts:
```bash
npm run compile
```

### Deployment

**To FHEVM Testnet:**
```bash
npm run deploy
```

**To local Hardhat network:**
```bash
npm run deploy:local
```

The contract will log its deployment address - save this for frontend configuration.

## 🎯 How It Works

### Tournament Flow
1. **Registration Phase**: Players join tournament by paying entry fee in USDC
2. **Match Creation**: Tournament owner starts tournament, automatic bracket generation
3. **Move Commitment**: Players encrypt and submit their moves
4. **Resolution**: Contract computes winner using FHE comparisons on encrypted data
5. **Payout**: Winners receive prize directly to their wallet

### Encryption Process
Players interact with Zama's Relayer SDK to:
- Encrypt their move locally (Rock=0, Paper=1, Scissors=2)
- Generate zero-knowledge proof of correct encryption
- Submit encrypted move + proof to smart contract

### Match Resolution
Smart contract uses FHEVM encrypted comparisons:
```
Rock (0) beats Scissors (2)
Paper (1) beats Rock (0)
Scissors (2) beats Paper (1)
```

## 📝 Move Encoding

| Move | Code |
|------|------|
| Rock | 0 |
| Paper | 1 |
| Scissors | 2 |

## 🔐 Security Considerations

- **Move Privacy**: Encrypted moves remain confidential until game end
- **Proof Verification**: ZK proofs ensure valid encryption by intended player
- **Immutable Results**: Match outcomes verified on-chain, cryptographically secure

⚠️ **Note**: This is a testnet implementation. Do not use with real funds on mainnet until audited.

## 📦 Smart Contract Functions

### Tournament Management
- `createTournament(entryFee)` - Owner creates new tournament
- `joinTournament(tournamentId)` - Player joins and pays entry fee
- `startTournament(tournamentId)` - Owner starts tournament

### Match Operations
- `commitMove(matchId, encryptedMove, inputProof)` - Player submits encrypted move
- `resolveMatch(matchId)` - Compute match winner from encrypted moves
- `payoutMatch(matchId)` - Transfer winnings to winner

### Queries
- `getTournament(tournamentId)` - Get tournament details
- `getMatch(matchId)` - Get match state
- `getTournamentPlayers(tournamentId)` - List tournament participants

## 🔗 Frontend Integration

The React components handle:
- Move selection UI with emojis (✊🎮✌️)
- Encryption via Zama Relayer SDK
- Transaction submission and status tracking
- Tournament participation flow

## 🚧 Future Enhancements

- [ ] Multi-round bracket management
- [ ] Leaderboard and season rankings
- [ ] Farcaster frame deployment
- [ ] NFT badges for winners
- [ ] Spectator mode with encrypted match viewing
- [ ] Time-based match expiry
- [ ] Dispute resolution mechanism

## 📚 Resources

- [Zama Protocol Docs](https://docs.zama.org/protocol)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Zama Developer Hub](https://www.zama.org/developer-hub)
- [FHEVM Quick Start](https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm)

## 📄 License

BSD-3-Clause-Clear

## 👤 Author

Jojo - Blockchain Developer

---

**Built with ❤️ using Zama's FHEVM for confidential gaming**
