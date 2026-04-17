import type { EChartsOption } from 'echarts';
import { MathTypeStat } from '../models/types';

const COLORS = ['#f56565', '#63b3ed', '#68d391', '#f6e05e', '#b794f4'];

export const buildMathTypePieOption = (stats: MathTypeStat[]): EChartsOption => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 0, top: 'middle', textStyle: { color: '#f8d49e' } },
  series: [{
    type: 'pie',
    radius: ['50%', '72%'],
    center: ['35%', '50%'],
    itemStyle: { borderColor: '#111827', borderWidth: 2 },
    label: { color: '#f8d49e' },
    color: COLORS,
    data: stats.map((item) => ({ name: item.mathType, value: item.solved }))
  }]
});
