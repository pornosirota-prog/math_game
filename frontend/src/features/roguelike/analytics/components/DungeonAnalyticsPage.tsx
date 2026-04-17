import { useMemo, useState } from 'react';
import { RunState } from '../../domain/types';
import { mapRunStateToAnalytics } from '../utils/runAnalyticsMapper';
import { OptionalBackground } from './OptionalVisuals';
import { AccuracyDepthChart, DepthProfileChart, ErrorHeatmapChart, MathTypeBreakdownChart } from './charts';
import { DeathReasonCard, ProgressComparisonCard, RunDetailsList, RunSummaryCards, RunSummaryHeader } from './summary';

export const DungeonAnalyticsPage = ({ state, recordDepth }: { state: RunState; recordDepth: number }) => {
  const [showBestRun, setShowBestRun] = useState(true);
  const analytics = useMemo(() => mapRunStateToAnalytics(state, recordDepth), [state, recordDepth]);

  return (
    <OptionalBackground>
      <RunSummaryHeader analytics={analytics} />
      <RunSummaryCards analytics={analytics} />

      <div className="dungeon-analytics-main-grid">
        <DepthProfileChart analytics={analytics} showBestRun={showBestRun} />
        <div className="dungeon-analytics-stack">
          <button type="button" className="dungeon-toggle" onClick={() => setShowBestRun((value) => !value)}>
            {showBestRun ? 'Скрыть лучший забег' : 'Показать лучший забег'}
          </button>
          <DeathReasonCard analytics={analytics} />
          <ProgressComparisonCard analytics={analytics} />
        </div>
      </div>

      <div className="dungeon-analytics-secondary-grid">
        <MathTypeBreakdownChart analytics={analytics} />
        <AccuracyDepthChart analytics={analytics} />
      </div>

      <div className="dungeon-analytics-secondary-grid">
        <ErrorHeatmapChart analytics={analytics} />
        <RunDetailsList analytics={analytics} />
      </div>
    </OptionalBackground>
  );
};
