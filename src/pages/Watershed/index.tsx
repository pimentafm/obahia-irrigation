import React from 'react';

import Map from '../../components/MapWatershed';

const Watershed: React.FC = () => {
  return (
    <Map
      defaultYear={2020}
      defaultMonth={12}
      defaultCategory="gcc"
      defaultWatershed="Grande"
    />
  );
};

export default Watershed;
