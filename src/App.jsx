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
      onClick={(e) => onClick && onClick(e)}
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


// Simple sound generator using Web Audio API — no files needed
function useSound() {
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'play') {
        // Pleasant card play sound
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

      } else if (type === 'draw') {
        // Soft draw sound
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);

      } else if (type === 'invalid') {
        // Buzzer for invalid move
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

      } else if (type === 'uno') {
        // Exciting UNO sound
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);

      } else if (type === 'win') {
        // Win fanfare
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.3);
        });
      }
    } catch(e) {
      // Silently fail if audio not supported
    }
  };
  return playSound;
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
  const [pendingWild, setPendingWild] = useState(null); // stores index of wild card clicked
  const [flyingCard, setFlyingCard] = useState(null); // { index, x, y }
  const [flyingCardData, setFlyingCardData] = useState(null);
  const playSound = useSound();

  // ─── API Calls ───────────────────────────────────────────────
  async function startGame() {
    setLoading(true);
    const res = await fetch(`${API}/new`, { method: "POST" });
    setGame(await res.json());
    setScreen("game");
    setLoading(false);
  }

  async function drawCard() {
    playSound('draw');
    setLoading(true);
    const res = await fetch(`${API}/${game.gameId}/draw`, { method: 'POST' });
    setGame(await res.json());
    setLoading(false);
  }

  async function playCard(cardIndex, e) {
    const card = game.playerHand[cardIndex];

    // Intercept Wild cards
    if (card.startsWith('Wild')) {
      playSound('play');
      setPendingWild(cardIndex);
      return;
    }

    // Save card position before anything else
    const getCardRect = () => {
      if (!e) return null;
      const rect = e.currentTarget.getBoundingClientRect();
      const discardEl = document.getElementById('discard-pile');
      const discardRect = discardEl?.getBoundingClientRect();
      if (!discardRect) return null;
      return {
        startX: rect.left, startY: rect.top,
        endX: discardRect.left - rect.left,
        endY: discardRect.top - rect.top,
      };
    };

    const cardRect = getCardRect();

    playSound('play');
    setLoading(true);
    const res = await fetch(
      `${API}/${game.gameId}/play?cardIndex=${cardIndex}&chosenColor=${chosenColor}`,
      { method: 'POST' }
    );
    const data = await res.json();
    setGame(data);
    setLoading(false);

    // Only animate if move was valid
    if (!data.message.includes('❌') && cardRect) {
      setFlyingCardData(card);
      setFlyingCard(cardRect);
      setTimeout(() => {
        setFlyingCard(null);
        setFlyingCardData(null);
      }, 400);
    }

    if (data.message.includes('❌')) {
      playSound('invalid');
    }

    // Play sounds based on result
    if (data.status === 'finished') playSound('win');
    else if (data.playerHand?.length === 1) playSound('uno');
  }

  async function callUno() {
    playSound('uno');
    setLoading(true);
    const res = await fetch(`${API}/${game.gameId}/uno`, { method: 'POST' });
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

  // Called after player picks a color for their Wild
  async function confirmWild(color) {
    setChosenColor(color);
    setPendingWild(null);
    setLoading(true);
    const res = await fetch(
      `${API}/${game.gameId}/play?cardIndex=${pendingWild}&chosenColor=${color}`,
      { method: 'POST' }
    );
    setGame(await res.json());
    setLoading(false);
  }

if (screen === 'name') return (
  <div style={{
    minHeight: '100vh', width: '100%',
    background: '#1a6b3a',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Nunito', sans-serif",
    position: 'relative', overflow: 'hidden'
  }}>

    {/* Floating background cards */}
    {[
      { bg: '#e74c3c', top: '10%', left: '5%',  r: '-15deg', delay: '0s',   w: 60, h: 84 },
      { bg: '#2980b9', top: '20%', right: '8%', r: '12deg',  delay: '1s',   w: 48, h: 68 },
      { bg: '#f39c12', bottom: '15%', left: '10%', r: '8deg', delay: '2s',  w: 56, h: 78 },
      { bg: '#27ae60', bottom: '20%', right: '6%', r: '-10deg', delay: '0.5s', w: 44, h: 62 },
    ].map((c, i) => (
      <div key={i} style={{
        position: 'absolute', borderRadius: 10,
        border: '3px solid white', opacity: 0.15,
        width: c.w, height: c.h, background: c.bg,
        top: c.top, left: c.left, right: c.right, bottom: c.bottom,
        animation: `float 6s ease-in-out ${c.delay} infinite`,
        '--r': c.r,
      }} />
    ))}

    {/* UNO letter cards */}
    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
      {[
        { letter: 'U', bg: '#e74c3c', delay: '0.1s', r: '-6deg' },
        { letter: 'N', bg: '#2980b9', delay: '0.2s', r: '3deg'  },
        { letter: 'O', bg: '#27ae60', delay: '0.3s', r: '-4deg' },
        { letter: '!', bg: '#f39c12', delay: '0.4s', r: '6deg'  },
      ].map((c, i) => (
        <div key={i} style={{
          width: 52, height: 72, borderRadius: 10,
          border: '3px solid white', background: c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fredoka One', cursive",
          fontSize: 26, color: 'white',
          transform: `rotate(${c.r})`,
          animation: `dealIn 0.4s ease-out ${c.delay} both`,
        }}>
          {c.letter}
        </div>
      ))}
    </div>

    <h1 style={{
      fontFamily: "'Fredoka One', cursive",
      fontSize: 72, color: 'white',
      letterSpacing: 4, margin: '0 0 4px',
      textShadow: '4px 4px 0 rgba(0,0,0,0.2)'
    }}>
      UNO<span style={{ color: '#f39c12' }}>!</span>
    </h1>

    <p style={{
      color: 'rgba(255,255,255,0.7)', fontSize: 14,
      fontWeight: 600, letterSpacing: 4,
      textTransform: 'uppercase', margin: '0 0 40px'
    }}>
      Card Game
    </p>

    <input
      type="text"
      placeholder="Enter your name..."
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setScreen('lobby')}
      style={{
        width: 280, padding: '14px 20px',
        borderRadius: 40, border: '3px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.15)',
        color: 'white', fontSize: 18,
        fontFamily: "'Nunito', sans-serif", fontWeight: 600,
        textAlign: 'center', outline: 'none', marginBottom: 16,
      }}
    />

    <button
      onClick={() => setScreen('lobby')}
      disabled={playerName.trim() === ''}
      style={{
        width: 280, padding: 14, borderRadius: 40,
        border: 'none', background: '#f39c12',
        color: 'white', fontSize: 20,
        fontFamily: "'Fredoka One', cursive",
        letterSpacing: 2, cursor: 'pointer',
        boxShadow: '0 4px 0 #c47f10', marginBottom: 12,
        opacity: playerName.trim() === '' ? 0.4 : 1,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => playerName.trim() && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      PLAY
    </button>

    <p style={{
      position: 'absolute',
      bottom: 20,
      color: 'rgba(255,255,255,0.4)',
      fontSize: 13,
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 600,
      letterSpacing: 1,
      margin: 0,
    }}>
      Created by Victor Lu
    </p>
  </div>
);

  // Lobby screen
  if (screen === 'lobby') return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#1a6b3a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <h1 style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: 64, color: 'white',
        letterSpacing: 4, margin: '0 0 8px',
        textShadow: '4px 4px 0 rgba(0,0,0,0.2)'
      }}>
        UNO<span style={{ color: '#f39c12' }}>!</span>
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.8)', fontSize: 18,
        fontWeight: 600, margin: '0 0 40px'
      }}>
        Welcome back, <span style={{ color: '#f39c12' }}>{playerName}</span>!
      </p>

      <button
        onClick={startGame}
        disabled={loading}
        style={{
          width: 280, padding: 16, borderRadius: 40,
          border: 'none', background: '#f39c12',
          color: 'white', fontSize: 22,
          fontFamily: "'Fredoka One', cursive",
          letterSpacing: 2, cursor: 'pointer',
          boxShadow: '0 4px 0 #c47f10', marginBottom: 16,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {loading ? 'DEALING...' : 'PLAY'}
      </button>

      <button
        onClick={loadLeaderboard}
        disabled={loading}
        style={{
          width: 280, padding: 14, borderRadius: 40,
          background: 'transparent',
          border: '2px solid rgba(255,255,255,0.4)',
          color: 'rgba(255,255,255,0.8)', fontSize: 16,
          fontFamily: "'Nunito', sans-serif", fontWeight: 600,
          cursor: 'pointer', transition: 'border 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
      >
        🏆 Leaderboard
      </button>
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
    minHeight: '100vh',
    width: '100%',             
    background: '#1a6b3a',
    display: 'flex',
    justifyContent: 'center',
  }}>
    <div style={{
      width: '100%',
      maxWidth: 600,
      padding: '16px 24px',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: '100vh',
    }}>

      {/* CPU area */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', marginBottom: 8 }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 6px' }}>
          CPU — {game.cpuHand.length} cards
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
          {game.cpuHand.map((_, i) => <CardBack key={i} small />)}
        </div>
      </div>

      {/* Message bar */}
      <div style={{
        flex: '0 0 auto',
        background: 'rgba(0,0,0,0.3)', borderRadius: 8,
        padding: '8px 16px', color: 'white',
        fontSize: 14, textAlign: 'center', margin: '8px 0'
      }}>
        {game.message}
      </div>

      {/* Turn indicator */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', marginBottom: 8 }}>
        <span style={{
          background: game.currentTurn === 'player' ? '#27ae60' : '#e74c3c',
          color: 'white', borderRadius: 20,
          padding: '4px 16px', fontSize: 13, fontWeight: 500
        }}>
          {game.currentTurn === 'player' ? 'Your turn' : "CPU's turn"}
        </span>
      </div>

      {/* Discard + Deck */}
      <div style={{
        flex: 1,
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: 32,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px' }}>
            Deck ({game.deck.length})
          </p>
          <CardBack />
        </div>
        <div style={{ textAlign: 'center' }} id="discard-pile">
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 6px' }}>
            Discard
          </p>
          {game.topCard && <UnoCard card={game.topCard} />}
        </div>
      </div>

      {/* UNO warning */}
      {game.playerHand.length === 1 && !game.unoCalled && (
        <div style={{
          flex: '0 0 auto',
          background: 'rgba(255,165,0,0.3)',
          border: '2px solid orange', borderRadius: 8,
          padding: '8px 16px', margin: '8px 0',
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

      {/* UNO called */}
      {game.unoCalled && game.playerHand.length === 1 && (
        <div style={{
          flex: '0 0 auto',
          background: 'rgba(39,174,96,0.3)',
          border: '2px solid #27ae60', borderRadius: 8,
          padding: '8px 16px', margin: '8px 0',
          textAlign: 'center', color: 'white', fontSize: 14
        }}>
          UNO called! Play your last card to win!
        </div>
      )}


      {/* Wild color picker popup */}
      {pendingWild !== null && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: '#1a6b3a',
            border: '3px solid white',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', fontSize: 18, fontWeight: 500, margin: '0 0 20px' }}>
              Choose a color
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => confirmWild(color)}
                  style={{
                    width: 64, height: 64,
                    borderRadius: '50%',
                    background: CARD_COLORS[color],
                    border: '3px solid white',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
            <button
              onClick={() => setPendingWild(null)}
              style={{
                marginTop: 20, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: 8, padding: '6px 16px',
                cursor: 'pointer', fontSize: 13
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Player hand */}
      <div style={{ flex: '0 0 auto', textAlign: 'center', marginTop: 8 }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 8px' }}>
          Your hand — {game.playerHand.length} cards
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: 8,
        }}>
          {game.playerHand.map((card, i) => (
            <UnoCard
              key={i}
              card={card}
              onClick={(e) => !loading && !isFinished && playCard(i, e)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        flex: '0 0 auto', textAlign: 'center',
        marginTop: 16, paddingBottom: 8
      }}>
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
            }} onClick={async () => {
              await finishGame();
              setGame(null);
              setScreen('lobby');
            }}>
              Save & Back to Lobby
            </button>
            <button style={{
              background: '#27ae60', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer'
            }} onClick={async () => {
              await finishGame();
              startGame();
            }}>
              Save & Play Again
            </button>
          </div>
        )}
      </div>

      {/* Flying card animation */}
      {flyingCard && flyingCardData && (
      <div style={{
        position: 'fixed',
        top: flyingCard.startY,
        left: flyingCard.startX,
        width: 72, height: 108,
        borderRadius: 10,
        border: '3px solid white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 999,
        background: getCardColor(flyingCardData)
          ?? 'linear-gradient(135deg, #e74c3c 25%, #2980b9 25%, #2980b9 50%, #27ae60 50%, #27ae60 75%, #f39c12 75%)',
        animation: 'flyToDiscard 0.35s ease-in forwards',
        '--fly-x': `${flyingCard.endX}px`,
        '--fly-y': `${flyingCard.endY}px`,
      }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>
          {getCardLabel(flyingCardData)}
        </span>
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