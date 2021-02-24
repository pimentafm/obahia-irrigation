import React, { useState, useEffect, useCallback } from 'react';

import OlMap from 'ol/Map';

import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';

import { defaults } from 'ol/interaction';

import 'ol/ol.css';

import { oba, wms } from '../../services';

import { Container } from './styles';

import Menu from '../Menu';
import Footer from '../Footer';

import CardPlot from '../CardPlotWatershed';

import Popup from '../../components/Popup';

interface MapProps {
  defaultYear: number;
  defaultMonth: number;
  defaultCategory: string;
  defaultWatershed: string;
}

interface WatershedsData {
  name: string;
  centroid: Object;
}

const Map: React.FC<MapProps> = ({
  defaultYear,
  defaultMonth,
  defaultCategory,
  defaultWatershed,
}) => {
  const [irrigation] = useState(
    new TileLayer({ visible: false, className: 'irrigation-layer' }),
  );
  const [evapotranspiration] = useState(
    new TileLayer({ visible: true, className: 'evapotranspiration-layer' }),
  );
  const [highways] = useState(new TileLayer({ visible: false }));
  const [hidrography] = useState(new TileLayer({ visible: false }));

  const [watershed, setWatershed] = useState(defaultWatershed);

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const [center, setCenter] = useState([-45.2471, -12.4818]);
  const [zoom, setZoom] = useState<number>(7);

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

  const osm = new TileLayer({ source: new OSM({ crossOrigin: 'anonymous' }) });

  const [map] = useState(
    new OlMap({
      controls: [],
      target: undefined,
      layers: [osm, irrigation, evapotranspiration, highways, hidrography],
      view: view,
      interactions: defaults({
        keyboard: false,
      }),
    }),
  );

  const highways_source = new TileWMS({
    url: wms.defaults.baseURL + 'highwaysWatersheds.map',
    params: {
      LAYERS: 'Rodovias',
      ws: watershed.toLowerCase(),
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const hidrography_source = new TileWMS({
    url: wms.defaults.baseURL + 'hidrographyWatersheds.map',
    params: {
      ws: watershed.toLowerCase(),
      LAYERS: 'hidrografia',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const irrigation_source = new TileWMS({
    url: wms.defaults.baseURL + 'irrigationWatersheds.map',
    params: {
      year: year,
      month: month,
      ws: watershed.toLowerCase(),
      LAYERS: 'irrigation',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const evapotranspiration_source = new TileWMS({
    url: wms.defaults.baseURL + 'evapotranspirationWatersheds.map',
    params: {
      year: year,
      month: month,
      ws: watershed.toLowerCase(),
      LAYERS: 'evapotranspiration',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  highways.set('name', 'highways');
  highways.setSource(highways_source);
  highways.getSource().refresh();

  hidrography.set('name', 'hidrography');
  hidrography.setSource(hidrography_source);
  hidrography.getSource().refresh();

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

  const handleWatershed = useCallback(
    ws => {
      setWatershed(ws.toLowerCase());

      oba
        .post('geom/', {
          table_name: 'gcc',
          headers: {
            'Content-type': 'application/json',
          },
        })
        .then(response => {
          let cxcy = response.data
            .filter((f: WatershedsData) => f.name === ws.toUpperCase())
            .map((c: WatershedsData) => c.centroid);

          cxcy = JSON.parse(cxcy);

          setCenter(cxcy);
          setZoom(7);

          map.getView().animate({ center: cxcy, duration: 1000, zoom });
        })
        .catch(e => {
          throw new Error('Do not load watersheds data');
        });
    },
    [map, zoom],
  );

  useEffect(() => {
    map.setTarget('map');
  });

  return (
    <Container id="map">
      <Menu
        ishidden={window.innerWidth <= 760 ? 1 : 0}
        defaultCategory={defaultCategory}
        defaultWatershed={watershed}
        handleWatershed={handleWatershed}
        defaultYear={year}
        defaultMonth={month}
        handleYear={handleYear}
        handleMonth={handleMonth}
        map={map}
      />

      <Popup
        map={map}
        source={[irrigation_source, evapotranspiration_source]}
      />

      <CardPlot
        watershed={watershed.toLowerCase()}
        ishidden={window.innerWidth <= 760 ? 1 : 0}
      />

      <Footer id="footer" map={map} />
    </Container>
  );
};

export default Map;
