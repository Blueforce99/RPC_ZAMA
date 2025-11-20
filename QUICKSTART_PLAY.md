# 🎯 QUICK START - 10 Minutes to Play

## Step 1: Install & Compile (3 min)
```bash
cd C:\Users\johns\Projects\encrypted-rps-tournament
npm install
npm run compile
```
✓ See: "Compiled successfully"

## Step 2: Get Testnet Tokens (2 min)
1. Visit: https://fhevm-testnet.zama.ai/faucet
2. Connect your MetaMask wallet
3. Request ETH and USDC tokens
4. Wait for confirmation (~1-2 min)

## Step 3: Deploy Contract (3 min)
```bash
# Copy template
cp .env.example .env

# Edit .env - Add your private key (without 0x prefix):
PRIVATE_KEY=your_key_here

# Deploy
npm run deploy
```
✅ Save the contract address output!

## Step 4: Start Frontend (2 min)
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:3000

---

## 🎮 Now Play!

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve MetaMask popup

2. **View Tournaments**
   - See available tournaments
   - Entry fees and player counts

3. **Join Tournament**
   - Click "Join Tournament"
   - Approve USDC spending
   - Pay entry fee

4. **Play Match**
   - Go to Dashboard
   - Select Rock/Paper/Scissors
   - Click "Submit Encrypted Move"
   - Wait for opponent

5. **See Results**
   - Match resolves
   - View winner
   - Claim prize

---

## 🔧 Troubleshooting

### "Can't compile"
```bash
rm -rf node_modules && npm install
npm run compile
```

### "Deployment failed"
- Check PRIVATE_KEY in .env (no spaces)
- Verify testnet ETH in wallet
- Check RPC URL works

### "Frontend won't load"
```bash
cd frontend
npm install
npm run dev
```
Make sure you're in frontend directory!

### "MetaMask error"
- Switch to FHEVM Testnet (84532)
- Refresh page
- Reconnect wallet

---

## 📊 Key Contracts

| Function | Purpose |
|----------|---------|
| `createTournament()` | Owner creates tournament |
| `joinTournament()` | Player pays and joins |
| `startTournament()` | Owner starts tournament |
| `commitMove()` | Player submits encrypted move |
| `resolveMatch()` | Contract determines winner |
| `payoutMatch()` | Winner receives prize |

---

## 🌐 Important Addresses

| Item | Value |
|------|-------|
| FHEVM RPC | https://fhevm-testnet.zama.ai |
| Chain ID | 84532 |
| Faucet | https://fhevm-testnet.zama.ai/faucet |
| Block Explorer | Check https://status.zama.ai |

---

## 📚 Docs

- **Full Setup:** See BUILDGUIDE.md
- **Architecture:** See ARCHITECTURE.md  
- **Reference:** See QUICKREFERENCE.md
- **Overview:** See README.md

---

## ✅ Verification

Everything works when:
```bash
npm run compile    # ✓ Compiled
npm run test       # ✓ All tests pass
npm run deploy     # ✓ Contract deployed
npm run dev        # ✓ Frontend starts (in frontend dir)
```

Then:
1. Open http://localhost:3000
2. Connect MetaMask
3. Join tournament
4. Play a match
5. See encrypted gameplay! 🎉

---

## 🚀 Network Details

**FHEVM Testnet:**
- Chain ID: 84532
- RPC: https://fhevm-testnet.zama.ai
- Block time: ~12 seconds
- Gas: Not used (FHE computation)

**Tokens:**
- ETH: For gas
- USDC: For tournament fees
- Get both from faucet

---

## 💾 Key Environment Variables

```env
PRIVATE_KEY=your_key_here
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=84532
```

---

## 📱 Wallet Setup

1. Install MetaMask (if not already)
2. Create or import account
3. Add FHEVM Testnet:
   - Chain ID: 84532
   - RPC: https://fhevm-testnet.zama.ai
   - Currency: ETH
4. Get tokens from faucet
5. Connect to app

---

## 🎯 Success Metrics

✅ Smart Contract:
- Compiles without errors
- All tests pass
- Deploys to testnet
- Returns contract address

✅ Frontend:
- Starts on localhost:3000
- Connects to MetaMask
- Shows tournaments
- Allows joining

✅ Gameplay:
- Can submit moves
- Moves are encrypted
- Match resolves
- Can see results

---

## 🆘 Common Errors

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` |
| "Contract not found" | Check contract address in .env |
| "User rejected" | Approve MetaMask transaction |
| "Wrong network" | Switch to FHEVM (84532) |
| "Gas error" | Check wallet has ETH |
| "Encryption failed" | Check Zama Gateway is up |

---

## ⏱️ Expected Timing

| Task | Time |
|------|------|
| Install deps | 2-3 min |
| Compile contract | 30 sec |
| Deploy contract | 1-2 min |
| Start frontend | 30 sec |
| Join tournament | 30 sec |
| Submit move | 10 sec |
| Resolve match | 10 sec |
| **Total:** | **~10 min** |

---

## 🔐 Security Notes

✅ Private keys never sent to frontend
✅ Moves encrypted before submission
✅ Smart contract controls funds
✅ All transactions on-chain

⚠️ Testnet only - not for real money
⚠️ Don't share private key
⚠️ Save contract addresses

---

## 📖 Next Steps

1. ✅ Deploy to testnet (you are here)
2. ⏭️ Test full tournament
3. ⏭️ Invite friends to play
4. ⏭️ Deploy to Farcaster
5. ⏭️ Launch mainnet

---

## 🎊 Ready?

```bash
# This is all you need:
npm install && npm run compile && npm run test

# Then deploy:
npm run deploy

# Then run frontend:
cd frontend && npm install && npm run dev
```

**Visit http://localhost:3000 and play! 🚀**

---

**Questions?** Check BUILDGUIDE.md or ask in Zama Discord: https://discord.gg/zama
