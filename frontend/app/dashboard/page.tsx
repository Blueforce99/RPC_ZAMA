'use client';

import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Link from 'next/link';
import { encryptMove, RPSMove, getMoveDisplay, getMoveName } from '@/src/services/fhevm';
import styles from './dashboard.module.css';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Match {
  matchId: number;
  opponent: string;
  status: 'waiting' | 'committed' | 'resolved' | 'paid';
  winner?: string;
  userMove?: RPSMove;
}

const RPS_TOURNAMENT_ABI = [
  'function getMatch(uint256 _matchId) external view returns (tuple(uint256 matchId, uint256 tournamentId, address player1, address player2, uint8 player1Move, uint8 player2Move, address winner, uint8 state, uint256 createdAt))',
];

export default function Dashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<RPSMove | null>(null);
  const [submittingMatch, setSubmittingMatch] = useState<number | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_RPS_CONTRACT_ADDRESS;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      checkWalletConnection();
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      const browserProvider = new BrowserProvider(window.ethereum!);
      const accounts = await browserProvider.listAccounts();
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0].address);
        setProvider(browserProvider);
        loadMatches(browserProvider);
      }
    } catch (err) {
      console.error('Error checking wallet:', err);
    }
  };

  const loadMatches = async (browserProvider: BrowserProvider) => {
    setLoading(true);
    setError(null);

    try {
      // In production, fetch from subgraph or contract events
      // For now, use mock data
      const mockMatches: Match[] = [
        {
          matchId: 1,
          opponent: '0x742d35...abcd',
          status: 'waiting',
        },
        {
          matchId: 2,
          opponent: '0x892f3d...efgh',
          status: 'committed',
        },
        {
          matchId: 3,
          opponent: '0x123abc...ijkl',
          status: 'resolved',
          winner: 'you',
        },
      ];

      setMatches(mockMatches);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMsg);
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMove = async (matchId: number, move: RPSMove) => {
    if (!contractAddress || !provider) {
      setError('Contract or provider not configured');
      return;
    }

    setSubmittingMatch(matchId);
    setError(null);

    try {
      // Encrypt the move
      const encrypted = await encryptMove(move);

      // Submit to contract
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, RPS_TOURNAMENT_ABI, signer);

      const tx = await contract.commitMove(matchId, encrypted.encryptedValue, encrypted.inputProof, {
        gasLimit: 500000,
      });

      await tx.wait();

      // Update UI
      setMatches(matches.map(m => 
        m.matchId === matchId 
          ? { ...m, status: 'committed', userMove: move }
          : m
      ));

      setSelectedMove(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit move';
      setError(errorMsg);
      console.error('Error submitting move:', err);
    } finally {
      setSubmittingMatch(null);
    }
  };

  if (!account) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.noAccess}>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to view your matches</p>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>My Matches</h1>
        <Link href="/" className={styles.backLink}>← Back</Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading matches...</div>
      ) : matches.length > 0 ? (
        <div className={styles.matchesList}>
          {matches.map((match) => (
            <div key={match.matchId} className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <h3>Match {match.matchId}</h3>
                <span className={`${styles.status} ${styles[match.status]}`}>
                  {match.status}
                </span>
              </div>

              <div className={styles.matchInfo}>
                <div className={styles.opponent}>
                  <span>Opponent:</span>
                  <strong>{match.opponent}</strong>
                </div>
              </div>

              {match.status === 'waiting' && (
                <div className={styles.moveSelection}>
                  <p>Select your move:</p>
                  <div className={styles.moves}>
                    {[RPSMove.ROCK, RPSMove.PAPER, RPSMove.SCISSORS].map((move) => (
                      <button
                        key={move}
                        className={`${styles.moveBtn} ${selectedMove === move ? styles.selected : ''}`}
                        onClick={() => setSelectedMove(move)}
                        disabled={submittingMatch === match.matchId}
                      >
                        <span className={styles.emoji}>{getMoveDisplay(move)}</span>
                        <span className={styles.name}>{getMoveName(move)}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    className={styles.submitBtn}
                    onClick={() => selectedMove !== null && handleSubmitMove(match.matchId, selectedMove)}
                    disabled={selectedMove === null || submittingMatch === match.matchId}
                  >
                    {submittingMatch === match.matchId ? 'Submitting...' : 'Submit Encrypted Move'}
                  </button>
                </div>
              )}

              {match.status === 'committed' && (
                <div className={styles.committed}>
                  <p>✓ Your move submitted: {match.userMove !== undefined ? getMoveName(match.userMove) : 'Pending'}</p>
                  <p className={styles.waiting}>Waiting for opponent...</p>
                </div>
              )}

              {match.status === 'resolved' && (
                <div className={`${styles.result} ${styles[match.winner === 'you' ? 'win' : 'loss']}`}>
                  <h4>{match.winner === 'you' ? '🎉 You Won!' : '😢 You Lost'}</h4>
                  <p>Match resolved and payout processed</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>You don't have any active matches yet.</p>
          <Link href="/" className={styles.joinBtn}>Join a Tournament</Link>
        </div>
      )}
    </div>
  );
}
