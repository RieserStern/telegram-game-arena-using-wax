import React from 'react';
import './HeroAvatar.scss';

const HeroAvatar = ({ hero }) => {
  const { avatar } = hero;
  const src = avatar
    ? `${process.env.PUBLIC_URL}/images/avatars/avatar${avatar.fileNumber}.jpg`
    : `${process.env.PUBLIC_URL}/images/avatars/empty.png`;

  return (
    <div className="hero-avatar">
      <img src={src} alt="test" />
    </div>
  );
};

export default HeroAvatar;
