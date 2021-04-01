import React from 'react';

import Map from '../../components/MapCounty';

const Counties: React.FC = () => {
  return (
    <Map
      defaultYear={2020}
      defaultMonth={12}
      defaultCategory="counties"
      defaultCodeName={{ code: 2903201, name: 'BARREIRAS' }}
    />
  );
};

export default Counties;
