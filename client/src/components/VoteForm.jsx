import React from 'react';

const VoteForm = ({ players, personalId, vote, onChange, onSubmit, disabled }) => (
  <form className="vote-form" onSubmit={onSubmit}>
    <h2>Votez pour l'infiltré</h2>
    <p>Choisissez le joueur que vous suspectez d'être l'intrus.</p>
    <select value={vote} onChange={(event) => onChange(event.target.value)} disabled={disabled} required>
      <option value="" disabled>
        Sélectionnez un joueur
      </option>
      {players
        .filter((player) => player.id !== personalId)
        .map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
    </select>
    <button type="submit" disabled={disabled || !vote}>
      Voter
    </button>
  </form>
);

export default VoteForm;
