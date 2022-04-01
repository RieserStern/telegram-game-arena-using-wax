import React from 'react';
import { HeroTag, HeroStats, HeroAvatar } from 'components';
import './HeroCard.scss';

const HeroCard = ({ hero }) => {
  return (
    <div className="hero-card">
      <div className="hero-card__header">
        <div className="hero-card__title">
          <HeroTag hero={hero} hideValues />
        </div>

        <div className="hero-card__avatar">
          <HeroAvatar hero={hero} />
        </div>

        <div className="hero-card__content">
          <HeroStats hero={hero} />
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
