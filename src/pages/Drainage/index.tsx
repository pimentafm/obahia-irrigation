import React from 'react';

import Map from '../../components/MapDrainage';

const Drainage: React.FC = () => {
  return (
    <Map
      defaultYear={2019}
      defaultMonth={11}
      defaultCategory="drainage"
      defaultCodeName={{ code: 46543000, name: 'RIO DE ONDAS - 46543000' }}
    />
  );
};

export default Drainage;
