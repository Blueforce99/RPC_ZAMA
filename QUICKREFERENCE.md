# Quick Reference Guide

## 🎯 Quick Command Reference

```bash
# Setup
npm install                    # Install all dependencies
npm run compile               # Compile Solidity contracts
npm run test                  # Run contract tests
npm run node                  # Start local Hardhat node

# Deployment
npm run deploy                # Deploy to FHEVM Testnet
npm run deploy:local          # Deploy to local network

# Development
npm run clean                 # Clean build artifacts
```

## 🔍 Contract Functions Quick Reference

### Tournament Management

```solidity
// Create new tournament
createTournament(uint256 _entryFee)

// Join active tournament
joinTournament(uint256 _tournamentId)

// Start tournament (owner only)
startTournament(uint256 _tournamentId)

// Get tournament info
getTournament(uint256 _tournamentId) → Tournament

// Get all players
getTournamentPlayers(uint256 _tournamentId) → address[]
```

### Match Operations

```solidity
// Submit encrypted move
commitMove(
  uint256 _matchId, 
  externalEuint8 _encryptedMove, 
  bytes calldata _inputProof
)

// Resolve match result
resolveMatch(uint256 _matchId)

// Payout match winner
payoutMatch(uint256 _matchId)

// Get match info
getMatch(uint256 _matchId) → Match
```

## 📊 Move Encoding

| Move | Value |
|------|-------|
| Rock | 0 |
| Paper | 1 |
| Scissors | 2 |

## 🎮 Win Conditions

```
Rock (0)     beats Scissors (2)
Paper (1)    beats Rock (0)
Scissors (2) beats Paper (1)
Same move    = Tie
```

## 🔐 Encryption Workflow

```javascript
// 1. Encrypt move locally
const { encrypted, proof } = await encryptMove(moveValue);

// 2. Submit to contract
await commitMove(matchId, encrypted, proof);

// 3. Contract verifies and stores encrypted value
// 4. When both players committed, anyone can resolve

// 5. Contract compares encrypted values
// 6. Winner determined without decryption
// 7. Payout issued
```

## 🧪 Testing Examples

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/RPSTournament.test.ts

# Run with verbose output
npx hardhat test --verbose
```

## 💰 Transaction Costs (Estimates)

| Action | Gas | Est. Cost (30 gwei) |
|--------|-----|-------------------|
| Create Tournament | 50k | $2.00 |
| Join Tournament | 100k | $4.00 |
| Commit Move | 80k | $3.20 |
| Resolve Match | 120k | $4.80 |
| Payout | 60k | $2.40 |
| **Total (2 players)** | **410k** | **~$16.40** |

## 🌐 Network Information

### FHEVM Testnet
- **RPC URL**: https://fhevm-testnet.zama.ai
- **Chain ID**: 8545
- **Gas Price**: 30 gwei (typical)
- **Gateway**: https://gateway.fhevm-testnet.zama.ai

### Local Hardhat
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 1337
- **Gas Price**: 1 gwei

## 📱 Frontend Integration Quick Start

```typescript
// Connect wallet
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create contract instance
const contract = new Contract(address, ABI, signer);

// Call tournament function
await contract.joinTournament(tournamentId);

// Get tournament data
const tournament = await contract.getTournament(tournamentId);
```

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Already joined" | Duplicate join | Check if address already in tournament |
| "Approval failed" | No USDC balance | Get testnet USDC from faucet |
| "Both players must commit" | Match not ready | Wait for opponent to submit move |
| "Network mismatch" | Wrong chain | Switch to FHEVM Testnet |
| "Encryption failed" | Gateway down | Wait or check Zama status page |

## 📈 Project Milestones

- ✅ **Day 1-2**: Smart contract + frontend components
- ⏳ **Day 3-4**: Testing + local deployment
- ⏳ **Day 5-10**: Testnet deployment + React app
- ⏳ **Week 3+**: Farcaster integration + production

## 🎯 Success Checklist

- [ ] Contract compiles without errors
- [ ] Tests pass locally
- [ ] Deploys to FHEVM Testnet
- [ ] Can create tournament
- [ ] Can join tournament
- [ ] Can commit encrypted moves
- [ ] Matches resolve correctly
- [ ] Winners receive payouts
- [ ] Frontend connects to testnet
- [ ] Farcaster frame works on Warpcast

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| QUICKSTART.md | Setup & testing |
| ARCHITECTURE.md | Technical details |
| NEXTSTEPS.md | Deployment roadmap |
| STRUCTURE.md | File organization |
| This file | Quick reference |

## 🔗 Useful Links

- Zama Docs: https://docs.zama.org/protocol
- FHEVM GitHub: https://github.com/zama-ai/fhevm
- Hardhat Docs: https://hardhat.org/
- Ethers.js: https://docs.ethers.org/
- Next.js: https://nextjs.org/docs

## 💡 Pro Tips

1. **Save deployment addresses** - You'll need them for frontend
2. **Test locally first** - Much faster than testnet
3. **Monitor gas usage** - Testnet gas is free but good practice
4. **Keep .env secure** - Never commit private keys
5. **Check Zama status** - Gateway availability varies
6. **Enable verbose logs** - Helps debug issues

## 🚀 Start Here

```bash
# 1. Install
npm install

# 2. Compile
npm run compile

# 3. Test
npm run test

# 4. Deploy
npm run deploy
```

Then follow NEXTSTEPS.md for next steps!

---

**Last Updated**: November 2025
**FHEVM Version**: 0.7+
**Zama Testnet**: Active
