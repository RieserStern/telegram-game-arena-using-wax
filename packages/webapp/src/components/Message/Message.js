import React from 'react';
import PropTypes from 'prop-types';
import './Message.scss';

const Message = ({ title, size }) => (
  <div className={`message message--${size}`}>
    <div className="message__title">{title}</div>
  </div>
);

Message.propTypes = {
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

Message.defaultProps = {
  size: 'lg'
};

export default Message;
