import type { ReactNode } from 'react';
import { buildDepthProfileOption } from '../charts/buildDepthProfileOption';
import { buildErrorHeatmapOption } from '../charts/buildErrorHeatmapOption';
import { buildAccuracyByDepthOption } from '../charts/buildAccuracyByDepthOption';
import { buildMathTypePieOption } from '../charts/buildMathTypePieOption';
import { ErrorHeatmapCell, MathTypeStat, RunAnalytics, RunStep } from '../models/types';

const ROOM_COLORS: Record<string, string> = {
  fight: '#f6ad55',
  elite: '#f56565',
  chest: '#f6e05e',
  shop: '#63b3ed',
  rest: '#68d391',
  event: '#b794f4',
  death: '#fc8181'
};

const CARD_STYLE = {
  marginBottom: 12
} as const;

const axisStyle = {
  color: '#f8d49e',
  fontSize: 12
} as const;

const emptyStyle = {
  margin: 0,
  color: '#cbd5e1'
} as const;

const chartContainerStyle = {
  background: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(246, 173, 85, 0.25)',
  borderRadius: 10,
  padding: 10
} as const;

const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="dungeon-analytics-card" style={CARD_STYLE}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    {children}
  </section>
);

const mapLinePoints = (values: number[], width: number, height: number) => {
  if (!values.length) {
    return [] as Array<{ x: number; y: number }>;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  return values.map((value, idx) => {
    const norm = (value - min) / span;
    return {
      x: idx * stepX,
      y: height - norm * height
    };
  });
};

const depthValueForPath = (step: RunStep) => -step.depth;

const DepthChartSvg = ({ analytics, showBestRun }: { analytics: RunAnalytics; showBestRun: boolean }) => {
  const width = 640;
  const height = 240;
  if (!analytics.steps.length) {
    return <p style={emptyStyle}>Нет данных о шагах забега.</p>;
  }

  const currentValues = analytics.steps.map(depthValueForPath);
  const bestValues = analytics.bestRunDepthProfile.map((point) => -point.depth);
  const currentPoints = mapLinePoints(currentValues, width, height);
  const bestPoints = mapLinePoints(bestValues, width, height);

  const currentPath = currentPoints.map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const bestPath = bestPoints.map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

  return (
    <div style={chartContainerStyle}>
      <svg viewBox={`0 0 ${width} ${height + 30}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Профиль погружения">
        <line x1={0} y1={height} x2={width} y2={height} stroke="rgba(248,212,158,0.45)" />
        <line x1={0} y1={0} x2={0} y2={height} stroke="rgba(248,212,158,0.45)" />

        <path d={currentPath} fill="none" stroke="#f6ad55" strokeWidth={3} />
        {showBestRun && bestPoints.length > 1 ? (
          <path d={bestPath} fill="none" stroke="#63b3ed" strokeWidth={2} strokeDasharray="8 6" />
        ) : null}

        {currentPoints.map((point, idx) => (
          <circle key={`p-${idx}`} cx={point.x} cy={point.y} r={5} fill={ROOM_COLORS[analytics.steps[idx].roomType] ?? '#f8d49e'}>
            <title>
              {`Шаг ${analytics.steps[idx].step}, глубина ${analytics.steps[idx].depth}, комната ${analytics.steps[idx].roomType}`}
            </title>
          </circle>
        ))}

        {currentPoints.filter((_, idx) => idx % Math.max(1, Math.floor(currentPoints.length / 8)) === 0).map((point, idx) => (
          <text key={`x-${idx}`} x={point.x} y={height + 20} textAnchor="middle" style={axisStyle}>
            {analytics.steps[idx * Math.max(1, Math.floor(currentPoints.length / 8))]?.step ?? ''}
          </text>
        ))}
      </svg>
    </div>
  );
};

const AccuracyChartSvg = ({ analytics }: { analytics: RunAnalytics }) => {
  const width = 640;
  const height = 220;
  const values = analytics.accuracyByDepth.map((sample) => sample.accuracy);

  if (!values.length) {
    return <p style={emptyStyle}>Нет данных по точности на глубине.</p>;
  }

  const points = mapLinePoints(values, width, height);
  const path = points.map((point, idx) => `${idx === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

  return (
    <div style={chartContainerStyle}>
      <svg viewBox={`0 0 ${width} ${height + 20}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Точность по глубине">
        <line x1={0} y1={height} x2={width} y2={height} stroke="rgba(248,212,158,0.45)" />
        <path d={path} fill="none" stroke="#ed8936" strokeWidth={3} />
        {points.map((point, idx) => (
          <circle key={idx} cx={point.x} cy={point.y} r={4} fill="#f6ad55">
            <title>{`Глубина ${analytics.accuracyByDepth[idx].depth}: ${Math.round(values[idx] * 100)}%`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

const ErrorHeatmapGrid = ({ cells }: { cells: ErrorHeatmapCell[] }) => {
  if (!cells.length) {
    return <p style={emptyStyle}>Пока нет ошибок — heatmap пуст.</p>;
  }

  const depthBuckets = [...new Set(cells.map((cell) => cell.depthBucket))];
  const mathTypes = [...new Set(cells.map((cell) => cell.mathType))];
  const max = Math.max(1, ...cells.map((cell) => cell.errors));

  const colorFor = (value: number) => {
    const alpha = 0.18 + (value / max) * 0.72;
    return `rgba(245, 101, 101, ${alpha.toFixed(2)})`;
  };

  return (
    <div style={{ ...chartContainerStyle, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, minWidth: 340 }}>
        <thead>
          <tr>
            <th style={{ ...axisStyle, textAlign: 'left' }}>Тип</th>
            {depthBuckets.map((bucket) => (
              <th key={bucket} style={axisStyle}>{bucket}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mathTypes.map((type) => (
            <tr key={type}>
              <th style={{ ...axisStyle, textAlign: 'left' }}>{type}</th>
              {depthBuckets.map((bucket) => {
                const value = cells.find((cell) => cell.mathType === type && cell.depthBucket === bucket)?.errors ?? 0;
                return (
                  <td key={`${type}-${bucket}`} style={{
                    textAlign: 'center',
                    borderRadius: 6,
                    background: colorFor(value),
                    color: '#fff7ed',
                    fontWeight: 700,
                    padding: '8px 6px'
                  }}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PieChart = ({ stats }: { stats: MathTypeStat[] }) => {
  if (!stats.length || stats.every((item) => item.solved === 0)) {
    return <p style={emptyStyle}>Недостаточно решённых задач для распределения.</p>;
  }

  const total = stats.reduce((acc, item) => acc + item.solved, 0);
  let offset = 0;
  const segments = stats.map((item, index) => {
    const percent = item.solved / total;
    const start = offset;
    offset += percent * 360;
    return {
      ...item,
      color: ['#f56565', '#63b3ed', '#68d391', '#f6e05e', '#b794f4'][index % 5],
      start,
      end: offset,
      percent
    };
  });

  const gradient = segments.map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`).join(', ');

  return (
    <div style={{ ...chartContainerStyle, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 180, height: 180, borderRadius: '50%', background: `conic-gradient(${gradient})`, border: '2px solid rgba(248,212,158,0.5)' }} />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
        {segments.map((segment) => (
          <li key={segment.mathType} style={{ color: '#f8d49e', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: segment.color, marginRight: 8 }} />{segment.mathType}</span>
            <strong>{Math.round(segment.percent * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const DepthProfileChart = ({ analytics, showBestRun }: { analytics: RunAnalytics; showBestRun: boolean }) => {
  void buildDepthProfileOption(analytics, showBestRun);
  return (
    <ChartCard title="Профиль погружения">
      <DepthChartSvg analytics={analytics} showBestRun={showBestRun} />
    </ChartCard>
  );
};

export const ErrorHeatmapChart = ({ analytics }: { analytics: RunAnalytics }) => {
  void buildErrorHeatmapOption(analytics.errorHeatmap);
  return (
    <ChartCard title="Heatmap ошибок">
      <ErrorHeatmapGrid cells={analytics.errorHeatmap} />
    </ChartCard>
  );
};

export const AccuracyDepthChart = ({ analytics }: { analytics: RunAnalytics }) => {
  void buildAccuracyByDepthOption(analytics.accuracyByDepth);
  return (
    <ChartCard title="Точность по глубине">
      <AccuracyChartSvg analytics={analytics} />
    </ChartCard>
  );
};

export const MathTypeBreakdownChart = ({ analytics }: { analytics: RunAnalytics }) => {
  void buildMathTypePieOption(analytics.mathTypeBreakdown);
  return (
    <ChartCard title="Распределение типов примеров">
      <PieChart stats={analytics.mathTypeBreakdown} />
    </ChartCard>
  );
};
