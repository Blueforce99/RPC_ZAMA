import React, { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { joinTournament, approveUSDC } from "../services/fhevm";

interface TournamentJoinProps {
  contractAddress: string;
  tournamentId: number;
  entryFee: string;
  onJoinSuccess: () => void;
}

// Sepolia testnet USDC address
const SEPOLIA_USDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

export const TournamentJoin: React.FC<TournamentJoinProps> = ({
  contractAddress,
  tournamentId,
  entryFee,
  onJoinSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [step, setStep] = useState<"approve" | "join">("approve");

  const handleJoinTournament = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not available");
      }

      const provider = new BrowserProvider(window.ethereum);

      // Step 1: Approve USDC spending
      if (step === "approve") {
        console.log("Approving USDC...");
        const approveTx = await approveUSDC(
          SEPOLIA_USDC,
          contractAddress,
          entryFee,
          provider
        );
        setTxHash(approveTx);
        setStep("join");
        setLoading(false);
        return;
      }

      // Step 2: Join tournament
      console.log("Joining tournament...");
      const joinTx = await joinTournament(contractAddress, tournamentId, provider);
      setTxHash(joinTx);
      onJoinSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to join tournament";
      setError(errorMsg);
      console.error("Tournament join error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-join">
      <div className="join-card">
        <h2>Join Tournament</h2>
        
        <div className="entry-fee">
          <span>Entry Fee:</span>
          <strong>{entryFee} USDC</strong>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {txHash && step === "approve" && (
          <div className="success-message">
            ✅ USDC approved! Now click below to join.
            <br />
            <span style={{ fontSize: "0.85em", opacity: 0.8 }}>
              Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
          </div>
        )}

        {txHash && step === "join" && (
          <div className="success-message">
            ✅ Successfully joined tournament!
            <br />
            <span style={{ fontSize: "0.85em", opacity: 0.8 }}>
              Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
          </div>
        )}

        <button
          className="join-button"
          onClick={handleJoinTournament}
          disabled={loading}
        >
          {loading ? (
            <>
              {step === "approve" ? "⏳ Approving USDC..." : "⏳ Joining..."}
            </>
          ) : (
            <>
              {step === "approve" ? "Approve USDC" : "Join Tournament"}
            </>
          )}
        </button>

        <div className="steps-info">
          <div className={`step-indicator ${step === "approve" ? "active" : "completed"}`}>
            <span>1</span> Approve USDC
          </div>
          <div className="arrow">→</div>
          <div className={`step-indicator ${step === "join" ? "active" : ""}`}>
            <span>2</span> Join
          </div>
        </div>
      </div>

      <style jsx>{`
        .tournament-join {
          width: 100%;
          margin: 20px 0;
        }

        .join-card {
          border: 2px solid #007bff;
          border-radius: 8px;
          padding: 20px;
          background: linear-gradient(135deg, #007bff15 0%, #007bff05 100%);
        }

        .join-card h2 {
          margin-top: 0;
          color: #007bff;
          margin-bottom: 15px;
        }

        .entry-fee {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-radius: 6px;
          margin: 15px 0;
          font-size: 1.1em;
          border: 1px solid #ddd;
        }

        .entry-fee strong {
          color: #388e3c;
          font-weight: 600;
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
          padding: 12px;
          background: #e8f5e9;
          border-radius: 4px;
          margin: 10px 0;
          font-size: 0.9em;
          border-left: 4px solid #388e3c;
        }

        .join-button {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin: 15px 0;
        }

        .join-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
        }

        .join-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .steps-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 15px;
          font-size: 0.85em;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f0f0f0;
          border-radius: 20px;
          transition: all 0.2s;
        }

        .step-indicator.active {
          background: #007bff;
          color: white;
        }

        .step-indicator.completed {
          background: #388e3c;
          color: white;
        }

        .step-indicator span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          font-weight: 600;
          font-size: 0.8em;
        }

        .arrow {
          color: #999;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};
