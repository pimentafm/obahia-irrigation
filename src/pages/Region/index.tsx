import React, { useEffect } from 'react';

import Map from '../../components/MapRegion';

import ReactGA from 'react-ga';

const Region: React.FC = () => {
  useEffect(() => {
    ReactGA.initialize('UA-182410588-8');
    ReactGA.pageview('/');
  }, []);
  return (
    <Map defaultYear={2020} defaultMonth={11} defaultCategory="regional" />
  );
};

export default Region;
