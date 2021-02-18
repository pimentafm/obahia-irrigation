import React, { useState, useEffect } from 'react';
import ReactHtmlParser from 'react-html-parser';

import { wms } from '../../../services';

import { Container } from './styles';

import { useTranslation } from 'react-i18next';

interface LegendProps {
  name: string;
  isvisible: boolean;
}

const Legend: React.FC<LegendProps> = ({ name, isvisible }) => {
  const { t } = useTranslation();

  const [legendHTML, setlegendHTML] = useState([]);

  useEffect(() => {
    wms
      .get(name + `Region.map&mode=legend&year=2018`, {
        responseType: 'text',
      })
      .then(res => {
        let html = res.data;

        if (name === 'irrigation') {
          html = html
            .replace('Irrigado', t('label_irrigated'))
            .replace('Não irrigado', t('label_notirrigated'))
            .replace('Outros usos', t('label_otheruses'));
        } else {
          html = html
            .replace('mm/mo', t('label_evapo_unit'))
            .replace('Outros usos', t('label_otheruses'));
        }

        html = ReactHtmlParser(html);

        setlegendHTML(html);
      });
  }, [name, t]);
  return (
    <Container id="layerswitcher" isvisible={isvisible}>
      {legendHTML}
    </Container>
  );
};

export default Legend;
