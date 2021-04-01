import React, { useState, useCallback, useEffect } from 'react';
import OlMap from 'ol/Map';
import TileWMS from 'ol/source/TileWMS';

import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';

import { createStringXY } from 'ol/coordinate';

import { FiXCircle } from 'react-icons/fi';

import HtmlParser from 'react-html-parser';

import { useTranslation } from 'react-i18next';
import { Container } from './styles';

interface PopupProps {
  map: OlMap;
  source: Array<TileWMS>;
}

const Popup: React.FC<PopupProps> = ({ map, source }) => {
  const { t } = useTranslation();

  const [popcoords, setPopCoords] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [evapotranspiration, setEvapotranspiration] = useState<string>();
  const [irrigation, setIrrigation] = useState<string>();

  let luclasses = [t('label_irrigated'), t('label_notirrigated')];

  const closePopUp = useCallback(() => {
    const element: HTMLElement = document.getElementById(
      'popup-class',
    ) as HTMLElement;

    element.style.display = 'none';
  }, []);

  const getData = useCallback((url, type) => {
    fetch(url)
      .then(response => {
        return response.text();
      })
      .then(value => {
        if (type === 'irrigation') {
          setIrrigation(luclasses[parseInt(value) - 1]);
        } else if (type === 'evapotranspiration') {
          setEvapotranspiration(value);
        } else {
          setAmount(value);
        }
      });
  }, []);

  useEffect(() => {
    map.on('pointermove', evt => {
      if (evt.dragging) {
        return;
      }

      const hit = map.forEachLayerAtPixel(
        evt.pixel,
        (_, rgba) => {
          return true;
        },
        { layerFilter: layer => layer.getClassName() !== 'ol-layer' },
      );

      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    map.on('singleclick', evt => {
      const res = map.getView().getResolution();
      const proj = map.getView().getProjection();

      const stringifyFunc = createStringXY(5);

      const urls = source.map(s =>
        s.getFeatureInfoUrl(evt.coordinate, res, proj, {
          INFO_FORMAT: 'text/html',
          VERSION: '1.3.0',
        }),
      );

      getData(urls[2], 'amount');
      getData(urls[1], 'evapotranspiration');
      getData(urls[0], 'irrigation');

      setPopCoords(stringifyFunc(evt.coordinate));

      const element: HTMLElement = document.getElementById(
        'popup-class',
      ) as HTMLElement;

      const popup = new Overlay({
        position: evt.coordinate,
        element,
        positioning: OverlayPositioning.BOTTOM_LEFT,
        autoPan: true,
        autoPanAnimation: {
          duration: 500,
        },
      });

      element.style.display = 'unset';

      map.addOverlay(popup);
    });
  }, [map, getData, source]);

  return (
    <Container>
      <tbody
        id="popup-class"
        className="popup-class"
        style={{
          boxShadow: `0px 2px 3px rgba(0, 0, 0, 0.13), 1px 2px 2px rgba(0, 0, 0, 0.1),
      -1px -2px 2px rgba(0, 0, 0, 0.05)`,
        }}
      >
        <tr className="table-header">
          <th
            colSpan={2}
            style={{ background: '#1f5582', borderRadius: '2px 2px 0px 0px' }}
          >
            <FiXCircle
              id="close-popup"
              type="close"
              onClick={closePopUp}
              style={{
                display: 'flex',
                color: '#fff',
                fontSize: '25px',
                padding: '2px',
                float: 'right',
                cursor: 'pointer',
              }}
            />
          </th>
        </tr>
        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px` }}>{t('label_amount')}</td>
          <td id="popup-amount" style={{ padding: `2px 5px` }}>
            {amount ? HtmlParser(amount) + t('label_label') : 'Fora da camada'}
          </td>
        </tr>
        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px` }}>{t('label_evapo')}</td>
          <td id="popup-evapo" style={{ padding: `2px 5px` }}>
            {evapotranspiration
              ? HtmlParser(evapotranspiration) + t('label_label')
              : 'Fora da camada'}
          </td>
        </tr>
        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px` }}>{t('label_popup')}</td>
          <td id="popup-class" style={{ padding: `2px 5px` }}>
            {irrigation ? HtmlParser(irrigation) : 'Fora da camada'}
          </td>
        </tr>
        <tr style={{ background: '#fff' }}>
          <td style={{ padding: `2px 5px`, borderRadius: `0px 0px 0px 2px` }}>
            LON, LAT
          </td>
          <td
            id="popup-coords"
            style={{ padding: `2px 5px`, borderRadius: `0px 0px 2px 0px` }}
          >
            {popcoords || t('popup_clickout')}
          </td>
        </tr>
      </tbody>
    </Container>
  );
};

export default Popup;
