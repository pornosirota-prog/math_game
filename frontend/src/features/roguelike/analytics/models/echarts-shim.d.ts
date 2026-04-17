declare module 'echarts' {
  export type EChartsOption = Record<string, unknown>;
}

declare module 'echarts-for-react' {
  import { ComponentType } from 'react';
  const ReactECharts: ComponentType<{ option: Record<string, unknown>; style?: React.CSSProperties }>;
  export default ReactECharts;
}
