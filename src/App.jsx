import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api/game";
const COLORS = ["Red", "Green", "Blue", "Yellow"];

// ─── Screens ─────────────────────────────────────────────────
// "name"        → enter your name
// "lobby"       → welcome + start game or view leaderboard
// "game"        → playing
// "leaderboard" → score history

export default function App() {
  const [screen, setScreen] = useState("name");
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chosenColor, setChosenColor] = useState("Red");
  const [playerName, setPlayerName] = useState("");
  const [scores, setScores] = useState([]);

  // ─── API Calls ───────────────────────────────────────────────
  async function startGame() {
    setLoading(true);
    const res = await fetch(`${API}/new`, { method: "POST" });
    setGame(await res.json());
    setScreen("game");
    setLoading(false);
  }

  async function drawCard() {
    setLoading(true);
    const res = await fetch(`${API}/${game.gameId}/draw`, { method: "POST" });
    setGame(await res.json());
    setLoading(false);
  }

  async function playCard(cardIndex) {
    setLoading(true);
    const res = await fetch(
      `${API}/${game.gameId}/play?cardIndex=${cardIndex}&chosenColor=${chosenColor}`,
      { method: "POST" }
    );
    setGame(await res.json());
    setLoading(false);
  }

  async function callUno() {
    setLoading(true);
    const res = await fetch(`${API}/${game.gameId}/uno`, { method: "POST" });
    setGame(await res.json());
    setLoading(false);
  }

  async function finishGame() {
    await fetch(
      `${API}/${game.gameId}/finish?playerName=${playerName}`,
      { method: "POST" }
    );
  }

  async function loadLeaderboard() {
    setLoading(true);
    const res = await fetch(`${API}/scores/all`);
    setScores(await res.json());
    setScreen("leaderboard");
    setLoading(false);
  }

  // ─── Screen: Name Entry ──────────────────────────────────────
  if (screen === "name") return (
    <div style={styles.container}>
      <h1 style={styles.title}>🃏 Uno</h1>
      <h2>Enter your name to play</h2>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          type="text"
          placeholder="Your name..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter"
            && playerName.trim() && setScreen("lobby")}
          style={styles.input}
        />
        <button
          onClick={() => setScreen("lobby")}
          disabled={playerName.trim() === ""}
          style={styles.button}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  // ─── Screen: Lobby ───────────────────────────────────────────
  if (screen === "lobby") return (
    <div style={styles.container}>
      <h1 style={styles.title}>🃏 Uno</h1>
      <p style={{ fontSize: 18 }}>
        Welcome, <strong>{playerName}</strong>! 👋
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          onClick={startGame}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Starting..." : "🎮 Start New Game"}
        </button>
        <button
          onClick={loadLeaderboard}
          disabled={loading}
          style={{ ...styles.button, background: "#6c757d" }}
        >
          🏆 Leaderboard
        </button>
      </div>
    </div>
  );

  // ─── Screen: Leaderboard ─────────────────────────────────────
  if (screen === "leaderboard") return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 Leaderboard</h1>

      {scores.length === 0 ? (
        <p>No games played yet!</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Player</th>
              <th style={styles.th}>Result</th>
              <th style={styles.th}>Cards Drawn</th>
              <th style={styles.th}>Cards Left</th>
              <th style={styles.th}>Played At</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, i) => (
              <tr
                key={score.id}
                style={{
                  background: i % 2 === 0 ? "white" : "#f9f9f9"
                }}
              >
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>
                  <strong>{score.playerName}</strong>
                </td>
                <td style={styles.td}>
                  {score.finalHandSize === 0 ? "🎉 Win" : "💀 Loss"}
                </td>
                <td style={styles.td}>{score.cardsDrawn}</td>
                <td style={styles.td}>{score.finalHandSize}</td>
                <td style={styles.td}>
                  {new Date(score.playedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => setScreen("lobby")}
        style={{ ...styles.button, marginTop: 24 }}
      >
        ← Back to Lobby
      </button>
    </div>
  );

  // ─── Screen: Game ────────────────────────────────────────────
  const isFinished = game.status === "finished";

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🃏 Uno</h1>
      <p>Playing as: <strong>{playerName}</strong></p>

      {/* Message */}
      <p style={{ fontSize: 18, fontWeight: "bold" }}>{game.message}</p>

      {/* Turn indicator */}
      <p style={{ color: game.currentTurn === "player" ? "green" : "red" }}>
        {game.currentTurn === "player" ? "⬆️ Your turn" : "⏳ CPU's turn"}
      </p>

      {/* CPU hand */}
      <h2>🤖 CPU Hand</h2>
      <p>{game.cpuHand.length} cards remaining</p>

      {/* Discard pile */}
      <h2>Discard Pile</h2>
      <div style={styles.card}>{game.topCard ?? "Empty"}</div>

      {/* Color picker */}
      <div style={{ margin: "16px 0" }}>
        <strong>Choose color for Wild: </strong>
        {COLORS.map(color => (
          <button
            key={color}
            onClick={() => setChosenColor(color)}
            style={{
              marginRight: 8, padding: "4px 12px",
              background: chosenColor === color
                ? color.toLowerCase() : "#eee",
              color: chosenColor === color ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: 4, cursor: "pointer"
            }}
          >
            {color}
          </button>
        ))}
      </div>

      {/* UNO warning */}
      {game.playerHand.length === 1 && !game.unoCalled && (
        <div style={styles.unoWarning}>
          <span style={{ fontSize: 18 }}>⚠️ You have 1 card left!</span>
          <button onClick={callUno} disabled={loading} style={styles.unoButton}>
            UNO!
          </button>
        </div>
      )}

      {/* UNO called */}
      {game.unoCalled && game.playerHand.length === 1 && (
        <div style={styles.unoSuccess}>
          🗣️ UNO called! Play your last card to win!
        </div>
      )}

      {/* Player hand */}
      <h2>Your Hand ({game.playerHand.length} cards)</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {game.playerHand.map((card, i) => (
          <div
            key={i}
            onClick={() => !loading && !isFinished && playCard(i)}
            style={{
              ...styles.card,
              cursor: isFinished ? "default" : "pointer",
              opacity: loading ? 0.5 : 1
            }}
          >
            {card}
          </div>
        ))}
      </div>

      <br />
      <p>Cards in deck: {game.deck.length} | Turn: {game.turnNumber}</p>

      {!isFinished && (
        <button onClick={drawCard} disabled={loading} style={styles.button}>
          Draw a Card
        </button>
      )}

      {/* Game over */}
      {isFinished && (
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            style={styles.button}
            onClick={async () => {
              await finishGame();   // save score
              setGame(null);
              setScreen("lobby");
            }}
          >
            💾 Save Score & Back to Lobby
          </button>
          <button
            style={{ ...styles.button, background: "#28a745" }}
            onClick={async () => {
              await finishGame();   // save score
              startGame();          // immediately start new game
            }}
          >
            🔄 Save & Play Again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  container: {
    padding: 40,
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "sans-serif"
  },
  title: {
    fontSize: 36,
    marginBottom: 8
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    fontSize: 16,
    cursor: "pointer"
  },
  input: {
    padding: 8,
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    width: 200
  },
  card: {
    display: "inline-block",
    border: "1px solid black",
    borderRadius: 8,
    padding: "10px 16px",
    background: "white",
    fontSize: 16
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 16
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6"
  },
  td: {
    padding: "10px 16px",
    borderBottom: "1px solid #dee2e6"
  },
  unoWarning: {
    background: "#fff3cd",
    border: "2px solid #ff6b00",
    borderRadius: 8,
    padding: "12px 20px",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  unoButton: {
    background: "#ff6b00",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "8px 24px",
    fontSize: 20,
    fontWeight: "bold",
    cursor: "pointer"
  },
  unoSuccess: {
    background: "#d4edda",
    border: "2px solid #28a745",
    borderRadius: 8,
    padding: "12px 20px",
    marginBottom: 16,
    fontSize: 18
  }
};