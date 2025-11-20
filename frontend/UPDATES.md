# 🎮 Encrypted Rock-Paper-Scissors Tournament Frontend

Updated frontend for the new RPSTournament smart contract deployed on Ethereum Sepolia.

## ✅ Updates Made

### Smart Contract Changes
- **Contract Address**: `0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9` (Sepolia)
- **commitMove()**: Now takes `(uint256 _matchId, bytes calldata _encryptedMove)` instead of separate proof
- **resolveMatchWithDecryption()**: KMS-based winner resolution with signature verification
- **payoutMatch()**: Automatic winner payout (2x entry fee)

### Frontend Updates
1. **fhevm.ts Service**:
   - Updated `submitEncryptedMove()` for new function signature
   - Added `resolveMatchWithKMS()` for decryption-based resolution
   - Added `payoutMatch()` function
   - Updated ABI calls

2. **RPSMatch Component**:
   - Updated to use new `submitEncryptedMove()` signature
   - Improved UI/UX with loading states and success messages
   - Added proper error handling

3. **TournamentJoin Component**:
   - Using correct Sepolia USDC: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
   - Two-step approval + join flow
   - Better step indicators

4. **Main Page (page.tsx)**:
   - Updated contract address to deployed address
   - Updated ABI with all new contract functions
   - Added contract address display
   - Improved UI with tabs for tournaments/matches/create
   - Better error messaging

## 🚀 Setup Instructions

### Prerequisites
```bash
# Install dependencies
npm install

# You need:
# - MetaMask browser extension
# - Sepolia testnet configured in MetaMask
# - Testnet ETH and USDC on Sepolia
```

### Environment Variables
```bash
# Create .env.local with:
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9
NEXT_PUBLIC_USDC_ADDRESS=0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8
```

### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📋 Key Features

### 1. Wallet Connection
- Connect MetaMask on Sepolia testnet
- Displays current account address

### 2. Tournament Management
- View active tournaments
- Join tournaments by paying entry fee
- See tournament state (Registration/Active/Completed)

### 3. Encrypted Moves
- Select Rock (✊), Paper (✋), or Scissors (✌️)
- Move encrypted via Zama FHE before submission
- Only encrypted bytes stored on-chain

### 4. Match Resolution
- Both players commit encrypted moves
- Off-chain KMS decrypts moves
- Winner determined via `resolveMatchWithDecryption()`
- Payouts handled automatically

## 🔐 Security Features

- **End-to-End Encryption**: Moves encrypted before leaving frontend
- **KMS Verification**: Decryption verified with KMS signatures
- **No Plaintext Storage**: Moves never stored unencrypted on-chain
- **USDC Integration**: Real token transactions on Sepolia

## 🛠️ Development Workflow

### Making Changes
1. **Update Services** (`src/services/fhevm.ts`):
   - Add new contract interactions
   - Update ABI calls

2. **Update Components** (`src/components/`):
   - Modify UI/UX as needed
   - Ensure proper error handling

3. **Update Main Page** (`app/page.tsx`):
   - Add new sections
   - Update contract interactions

### Testing
```bash
# Type checking
npm run typecheck

# Build
npm run build

# Production server
npm run start
```

## 📊 Contract Functions Used

### Tournament Functions
```solidity
// Create tournament (owner only)
createTournament(uint256 _entryFee)

// Join tournament
joinTournament(uint256 _tournamentId)

// View tournament details
getTournament(uint256 _tournamentId)
getTournamentPlayers(uint256 _tournamentId)
```

### Match Functions
```solidity
// Commit encrypted move
commitMove(uint256 _matchId, bytes calldata _encryptedMove)

// Resolve with KMS decryption
resolveMatchWithDecryption(
  uint256 _matchId,
  address _winner,
  bytes32[] calldata _handlesList,
  bytes calldata _decryptionProof
)

// Get match details
getMatch(uint256 _matchId)

// Payout winner
payoutMatch(uint256 _matchId)
```

## 🔗 Network Configuration

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: https://eth-sepolia.public.blastapi.io
- **USDC**: 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8
- **Contract**: 0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9

## 🔒 Encryption Details

### Zama FHE Configuration
- **Host Chain**: Sepolia (11155111)
- **Gateway Chain**: 55815
- **Relayer**: https://relayer.testnet.zama.cloud

### Move Encryption
1. Frontend: User selects move (0=Rock, 1=Paper, 2=Scissors)
2. Encryption: Move encrypted via Zama Relayer using euint8
3. Submission: Encrypted bytes sent to `commitMove()`
4. Storage: Encrypted bytes stored on-chain
5. Resolution: KMS decrypts off-chain and verifies winner

## 📱 User Flow

```
1. Connect MetaMask on Sepolia
   ↓
2. View Active Tournaments
   ↓
3. Join Tournament (approve USDC + pay entry fee)
   ↓
4. Create/Join Match
   ↓
5. Select Move (Rock/Paper/Scissors)
   ↓
6. Encrypt Move via Zama FHE
   ↓
7. Submit Encrypted Move to Contract
   ↓
8. Wait for Opponent to Commit
   ↓
9. KMS Decrypts Both Moves
   ↓
10. Winner Resolved & Paid Out
```

## ⚠️ Important Notes

- **Testnet Only**: This is for Sepolia testnet use only
- **Real USDC**: Uses actual USDC token on Sepolia (testnet version)
- **Gas Costs**: FHE operations may cost more gas
- **Time**: Decryption via KMS adds processing time
- **Dependencies**: Requires @zama-fhe/relayer-sdk npm package

## 📝 Dependencies

```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "ethers": "^6.11.1",
  "typescript": "^5.3.3",
  "@zama-fhe/relayer-sdk": "^latest"
}
```

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia network in MetaMask
- Try: `window.ethereum` in console to verify availability

### Move Submission Fails
- Check gas limit (500,000 recommended)
- Ensure wallet has ETH for gas
- Check USDC approval

### Encryption Errors
- Verify @zama-fhe/relayer-sdk is installed
- Check Zama relayer is accessible
- Review browser console for error details

## 📞 Support

For issues or questions:
1. Check browser console (F12 → Console)
2. Verify network is set to Sepolia
3. Ensure testnet ETH and USDC balance
4. Review smart contract ABI matches function calls

## 🎯 Next Steps

1. Test on Sepolia with testnet tokens
2. Deploy admin dashboard for tournament creation
3. Integrate The Graph for better data indexing
4. Add leaderboard and statistics
5. Implement tournament rounds/brackets
6. Add chat/messaging between players
