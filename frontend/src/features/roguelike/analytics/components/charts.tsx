import { buildDepthProfileOption } from '../charts/buildDepthProfileOption';
import { buildErrorHeatmapOption } from '../charts/buildErrorHeatmapOption';
import { buildAccuracyByDepthOption } from '../charts/buildAccuracyByDepthOption';
import { buildMathTypePieOption } from '../charts/buildMathTypePieOption';
import { RunAnalytics } from '../models/types';

const ChartFallback = ({ title, option }: { title: string; option: Record<string, unknown> }) => (
  <section className="dungeon-analytics-card">
    <h3>{title}</h3>
    <p>Графики недоступны в этой сборке. Показываем подготовленные данные в JSON-формате.</p>
    <pre style={{ maxHeight: 260, overflow: 'auto', background: '#111827', color: '#e5e7eb', padding: 12, borderRadius: 8 }}>
      {JSON.stringify(option, null, 2)}
    </pre>
  </section>
);

export const DepthProfileChart = ({ analytics, showBestRun }: { analytics: RunAnalytics; showBestRun: boolean }) => (
  <ChartFallback title="Профиль погружения" option={buildDepthProfileOption(analytics, showBestRun)} />
);

export const ErrorHeatmapChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <ChartFallback title="Heatmap ошибок" option={buildErrorHeatmapOption(analytics.errorHeatmap)} />
);

export const AccuracyDepthChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <ChartFallback title="Точность по глубине" option={buildAccuracyByDepthOption(analytics.accuracyByDepth)} />
);

export const MathTypeBreakdownChart = ({ analytics }: { analytics: RunAnalytics }) => (
  <ChartFallback title="Распределение типов примеров" option={buildMathTypePieOption(analytics.mathTypeBreakdown)} />
);
