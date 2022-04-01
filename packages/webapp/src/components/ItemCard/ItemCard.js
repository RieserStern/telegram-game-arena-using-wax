import React from 'react';
import { useTranslations } from 'i18n';
import { Emoji } from 'components';
import './ItemCard.scss';

const ItemRequirement = ({ param }) => {
  const { t } = useTranslations();
  const label = t(param.label);
  const labelIcon = label.substring(0, 2);
  const labelText = label.substring(2).trim();

  if (param.id === 'tendency') {
    return (
      <li>
        <Emoji icon={labelIcon} /> <label>{labelText}:</label>{' '}
        {!param.value ? t('labelTendencyLight') : t('labelTendencyDark')}
      </li>
    );
  }

  if (param.id === 'legendary') {
    return (
      <li>
        <Emoji icon={labelIcon} /> <label>{labelText}:</label> {t('labelLegendaryRequirement')}
      </li>
    );
  }

  return (
    <li>
      <Emoji icon={labelIcon} /> <label>{labelText}:</label> {param.value}
    </li>
  );
};

const ItemEffect = ({ param }) => {
  const { t } = useTranslations();
  const label = t(param.label);
  const labelIcon = label.substring(0, 2);
  const labelText = label.substring(2).trim();

  return (
    <li>
      <Emoji icon={labelIcon} /> <label>{labelText}:</label>{' '}
      {param.decrement ? <span className="minus">-{param.value}</span> : <span className="plus">+{param.value}</span>}
    </li>
  );
};

const ItemCard = ({ item }) => {
  const { t, locale } = useTranslations();
  const {
    _title,
    price,
    onlyCredits,
    priceCreditsCalculated,
    weight,
    minDurability,
    maxDurability,
    artefact,
    superset,
    type,
    twoHanded,
    requirements,
    effects,
    display
  } = item;

  let features = '';
  if (artefact) features += t('labelItemArtefact');
  if (superset && superset.id) features += t('labelItemFromSet');
  if (!display) features += t('labelItemNotSelling');

  const itemFeatures = features.length > 0 ? features : '-';
  const itemWeaponType = twoHanded ? t('labelTwoHanded') : t('labelOneHanded');
  const itemPrice = onlyCredits
    ? `💎 ${priceCreditsCalculated}`
    : `${price} ${t('labelOfGold')} ${priceCreditsCalculated > 0 ? `(💎 ${priceCreditsCalculated})` : ''}`;

  return (
    <div className="item-card">
      <div className="item-card__title">{_title[locale]}</div>
      <ul className="item-card__list">
        <li>
          <Emoji icon="💰" /> <label>{t('labelPrice')}:</label> {itemPrice}
        </li>
        <li>
          <Emoji icon="🔰" /> <label>{t('labelDurability')}:</label> {minDurability}/{maxDurability}
        </li>
        <li>
          <Emoji icon="⚖" /> <label>{t('labelWeight')}:</label> {weight}
        </li>
        {type === 'weapon' && (
          <li>
            <Emoji icon="⚔" /> <label>{t('labelWeaponType')}:</label> {itemWeaponType}
          </li>
        )}
        <li>
          <Emoji icon="📜" /> <label>{t('labelItemFeatures')}:</label> {itemFeatures}
        </li>
      </ul>

      {requirements && requirements.length > 0 && (
        <ul className="item-card__list">
          <h4>{t('labelRequirements')}</h4>
          {requirements.map(param => (
            <ItemRequirement t={t} param={param} key={param.id} />
          ))}
        </ul>
      )}

      {effects && effects.length > 0 && (
        <ul className="item-card__list">
          <h4>{t('labelEffects')}</h4>
          {effects.map(param => (
            <ItemEffect t={t} param={param} key={param.id} />
          ))}
        </ul>
      )}

      {superset && superset.id && superset.effects.length > 0 && (
        <ul className="item-card__list">
          <h4>{t('labelSupersetEffects')}</h4>
          {superset.effects.map(param => (
            <ItemEffect t={t} param={param} key={param.id} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItemCard;
