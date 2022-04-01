import React from 'react';
import { useTranslations } from 'i18n';
import './HeroTag.scss';

const HeroTag = ({ hero, hideValues }) => {
  const { t } = useTranslations();
  const {
    firstName,
    username,
    customName,
    clan,
    tendency,
    stats: { level },
    values: { health, maxHealth },
    effects: { faceless }
  } = hero;

  if (faceless) {
    return (
      <span className="hero-tag">
        {t('label.faceless')}
        🎖
        {level}
      </span>
    );
  }

  const hearthBroken = tendency ? '🖤' : '💔';
  const hearthDefault = tendency ? '🖤' : '❤️ ';
  const hearthIcon = health < maxHealth / 2 ? hearthBroken : hearthDefault;

  return (
    <span className="hero-tag">
      <span className="hero-tag__name">
        {clan && clan.icon} {customName || username || firstName}
        🎖
        {level}
      </span>
      {!hideValues && (
        <span className="hero-tag__values">
          {' '}
          {hearthIcon} ({health}/{maxHealth})
        </span>
      )}
    </span>
  );
};

export default HeroTag;
