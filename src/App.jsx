import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api/game";
const COLORS = ["Red", "Green", "Blue", "Yellow"];
const CARD_COLORS = {
  Red: '#e74c3c', Blue: '#2980b9',
  Green: '#27ae60', Yellow: '#f39c12'
};

function getCardLabel(card) {
  if (card.includes('Skip')) return 'S';
  if (card.includes('Reverse')) return 'R';
  if (card.includes('Draw Two')) return '+2';
  if (card === 'Wild Draw Four') return '+4';
  if (card === 'Wild') return 'W';
  return card.split(' ')[1] ?? card;
}

function getCardColor(card) {
  if (card.startsWith('Red')) return '#e74c3c';
  if (card.startsWith('Blue')) return '#2980b9';
  if (card.startsWith('Green')) return '#27ae60';
  if (card.startsWith('Yellow')) return '#f39c12';
  return null; // Wild
}

function UnoCard({ card, onClick, small }) {
  const bg = getCardColor(card);
  const label = getCardLabel(card);
  const isWild = !bg;
  const w = small ? 44 : 72;
  const h = small ? 64 : 108;

  const wildStyle = {
    background: 'linear-gradient(135deg, #e74c3c 25%, #2980b9 25%, #2980b9 50%, #27ae60 50%, #27ae60 75%, #f39c12 75%)'
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: w, height: h,
        borderRadius: 10,
        border: '3px solid white',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        flexShrink: 0,
        ...(isWild ? wildStyle : { background: bg })
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-12px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {!small && (
        <span style={{
          position: 'absolute', top: 6, left: 8,
          fontSize: 13, fontWeight: 700, color: 'white'
        }}>{label}</span>
      )}
      <div style={{
        width: small ? 30 : 48, height: small ? 44 : 72,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.15)'
      }}>
        <span style={{
          fontSize: small ? 14 : 26,
          fontWeight: 900, color: 'white',
          textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
        }}>{label}</span>
      </div>
      {!small && (
        <span style={{
          position: 'absolute', bottom: 6, right: 8,
          fontSize: 13, fontWeight: 700, color: 'white',
          transform: 'rotate(180deg)'
        }}>{label}</span>
      )}
    </div>
  );
}

function CardBack({ small }) {
  return (
    <div style={{
      width: small ? 44 : 72, height: small ? 64 : 108,
      borderRadius: 10, border: '3px solid white',
      background: '#c0392b',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: small ? 34 : 58, height: small ? 54 : 94,
        borderRadius: 6, border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)'
      }}>
        <span style={{
          fontSize: small ? 11 : 18, fontWeight: 900,
          color: 'white', fontStyle: 'italic'
        }}>UNO</span>
      </div>
    </div>
  );
}


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
      <div style={{
        height: '100vh',
        maxWidth: 600,               // ← locks game width
        margin: '0 auto',            // ← centres it on wide screens
        background: '#1a6b3a',
        padding: 24,
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>

      {/* CPU area — fixed height, fixed width, wraps inside */}
      <div style={{ height: 100, textAlign: 'center', marginBottom: 8 }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 8px' }}>
          CPU — {game.cpuHand.length} cards
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',          // ← wraps to next line instead of expanding
          gap: 4,
          maxWidth: '100%',          // ← never wider than screen
          overflow: 'hidden',        // ← hides anything that overflows
          maxHeight: 68,             // ← clips to fixed height
        }}>
          {game.cpuHand.map((_, i) => <CardBack key={i} small />)}
        </div>
      </div>

      {/* Message bar — fixed height */}
      <div style={{
        height: 40,
        background: 'rgba(0,0,0,0.3)', borderRadius: 8,
        padding: '0 16px', color: 'white',
        fontSize: 14, textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '8px 0', flexShrink: 0
      }}>
        {game.message}
      </div>

      {/* Turn indicator — fixed height */}
      <div style={{ height: 32, textAlign: 'center', marginBottom: 8, flexShrink: 0 }}>
        <span style={{
          background: game.currentTurn === 'player' ? '#27ae60' : '#e74c3c',
          color: 'white', borderRadius: 20,
          padding: '4px 16px', fontSize: 13, fontWeight: 500
        }}>
          {game.currentTurn === 'player' ? 'Your turn' : "CPU's turn"}
        </span>
      </div>

      {/* Discard + Deck — fixed height */}
      <div style={{
        height: 160,
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: 32,
        flexShrink: 0
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px' }}>
            Deck ({game.deck.length})
          </p>
          <CardBack />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px' }}>
            Discard
          </p>
          {game.topCard && <UnoCard card={game.topCard} />}
        </div>
      </div>

      {/* Color picker — fixed height */}
        <div style={{ height: 36, textAlign: 'center', flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Wild color: </span>
          {COLORS.map(color => (
            <button key={color} onClick={() => setChosenColor(color)} style={{
              marginLeft: 6, padding: '4px 12px',
              background: chosenColor === color
                ? CARD_COLORS[color] : 'rgba(255,255,255,0.15)',
              color: 'white', border: '2px solid white',
              borderRadius: 6, cursor: 'pointer', fontSize: 12
            }}>
              {color}
            </button>
          ))}
      </div>

      {/* UNO warning — fixed height (always rendered, just invisible when not needed) */}
      <div style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {game.playerHand.length === 1 && !game.unoCalled && (
          <div style={{
            background: 'rgba(255,165,0,0.3)',
            border: '2px solid orange', borderRadius: 8,
            padding: '8px 16px', width: '100%', maxWidth: 300,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 16
          }}>
            <span style={{ color: 'white', fontSize: 14 }}>1 card left!</span>
            <button onClick={callUno} style={{
              background: '#e74c3c', color: 'white', border: 'none',
              borderRadius: 6, padding: '6px 20px',
              fontSize: 18, fontWeight: 900,
              fontStyle: 'italic', cursor: 'pointer'
            }}>UNO!</button>
          </div>
        )}
      </div>

      {/* Player hand — takes remaining space, scrolls horizontally if needed */}
      <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 8px' }}>
          Your hand — {game.playerHand.length} cards
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: 8,
          maxHeight: 'calc(100% - 24px)',
          overflowY: 'auto',          // ← cards scroll inside fixed zone
          padding: '4px 0 8px'
        }}>
          {game.playerHand.map((card, i) => (
            <UnoCard
              key={i}
              card={card}
              onClick={() => !loading && !isFinished && playCard(i)}
            />
          ))}
        </div>
      </div>

      {/* Actions — fixed height at bottom */}
      <div style={{ height: 60, textAlign: 'center', flexShrink: 0, paddingTop: 8 }}>
        {!isFinished && (
          <button onClick={drawCard} disabled={loading} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white', color: 'white',
            borderRadius: 8, padding: '10px 24px',
            fontSize: 15, cursor: 'pointer'
          }}>
            Draw a card
          </button>
        )}
        {isFinished && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={{
              background: '#2980b9', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer'
            }} onClick={async () => { await finishGame(); setGame(null); setScreen('lobby'); }}>
              Save & Back to Lobby
            </button>
            <button style={{
              background: '#27ae60', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer'
            }} onClick={async () => { await finishGame(); startGame(); }}>
              Save & Play Again
            </button>
          </div>
        )}
      </div>

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