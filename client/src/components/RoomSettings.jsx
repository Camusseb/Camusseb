import React from 'react';

const formatDuration = (seconds) => {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes <= 0) {
    return `${total}s`;
  }
  return `${minutes} min ${secs.toString().padStart(2, '0')}s`;
};

const RoomSettings = ({
  effectiveSettings,
  draftSettings,
  isHost,
  phase,
  onDraftChange,
  onSubmit
}) => {
  if (!effectiveSettings) {
    return null;
  }

  const handleNumberChange = (field) => (event) => {
    onDraftChange(field, event.target.value);
  };

  const handleToggleChange = (event) => {
    onDraftChange('autoAdvance', event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(draftSettings);
  };

  const locked = phase !== 'lobby';

  if (!isHost) {
    return (
      <div className="room-settings">
        <h3>Paramètres de manche</h3>
        <ul className="settings-summary">
          <li>
            Indices : <strong>{formatDuration(effectiveSettings.clueDuration)}</strong>
          </li>
          <li>
            Débat : <strong>{formatDuration(effectiveSettings.discussionDuration)}</strong>
          </li>
          <li>
            Vote : <strong>{formatDuration(effectiveSettings.voteDuration)}</strong>
          </li>
          <li>
            Progression automatique : <strong>{effectiveSettings.autoAdvance ? 'Activée' : 'Désactivée'}</strong>
          </li>
        </ul>
        {locked && <p className="settings-hint">L'hôte peut ajuster ces valeurs entre les manches.</p>}
      </div>
    );
  }

  return (
    <div className="room-settings">
      <h3>Paramètres de manche</h3>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-grid">
          <label className="settings-field">
            <span>Durée des indices (s)</span>
            <input
              type="number"
              min="30"
              max="600"
              step="15"
              value={draftSettings.clueDuration}
              onChange={handleNumberChange('clueDuration')}
            />
          </label>
          <label className="settings-field">
            <span>Durée du débat (s)</span>
            <input
              type="number"
              min="30"
              max="600"
              step="15"
              value={draftSettings.discussionDuration}
              onChange={handleNumberChange('discussionDuration')}
            />
          </label>
          <label className="settings-field">
            <span>Durée du vote (s)</span>
            <input
              type="number"
              min="30"
              max="600"
              step="15"
              value={draftSettings.voteDuration}
              onChange={handleNumberChange('voteDuration')}
            />
          </label>
        </div>
        <label className="settings-toggle">
          <input type="checkbox" checked={Boolean(draftSettings.autoAdvance)} onChange={handleToggleChange} />
          <span>Progression automatique des phases</span>
        </label>
        <p className="settings-hint">
          {locked
            ? 'Les changements de durée seront appliqués dès la prochaine manche. Désactivez la progression automatique pour couper les minuteries en cours.'
            : 'Configurez les minuteries avant de lancer la prochaine manche.'}
        </p>
        <button type="submit" className="settings-submit">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default RoomSettings;
