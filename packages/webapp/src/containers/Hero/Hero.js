import React from 'react';
import useSWR from 'swr';
import api from 'lib/utils/api';
import { useParams } from 'react-router-dom';
import { HeroProfile, Loader } from 'components';
import './Hero.scss';

function useHero(id) {
  const { data, error } = useSWR(['/heroes', id], (url, id) => api.get(`${url}/${id}`));

  return {
    error,
    hero: data,
    loading: !data
  };
}

function Hero() {
  const { id } = useParams();
  const { hero, loading } = useHero(id);

  if (loading) {
    return (
      <div className="hero-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="hero-page">
      <HeroProfile hero={hero.data} />
    </div>
  );
}

export default Hero;
