import React, { useState, useCallback } from 'react';

import { Popover } from 'antd';

import { FiMenu } from 'react-icons/fi';

import { Container, Content } from './styles';

import TimeSeriePlot from './TimeSeriePlot';

import { useTranslation } from 'react-i18next';

interface CardProps {
  ishidden: number;
  year: number;
}

const CardPlot: React.FC<CardProps> = ({ year, ishidden }) => {
  const { t } = useTranslation();

  const [hidden, setHidden] = useState(ishidden);

  const handleCardPlot = useCallback(() => {
    if (hidden === 0) {
      setHidden(1);
    } else {
      setHidden(0);
    }
  }, [hidden]);

  return (
    <Container id="cardplot" ishidden={hidden}>
      <div id="handleCardplot">
        <Popover placement="leftTop" content={t('tooltip_menu_plot')}>
          <FiMenu
            type="menu"
            style={{ fontSize: '20px', color: '#000' }}
            onClick={handleCardPlot}
          />
        </Popover>
      </div>

      <Content>
        <label>{t('timeseriesplot_title')}</label>
        <TimeSeriePlot tableName="landuse" />

        <div className="final-space"></div>
      </Content>
    </Container>
  );
};

export default CardPlot;
