import React from 'react';

import Map from '../../components/MapRegion';

const Region: React.FC = () => {
  return (
    <Map defaultYear={2019} defaultMonth={11} defaultCategory="regional" />
  );
};

export default Region;
