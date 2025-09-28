import React from 'react';

const DiscussionPanel = ({ round }) => {
  const clues = round?.clues || [];

  return (
    <div className="phase-card">
      <h2>Débat</h2>
      <p>Discutez librement à l'oral ou via un outil vocal externe pour confondre l'infiltré.</p>
      <section className="clue-review">
        <h3>Indices publiés</h3>
        <ul>
          {clues.map((entry) => (
            <li key={entry.playerId}>
              <span className="name">{entry.playerName}</span>
              <span className="text">{entry.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="hint">Quand tout le monde est prêt, l'hôte peut lancer la phase de vote.</p>
    </div>
  );
};

export default DiscussionPanel;
