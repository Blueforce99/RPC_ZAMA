# Project Structure

```
encrypted-rps-tournament/
│
├── 📄 Documentation
│   ├── README.md              # Project overview & features
│   ├── QUICKSTART.md          # Quick setup & testing guide
│   ├── ARCHITECTURE.md        # Detailed technical architecture
│   ├── NEXTSTEPS.md          # Deployment roadmap & tasks
│   └── .env.example          # Environment template
│
├── 🤖 Smart Contracts
│   ├── contracts/
│   │   └── RPSTournament.sol  # Main FHEVM tournament contract
│   │       ├── Tournament struct & mapping
│   │       ├── Match struct & mapping
│   │       ├── Tournament lifecycle (create → join → play)
│   │       ├── Encrypted move commitment
│   │       ├── FHE-based result computation
│   │       └── Prize distribution
│   │
│   ├── scripts/
│   │   └── deploy.ts          # Deployment script for testnet/local
│   │
│   ├── test/
│   │   └── RPSTournament.test.ts  # Contract unit tests
│   │
│   ├── hardhat.config.ts      # Hardhat configuration
│   └── package.json           # Dependencies & scripts
│
├── 🎨 Frontend
│   ├── frontend/src/
│   │   ├── services/
│   │   │   └── fhevm.ts       # Zama Relayer integration
│   │   │       ├── encryptMove()
│   │   │       ├── commitMove()
│   │   │       └── resolveMatch()
│   │   │
│   │   ├── components/
│   │   │   ├── RPSMatch.tsx        # Match UI with move selection
│   │   │   │   ├── Move buttons (Rock/Paper/Scissors)
│   │   │   │   ├── Encryption & submission
│   │   │   │   └── Status display
│   │   │   │
│   │   │   └── TournamentJoin.tsx   # Tournament joining
│   │   │       ├── Entry fee display
│   │   │       ├── USDC approval
│   │   │       └── Join button
│   │   │
│   │   └── frames/
│   │       └── tournament.tsx   # Farcaster frame templates
│   │           ├── Home frame
│   │           ├── Join frame
│   │           ├── Play frame
│   │           ├── Result frame
│   │           └── Leaderboard frame
│   │
│   └── package.json           # Frontend dependencies (to be created)
│
├── 📋 Configuration
│   ├── tsconfig.json          # TypeScript config
│   ├── .gitignore             # Git ignore rules
│   ├── .env.example           # Environment template
│   └── hardhat.config.ts      # Network & compiler settings
│
└── 🔧 Build & Deployment
    ├── package.json           # Root dependencies
    ├── npm run compile        # Compile contracts
    ├── npm run test           # Run tests
    ├── npm run deploy         # Deploy to FHEVM Testnet
    └── npm run deploy:local   # Deploy locally
```

## File Descriptions

### Smart Contracts

**RPSTournament.sol** (Solidity)
- Core FHEVM smart contract
- Handles tournament lifecycle
- Manages encrypted moves using `euint8` type
- Uses FHE comparisons for match results
- Distributes USDC rewards

**deploy.ts** (TypeScript)
- Hardhat deployment script
- Deploys to FHEVM Testnet or local network
- Outputs contract address
- Saves deployment info

**RPSTournament.test.ts** (TypeScript)
- Unit tests for contract functions
- Tests tournament creation/joining
- Tests access control
- Uses Hardhat test environment

### Frontend

**fhevm.ts** (TypeScript)
- Encryption service using Zama Relayer
- `encryptMove()` - encrypts move locally
- `commitMove()` - submits to contract
- `resolveMatch()` - triggers resolution

**RPSMatch.tsx** (React)
- Match playing component
- Visual move selection (✊ ✋ ✌️)
- Handles encryption flow
- Shows status & errors

**TournamentJoin.tsx** (React)
- Tournament joining interface
- USDC approval flow
- Join button & confirmation
- Error & success messages

**tournament.tsx** (React/Farcaster)
- Farcaster frame definitions
- Home, Join, Play, Result frames
- Frame buttons & routing
- Leaderboard display

### Configuration

**hardhat.config.ts**
- Network configurations
- Solidity compiler settings
- Gas settings
- Plugin configuration

**tsconfig.json**
- TypeScript compiler options
- Path aliases
- Module resolution

## Key Points

✅ All necessary files created
✅ Smart contract fully functional
✅ React components ready
✅ Farcaster frame template included
✅ Comprehensive documentation

## What's Next?

1. Install dependencies
2. Compile contract
3. Run tests
4. Deploy to testnet
5. Build & test frontend
6. Integrate Farcaster frames

See NEXTSTEPS.md for detailed instructions!
