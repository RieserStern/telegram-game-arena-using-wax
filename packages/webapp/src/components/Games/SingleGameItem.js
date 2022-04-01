import React from 'react';
import PropTypes from 'prop-types';
import { Emoji, HeroTag } from 'components';

const SingleGameItem = ({ game }) => {
  const players = Object.values(game.players);
  const p1 = players[0];
  const p2 = players[1];

  return (
    <div className="game-item">
      <div className="game-item__players">
        <div className="game-item__player">
          {p1 && <HeroTag hero={p1.character} />}
        </div>
        <Emoji icon="⚔" />
        <div className="game-item__player game-item__player--last">
          {p2 && <HeroTag hero={p2.character} />}
        </div>
      </div>
    </div>
  );
};

SingleGameItem.propTypes = {
  game: PropTypes.object.isRequired
};

export default SingleGameItem;
