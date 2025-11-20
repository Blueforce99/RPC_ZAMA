import { createFrames } from "frames.js";

/**
 * Farcaster Frame for Encrypted RPS Tournament
 * 
 * This template shows how to integrate the tournament into Farcaster frames
 * Deploy this as a Next.js API route and reference it in frame metadata
 */

export const frames = createFrames({
  basePath: "/frames",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

// Frame 1: Tournament Selection
export const tournamentFrame = frames.frame(async (ctx) => {
  return {
    image: (
      <div
        style={{
          fontSize: 40,
          color: "white",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 60, marginBottom: "20px" }}>🎮</div>
        <div>Encrypted RPS Tournament</div>
        <div style={{ fontSize: 20, marginTop: "20px", opacity: 0.8 }}>
          Play privately. Win publicly.
        </div>
      </div>
    ),
    buttons: [
      {
        label: "Join Tournament",
        action: "post",
        target: `/frames/join`,
      },
      {
        label: "View Leaderboard",
        action: "post",
        target: `/frames/leaderboard`,
      },
      {
        label: "Active Matches",
        action: "post",
        target: `/frames/matches`,
      },
    ],
  };
});

// Frame 2: Join Tournament
export const joinTournamentFrame = frames.frame(async (ctx) => {
  // Fetch active tournaments
  const tournaments = [
    { id: 1, entryFee: "10 USDC", players: 8 },
    { id: 2, entryFee: "25 USDC", players: 4 },
  ];

  return {
    image: (
      <div
        style={{
          fontSize: 32,
          color: "white",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: "20px" }}>💰</div>
        <div>Active Tournaments</div>
        <div style={{ fontSize: 16, marginTop: "20px", opacity: 0.9 }}>
          {tournaments.map((t) => `Tournament ${t.id}: ${t.entryFee} (${t.players} players)`).join(" | ")}
        </div>
      </div>
    ),
    buttons: tournaments.map((t) => ({
      label: `Join ${t.entryFee}`,
      action: "post",
      target: `/frames/confirm-join/${t.id}`,
    })),
  };
});

// Frame 3: Play Match
export const playMatchFrame = frames.frame(async (ctx) => {
  const matchId = ctx.searchParams.matchId || "1";

  return {
    image: (
      <div
        style={{
          fontSize: 32,
          color: "white",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>Match {matchId}</div>
        <div style={{ fontSize: 48, marginTop: "20px", marginBottom: "20px" }}>
          ✊ vs ❓
        </div>
        <div style={{ fontSize: 16, opacity: 0.8 }}>Choose your move (it will be encrypted)</div>
      </div>
    ),
    buttons: [
      {
        label: "✊ Rock",
        action: "post",
        target: `/frames/submit-move/${matchId}?move=0`,
      },
      {
        label: "✋ Paper",
        action: "post",
        target: `/frames/submit-move/${matchId}?move=1`,
      },
      {
        label: "✌️ Scissors",
        action: "post",
        target: `/frames/submit-move/${matchId}?move=2`,
      },
    ],
  };
});

// Frame 4: Match Result
export const resultFrame = frames.frame(async (ctx) => {
  const result = ctx.searchParams.result || "pending";

  const resultMessages = {
    win: { text: "🎉 You won!", color: "#10b981" },
    loss: { text: "😢 You lost", color: "#ef4444" },
    tie: { text: "🤝 It's a tie!", color: "#f59e0b" },
    pending: { text: "⏳ Match pending", color: "#8b5cf6" },
  };

  const message = resultMessages[result as keyof typeof resultMessages] || resultMessages.pending;

  return {
    image: (
      <div
        style={{
          fontSize: 32,
          color: "white",
          background: `linear-gradient(135deg, ${message.color} 0%, ${message.color}dd 100%)`,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 60, marginBottom: "20px" }}>
          {result === "win" ? "🏆" : result === "loss" ? "💔" : "⚖️"}
        </div>
        <div style={{ fontSize: 48 }}>{message.text}</div>
      </div>
    ),
    buttons: [
      {
        label: "Back to Tournament",
        action: "post",
        target: `/frames`,
      },
      {
        label: "Play Again",
        action: "post",
        target: `/frames/join`,
      },
    ],
  };
});

// Frame 5: Leaderboard
export const leaderboardFrame = frames.frame(async (ctx) => {
  // In production, fetch from contract
  const topPlayers = [
    { rank: 1, name: "Player1", wins: 12 },
    { rank: 2, name: "Player2", wins: 10 },
    { rank: 3, name: "Player3", wins: 8 },
  ];

  return {
    image: (
      <div
        style={{
          fontSize: 32,
          color: "white",
          background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: "20px" }}>🏅</div>
        <div>Leaderboard</div>
        <div style={{ fontSize: 16, marginTop: "20px", opacity: 0.9 }}>
          {topPlayers.map((p) => `${p.rank}. ${p.name} - ${p.wins} wins`).join(" | ")}
        </div>
      </div>
    ),
    buttons: [
      {
        label: "Back",
        action: "post",
        target: `/frames`,
      },
    ],
  };
});
