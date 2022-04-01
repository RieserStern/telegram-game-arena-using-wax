import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, PageList, HeroCard } from 'components';
import './Heroes.scss';
import useSWR from 'swr';
import api from 'lib/utils/api';

function useHeroes() {
  const sort = { 'stats.experience': 'desc', 'stats.rating': 'desc' };
  const [page, setPage] = useState(1);
  const { data, error } = useSWR(['/heroes', page], (url, page) => api.get(url, { page, sort }));

  return {
    error,
    heroes: data,
    loading: !data,
    setPage
  };
}

function Heroes() {
  const { heroes, loading, setPage } = useHeroes();

  if (loading) {
    return (
      <div className="heroes-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="heroes-page">
      <div className="heroes-content">
        {heroes.data && (
          <PageList
            data={heroes.data}
            onPage={setPage}
            renderItem={hero => (
              <Link className="hero-link" to={`/heroes/${hero.userId}`}>
                <HeroCard hero={hero} />
              </Link>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default Heroes;
