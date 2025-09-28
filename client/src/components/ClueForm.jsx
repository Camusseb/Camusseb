import React from 'react';

const ClueForm = ({ clue, onChange, onSubmit, disabled }) => (
  <form className="clue-form" onSubmit={onSubmit}>
    <label htmlFor="clue-input">Votre indice</label>
    <input
      id="clue-input"
      value={clue}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Un mot ou une courte expression"
      maxLength={64}
      disabled={disabled}
      required
    />
    <button type="submit" disabled={disabled || !clue.trim()}>
      Envoyer
    </button>
  </form>
);

export default ClueForm;
