import React, { useState, useEffect } from 'react';
import PlotlyChart from 'react-plotlyjs-ts';

import { oba } from '../../../services';

import { useTranslation } from 'react-i18next';

interface TimeSeriePlotData {
  totalamount: Object;
  totalvolume: Object;
  totalflow: Object;
  totalarea: Object;
  totalevapo: Object;
  datestring: Object;
}

interface TimeSeriePlotProps {
  code: number;
}

const TimeSeriePlot: React.FC<TimeSeriePlotProps> = ({ code }) => {
  const { t } = useTranslation();

  const [totalamount, setTotalAmount] = useState(null);
  const [totalflow, setTotalFlow] = useState(null);
  const [totalarea, setTotalArea] = useState(null);
  const [totalevapo, setTotalEvapo] = useState(null);
  const [datestring, setDateString] = useState(null);

  useEffect(() => {
    oba
      .post('irrigationcountiesstats/', {
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
        setTotalEvapo(
          response.data.map((j: TimeSeriePlotData) => j.totalevapo),
        );
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
      name: t('label_amount'),
      yaxis: 'y1',
      hovertemplate: `%{y:.2f} ` + t('label_label') + `</sup><extra></extra>`,
      line: { color: '#0000ff', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalflow,
      type: 'scatter',
      name: t('label_flow'),
      yaxis: 'y2',
      hovertemplate: '%{y:.2f}</sup> m<sup>3</sup>/s<extra></extra>',
      line: { color: '#868e96', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalarea,
      type: 'scatter',
      name: t('label_area'),
      yaxis: 'y3',
      hovertemplate: '%{y:.2f} ha<extra></extra>',
      line: { color: '#9e1e1c', shape: 'hvh' },
      mode: 'lines+markers',
    },
    {
      x: datestring,
      y: totalevapo,
      type: 'scatter',
      name: t('label_plot_evapo'),
      yaxis: 'y1',
      hovertemplate:
        `%{y:.2f}</sup> ` + t('label_evapo_unit') + `<extra></extra>`,
      line: { color: '#fd8025', shape: 'hvh' },
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
      linewidth: 2,
      mirror: 'ticks',
      rangeslider: {
        type: 'date',
      },
      range: ['2001-01-15', '2020-12-15'],
      rangeselector: {
        buttons: [
          {
            count: 3,
            label: '3m',
            step: 'month',
            stepmode: 'backward',
          },
          {
            count: 6,
            label: '6m',
            step: 'month',
            stepmode: 'backward',
          },
          {
            count: 12,
            label: '12m',
            step: 'month',
            stepmode: '',
          },
          {
            count: 20,
            label: 'all',
            step: 'year',
            stepmode: 'backward',
          },
        ],
      },
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      linewidth: 2,
      mirror: 'ticks',
    },
    yaxis2: {
      overlaying: 'y',
      zeroline: false,
      showticklabels: false,
    },
    yaxis3: {
      overlaying: 'y',
      zeroline: false,
      showticklabels: false,
    },
    yaxis4: {
      overlaying: 'y',
      zeroline: false,
      showticklabels: false,
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
