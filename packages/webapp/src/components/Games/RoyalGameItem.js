import React from 'react';
import PropTypes from 'prop-types';
import { Emoji, HeroTag } from 'components';

const RoyalPlayer = ({ character, dead, surrender }) => {
  const iconDead = dead ? <Emoji icon="💀" /> : null;
  const iconSurrender = surrender ? <Emoji icon="🏳" /> : null;

  return (
    <div className="game-item__player">
      <HeroTag hero={character} />
      {iconDead}
      {iconSurrender}
    </div>
  );
};

const RoyalGameItem = ({ game }) => {
  const players = Object.values(game.players);

  return (
    <div className="game-item">
      <div className="game-item__royal-players">{players.map(RoyalPlayer)}</div>
    </div>
  );
};

RoyalPlayer.propTypes = {
  dead: PropTypes.bool,
  surrender: PropTypes.bool,
  character: PropTypes.object
};

RoyalGameItem.propTypes = {
  game: PropTypes.object.isRequired
};

export default RoyalGameItem;
