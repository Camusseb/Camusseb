import React from 'react';

const phaseLabels = {
  lobby: 'Lobby',
  clue: 'Indices',
  discussion: 'Débat',
  vote: 'Vote',
  reveal: 'Débrief'
};

const formatCountdown = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return null;
  }
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

const PhaseBanner = ({ phase, roundNumber, theme, timeLeft, autoAdvance }) => {
  const countdown = autoAdvance ? formatCountdown(timeLeft) : null;
  return (
    <div className="phase-banner">
      <h2>Manche {roundNumber || 0}</h2>
      <p>
        Phase : <strong>{phaseLabels[phase] || '—'}</strong>
      </p>
      {theme && (
        <p>
          Thème : <strong>{theme}</strong>
        </p>
      )}
      {countdown && (
        <p className="timer">
          Temps restant : <strong>{countdown}</strong>
        </p>
      )}
    </div>
  );
};

export default PhaseBanner;
