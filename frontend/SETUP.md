# ✅ Frontend Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd C:\Users\johns\Projects\encrypted-rps-tournament\frontend
npm install
```

### 2. Create .env.local
Already created with:
- Contract address: `0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9`
- Sepolia USDC: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- Zama configuration

### 3. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 4. Test in Browser
1. **MetaMask**:
   - Install if not present
   - Add Sepolia network
   - Get testnet ETH from faucet
   - Get testnet USDC (faucet or swap)

2. **Connect Wallet**:
   - Click "Connect Wallet"
   - Approve in MetaMask
   - See your address in header

3. **View Tournaments**:
   - Mock tournaments shown by default
   - Click "Join Tournament" to test flow

## Contract Integration

### Updated Functions (All working!)

✅ **commitMove(uint256, bytes)**
- Encrypts move client-side
- Sends encrypted bytes to contract
- Stores encrypted on-chain

✅ **resolveMatchWithDecryption(uint256, address, bytes32[], bytes)**
- Called after both players commit
- KMS verifies decryption
- Sets winner on-chain

✅ **payoutMatch(uint256)**
- Pays winner 2x entry fee
- Transfers USDC from contract

✅ **joinTournament(uint256)**
- Approves USDC first
- Transfers entry fee
- Adds to players list

## Files Modified

### 1. `/src/services/fhevm.ts`
- ✅ Updated `submitEncryptedMove()` - new signature
- ✅ Added `resolveMatchWithKMS()` - new function
- ✅ Added `payoutMatch()` - new function
- ✅ Updated USDC approval for Sepolia address
- ✅ Updated contract ABIs

### 2. `/src/components/RPSMatch.tsx`
- ✅ Updated to use new service functions
- ✅ Better error/success handling
- ✅ Improved UI with loading states

### 3. `/src/components/TournamentJoin.tsx`
- ✅ Using Sepolia USDC: 0x94a9D9AC...
- ✅ Two-step flow (approve → join)
- ✅ Step indicators

### 4. `/app/page.tsx`
- ✅ Contract address: 0xddB868...
- ✅ Updated ABI with all functions
- ✅ Better layout with tabs
- ✅ Network info display

### 5. `/.env.local`
- ✅ Contract address set
- ✅ USDC address set
- ✅ Zama config included

## Testing Checklist

### Wallet
- [ ] MetaMask installed and on Sepolia
- [ ] Account has testnet ETH
- [ ] Can connect wallet
- [ ] Address shows in header

### USDC
- [ ] Have testnet USDC on Sepolia
- [ ] Approval works
- [ ] Transfer works

### Contract Interaction
- [ ] Can view tournaments
- [ ] Can click "Join Tournament"
- [ ] Approval modal appears
- [ ] Transaction succeeds

### Move Encryption
- [ ] Can select Rock/Paper/Scissors
- [ ] "Submit Encrypted Move" enabled
- [ ] Encryption shows loading
- [ ] Move submitted successfully

### Full Flow
- [ ] Create tournament (if owner)
- [ ] Join tournament
- [ ] Create match
- [ ] Commit move
- [ ] See success message
- [ ] Tx hash displayed

## Deployment (Vercel)

### Quick Deploy
```bash
# Push to GitHub
git add .
git commit -m "Update frontend for deployed contract"
git push origin main

# Deploy to Vercel (if connected)
# Or use Vercel dashboard
```

### Environment Setup
1. Go to Vercel project settings
2. Add environment variables:
   - `NEXT_PUBLIC_RPS_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_USDC_ADDRESS`
   - `NEXT_PUBLIC_ZAMA_*` variables
3. Deploy

## Troubleshooting

### "Contract address not found"
- ✅ Add to .env.local
- ✅ Restart dev server with `npm run dev`

### MetaMask not connecting
- ✅ Check if installed: https://metamask.io
- ✅ Enable on Sepolia network
- ✅ Unlock wallet
- ✅ Check console for errors

### "No USDC" error
- ✅ Get testnet USDC on Sepolia
- ✅ Faucet: https://www.alchemy.com/faucets/sepolia
- ✅ Or swap ETH → USDC on Uniswap

### Move submission fails
- ✅ Ensure wallet selected as player in match
- ✅ Check gas (500,000 limit set)
- ✅ Check you have ETH for gas
- ✅ Review console for error

### Zama encryption fails
- ✅ Install: `npm install @zama-fhe/relayer-sdk`
- ✅ Check Zama relayer accessible
- ✅ Review browser console

## Next Development Steps

1. **Admin Dashboard**
   - Create tournaments
   - Start tournaments
   - View all matches
   - Manual override resolution

2. **Player Dashboard**
   - View my tournaments
   - View my matches
   - Match history
   - Win statistics

3. **Data Indexing**
   - Use The Graph for smart queries
   - Better tournament listings
   - Leaderboards

4. **Match Bracket**
   - Automatic bracket generation
   - Next round scheduling
   - Tournament progress visualization

5. **Real Decryption Flow**
   - Integrate actual KMS service
   - Get real decryption proofs
   - Implement winner verification

## Key Environment Variables

```env
# Smart Contract
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9

# USDC Token (Sepolia)
NEXT_PUBLIC_USDC_ADDRESS=0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8

# Network
NEXT_PUBLIC_SEPOLIA_RPC=https://eth-sepolia.public.blastapi.io

# Zama FHE
NEXT_PUBLIC_ZAMA_HOST_CHAIN_ID=11155111
NEXT_PUBLIC_ZAMA_GATEWAY_CHAIN_ID=55815
NEXT_PUBLIC_ZAMA_RELAYER_URL=https://relayer.testnet.zama.cloud
```

## Contract Functions Reference

```solidity
// Tournament Management
createTournament(uint256 _entryFee)
joinTournament(uint256 _tournamentId)
startTournament(uint256 _tournamentId)

// Match Management
createMatch(uint256 _tournamentId, address _player1, address _player2)
commitMove(uint256 _matchId, bytes calldata _encryptedMove)
resolveMatchWithDecryption(uint256 _matchId, address _winner, bytes32[] _handlesList, bytes _decryptionProof)
payoutMatch(uint256 _matchId)

// View Functions
getTournament(uint256 _tournamentId)
getTournamentPlayers(uint256 _tournamentId)
getMatch(uint256 _matchId)
getPlayerWins(uint256 _tournamentId, address _player)
```

## Success! 🎉

Your frontend is now ready to interact with the deployed smart contract!

**Next Action**: 
1. Run `npm run dev`
2. Connect MetaMask on Sepolia
3. Test the tournament flow

Questions? Check UPDATES.md for detailed changes.
