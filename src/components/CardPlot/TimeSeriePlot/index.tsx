import React, { useState, useEffect } from 'react';
import PlotlyChart from 'react-plotlyjs-ts';

import axios from 'axios';

import { useTranslation } from 'react-i18next';

interface TimeSeriePlotData {
  totalamount: Object;
  totalvolume: Object;
  totalflow: Object;
  totalarea: Object;
  datestring: Object;
}

interface TimeSeriePlotProps {
  tableName: string;
}

const TimeSeriePlot: React.FC<TimeSeriePlotProps> = ({ tableName }) => {
  const { t } = useTranslation();

  const [totalamount, setTotalAmount] = useState(null);
  const [totalvolume, setTotalVolume] = useState(null);
  const [totalflow, setTotalFlow] = useState(null);
  const [totalarea, setTotalArea] = useState(null);
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
        setTotalAmount(
          response.data.map((j: TimeSeriePlotData) => j.totalamount),
        );
        setTotalVolume(
          response.data.map((j: TimeSeriePlotData) => j.totalvolume),
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
  }, [tableName, t]);

  const data = [
    {
      x: datestring,
      y: totalamount,
      type: 'scatter',
      name: 'Amount',
      yaxis: 'y1',
      hovertemplate: '%{y:.2f}</sup> mm<extra></extra>',
      line: { color: '#0000ff', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalvolume,
      type: 'scatter',
      name: 'Volume',
      yaxis: 'y2',
      hovertemplate: '%{y:.2f}</sup> litres<extra></extra>',
      line: { color: '#f76707', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalflow,
      type: 'scatter',
      name: 'Flow',
      yaxis: 'y3',
      hovertemplate: '%{y:.2f}</sup> m<sup>3</sup>/s<extra></extra>',
      line: { color: '#6495ed', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalarea,
      type: 'scatter',
      name: 'Area',
      yaxis: 'y4',
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
      title: 'Amount (mm)',
      titlefont: { color: '#016513' },
      tickfont: { color: '#016513' },
    },
    yaxis2: {
      title: 'Volume (litres)',
      titlefont: { color: '#f76707' },
      tickfont: { color: '#f76707' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.05,
    },
    yaxis3: {
      title: 'Flow (m³/s)',
      titlefont: { color: '#0064ff' },
      tickfont: { color: '#0064ff' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.1,
    },
    yaxis4: {
      title: 'Area (ha)',
      titlefont: { color: '#030188' },
      tickfont: { color: '#030188' },
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.15,
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
