import React from 'react';
import moment from 'moment';
import { useTranslations } from 'i18n';
import { Emoji } from 'components';
import './ChronicleItem.scss';

const ChronicleItem = ({ chronicle }) => {
  const { t, locale } = useTranslations();
  const { type, data } = chronicle;
  const text = t(`chronicle.${type}`, data);
  const date = moment(chronicle.date).locale(locale).format('LL');

  return (
    <div className="chronicle-item">
      <span className="chronicle-item__text">
        <Emoji icon="🔸️" /> {text}
      </span>
      <span className="chronicle-item__date">{date}</span>
    </div>
  );
};

export default ChronicleItem;
