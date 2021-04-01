import React, { useState, useEffect, useCallback } from 'react';

import OlMap from 'ol/Map';

import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';

import { defaults } from 'ol/interaction';

import 'ol/ol.css';

import { wms } from '../../services';

import { Container } from './styles';

import Menu from '../Menu';
import Footer from '../Footer';

import CardPlot from '../CardPlot';

import Popup from '../../components/Popup';

interface MapProps {
  defaultYear: number;
  defaultMonth: number;
  defaultCategory: string;
}

const Map: React.FC<MapProps> = ({
  defaultYear,
  defaultMonth,
  defaultCategory,
}) => {
  const [amount] = useState(
    new TileLayer({ visible: true, className: 'amount-layer' }),
  );
  const [irrigation] = useState(
    new TileLayer({ visible: false, className: 'irrigation-layer' }),
  );
  const [evapotranspiration] = useState(
    new TileLayer({ visible: false, className: 'evapotranspiration-layer' }),
  );

  const [highways] = useState(new TileLayer({ visible: false }));
  const [hidrography] = useState(new TileLayer({ visible: false }));
  const [watersheds] = useState(new TileLayer({ visible: true }));
  const [counties] = useState(new TileLayer({ visible: false }));

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const [center] = useState([-45.2471, -12.4818]);
  const [zoom] = useState<number>(7);

  const [view] = useState(
    new View({
      projection: 'EPSG:4326',
      maxZoom: 12,
      minZoom: 7,
      center: center,
      extent: [-56.0, -20.0, -33.0, -6.0],
      zoom: zoom,
    }),
  );

  const osm = new TileLayer({
    source: new OSM({
      crossOrigin: 'anonymous',
    }),
  });

  const [map] = useState(
    new OlMap({
      controls: [],
      target: undefined,
      layers: [
        osm,
        irrigation,
        evapotranspiration,
        amount,
        watersheds,
        counties,
        highways,
        hidrography,
      ],
      view: view,
      interactions: defaults({
        keyboard: false,
      }),
    }),
  );

  const watersheds_source = new TileWMS({
    url: wms.defaults.baseURL + 'watersheds.map',
    params: {
      LAYERS: 'watersheds',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const counties_source = new TileWMS({
    url: wms.defaults.baseURL + 'counties.map',
    params: {
      LAYERS: 'counties',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const highways_source = new TileWMS({
    url: wms.defaults.baseURL + 'highwaysRegion.map',
    params: {
      LAYERS: 'Rodovias',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const hidrography_source = new TileWMS({
    url: wms.defaults.baseURL + 'hidrographyRegion.map',
    params: {
      LAYERS: 'hidrografia',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const zeroPad = (num: number, places: number) =>
    String(num).padStart(places, '0');

  const irrigation_source = new TileWMS({
    url: wms.defaults.baseURL + 'irrigationRegion.map',
    params: {
      year: year,
      month: zeroPad(month, 2),
      LAYERS: 'irrigation',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const evapotranspiration_source = new TileWMS({
    url: wms.defaults.baseURL + 'evapotranspirationRegion.map',
    params: {
      year: year,
      month: zeroPad(month, 2),
      LAYERS: 'evapotranspiration',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const amount_source = new TileWMS({
    url: wms.defaults.baseURL + 'amountRegion.map',
    params: {
      year: year,
      month: zeroPad(month, 2),
      LAYERS: 'amount',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  watersheds.set('name', 'watersheds');
  watersheds.setSource(watersheds_source);
  watersheds.getSource().refresh();

  counties.set('name', 'counties');
  counties.setSource(counties_source);
  counties.getSource().refresh();

  highways.set('name', 'highways');
  highways.setSource(highways_source);
  highways.getSource().refresh();

  hidrography.set('name', 'hidrography');
  hidrography.setSource(hidrography_source);
  hidrography.getSource().refresh();

  amount.set('name', 'amount');
  amount.setSource(amount_source);
  amount.getSource().refresh();

  irrigation.set('name', 'irrigation');
  irrigation.setSource(irrigation_source);
  irrigation.getSource().refresh();

  evapotranspiration.set('name', 'evapotranspiration');
  evapotranspiration.setSource(evapotranspiration_source);
  evapotranspiration.getSource().refresh();

  const handleYear = useCallback(
    y => {
      setYear(y);
    },
    [setYear],
  );

  const handleMonth = useCallback(
    m => {
      setMonth(m);
    },
    [setMonth],
  );

  useEffect(() => {
    map.setTarget('map');
  });

  return (
    <Container id="map">
      <Menu
        ishidden={window.innerWidth <= 760 ? 1 : 0}
        defaultCategory={defaultCategory}
        defaultYear={year}
        defaultMonth={month}
        handleYear={handleYear}
        handleMonth={handleMonth}
        map={map}
      />

      <Popup
        map={map}
        source={[irrigation_source, evapotranspiration_source, amount_source]}
      />

      <CardPlot ishidden={window.innerWidth <= 760 ? 1 : 0} />

      <Footer id="footer" map={map} />
    </Container>
  );
};

export default Map;
