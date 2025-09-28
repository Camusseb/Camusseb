import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { customAlphabet } from 'nanoid';

const PORT = Number(process.env.PORT || 4000);
const app = express();
app.use(cors());
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 5);

const WORD_SETS = [
  { theme: 'Desserts', secret: 'Macaron', intruder: 'Donut' },
  { theme: 'Animaux marins', secret: 'Raie Manta', intruder: 'Dauphin' },
  { theme: 'Cinéma', secret: 'Projecteur', intruder: 'Popcorn' },
  { theme: 'Technologie', secret: 'Pare-feu', intruder: 'Antivirus' },
  { theme: 'Voyage', secret: 'Boussole', intruder: 'Carte' },
  { theme: 'Sport', secret: 'Marathon', intruder: 'Sprint' },
  { theme: 'Musique', secret: 'Partition', intruder: 'Microphone' },
  { theme: 'Cuisine', secret: 'Mijoteuse', intruder: 'Four' }
];

const rooms = new Map();

const DEFAULT_SETTINGS = {
  clueDuration: 120,
  discussionDuration: 180,
  voteDuration: 60,
  autoAdvance: true
};

const createRoomState = (code, hostId) => ({
  code,
  hostId,
  players: {},
  scores: {},
  phase: 'lobby',
  round: null,
  roundNumber: 0,
  settings: { ...DEFAULT_SETTINGS }
});

const getPlayersArray = (room) => Object.values(room.players);

const sanitizeClue = (clue) => clue.trim().slice(0, 80);

const buildClueArray = (room) => {
  if (!room.round) return [];
  return getPlayersArray(room).map((player) => {
    const entry = room.round.clues[player.id];
    if (!entry) return null;
    return {
      playerId: player.id,
      playerName: player.name,
      text: entry.text
    };
  }).filter(Boolean);
};

const buildClueProgress = (room) => {
  if (!room.round) return [];
  return getPlayersArray(room).map((player) => ({
    playerId: player.id,
    playerName: player.name,
    submitted: Boolean(room.round.clues[player.id])
  }));
};

const buildVoteSummary = (room, counts) =>
  Object.entries(counts).map(([playerId, count]) => ({
    playerId,
    playerName: room.players[playerId]?.name || 'Inconnu',
    count
  }));

const clearPhaseTimer = (room, phase) => {
  if (room?.round?.timers?.[phase]) {
    clearTimeout(room.round.timers[phase]);
    delete room.round.timers[phase];
  }
};

const clearAllTimers = (room) => {
  ['clue', 'discussion', 'vote'].forEach((phase) => clearPhaseTimer(room, phase));
};

const schedulePhaseTimer = (room, phase) => {
  if (!room.round) return;
  if (!room.round.timers) {
    room.round.timers = {};
  }

  const durations = {
    clue: room.settings.clueDuration,
    discussion: room.settings.discussionDuration,
    vote: room.settings.voteDuration
  };

  const duration = durations[phase];
  if (!room.settings.autoAdvance || !duration) {
    room.round.phaseEndsAt = null;
    return;
  }

  const endTime = Date.now() + duration * 1000;
  room.round.phaseEndsAt = endTime;
  clearPhaseTimer(room, phase);

  const handle = setTimeout(() => {
    if (phase === 'clue') {
      advanceToDiscussion(room, { forced: true });
    } else if (phase === 'discussion') {
      advanceToVote(room, { forced: true });
    } else if (phase === 'vote') {
      computeReveal(room, { forced: true });
    }
  }, duration * 1000);

  room.round.timers[phase] = handle;
};

const getPublicRoomState = (room) => {
  const players = getPlayersArray(room).map((player) => ({
    id: player.id,
    name: player.name,
    connected: player.connected,
    score: room.scores[player.id] || 0,
    clueSubmitted: Boolean(room.round?.clues?.[player.id]),
    voteSubmitted: Boolean(room.round?.votes?.[player.id])
  }));

  let round = null;
  if (room.round) {
    const baseWordSet = room.phase === 'reveal' ? room.round.wordSet : { theme: room.round.wordSet.theme };
    round = {
      phase: room.phase,
      wordSet: baseWordSet,
      clues: [],
      results: room.round.results,
      phaseEndsAt: room.round.phaseEndsAt || null
    };

    if (room.phase === 'clue') {
      round.clues = buildClueProgress(room);
    } else if (room.phase === 'discussion' || room.phase === 'reveal') {
      round.clues = buildClueArray(room);
    }
  }

  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    players,
    round,
    roundNumber: room.roundNumber,
    settings: room.settings
  };
};

const emitRoomState = (room) => {
  io.to(room.code).emit('roomUpdate', getPublicRoomState(room));
};

const assignHostIfNeeded = (room) => {
  if (room.players[room.hostId]) return;
  const players = getPlayersArray(room);
  room.hostId = players.length ? players[0].id : null;
  if (room.hostId) {
    io.to(room.hostId).emit('personalUpdate', {
      playerId: room.hostId,
      isHost: true,
      roomCode: room.code
    });
  }
};

const removePlayerFromRound = (room, playerId) => {
  if (!room.round) return;
  clearAllTimers(room);
  if (room.round.clues) {
    delete room.round.clues[playerId];
  }
  if (room.round.votes) {
    delete room.round.votes[playerId];
  }
  if (room.round.intruderId === playerId) {
    room.phase = 'lobby';
    room.round = null;
    io.to(room.code).emit('statusMessage', "La manche a été interrompue (l'infiltré a quitté la partie).");
    Object.values(room.players).forEach((player) => {
      delete player.role;
      io.to(player.id).emit('personalUpdate', {
        playerId: player.id,
        role: null,
        word: null,
        roomCode: room.code,
        isHost: room.hostId === player.id
      });
    });
  }
};

const teardownRoomIfEmpty = (code) => {
  const room = rooms.get(code);
  if (room && Object.keys(room.players).length === 0) {
    rooms.delete(code);
  }
};

const startRound = (room) => {
  const playerIds = Object.keys(room.players);
  if (playerIds.length < 3) {
    throw new Error('Une manche nécessite au moins trois joueurs.');
  }
  clearAllTimers(room);
  const wordSet = WORD_SETS[Math.floor(Math.random() * WORD_SETS.length)];
  const intruderId = playerIds[Math.floor(Math.random() * playerIds.length)];

  room.roundNumber += 1;
  room.round = {
    wordSet,
    intruderId,
    clues: {},
    votes: {},
    results: null,
    phase: 'clue',
    timers: {},
    phaseEndsAt: null
  };
  room.phase = 'clue';

  playerIds.forEach((playerId) => {
    const role = playerId === intruderId ? 'intruder' : 'agent';
    const word = role === 'intruder' ? wordSet.intruder : wordSet.secret;
    room.players[playerId].role = role;
    io.to(playerId).emit('personalUpdate', {
      playerId,
      role,
      word,
      roomCode: room.code,
      isHost: room.hostId === playerId
    });
  });

  schedulePhaseTimer(room, 'clue');
  emitRoomState(room);
};

const advanceToDiscussion = (room, { forced = false } = {}) => {
  if (!room.round || room.phase !== 'clue') return;
  clearPhaseTimer(room, 'clue');
  room.phase = 'discussion';
  room.round.phase = 'discussion';
  schedulePhaseTimer(room, 'discussion');
  emitRoomState(room);
  if (forced) {
    io.to(room.code).emit('statusMessage', 'Temps des indices écoulé, débat lancé automatiquement.');
  }
};

const maybeAdvanceAfterClues = (room) => {
  if (!room.round) return;
  const totalPlayers = Object.keys(room.players).length;
  if (Object.keys(room.round.clues).length >= totalPlayers) {
    advanceToDiscussion(room, { forced: false });
    io.to(room.code).emit('statusMessage', 'Tous les indices sont publiés, place au débat !');
  }
};

const advanceToVote = (room, { forced = false } = {}) => {
  if (!room.round || (room.phase !== 'discussion' && room.phase !== 'clue')) return;
  clearPhaseTimer(room, 'clue');
  clearPhaseTimer(room, 'discussion');
  room.phase = 'vote';
  room.round.phase = 'vote';
  schedulePhaseTimer(room, 'vote');
  emitRoomState(room);
  if (forced) {
    io.to(room.code).emit('statusMessage', 'Fin du débat, passage automatique au vote.');
  }
};

const computeReveal = (room, { forced = false } = {}) => {
  const voteCounts = {};
  Object.entries(room.round.votes).forEach(([, suspectId]) => {
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
  });

  let majorityVote = null;
  let highest = 0;
  Object.entries(voteCounts).forEach(([suspectId, count]) => {
    if (count > highest) {
      highest = count;
      majorityVote = suspectId;
    }
  });

  const intruderId = room.round.intruderId;
  const intruderCaught = majorityVote === intruderId;

  if (intruderCaught) {
    Object.keys(room.players).forEach((playerId) => {
      if (playerId !== intruderId) {
        room.scores[playerId] = (room.scores[playerId] || 0) + 1;
      }
    });
  } else {
    room.scores[intruderId] = (room.scores[intruderId] || 0) + 1;
  }

  clearPhaseTimer(room, 'vote');
  room.phase = 'reveal';
  room.round.phase = 'reveal';
  room.round.results = {
    intruderId,
    intruderName: room.players[intruderId]?.name || 'Inconnu',
    intruderCaught,
    majorityVote,
    voteSummary: buildVoteSummary(room, voteCounts)
  };
  room.round.phaseEndsAt = null;

  emitRoomState(room);
  if (forced) {
    io.to(room.code).emit('statusMessage', 'Fin du temps de vote, révélation automatique !');
  }
};

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name }, callback) => {
    const safeName = (name || '').trim().slice(0, 32);
    if (!safeName) {
      callback?.({ ok: false, error: 'Pseudo obligatoire.' });
      return;
    }
    const code = nanoid();
    const room = createRoomState(code, socket.id);
    rooms.set(code, room);

    room.players[socket.id] = {
      id: socket.id,
      name: safeName,
      connected: true
    };
    room.scores[socket.id] = room.scores[socket.id] || 0;

    socket.join(code);
    socket.data.roomCode = code;

    emitRoomState(room);
    io.to(socket.id).emit('personalUpdate', {
      playerId: socket.id,
      isHost: true,
      roomCode: code
    });

    callback?.({ ok: true, roomCode: code, playerId: socket.id, hostId: room.hostId });
  });

  socket.on('joinRoom', ({ name, roomCode }, callback) => {
    const safeName = (name || '').trim().slice(0, 32);
    const code = (roomCode || '').trim().toUpperCase();
    if (!safeName) {
      callback?.({ ok: false, error: 'Pseudo obligatoire.' });
      return;
    }
    const room = rooms.get(code);
    if (!room) {
      callback?.({ ok: false, error: 'Salle introuvable.' });
      return;
    }

    room.players[socket.id] = {
      id: socket.id,
      name: safeName,
      connected: true
    };
    room.scores[socket.id] = room.scores[socket.id] || 0;

    socket.join(code);
    socket.data.roomCode = code;

    emitRoomState(room);
    io.to(socket.id).emit('personalUpdate', {
      playerId: socket.id,
      isHost: room.hostId === socket.id,
      roomCode: code
    });

    callback?.({ ok: true, roomCode: code, playerId: socket.id, hostId: room.hostId });
  });

  socket.on('leaveRoom', ({ roomCode }) => {
    const code = roomCode || socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    removePlayerFromRound(room, socket.id);
    delete room.players[socket.id];
    delete room.scores[socket.id];

    assignHostIfNeeded(room);
    emitRoomState(room);

    socket.leave(code);
    socket.data.roomCode = null;

    teardownRoomIfEmpty(code);
  });

  socket.on('startRound', ({ roomCode }, callback) => {
    const code = roomCode || socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) {
      callback?.({ ok: false, error: 'Salle introuvable.' });
      return;
    }
    if (room.hostId !== socket.id) {
      callback?.({ ok: false, error: "Seul l'hôte peut démarrer." });
      return;
    }
    try {
      startRound(room);
      callback?.({ ok: true });
    } catch (error) {
      callback?.({ ok: false, error: error.message });
    }
  });

  socket.on('submitClue', ({ roomCode, clue }, callback) => {
    const code = roomCode || socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || !room.round || room.phase !== 'clue') {
      callback?.({ ok: false, error: 'Phase invalide.' });
      return;
    }
    if (!room.players[socket.id]) {
      callback?.({ ok: false, error: 'Joueur inconnu.' });
      return;
    }
    const safeClue = sanitizeClue(clue || '');
    if (!safeClue) {
      callback?.({ ok: false, error: 'Indice vide.' });
      return;
    }

    room.round.clues[socket.id] = { text: safeClue };
    emitRoomState(room);
    maybeAdvanceAfterClues(room);
    callback?.({ ok: true });
  });

  socket.on('advancePhase', ({ roomCode, targetPhase }, callback) => {
    const code = roomCode || socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) {
      callback?.({ ok: false, error: 'Salle introuvable.' });
      return;
    }
    if (room.hostId !== socket.id) {
      callback?.({ ok: false, error: "Action réservée à l'hôte." });
      return;
    }
    if (targetPhase === 'vote' && room.phase === 'discussion') {
      advanceToVote(room, { forced: true });
      callback?.({ ok: true });
      return;
    }
    if (targetPhase === 'lobby' && room.phase === 'reveal') {
      room.phase = 'lobby';
      room.round = null;
      Object.values(room.players).forEach((player) => {
        delete player.role;
        io.to(player.id).emit('personalUpdate', {
          playerId: player.id,
          role: null,
          word: null,
          roomCode: room.code,
          isHost: room.hostId === player.id
        });
      });
      clearAllTimers(room);
      emitRoomState(room);
      callback?.({ ok: true });
      return;
    }
    callback?.({ ok: false, error: 'Transition impossible.' });
  });

  socket.on('submitVote', ({ roomCode, suspectId }, callback) => {
    const code = roomCode || socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || !room.round || room.phase !== 'vote') {
      callback?.({ ok: false, error: 'Phase de vote indisponible.' });
      return;
    }
    if (!room.players[socket.id]) {
      callback?.({ ok: false, error: 'Joueur inconnu.' });
      return;
    }
    if (!room.players[suspectId]) {
      callback?.({ ok: false, error: 'Cible invalide.' });
      return;
    }

    room.round.votes[socket.id] = suspectId;
    emitRoomState(room);

    if (Object.keys(room.round.votes).length >= Object.keys(room.players).length) {
      computeReveal(room);
    }

    callback?.({ ok: true });
  });

  socket.on('updateSettings', ({ roomCode, settings }, callback) => {
    const code = roomCode || socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) {
      callback?.({ ok: false, error: 'Salle introuvable.' });
      return;
    }
    if (room.hostId !== socket.id) {
      callback?.({ ok: false, error: "Action réservée à l'hôte." });
      return;
    }
    const sanitizeDuration = (value, fallback) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return fallback;
      return Math.max(30, Math.min(600, Math.round(parsed)));
    };

    const previousSettings = { ...room.settings };
    const nextSettings = { ...room.settings };
    if (settings && Object.prototype.hasOwnProperty.call(settings, 'clueDuration')) {
      nextSettings.clueDuration = sanitizeDuration(settings.clueDuration, room.settings.clueDuration);
    }
    if (settings && Object.prototype.hasOwnProperty.call(settings, 'discussionDuration')) {
      nextSettings.discussionDuration = sanitizeDuration(settings.discussionDuration, room.settings.discussionDuration);
    }
    if (settings && Object.prototype.hasOwnProperty.call(settings, 'voteDuration')) {
      nextSettings.voteDuration = sanitizeDuration(settings.voteDuration, room.settings.voteDuration);
    }
    if (settings && Object.prototype.hasOwnProperty.call(settings, 'autoAdvance')) {
      nextSettings.autoAdvance = Boolean(settings.autoAdvance);
    }

    room.settings = nextSettings;
    const durationsChanged =
      previousSettings.clueDuration !== nextSettings.clueDuration ||
      previousSettings.discussionDuration !== nextSettings.discussionDuration ||
      previousSettings.voteDuration !== nextSettings.voteDuration;
    const autoChanged = previousSettings.autoAdvance !== nextSettings.autoAdvance;

    if (room.round) {
      if (!nextSettings.autoAdvance) {
        clearAllTimers(room);
        room.round.phaseEndsAt = null;
      } else if (['clue', 'discussion', 'vote'].includes(room.phase) && (autoChanged || durationsChanged)) {
        schedulePhaseTimer(room, room.phase);
      }
    }

    emitRoomState(room);
    callback?.({ ok: true, settings: room.settings });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    removePlayerFromRound(room, socket.id);
    delete room.players[socket.id];
    delete room.scores[socket.id];

    assignHostIfNeeded(room);
    emitRoomState(room);
    teardownRoomIfEmpty(code);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Little Secret server listening on port ${PORT}`);
});
