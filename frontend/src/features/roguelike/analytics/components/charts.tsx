import ReactECharts from 'echarts-for-react';
import { buildDepthProfileOption } from '../charts/buildDepthProfileOption';
import { buildErrorHeatmapOption } from '../charts/buildErrorHeatmapOption';
import { buildAccuracyByDepthOption } from '../charts/buildAccuracyByDepthOption';
import { buildMathTypePieOption } from '../charts/buildMathTypePieOption';
import { RunAnalytics } from '../models/types';

export const DepthProfileChart = ({ analytics, showBestRun }: { analytics: RunAnalytics; showBestRun: boolean }) => (
  <section className="dungeon-analytics-card">
    <h3>Профиль погружения</h3>
    <ReactECharts option={buildDepthProfileOption(analytics, showBestRun)} style={{ height: 360 }} />
  </section>
);

export const ErrorHeatmapChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <section className="dungeon-analytics-card">
    <h3>Heatmap ошибок</h3>
    <ReactECharts option={buildErrorHeatmapOption(analytics.errorHeatmap)} style={{ height: 280 }} />
  </section>
);

export const AccuracyDepthChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <section className="dungeon-analytics-card">
    <h3>Точность по глубине</h3>
    <ReactECharts option={buildAccuracyByDepthOption(analytics.accuracyByDepth)} style={{ height: 260 }} />
  </section>
);

export const MathTypeBreakdownChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <section className="dungeon-analytics-card">
    <h3>Распределение типов примеров</h3>
    <ReactECharts option={buildMathTypePieOption(analytics.mathTypeBreakdown)} style={{ height: 260 }} />
  </section>
);
