import React, { useEffect, useState } from 'react';
import { useTranslations } from 'i18n';
import { initSocket, decodePayload } from 'lib/utils/socket';
import { GamesList, SingleGameItem, TeamsGameItem, RoyalGameItem } from 'components';
import './Games.scss';

const initialGames = {
  single: [],
  teams: [],
  royal: []
};

function Games() {
  const { t } = useTranslations();
  const [games, setGames] = useState(initialGames);

  function onGamesUpdate(payload) {
    const serverGames = decodePayload(payload);
    const sortedGames = serverGames.reduce(
      (sorted, game) => ({
        ...sorted,
        [game.params.mode]: [...sorted[game.params.mode], game]
      }),
      initialGames
    );

    setGames(sortedGames);
  }

  useEffect(() => {
    const socket = initSocket();
    socket.on('gamesUpdate', onGamesUpdate);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="games-page">
      <div className="games-body flex-row">
        <div className="games-col flex-col">
          <GamesList title={t('label.singleFights')} games={games.single} component={SingleGameItem} />
        </div>

        <div className="games-col flex-col">
          <GamesList title={t('label.teamFights')} games={games.teams} component={TeamsGameItem} />
        </div>

        <div className="games-col flex-col">
          <GamesList title={t('label.royalFights')} games={games.royal} component={RoyalGameItem} />
        </div>
      </div>
    </div>
  );
}

export default Games;
