import React from 'react';
import PropTypes from 'prop-types';
import './Emoji.scss';

const Emoji = ({ icon, theme = 'default' }) => (
  <span
    className={`emoji-icon emoji-icon--${theme}`}
    role="img"
    aria-labelledby="emoji"
  >
    {icon}
  </span>
);

Emoji.propTypes = {
  icon: PropTypes.string,
  theme: PropTypes.string
};

export default Emoji;
