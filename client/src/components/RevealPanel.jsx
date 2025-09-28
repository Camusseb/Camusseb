import React from 'react';

const RevealPanel = ({ round }) => {
  if (!round?.results) {
    return (
      <div className="phase-card">
        <h2>Révélation en attente…</h2>
        <p>L'hôte finalise la manche.</p>
      </div>
    );
  }

  const { results, wordSet, clues } = round;
  const voteSummary = results.voteSummary || [];
  const playerClues = clues || [];

  return (
    <div className="phase-card">
      <h2>Résultat de la manche</h2>
      <p>
        Mot agents : <strong>{wordSet.secret}</strong> — Mot infiltré : <strong>{wordSet.intruder}</strong>
      </p>
      <p>
        Infiltré : <strong>{results.intruderName}</strong>
      </p>
      <p>
        Verdict :{' '}
        <strong className={results.intruderCaught ? 'success' : 'danger'}>
          {results.intruderCaught ? 'Les agents gagnent' : "L'infiltré s'en sort"}
        </strong>
      </p>

      <section className="clue-review">
        <h3>Indices</h3>
        <ul>
          {playerClues.map((entry) => (
            <li key={entry.playerId} className={entry.playerId === results.intruderId ? 'intruder' : ''}>
              <span className="name">{entry.playerName}</span>
              <span className="text">{entry.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="vote-review">
        <h3>Votes</h3>
        <ul>
          {voteSummary.map((entry) => (
            <li key={entry.playerId} className={entry.playerId === results.majorityVote ? 'selected' : ''}>
              {entry.playerName} — {entry.count} vote{entry.count > 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default RevealPanel;
