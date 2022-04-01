import React from 'react';
import './Home.scss';

function Home() {
  return (
    <div className="home-page">
      <img
        className="home-image"
        src={`${process.env.PUBLIC_URL}/images/gamepass.jpg`}
        alt="GRAFFpunks Arena Game Intro"
      />
    </div>
  );
}

export default Home;
