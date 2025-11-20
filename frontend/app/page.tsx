'use client';

import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import styles from './page.module.css';

interface Tournament {
  id: number;
  entryFee: string;
  playersCount: number;
  totalPrizePool: string;
  state: number;
}

interface Match {
  matchId: number;
  tournamentId: number;
  player1: string;
  player2: string;
  state: number;
  winner: string;
}

// Updated contract address from deployment
const RPS_CONTRACT_ADDRESS = "0xddB868404A70DdA4434A4A60e0c7C9dDBeCb17e9";
const SEPOLIA_USDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

const RPS_TOURNAMENT_ABI = [
  'function getTournament(uint256 _tournamentId) external view returns (tuple(uint256 id, address[] players, uint256 entryFee, uint256 totalPrizePool, uint8 state, uint256 createdAt, uint256 roundNumber, bool completed))',
  'function getTournamentPlayers(uint256 _tournamentId) external view returns (address[])',
  'function getMatch(uint256 _matchId) external view returns (tuple(uint256 matchId, uint256 tournamentId, address player1, address player2, address winner, uint8 state, uint256 createdAt))',
  'function createTournament(uint256 _entryFee) external',
  'function joinTournament(uint256 _tournamentId) external',
  'function startTournament(uint256 _tournamentId) external',
  'function commitMove(uint256 _matchId, bytes calldata _encryptedMove, bytes calldata _inputProof) external',
  'function resolveMatch(uint256 _matchId) external',
  'function payoutMatch(uint256 _matchId) external',
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches' | 'create'>('tournaments');
  const [entryFeeInput, setEntryFeeInput] = useState('0.1');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      checkWalletConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setSigner(null);
        }
      });
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.listAccounts();
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0].address);
        setProvider(browserProvider);
        const signerInstance = await browserProvider.getSigner();
        setSigner(signerInstance);
      }
    } catch (err) {
      console.error('Error checking wallet:', err);
    }
  };

  const connectWallet = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setProvider(browserProvider);
        const signerInstance = await browserProvider.getSigner();
        setSigner(signerInstance);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Wallet connection error:', err);
    }
  };

  const loadTournaments = async () => {
    if (!provider) {
      setError('Provider not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock tournaments for display
      const mockTournaments: Tournament[] = [
        {
          id: 0,
          entryFee: '0.1 USDC',
          playersCount: 8,
          totalPrizePool: '0.8 USDC',
          state: 0, // REGISTRATION
        },
        {
          id: 1,
          entryFee: '0.1 USDC',
          playersCount: 4,
          totalPrizePool: '0.4 USDC',
          state: 1, // ACTIVE
        },
      ];

      setTournaments(mockTournaments);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load tournaments';
      setError(errorMsg);
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && provider && activeTab === 'tournaments') {
      loadTournaments();
    }
  }, [account, provider, activeTab]);

  // ✅ NEW: Join tournament handler
  const handleJoinTournament = async (tournamentId: number, entryFee: string) => {
    if (!signer || !account) {
      setError('Please connect wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      // Step 1: Approve USDC
      console.log('Step 1: Approving USDC...');
      const usdcContract = new Contract(SEPOLIA_USDC, USDC_ABI, signer);
      
      // Convert to wei (USDC has 6 decimals on Sepolia)
      const amount = ethers.parseUnits(entryFee, 6);
      
      const approveTx = await usdcContract.approve(RPS_CONTRACT_ADDRESS, amount);
      await approveTx.wait();
      console.log('✅ USDC approved');

      // Step 2: Join tournament
      console.log('Step 2: Joining tournament...');
      const tournamentContract = new Contract(RPS_CONTRACT_ADDRESS, RPS_TOURNAMENT_ABI, signer);
      
      const joinTx = await tournamentContract.joinTournament(tournamentId);
      const receipt = await joinTx.wait();
      
      setTransactionHash(receipt?.hash);
      console.log('✅ Tournament joined!', receipt?.hash);
      
      // Reload tournaments
      setTimeout(() => loadTournaments(), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to join tournament';
      setError(errorMsg);
      console.error('Error joining tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Create tournament handler
  const handleCreateTournament = async () => {
    if (!signer || !account) {
      setError('Please connect wallet first');
      return;
    }

    if (!entryFeeInput || parseFloat(entryFeeInput) <= 0) {
      setError('Please enter a valid entry fee');
      return;
    }

    setLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const tournamentContract = new Contract(RPS_CONTRACT_ADDRESS, RPS_TOURNAMENT_ABI, signer);
      
      // Convert to wei (USDC has 6 decimals)
      const fee = ethers.parseUnits(entryFeeInput, 6);
      
      console.log('Creating tournament with entry fee:', entryFeeInput, 'USDC');
      const tx = await tournamentContract.createTournament(fee);
      const receipt = await tx.wait();
      
      setTransactionHash(receipt?.hash);
      setEntryFeeInput('0.1');
      console.log('✅ Tournament created!', receipt?.hash);
      
      // Switch to tournaments tab
      setTimeout(() => {
        setActiveTab('tournaments');
        loadTournaments();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create tournament';
      setError(errorMsg);
      console.error('Error creating tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Resolve match handler
  const handleResolveMatch = async (matchId: number) => {
    if (!signer) {
      setError('Please connect wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const tournamentContract = new Contract(RPS_CONTRACT_ADDRESS, RPS_TOURNAMENT_ABI, signer);
      
      console.log('Resolving match with FHE...');
      const tx = await tournamentContract.resolveMatch(matchId);
      const receipt = await tx.wait();
      
      setTransactionHash(receipt?.hash);
      console.log('✅ Match resolved!', receipt?.hash);
      
      setTimeout(() => loadTournaments(), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resolve match';
      setError(errorMsg);
      console.error('Error resolving match:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTournamentState = (state: number): string => {
    const states = ['Registration', 'Active', 'Completed'];
    return states[state] || 'Unknown';
  };

  const getStateColor = (state: number): string => {
    const colors = ['#FFA500', '#388e3c', '#757575'];
    return colors[state] || '#999';
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.title}>
            <h1>🎮 Encrypted RPS Tournament</h1>
            <p>Play privately. Win publicly.</p>
            <p style={{ fontSize: '0.85em', opacity: 0.7, marginTop: '5px' }}>
              Contract: {RPS_CONTRACT_ADDRESS.slice(0, 10)}...{RPS_CONTRACT_ADDRESS.slice(-8)}
            </p>
          </div>
          
          <div className={styles.wallet}>
            {account ? (
              <div className={styles.connected}>
                <span className={styles.address}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span className={styles.status}>✓ Connected to Sepolia</span>
              </div>
            ) : (
              <button className={styles.connectBtn} onClick={connectWallet}>
                🔌 Connect Wallet
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {transactionHash && (
          <div className={styles.success}>
            <strong>✅ Success!</strong> Tx: <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash.slice(0, 20)}...</a>
          </div>
        )}

        {account ? (
          <div className={styles.content}>
            <div className={styles.tabsNav}>
              <button 
                className={`${styles.tab} ${activeTab === 'tournaments' ? styles.active : ''}`}
                onClick={() => setActiveTab('tournaments')}
              >
                🏆 Tournaments
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'matches' ? styles.active : ''}`}
                onClick={() => setActiveTab('matches')}
              >
                🎮 Matches
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
                onClick={() => setActiveTab('create')}
              >
                ➕ Create
              </button>
            </div>

            {activeTab === 'tournaments' && (
              <section className={styles.section}>
                <h2>Active Tournaments</h2>
                
                {loading ? (
                  <div className={styles.loading}>⏳ Loading tournaments...</div>
                ) : tournaments.length > 0 ? (
                  <div className={styles.tournamentList}>
                    {tournaments.map((tournament) => (
                      <div key={tournament.id} className={styles.tournamentCard}>
                        <div className={styles.tournamentHeader}>
                          <h3>Tournament #{tournament.id}</h3>
                          <span 
                            className={styles.state}
                            style={{ background: getStateColor(tournament.state) }}
                          >
                            {getTournamentState(tournament.state)}
                          </span>
                        </div>
                        
                        <div className={styles.tournamentDetails}>
                          <div className={styles.detail}>
                            <span className={styles.label}>Entry Fee:</span>
                            <strong>{tournament.entryFee}</strong>
                          </div>
                          <div className={styles.detail}>
                            <span className={styles.label}>Players:</span>
                            <strong>{tournament.playersCount}</strong>
                          </div>
                          <div className={styles.detail}>
                            <span className={styles.label}>Prize Pool:</span>
                            <strong>{tournament.totalPrizePool}</strong>
                          </div>
                        </div>

                        <button 
                          className={styles.joinBtn}
                          onClick={() => handleJoinTournament(tournament.id, tournament.entryFee.split(' ')[0])}
                          disabled={loading}
                        >
                          {loading ? '⏳ Processing...' : tournament.state === 0 ? '✅ Join Tournament' : '👀 View Matches'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <p>No tournaments available yet.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'create' && (
              <section className={styles.section}>
                <h2>Create Tournament</h2>
                <div className={styles.createCard}>
                  <div className={styles.formGroup}>
                    <label htmlFor="entryFee">Entry Fee (USDC):</label>
                    <input 
                      id="entryFee"
                      type="number" 
                      value={entryFeeInput}
                      onChange={(e) => setEntryFeeInput(e.target.value)}
                      placeholder="0.1"
                      min="0.01"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                  <button 
                    className={styles.primaryBtn}
                    onClick={handleCreateTournament}
                    disabled={loading}
                  >
                    {loading ? '⏳ Creating...' : '🏆 Create Tournament'}
                  </button>
                  <p style={{ fontSize: '0.9em', color: '#666', marginTop: '15px' }}>
                    Only the owner can create tournaments. Make sure you have USDC for player payouts.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 'matches' && (
              <section className={styles.section}>
                <h2>Active Matches</h2>
                <div className={styles.empty}>
                  <p>Join a tournament to see and play matches.</p>
                </div>
              </section>
            )}

            <section className={styles.section} style={{ marginTop: '40px' }}>
              <h2>How to Play 🎮</h2>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>1</div>
                  <h4>Join Tournament</h4>
                  <p>Click "Join Tournament" and approve USDC payment</p>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>2</div>
                  <h4>🔐 Encrypt Your Move</h4>
                  <p>Select Rock, Paper, or Scissors - encrypted by Zama FHE</p>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>3</div>
                  <h4>⚔️ Play Matches</h4>
                  <p>Battle opponents with encrypted moves, then click "Resolve Match"</p>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>4</div>
                  <h4>🏆 Win Prizes</h4>
                  <p>Winners advance and earn from the prize pool</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>About Encrypted RPS</h2>
              <div className={styles.infoBox}>
                <p>
                  This tournament uses <strong>Fully Homomorphic Encryption (FHE)</strong> via Zama Protocol 
                  to ensure moves remain encrypted on-chain.
                </p>
                <ul>
                  <li>🔒 Moves are encrypted using Zama FHE before submission</li>
                  <li>📊 Winner is determined by FHE comparison (no decryption needed!)</li>
                  <li>✅ All moves stay encrypted - your strategy is secret</li>
                  <li>💰 Payouts happen automatically after match resolution</li>
                </ul>
              </div>
            </section>
          </div>
        ) : (
          <div className={styles.noWallet}>
            <div className={styles.noWalletCard}>
              <h2>🔌 Connect Your Wallet</h2>
              <p>Connect MetaMask (on Sepolia testnet) to get started</p>
              <button className={styles.primaryBtn} onClick={connectWallet}>
                Connect Wallet
              </button>
              <p style={{ fontSize: '0.85em', color: '#666', marginTop: '15px' }}>
                You need testnet ETH and USDC on Sepolia to play.
              </p>
              <div style={{ marginTop: '20px', fontSize: '0.85em', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Getting Sepolia USDC:</strong></p>
                <ol style={{ marginLeft: '20px', color: '#666' }}>
                  <li>Go to <a href="https://sepolia.etherscan.io/" target="_blank" rel="noopener noreferrer">Sepolia Etherscan</a></li>
                  <li>Use the USDC faucet or bridge</li>
                  <li>Come back and connect your wallet</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
