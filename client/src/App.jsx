import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import PlayerList from './components/PlayerList.jsx';
import PhaseBanner from './components/PhaseBanner.jsx';
import ClueForm from './components/ClueForm.jsx';
import VoteForm from './components/VoteForm.jsx';
import RevealPanel from './components/RevealPanel.jsx';
import DiscussionPanel from './components/DiscussionPanel.jsx';
import RoomSettings from './components/RoomSettings.jsx';

const defaultStatus = {
  type: 'info',
  message: 'Configurez votre pseudo puis créez ou rejoignez une salle.'
};

const guessServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = import.meta.env.VITE_SERVER_PORT || 4000;
  return `${protocol}//${host}:${port}`;
};

const App = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [personal, setPersonal] = useState({ playerId: null, role: null, word: null, isHost: false, roomCode: null });
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(defaultStatus);
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [clue, setClue] = useState('');
  const [vote, setVote] = useState('');
  const defaultSettingsDraft = useMemo(() => ({
    clueDuration: '120',
    discussionDuration: '180',
    voteDuration: '60',
    autoAdvance: true
  }), []);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettingsDraft);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const socket = io(guessServerUrl(), {
      transports: ['websocket'],
      autoConnect: true
    });
    socketRef.current = socket;

    const resetState = () => {
      setRoom(null);
      setPersonal((prev) => ({ ...prev, role: null, word: null, isHost: false, roomCode: null }));
      setClue('');
      setVote('');
    };

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      resetState();
      setStatus({ type: 'warning', message: 'Déconnecté du serveur. Tentative de reconnexion…' });
    });

    socket.on('roomUpdate', (payload) => {
      setRoom(payload);
      setStatus(defaultStatus);
      setPersonal((prev) => ({
        ...prev,
        isHost: payload.hostId === prev.playerId,
        roomCode: payload.code || prev.roomCode
      }));
    });

    socket.on('personalUpdate', (payload) => {
      setPersonal((prev) => ({ ...prev, ...payload }));
      if (payload.word) {
        setStatus({ type: 'success', message: `Votre mot secret est « ${payload.word} » (${payload.role === 'intruder' ? 'Infiltré' : 'Agent'}).` });
      }
    });

    socket.on('errorMessage', (message) => {
      setError(message);
    });

    socket.on('statusMessage', (message) => {
      setStatus({ type: 'info', message });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const socket = socketRef.current;

  useEffect(() => {
    if (!room) {
      setSettingsDraft(defaultSettingsDraft);
    }
  }, [room, defaultSettingsDraft]);

  useEffect(() => {
    if (!room?.settings) {
      return;
    }
    setSettingsDraft({
      clueDuration: String(room.settings.clueDuration),
      discussionDuration: String(room.settings.discussionDuration),
      voteDuration: String(room.settings.voteDuration),
      autoAdvance: room.settings.autoAdvance
    });
  }, [room?.settings?.clueDuration, room?.settings?.discussionDuration, room?.settings?.voteDuration, room?.settings?.autoAdvance]);

  useEffect(() => {
    if (!room?.settings?.autoAdvance || !room?.round?.phaseEndsAt) {
      setTimeLeft(null);
      return undefined;
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((room.round.phaseEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [room?.round?.phaseEndsAt, room?.settings?.autoAdvance]);

  const currentPlayer = useMemo(() => {
    if (!room || !personal.playerId) {
      return null;
    }
    return room.players.find((player) => player.id === personal.playerId) || null;
  }, [room, personal.playerId]);

  const handleCreateRoom = () => {
    setError(null);
    if (!socket) {
      setError('Connexion en cours, veuillez patienter.');
      return;
    }
    if (!name.trim()) {
      setError('Merci de renseigner un pseudo.');
      return;
    }
    socket.emit('createRoom', { name: name.trim() }, (response) => {
      if (!response?.ok) {
        setError(response?.error || "Impossible de créer la salle.");
        return;
      }
      setPersonal((prev) => ({ ...prev, playerId: response.playerId, isHost: true, roomCode: response.roomCode }));
      setRoomCodeInput(response.roomCode);
      setStatus({ type: 'success', message: `Salle ${response.roomCode} créée. Invitez vos amis à rejoindre la partie !` });
    });
  };

  const handleJoinRoom = () => {
    setError(null);
    if (!socket) {
      setError('Connexion en cours, veuillez patienter.');
      return;
    }
    if (!name.trim()) {
      setError('Merci de renseigner un pseudo.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setError('Indiquez un code de salle.');
      return;
    }
    socket.emit('joinRoom', { name: name.trim(), roomCode: roomCodeInput.trim().toUpperCase() }, (response) => {
      if (!response?.ok) {
        setError(response?.error || "Impossible de rejoindre la salle.");
        return;
      }
      setPersonal((prev) => ({ ...prev, playerId: response.playerId, isHost: response.hostId === response.playerId, roomCode: response.roomCode }));
      setStatus({ type: 'success', message: `Connecté à la salle ${response.roomCode}.` });
    });
  };

  const handleLeaveRoom = () => {
    if (socket && personal.roomCode) {
      socket.emit('leaveRoom', { roomCode: personal.roomCode });
    }
    setRoom(null);
    setPersonal({ playerId: personal.playerId, role: null, word: null, isHost: false, roomCode: null });
    setClue('');
    setVote('');
  };

  const handleStartRound = () => {
    if (!personal.roomCode) return;
    if (!socket) return;
    socket.emit('startRound', { roomCode: personal.roomCode }, (response) => {
      if (!response?.ok) {
        setError(response?.error || 'Impossible de démarrer la manche.');
      }
    });
  };

  const handleSubmitClue = (event) => {
    event.preventDefault();
    if (!clue.trim() || !personal.roomCode) return;
    if (!socket) return;
    socket.emit('submitClue', { roomCode: personal.roomCode, clue: clue.trim() }, (response) => {
      if (!response?.ok) {
        setError(response?.error || "Impossible d'envoyer l'indice.");
        return;
      }
      setClue('');
    });
  };

  const handleAdvancePhase = (targetPhase) => {
    if (!personal.roomCode) return;
    if (!socket) return;
    socket.emit('advancePhase', { roomCode: personal.roomCode, targetPhase }, (response) => {
      if (!response?.ok) {
        setError(response?.error || "Action refusée.");
      }
    });
  };

  const handleSubmitVote = (event) => {
    event.preventDefault();
    if (!vote || !personal.roomCode) return;
    if (!socket) return;
    socket.emit('submitVote', { roomCode: personal.roomCode, suspectId: vote }, (response) => {
      if (!response?.ok) {
        setError(response?.error || "Impossible d'enregistrer le vote.");
        return;
      }
    });
  };

  const handleSettingsDraftChange = (field, value) => {
    setSettingsDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsSubmit = (draft) => {
    if (!personal.isHost || !personal.roomCode || !socket) {
      return;
    }
    const parseDuration = (value, fallback) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return fallback;
      }
      return parsed;
    };

    socket.emit(
      'updateSettings',
      {
        roomCode: personal.roomCode,
        settings: {
          clueDuration: parseDuration(draft.clueDuration, room?.settings?.clueDuration ?? 120),
          discussionDuration: parseDuration(draft.discussionDuration, room?.settings?.discussionDuration ?? 180),
          voteDuration: parseDuration(draft.voteDuration, room?.settings?.voteDuration ?? 60),
          autoAdvance: draft.autoAdvance
        }
      },
      (response) => {
        if (!response?.ok) {
          setError(response?.error || 'Impossible de mettre à jour les paramètres.');
          return;
        }
        setStatus({ type: 'success', message: 'Paramètres de manche mis à jour.' });
      }
    );
  };

  const canStartRound = personal.isHost && room && room.players.length >= 3 && room.phase === 'lobby';

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/logo.svg" alt="Little Secret Online" className="logo" />
        <div>
          <h1>Little Secret Online</h1>
          <p className="subtitle">Adaptation multijoueur temps réel</p>
        </div>
      </header>

      {!connected && (
        <div className="status-card warning">Connexion au serveur en cours…</div>
      )}

      <section className="control-panel">
        <div className="control-group">
          <label htmlFor="player-name">Pseudo</label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre pseudo"
            autoComplete="off"
          />
        </div>

        <div className="control-group">
          <label htmlFor="room-code">Code salle</label>
          <input
            id="room-code"
            type="text"
            value={roomCodeInput}
            onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
            placeholder="Ex : FABLE"
            autoComplete="off"
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={handleCreateRoom} disabled={!connected}>
            Créer
          </button>
          <button type="button" onClick={handleJoinRoom} disabled={!connected}>
            Rejoindre
          </button>
          {room && (
            <button type="button" className="secondary" onClick={handleLeaveRoom}>
              Quitter
            </button>
          )}
        </div>
      </section>

      {status && (
        <div className={`status-card ${status.type}`}>{status.message}</div>
      )}
      {error && <div className="status-card danger">{error}</div>}

      {room ? (
        <main className="layout-grid">
          <aside className="sidebar">
            <PhaseBanner
              phase={room.phase}
              roundNumber={room.roundNumber}
              theme={room.round?.wordSet?.theme}
              timeLeft={timeLeft}
              autoAdvance={room.settings?.autoAdvance}
            />
            <PlayerList
              players={room.players}
              personalId={personal.playerId}
              hostId={room.hostId}
              round={room.round}
            />
            {personal.isHost && (
              <div className="host-actions">
                <h3>Contrôles hôte</h3>
                <button type="button" onClick={handleStartRound} disabled={!canStartRound}>
                  Démarrer une manche
                </button>
                {room.phase === 'discussion' && (
                  <button type="button" onClick={() => handleAdvancePhase('vote')}>
                    Passer au vote
                  </button>
                )}
                {room.phase === 'reveal' && (
                  <button type="button" onClick={() => handleAdvancePhase('lobby')}>
                    Retour au lobby
                  </button>
                )}
              </div>
            )}
            <RoomSettings
              effectiveSettings={room.settings}
              draftSettings={settingsDraft}
              isHost={personal.isHost}
              phase={room.phase}
              onDraftChange={handleSettingsDraftChange}
              onSubmit={handleSettingsSubmit}
            />
          </aside>

          <section className="main-panel">
            {room.phase === 'lobby' && (
              <div className="phase-card">
                <h2>Lobby</h2>
                <p>
                  Partagez le code <strong>{room.code}</strong> pour inviter vos ami·e·s. Une partie nécessite au moins trois
                  personnes.
                </p>
              </div>
            )}

            {room.phase === 'clue' && (
              <div className="phase-card">
                <h2>Phase des indices</h2>
                <p className="phase-hint">Votre rôle : <strong>{personal.role === 'intruder' ? 'Infiltré' : 'Agent'}</strong></p>
                <p className="phase-hint">Mot secret : <strong>{personal.word || '—'}</strong></p>
                <ClueForm
                  clue={clue}
                  onChange={setClue}
                  onSubmit={handleSubmitClue}
                  disabled={!!(currentPlayer && currentPlayer.clueSubmitted)}
                />
              </div>
            )}

            {room.phase === 'discussion' && (
              <DiscussionPanel round={room.round} />
            )}

            {room.phase === 'vote' && (
              <VoteForm
                players={room.players}
                personalId={personal.playerId}
                vote={vote}
                onChange={setVote}
                onSubmit={handleSubmitVote}
                disabled={!!(currentPlayer && currentPlayer.voteSubmitted)}
              />
            )}

            {room.phase === 'reveal' && <RevealPanel round={room.round} />}
          </section>
        </main>
      ) : (
        <div className="placeholder">
          <h2>Préparez votre partie</h2>
          <p>Définissez votre pseudo puis créez une salle ou rejoignez celle d'un ami.</p>
        </div>
      )}
    </div>
  );
};

export default App;
