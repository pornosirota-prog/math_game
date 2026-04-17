import type { EChartsOption } from 'echarts';
import { AccuracySample } from '../models/types';

export const buildAccuracyByDepthOption = (samples: AccuracySample[]): EChartsOption => ({
  backgroundColor: 'transparent',
  grid: { left: 45, right: 20, top: 20, bottom: 35 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: samples.map((sample) => sample.depth),
    axisLabel: { color: '#f8d49e' }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 1,
    axisLabel: { formatter: (v: number) => `${Math.round(v * 100)}%`, color: '#f8d49e' },
    splitLine: { lineStyle: { color: 'rgba(246,173,85,0.15)' } }
  },
  series: [{
    type: 'line',
    smooth: true,
    lineStyle: { color: '#ed8936', width: 3 },
    areaStyle: { color: 'rgba(237,137,54,0.2)' },
    data: samples.map((sample) => sample.accuracy)
  }]
});
