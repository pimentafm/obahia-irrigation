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

import CardPlot from '../CardPlotCounty';

import Popup from '../../components/Popup';

interface CountyData {
  code: number;
  name: string;
  centroid?: Object;
}

interface MapProps {
  defaultYear: number;
  defaultMonth: number;
  defaultCategory: string;
  defaultCodeName: CountyData;
}

const Map: React.FC<MapProps> = ({
  defaultYear,
  defaultMonth,
  defaultCategory,
  defaultCodeName,
}) => {
  const [irrigation] = useState(
    new TileLayer({ visible: true, className: 'irrigation-layer' }),
  );
  const [highways] = useState(new TileLayer({ visible: false }));
  const [hidrography] = useState(new TileLayer({ visible: false }));

  const [codeName, setCodeName] = useState<CountyData>(defaultCodeName);

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const [center, setCenter] = useState([-45.2581, -12.6521]);
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
      layers: [osm, irrigation, highways, hidrography],
      view: view,
      interactions: defaults({
        keyboard: false,
      }),
    }),
  );

  const highways_source = new TileWMS({
    url: wms.defaults.baseURL + 'highwaysCounties.map',
    params: {
      code: codeName.code,
      LAYERS: 'Rodovias',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const hidrography_source = new TileWMS({
    url: wms.defaults.baseURL + 'hidrographyCounties.map',
    params: {
      code: codeName.code,
      LAYERS: 'hidrografia',
      TILED: true,
    },
    serverType: 'mapserver',
    crossOrigin: 'anonymous',
  });

  const irrigation_source = new TileWMS({
    url: wms.defaults.baseURL + 'irrigationCounties.map',
    params: {
      year: year,
      month: month,
      code: codeName.code,
      LAYERS: 'irrigation',
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

  const handleCodeName = useCallback(
    codename => {
      const code = parseInt(codename.split(' - ')[1]);

      setCodeName({ code: code, name: codename });

      oba
        .post('geom/', {
          table_name: 'counties',
          headers: {
            'Content-type': 'application/json',
          },
        })
        .then(response => {
          let cxcy = response.data
            .filter((f: CountyData) => f.code === code)
            .map((c: CountyData) => c.centroid);

          cxcy = JSON.parse(cxcy);

          setCenter(cxcy);
          setZoom(7);

          map.getView().animate({ center: cxcy, duration: 1000, zoom });
        })
        .catch(e => {
          throw new Error('Do not load drainage data');
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
        defaultCodeName={codeName}
        handleCodeName={handleCodeName}
        defaultYear={year}
        defaultMonth={month}
        handleYear={handleYear}
        handleMonth={handleMonth}
        map={map}
      />

      <Popup map={map} source={irrigation_source} />

      <CardPlot
        code={codeName.code}
        //name={codeName.name}
        ishidden={window.innerWidth <= 760 ? 1 : 0}
      />

      <Footer id="footer" map={map} />
    </Container>
  );
};

export default Map;
