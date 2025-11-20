# Quick Start Guide - Encrypted RPS Tournament

## Step 1: Setup Local Environment

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## Step 2: Compile Smart Contract

```bash
npm run compile
```

You should see output like:
```
Compiled successfully: contracts/RPSTournament.sol
```

## Step 3: Deploy to FHEVM Testnet

First, make sure you have:
- PRIVATE_KEY in your .env (a testnet account with test FHEVM tokens)
- Some FHEVM testnet tokens for gas fees

```bash
npm run deploy
```

Save the contract address from the output. Example:
```
RPSTournament deployed to: 0x1234567890123456789012345678901234567890
```

## Step 4: Configure Frontend

1. Create `.env.local` in the frontend directory:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_CHAIN_ID=8545
```

2. Update the contract address in your frontend components

## Step 5: Test Flow

### As Tournament Owner
1. Call `createTournament(entryFee)` with desired entry fee in USDC
2. Players can join via `joinTournament(tournamentId)`
3. Once players joined, call `startTournament(tournamentId)` to begin

### As Player
1. Approve USDC spending on contract
2. Join tournament via `joinTournament(tournamentId)`
3. Wait for your match assignment
4. Select your move (Rock/Paper/Scissors)
5. Your move is encrypted client-side
6. Submit encrypted move via `commitMove(matchId, encryptedMove, proof)`
7. Wait for opponent to submit
8. Match is resolved automatically

## Common Issues

### "Approval failed"
- Make sure you have USDC balance on FHEVM testnet
- Check USDC contract address matches your network

### "Encryption failed"
- Verify Zama gateway URL is accessible
- Check internet connection to relayer service

### "Transaction reverted"
- Ensure match is in correct state (both players committed moves before resolving)
- Check you're the correct player for the match

## Testing with Hardhat

Run local tests:
```bash
npm run test
```

Start local node:
```bash
npm run node
```

Then in another terminal, deploy locally:
```bash
npm run deploy:local
```

## Next Steps

1. Build the Farcaster frame integration
2. Deploy frontend to Vercel
3. Set up tournament automation
4. Create tournament scheduling system
5. Add spectator/leaderboard views

## Support

- Check Zama docs: https://docs.zama.org/protocol
- Zama Discord: For FHE & FHEVM questions
- This project: For tournament-specific questions
