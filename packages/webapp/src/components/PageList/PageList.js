import React from 'react';
import cx from 'classnames';
import { range } from 'lodash';

import './PageList.scss';

const Pagination = ({ data, onPage }) => {
  const { pages, page } = data;

  if (pages <= 1) {
    return null;
  }

  const pageNumbers = range(1, pages + 1);

  return (
    <div className="pagination">
      {pageNumbers.map(pageNumber => (
        <button
          type="button"
          onClick={() => onPage(pageNumber)}
          className={cx('pagination__button button', {
            'is-active': page === pageNumber
          })}
        >
          {pageNumber}
        </button>
      ))}
    </div>
  );
};

const PageList = ({ data, renderItem, key, direction, onPage }) => {
  const { docs, pagination } = data;
  const className = `page-list__items flex-${direction}`;

  if (docs.length > 0) {
    return (
      <div className="page-list">
        <div className={className}>
          {docs.map(item => (
            <div className="page-list__item flex-col" key={item[key]}>
              {renderItem(item)}
            </div>
          ))}
        </div>

        <div className="page-list__buttons">
          <Pagination data={pagination} onPage={onPage} />
        </div>
      </div>
    );
  }

  return null;
};

PageList.defaultProps = {
  key: '_id',
  direction: 'row'
};

export default PageList;
