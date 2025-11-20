import React, { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { encryptMove, submitEncryptedMove, RPSMove } from "../services/fhevm";

const MATCH_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }],
    name: "resolveMatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }],
    name: "getMatch",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "matchId", type: "uint256" },
          { internalType: "uint256", name: "tournamentId", type: "uint256" },
          { internalType: "address", name: "player1", type: "address" },
          { internalType: "address", name: "player2", type: "address" },
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint8", name: "state", type: "uint8" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct RPSTournament.Match",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface RPSMatchProps {
  matchId: number;
  opponent: string;
  contractAddress: string;
}

const MOVES = {
  0: { name: "Rock", emoji: "✊" },
  1: { name: "Paper", emoji: "✋" },
  2: { name: "Scissors", emoji: "✌️" },
};

export const RPSMatch: React.FC<RPSMatchProps> = ({
  matchId,
  opponent,
  contractAddress,
}) => {
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [matchState, setMatchState] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const handleResolveMatch = async () => {
    if (!contractAddress || matchId === undefined) {
      setError("Contract address or match ID missing");
      return;
    }

    setResolving(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not available");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, MATCH_ABI, signer);

      console.log(`Resolving match ${matchId}...`);
      const tx = await contract.resolveMatch(matchId);
      const receipt = await tx.wait();

      setTxHash(receipt?.transactionHash);

      // Fetch updated match state
      const updatedMatch = await contract.getMatch(matchId);
      setMatchState(updatedMatch.state);
      setWinner(updatedMatch.winner);

      console.log("Match resolved!", updatedMatch);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resolve match";
      setError(errorMessage);
      console.error("Match resolution error:", err);
    } finally {
      setResolving(false);
    }
  };

  const handleMoveSubmit = async () => {
    if (selectedMove === null) {
      setError("Please select a move");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get provider from window.ethereum
      if (!window.ethereum) {
        throw new Error("MetaMask not available");
      }

      const provider = new BrowserProvider(window.ethereum);

      // Encrypt the move
      console.log(`Encrypting ${MOVES[selectedMove as keyof typeof MOVES].name}...`);
      const encryptedMoveData = await encryptMove(selectedMove as RPSMove);

      // Submit encrypted move to contract
      console.log("Submitting encrypted move to contract...");
      const hash = await submitEncryptedMove(
        contractAddress,
        matchId,
        encryptedMoveData,
        provider
      );

      setTxHash(hash);
      setSubmitted(true);
      setSelectedMove(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit move";
      setError(errorMessage);
      console.error("Move submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rps-match">
      <div className="match-header">
        <h3>Match #{matchId}</h3>
        <p className="opponent">vs {opponent.slice(0, 6)}...{opponent.slice(-4)}</p>
      </div>

      {winner && matchState === 3 ? (
        <div className="resolved-message">
          <p>✅ Match Resolved!</p>
          <p className="winner-info">Winner: {winner.slice(0, 6)}...{winner.slice(-4)}</p>
          <p className="tx-hash">Tx: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}</p>
        </div>
      ) : submitted && matchState === 2 ? (
        <div className="success-message">
          <p>✅ Move submitted successfully!</p>
          <p className="tx-hash">Tx: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}</p>
          <p className="instruction">Waiting for opponent or match resolution...</p>
          <button
            className="resolve-button"
            onClick={handleResolveMatch}
            disabled={resolving}
          >
            {resolving ? "⏳ Resolving Match..." : "Resolve Match (FHE Comparison)"}
          </button>
        </div>
      ) : submitted && matchState < 2 ? (
        <div className="success-message">
          <p>✅ Move submitted successfully!</p>
          <p className="tx-hash">Tx: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}</p>
          <p className="instruction">Waiting for opponent to commit...</p>
        </div>
      ) : (
        <>
          <div className="moves-container">
            {Object.entries(MOVES).map(([moveKey, moveData]) => (
              <button
                key={moveKey}
                className={`move-button ${selectedMove === parseInt(moveKey) ? "selected" : ""}`}
                onClick={() => setSelectedMove(parseInt(moveKey))}
                disabled={loading}
              >
                <span className="emoji">{moveData.emoji}</span>
                <span className="name">{moveData.name}</span>
              </button>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="submit-button"
            onClick={handleMoveSubmit}
            disabled={loading || selectedMove === null}
          >
            {loading ? "🔐 Encrypting & Submitting..." : "Submit Encrypted Move"}
          </button>
        </>
      )}

      <style jsx>{`
        .rps-match {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 10px 0;
          background: #f9f9f9;
        }

        .match-header {
          margin-bottom: 20px;
        }

        .match-header h3 {
          margin: 0;
          font-size: 1.2em;
          color: #007bff;
        }

        .opponent {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 0.9em;
        }

        .moves-container {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .move-button {
          flex: 1;
          min-width: 80px;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 0.9em;
          font-weight: 500;
        }

        .move-button:hover:not(:disabled) {
          border-color: #007bff;
          background: #f0f8ff;
          transform: scale(1.05);
        }

        .move-button.selected {
          border-color: #007bff;
          background: #007bff;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        }

        .move-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .emoji {
          font-size: 2em;
        }

        .name {
          font-size: 0.85em;
        }

        .error-message {
          color: #d32f2f;
          padding: 12px;
          background: #ffebee;
          border-radius: 4px;
          margin: 10px 0;
          font-size: 0.9em;
          border-left: 4px solid #d32f2f;
        }

        .success-message {
          color: #388e3c;
          padding: 15px;
          background: #e8f5e9;
          border-radius: 4px;
          margin: 10px 0;
          font-size: 0.95em;
          border-left: 4px solid #388e3c;
        }

        .success-message p {
          margin: 5px 0;
        }

        .tx-hash {
          font-family: monospace;
          font-size: 0.85em;
          color: #2e7d32;
        }

        .instruction {
          font-size: 0.85em;
          font-style: italic;
          margin-top: 10px;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95em;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .submit-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .resolved-message {
          color: #388e3c;
          padding: 15px;
          background: #e8f5e9;
          border-radius: 4px;
          margin: 10px 0;
          font-size: 0.95em;
          border-left: 4px solid #388e3c;
        }

        .resolved-message p {
          margin: 5px 0;
        }

        .winner-info {
          font-weight: 600;
          font-size: 1.1em;
          color: #2e7d32;
        }

        .resolve-button {
          width: 100%;
          padding: 10px;
          background: #ff9800;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9em;
          transition: all 0.2s;
          margin-top: 10px;
        }

        .resolve-button:hover:not(:disabled) {
          background: #f57c00;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }

        .resolve-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
