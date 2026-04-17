import type { EChartsOption } from 'echarts';
import { RunAnalytics } from '../models/types';

const ROOM_COLORS: Record<string, string> = {
  fight: '#f6ad55',
  elite: '#f56565',
  chest: '#f6e05e',
  shop: '#63b3ed',
  rest: '#68d391',
  event: '#b794f4',
  death: '#fc8181'
};

export const buildDepthProfileOption = (analytics: RunAnalytics, showBestRun = false): EChartsOption => ({
  backgroundColor: 'transparent',
  animationDuration: 500,
  grid: { left: 40, right: 20, top: 30, bottom: 45 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#111827',
    borderColor: '#f6ad55',
    textStyle: { color: '#f7fafc' },
    formatter: (params: any) => {
      const point = params?.[0]?.data;
      if (!point) return '';
      return `Шаг ${point.step}<br/>Комната: ${point.roomType}<br/>Глубина: ${point.value}<br/>HP: ${point.hpAfterRoom}<br/>Событие: ${point.rewardOrEvent ?? '—'}`;
    }
  },
  legend: {
    top: 0,
    textStyle: { color: '#f8d49e' }
  },
  xAxis: {
    type: 'category',
    data: analytics.steps.map((s) => s.step),
    axisLabel: { color: '#d6bcfa' },
    axisLine: { lineStyle: { color: '#8b6f47' } }
  },
  yAxis: {
    type: 'value',
    inverse: true,
    name: 'Глубина',
    nameTextStyle: { color: '#f8d49e' },
    axisLabel: { color: '#f8d49e' },
    splitLine: { lineStyle: { color: 'rgba(246, 173, 85, 0.15)' } }
  },
  series: [
    {
      name: 'Текущий забег',
      type: 'line',
      smooth: 0.25,
      showSymbol: true,
      symbolSize: 12,
      areaStyle: { color: 'rgba(246, 173, 85, 0.12)' },
      lineStyle: { color: '#f6ad55', width: 3 },
      data: analytics.steps.map((step) => ({
        value: step.depth,
        ...step,
        itemStyle: {
          color: ROOM_COLORS[step.roomType],
          shadowBlur: step.roomType === 'death' ? 14 : 6,
          shadowColor: ROOM_COLORS[step.roomType]
        }
      }))
    },
    ...(showBestRun ? [{
      name: 'Лучший забег',
      type: 'line',
      showSymbol: false,
      lineStyle: { color: '#63b3ed', width: 2, type: 'dashed' },
      data: analytics.bestRunDepthProfile.map((point) => point.depth)
    }] : [])
  ]
});
