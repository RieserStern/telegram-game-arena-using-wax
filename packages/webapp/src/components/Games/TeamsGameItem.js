import React from 'react';
import PropTypes from 'prop-types';
import { Emoji, HeroTag } from 'components';

const TeamsGameItem = ({ t, game }) => {
  const { t1, t2 } = game.teams;

  return (
    <div className="game-item">
      <div className="game-item__teams">
        <div className="game-item__team">
          <div className="game-item__title">
            <Emoji icon={t1.icon} /> {t('label.team')} 1
          </div>
          <div className="game-item__team-players">
            {Object.keys(t1.players).map(playerId => {
              const player = t1.players[playerId];
              if (player) {
                return <HeroTag key={playerId} hero={player.character} />;
              }
              return '';
            })}
          </div>
        </div>
        <Emoji icon="⚔" />
        <div className="game-item__team game-item__team--last">
          <div className="game-item__title">
            <Emoji icon={t2.icon} /> {t('label.team')} 2
          </div>
          <div className="game-item__team-players">
            {Object.keys(t2.players).map(playerId => {
              const player = t2.players[playerId];
              if (player) {
                return <HeroTag key={playerId} hero={player.character} />;
              }
              return '';
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

TeamsGameItem.propTypes = {
  t: PropTypes.func.isRequired,
  game: PropTypes.object.isRequired
};

export default TeamsGameItem;
