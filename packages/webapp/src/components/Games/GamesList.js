import React from 'react';
import { useTranslations } from 'i18n';
import { Message } from 'components';
import './GamesList.scss';

const GamesList = ({ games, title, component: GameComponent }) => {
  const { t } = useTranslations();

  if (!games.length) {
    return (
      <div className="games-list">
        <div className="games-list__title">{title}</div>
        <Message size="sm" title={t('label.empty')} />
      </div>
    );
  }

  return (
    <div className="games-list">
      <div className="games-list__title">{title}</div>
      {games.map(game => (
        <GameComponent key={game.gameId} t={t} game={game} />
      ))}
    </div>
  );
};

export default GamesList;
