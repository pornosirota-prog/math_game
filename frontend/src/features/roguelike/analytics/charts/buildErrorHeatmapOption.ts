import type { EChartsOption } from 'echarts';
import { ErrorHeatmapCell } from '../models/types';

const mathTypes = ['addition', 'subtraction', 'multiplication', 'division', 'mixed'];

export const buildErrorHeatmapOption = (cells: ErrorHeatmapCell[]): EChartsOption => {
  const depthBuckets = [...new Set(cells.map((cell) => cell.depthBucket))];
  const data = cells.map((cell) => [depthBuckets.indexOf(cell.depthBucket), mathTypes.indexOf(cell.mathType), cell.errors]);

  return {
    backgroundColor: 'transparent',
    tooltip: { position: 'top' },
    grid: { left: 110, right: 25, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: depthBuckets, axisLabel: { color: '#f8d49e' } },
    yAxis: { type: 'category', data: mathTypes, axisLabel: { color: '#f8d49e' } },
    visualMap: {
      min: 0,
      max: Math.max(1, ...cells.map((cell) => cell.errors)),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      text: ['Много ошибок', 'Мало ошибок'],
      textStyle: { color: '#f8d49e' },
      inRange: { color: ['#2d3748', '#c05621', '#f56565'] }
    },
    series: [{
      type: 'heatmap',
      data,
      label: { show: true, color: '#f7fafc' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(255,255,255,0.25)' } }
    }]
  };
};
