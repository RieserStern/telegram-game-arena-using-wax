import React from 'react';
import { useTranslations } from 'i18n';
import { HeroTag, HeroAvatar, HeroStats } from 'components';
import './HeroProfile.scss';

const HeroProfile = ({ hero }) => {
  const { t } = useTranslations();

  return (
    <div className="hero-profile">
      <div className="hero-section">
        <div className="hero-title">
          <HeroTag hero={hero} hideValues />
        </div>
      </div>

      <div className="hero-section hero-section--avatar">
        <HeroAvatar hero={hero} />
      </div>

      <div className="hero-section">
        <div className="hero-section__title">{t('labelStats')}</div>
        <HeroStats hero={hero} />
      </div>
    </div>
  );
};

export default HeroProfile;
