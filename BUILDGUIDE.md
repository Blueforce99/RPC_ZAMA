# 🚀 Build Guide - Encrypted RPS Tournament

This guide will walk you through building and deploying the Encrypted Rock-Paper-Scissors Tournament in 2-3 days.

## ⚡ Quick Start (30 minutes)

### Step 1: Setup & Install Dependencies
```bash
cd C:\Users\johns\Projects\encrypted-rps-tournament

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Compile Smart Contract
```bash
npm run compile
```

You should see output indicating successful compilation of:
- `RPSTournament.sol`
- `MockERC20.sol`

### Step 3: Run Tests
```bash
npm run test
```

Expected output: All tests pass ✓

---

## 📅 Day 1: Smart Contract Testing & Deployment

### What We'll Do
1. ✅ Compile contract (completed in Quick Start)
2. ✅ Run unit tests
3. Deploy to FHEVM Testnet
4. Verify contract on block explorer

### Test Execution
```bash
npm run test

# Watch tests (optional)
npm run test -- --watch
```

**Tests should verify:**
- ✓ Tournament creation
- ✓ Player joining with USDC payment
- ✓ Tournament start
- ✓ Access control (only owner can create/start)

### Deploy to FHEVM Testnet

**1. Get Testnet ETH and USDC**
- Go to: https://fhevm-testnet.zama.ai/faucet
- Get testnet ETH and USDC tokens

**2. Set up environment**
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
PRIVATE_KEY=your_private_key_without_0x_prefix
```

⚠️ **SECURITY**: Never commit `.env` to git!

**3. Deploy**
```bash
npm run deploy
```

Save the output:
```
✅ RPSTournament deployed at: 0x...
```

**4. Update frontend config**
Edit `.env.local` (create if doesn't exist):
```
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0x... (from deployment)
NEXT_PUBLIC_USDC_ADDRESS=0x... (USDC address on testnet)
NEXT_PUBLIC_NETWORK_ID=84532
```

---

## 📅 Day 2: Frontend Development

### What We'll Do
1. Create Next.js app structure (DONE ✓)
2. Build tournament dashboard
3. Build match UI with encryption
4. Wire up wallet connection
5. Test locally

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

Navigate to: http://localhost:3000

### Components to Build/Complete

#### ✅ Already Built:
- `app/page.tsx` - Homepage with tournament list
- `frontend/src/components/RPSMatch.tsx` - Match UI
- `frontend/src/components/TournamentJoin.tsx` - Join UI
- `frontend/src/services/fhevm.ts` - Encryption service

#### Next: Update RPSMatch.tsx to Work Properly
The existing component needs the `commitMove` function. Update it:

```bash
# This file already exists at:
# frontend/src/components/RPSMatch.tsx

# It imports `commitMove` which we need to export from fhevm.ts
# This is already done ✓
```

#### Missing: Create Dashboard Component
Create `frontend/app/dashboard/page.tsx`:
```bash
# You'll create this in the next step
# This will show user's current matches and results
```

### Key Implementation Details

**Wallet Connection Flow:**
```
User clicks "Connect Wallet"
  ↓
MetaMask pops up
  ↓
User approves connection
  ↓
App shows connected address
  ↓
Load active tournaments
```

**Join Tournament Flow:**
```
User selects tournament
  ↓
Approves USDC spending
  ↓
Calls joinTournament()
  ↓
Displays "You joined!"
```

**Match Play Flow:**
```
User selects their move (Rock/Paper/Scissors)
  ↓
Frontend encrypts move using Zama SDK
  ↓
Submits to contract.commitMove()
  ↓
Wait for opponent's move
  ↓
Contract resolves match
  ↓
Display results
```

---

## 📅 Day 3: Integration & Testing

### What We'll Do
1. Connect frontend to deployed contract
2. End-to-end testing
3. Fix bugs
4. Prepare for Farcaster deployment

### Full Flow Test

**1. Test Tournament Creation (Owner Only)**
```bash
# Use Hardhat to create tournament
npx hardhat run scripts/deploy.ts

# Then call createTournament on deployed contract
# You'll need a script or use Etherscan
```

**2. Test Tournament Join**
- Open frontend
- Connect wallet
- Click "Join Tournament"
- Should approve USDC
- Should pay entry fee
- Should see "Joined!" message

**3. Test Match Gameplay**
- Create second account (in MetaMask)
- Have both players join same tournament
- Both submit encrypted moves
- Contract should resolve and show winner

### Debugging Tips

**Contract Interaction Issues:**
```bash
# Check contract ABI is correct
# Make sure contract address is in frontend .env
# Verify you're on FHEVM Testnet (84532)
# Check wallet has ETH for gas fees
```

**Encryption Issues:**
```bash
# Make sure Zama SDK is installed:
npm install @fhevm/sdk

# Check Zama Gateway is accessible
curl https://gateway.zama.ai/health
```

**Gas Issues:**
```bash
# Increase gas limit in frontend if needed:
{ gasLimit: 1000000 } // in transaction options
```

---

## 🎯 Checklist - What You Should Have Working

### Smart Contract ✓
- [x] Compiles without errors
- [x] All tests pass
- [x] Deployed to FHEVM Testnet
- [x] Address saved in `.env`

### Frontend
- [ ] Starts without errors (`npm run dev`)
- [ ] Homepage loads
- [ ] Can connect MetaMask wallet
- [ ] Shows active tournaments
- [ ] Can join tournament (on testnet)
- [ ] Can see current matches
- [ ] Can submit encrypted moves
- [ ] Can see match results

### Full Flow
- [ ] Create tournament (as owner)
- [ ] Two players join tournament
- [ ] Both players submit moves
- [ ] Match resolves and shows winner
- [ ] Winner can claim prize

---

## 🔧 Troubleshooting

### "Compilation failed"
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run compile
```

### "Network error" when deploying
```bash
# Check RPC URL in hardhat.config.ts
# Make sure FHEVM_RPC_URL is set correctly in .env
# Check if testnet is down: https://status.zama.ai
```

### "Contract not found" on frontend
```bash
# Make sure NEXT_PUBLIC_RPS_CONTRACT_ADDRESS is set
# Check address is correct (copy/paste from deployment output)
# Verify you're on the right network (84532)
```

### MetaMask keeps requesting approval
```bash
# This is normal - contract needs:
# 1. Approval to spend USDC (appears once)
# 2. Access to read/write contract state

# If it keeps asking, check:
# - You're on FHEVM Testnet
# - Contract address is correct
# - You have ETH for gas
```

### Moves aren't encrypting
```bash
# Check if @fhevm/sdk is installed
npm list @fhevm/sdk

# If not installed:
npm install @fhevm/sdk

# Check Zama Gateway is working
curl https://gateway.zama.ai/health
```

---

## 📚 Key Files Overview

```
encrypted-rps-tournament/
│
├── contracts/
│   ├── RPSTournament.sol       ← Main contract (COMPLETE ✓)
│   └── MockERC20.sol           ← Test token (COMPLETE ✓)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            ← Homepage (COMPLETE ✓)
│   │   ├── layout.tsx          ← Root layout (COMPLETE ✓)
│   │   └── globals.css         ← Global styles (COMPLETE ✓)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── RPSMatch.tsx    ← Match UI (NEEDS UPDATE)
│   │   │   └── TournamentJoin.tsx
│   │   │
│   │   └── services/
│   │       └── fhevm.ts        ← Encryption (COMPLETE ✓)
│   │
│   ├── next.config.ts          ← Next.js config (COMPLETE ✓)
│   ├── tsconfig.json           ← TS config (COMPLETE ✓)
│   └── package.json            ← Dependencies (COMPLETE ✓)
│
├── scripts/
│   └── deploy.ts               ← Deployment script (COMPLETE ✓)
│
├── test/
│   └── RPSTournament.test.ts   ← Unit tests (COMPLETE ✓)
│
├── .env.example                ← Config template (COMPLETE ✓)
├── hardhat.config.ts           ← Hardhat config (COMPLETE ✓)
├── package.json                ← Root dependencies (COMPLETE ✓)
└── tsconfig.json               ← Root TS config (COMPLETE ✓)
```

---

## 🚀 Next Steps After Build

### Week 2:
1. **Farcaster Frame Deployment**
   - Use frames.js (already set up in `frontend/src/frames/tournament.tsx`)
   - Deploy frame server to Vercel
   - Register frame with Warpcast

2. **Enhanced Features**
   - Multi-round bracket management
   - Leaderboard querying with The Graph
   - Match auto-resolution after timeout
   - NFT badges for winners

### Week 3+:
1. **Production Hardening**
   - Security audit
   - Gas optimization
   - Rate limiting
   - Monitoring & alerts

2. **Mainnet Deployment**
   - Deploy to Ethereum/Polygon
   - Launch with real USDC prizes
   - Marketing campaign

---

## 📞 Getting Help

**Stuck? Check these resources:**
- Zama Docs: https://docs.zama.ai/protocol
- Zama Discord: https://discord.gg/zama
- Next.js Docs: https://nextjs.org/docs
- ethers.js Docs: https://docs.ethers.org/

**Common Issues:**
- Check the NEXTSTEPS.md file for detailed troubleshooting
- Review ARCHITECTURE.md for technical details
- Look at QUICKREFERENCE.md for common commands

---

## ✅ Success Indicators

You're on track when:
1. ✓ Contract compiles and tests pass
2. ✓ Contract deploys to testnet
3. ✓ Frontend loads without errors
4. ✓ Can connect wallet
5. ✓ Can see tournaments in UI
6. ✓ Can join tournament
7. ✓ Can submit encrypted moves
8. ✓ Can see match results

---

## 🎮 Quick Commands Reference

```bash
# Smart Contract
npm run compile              # Compile contracts
npm run test                 # Run tests
npm run deploy               # Deploy to FHEVM Testnet
npm run deploy:local         # Deploy locally

# Frontend
cd frontend
npm run dev                  # Start dev server (port 3000)
npm run build                # Build for production
npm run start                # Start production server

# Useful
npm run clean                # Clean all artifacts
rm -rf node_modules          # Hard reset
```

---

**You've got this! 🎉 The framework is ready - now let's make it work!**
