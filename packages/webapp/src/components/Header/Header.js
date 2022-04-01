import React from 'react';
import { useTranslations } from 'i18n';
import { Link } from 'react-router-dom';
import { Button } from 'components';
import './Header.scss';

function Header() {
  const { t, changeLocale } = useTranslations();

  return (
    <header className="header">
      <div className="header__logo">
        <img src={`${process.env.PUBLIC_URL}/images/graffpunks.jpg`} alt="GRAFFpunks Arena Game" />
      </div>

      <nav className="header__menu">
        <div className="header__menu-item">
          <a href={process.env.REACT_APP_BOT_URL} target="_blank" rel="noopener noreferrer">
            <Button icon="🎮">{t('menu.label.play')}</Button>
          </a>
        </div>
        <div className="header__menu-item">
          <Link to="/items">
            <Button icon="🗡">{t('menu.label.items')}</Button>
          </Link>
        </div>
        <div className="header__menu-item">
          <Link to="/heroes">
            <Button icon="🎖">{t('menu.label.heroes')}</Button>
          </Link>
        </div>
        <div className="header__menu-item">
          <Link to="/games">
            <Button icon="⚔">{t('menu.label.games')}</Button>
          </Link>
        </div>
        <div className="header__menu-item">
          <Link to="/chronicles">
            <Button icon="📜">{t('menu.label.chronicles')}</Button>
          </Link>
        </div>
        <div className="header__menu-item">
          <a
            href={`https://telegra.ph/GraffPunks-MidEvil-Hero-Arena-Game-Library-02-16`}
            target="_blank"
            rel="noreferrer"
          >
            <Button icon="📖">{t('menu.label.library')}</Button>
          </a>
        </div>
        <div className="header__menu-item">
          <a
            href={`https://telegra.ph/GRAFFPUNKS-MIDEVIL-Hero-Arena-Terms-and-Conditions-01-14`}
            target="_blank"
            rel="noreferrer"
          >
            <Button icon="📝">{t('menu.label.terms')}</Button>
          </a>
        </div>
        <div className="header__menu-item">
          <Link to="/bank">
            <Button icon="💰">{t('menu.label.bank')}</Button>
          </Link>
        </div>
        <div className="header__menu-item header__menu-item--lang">
          <Button icon="🇬🇧" className="button-lang" onClick={() => changeLocale('en')} />
        </div>
        <div className="header__menu-item header__menu-item--lang">
          <Button icon="🇷🇺" className="button-lang" onClick={() => changeLocale('ru')} />
        </div>
      </nav>
    </header>
  );
}

export default Header;
