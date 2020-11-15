import React, { useState, useEffect } from 'react';
import PlotlyChart from 'react-plotlyjs-ts';

import axios from 'axios';

import { useTranslation } from 'react-i18next';

interface TimeSeriePlotData {
  totalarea: Object;
  totalflow: Object;
  totalamount: Object;
  datestring: Object;
}

interface TimeSeriePlotProps {
  tableName: string;
}

const TimeSeriePlot: React.FC<TimeSeriePlotProps> = ({ tableName }) => {
  const { t } = useTranslation();

  const [totalarea, setTotalArea] = useState(null);
  const [totalamount, setTotalAmount] = useState(null);
  const [totalflow, setTotalFlow] = useState(null);
  const [datestring, setDateString] = useState(null);

  useEffect(() => {
    axios
      .post('http://localhost:8000/irrigation/', {
        table_name: 'irrigation',
        headers: {
          'Content-type': 'application/json',
        },
      })
      .then(response => {
        console.log(response.data);
        setTotalArea(response.data.map((j: TimeSeriePlotData) => j.totalarea));
        setTotalFlow(response.data.map((j: TimeSeriePlotData) => j.totalflow));
        setTotalAmount(
          response.data.map((j: TimeSeriePlotData) => j.totalamount),
        );
        setDateString(
          response.data.map((j: TimeSeriePlotData) => j.datestring),
        );
      })
      .catch(e => {
        throw new Error('Do not load TimeSeriePlot data');
      });
  }, [tableName, t]);

  const data = [
    {
      x: datestring,
      y: totalarea,
      type: 'scatter',
      name: 'Area',
      yaxis: 'y1',
      hovertemplate: '%{y:.2f} x 10<sup>3</sup> km<sup>2</sup><extra></extra>',
      line: { color: '#016513', shape: 'hv' },
    },
    {
      x: datestring,
      y: totalamount,
      type: 'scatter',
      name: 'Amount',
      yaxis: 'y2',
      hovertemplate: '%{y:.2f} x 10<sup>3</sup> mm<extra></extra>',
      line: { color: '#0000ff', shape: 'hv' },
    },
    {
      x: datestring,
      y: totalflow,
      type: 'scatter',
      name: 'Flow',
      yaxis: 'y3',
      hovertemplate: '%{y:.2f} x 10<sup>3</sup> m<sup>3</sup>/s<extra></extra>',
      line: { color: '#6495ed', shape: 'hv' },
    },
  ];
  const layout = {
    title: {
      font: {
        family: 'Arial, sans-serif',
        size: 14,
      },
    },
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
      title: 'Area (ha)',
      titlefont: { color: '#016513' },
      tickfont: { color: '#016513' },
    },
    yaxis2: {
      title: 'Amount (mm)',
      titlefont: { color: '#0000ff' },
      tickfont: { color: '#0000ff' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.08,
    },
    yaxis3: {
      title: 'Flow (m³/s)',
      titlefont: { color: '#0064ff' },
      tickfont: { color: '#0064ff' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.16,
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
