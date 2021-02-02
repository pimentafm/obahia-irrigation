import React, { useState, useEffect } from 'react';
import PlotlyChart from 'react-plotlyjs-ts';

import { local } from '../../../services';

//import { useTranslation } from 'react-i18next';

interface TimeSeriePlotData {
  totalamount: Object;
  totalvolume: Object;
  totalflow: Object;
  totalarea: Object;
  datestring: Object;
}

interface TimeSeriePlotProps {
  code: number;
}

const TimeSeriePlot: React.FC<TimeSeriePlotProps> = ({ code }) => {
  //const { t } = useTranslation();

  const [totalamount, setTotalAmount] = useState(null);
  const [totalflow, setTotalFlow] = useState(null);
  const [totalarea, setTotalArea] = useState(null);
  const [datestring, setDateString] = useState(null);

  useEffect(() => {
    local
      .post('irrigationdrainstats/', {
        code: code,
        headers: {
          'Content-type': 'application/json',
        },
      })
      .then(response => {
        setTotalAmount(
          response.data.map((j: TimeSeriePlotData) => j.totalamount),
        );
        setTotalFlow(response.data.map((j: TimeSeriePlotData) => j.totalflow));
        setTotalArea(response.data.map((j: TimeSeriePlotData) => j.totalarea));
        setDateString(
          response.data.map((j: TimeSeriePlotData) => j.datestring),
        );
      })
      .catch(e => {
        throw new Error('Do not load TimeSeriePlot data');
      });
  }, [code]);

  const data = [
    {
      x: datestring,
      y: totalamount,
      type: 'scatter',
      name: 'Amount (mm)',
      yaxis: 'y1',
      hovertemplate: '%{y:.2f}</sup> mm<extra></extra>',
      line: { color: '#0000ff', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalflow,
      type: 'scatter',
      name: 'Flow (m³/s)',
      yaxis: 'y2',
      hovertemplate: '%{y:.2f}</sup> m<sup>3</sup>/s<extra></extra>',
      line: { color: '#f76707', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalarea,
      type: 'scatter',
      name: 'Area (ha)',
      yaxis: 'y3',
      hovertemplate: '%{y:.2f} ha<extra></extra>',
      line: { color: '#016513', shape: 'hvh' },
      mode: 'lines+markers',
    },
  ];
  const layout = {
    title: {
      font: {
        family: 'Arial, sans-serif',
        size: 14,
      },
    },
    height: 400,
    xaxis: {
      domain: ['2018-01-15', '2019-12-15'],
      rangeselector: {
        buttons: [
          {
            count: 1,
            label: '1m',
            step: 'month',
            stepmode: 'backward',
          },
          {
            count: 6,
            label: '6m',
            step: 'month',
            stepmode: 'backward',
          },
          { step: 'all' },
        ],
      },
      rangeslider: { range: ['2001-01-15', '2019-12-15'] },
      type: 'date',
    },
    yaxis: {
      //title: 'Amount (ha)',
      titlefont: { color: '#030188' },
      tickfont: { color: '#030188' },
    },
    yaxis2: {
      //title: 'Flow (m³/s)',
      titlefont: { color: '#f76707' },
      tickfont: { color: '#f76707' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.02,
    },
    yaxis3: {
      //title: 'Area (mm)',
      titlefont: { color: '#016513' },
      tickfont: { color: '#016513' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.04,
    },
    margin: { l: 60, r: 10, t: 10, b: 30 },
    transition: {
      duration: 1000,
      easing: 'cubic-in-out',
    },
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d'],
  };

  return <PlotlyChart data={data} layout={layout} config={config} />;
};

export default TimeSeriePlot;
