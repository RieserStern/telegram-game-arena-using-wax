import React from 'react';
import { useTranslations } from 'i18n';
import { Emoji } from 'components';
import './HeroStats.scss';

const Stat = ({ label, value }) => {
  const labelIcon = label.substring(0, 2);
  const labelText = label.substring(2).trim();

  return (
    <span>
      <Emoji icon={labelIcon} theme="dark" /> {labelText}: {value}
    </span>
  );
};

const HeroStats = ({ hero }) => {
  const { t } = useTranslations();
  const {
    stats: { level, wins, loses, draws, rating }
  } = hero;

  return (
    <div className="hero-stats">
      <ul className="hero-stats__list">
        <li>
          <Stat label={t('labelLevel')} value={level} />
        </li>
        <li>
          <Stat label={t('labelRating')} value={rating} />
        </li>
        <li>
          <Stat label={t('labelWins')} value={wins} />
        </li>
        <li>
          <Stat label={t('labelLoses')} value={loses} />
        </li>
        <li>
          <Stat label={t('labelDraws')} value={draws} />
        </li>
      </ul>
    </div>
  );
};

export default HeroStats;
