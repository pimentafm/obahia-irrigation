import React from 'react';

import Map from '../../components/MapWatershed';

const Watershed: React.FC = () => {
  return (
    <Map
      defaultYear={2019}
      defaultMonth={11}
      defaultCategory="gcc"
      defaultWatershed="Grande"
    />
  );
};

export default Watershed;
