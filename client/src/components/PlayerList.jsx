import React from 'react';

const PlayerList = ({ players, personalId, hostId, round }) => {
  const renderStatus = (player) => {
    if (!round) return null;
    if (round.phase === 'clue') {
      return player.clueSubmitted ? '✅ indice' : '…';
    }
    if (round.phase === 'vote') {
      return player.voteSubmitted ? '✅ vote' : '…';
    }
    return null;
  };

  return (
    <div className="player-list">
      <h3>Joueurs ({players.length})</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id} className={player.id === personalId ? 'me' : ''}>
            <span className="player-name">
              {player.name}
              {player.id === hostId && <span className="tag">Hôte</span>}
              {player.id === personalId && <span className="tag accent">Moi</span>}
            </span>
            <span className="player-status">{renderStatus(player)}</span>
            <span className="player-score">{player.score} pt{player.score === 1 ? '' : 's'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
