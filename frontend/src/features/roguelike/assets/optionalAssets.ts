export const getOptionalAsset = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (!path.startsWith('/assets/dungeon/')) return path;
  return path;
};

export type OptionalImageStatus = 'idle' | 'loading' | 'loaded' | 'missing';

export const resolveOptionalAssetState = (loaded: boolean, errored: boolean): OptionalImageStatus => {
  if (errored) return 'missing';
  if (loaded) return 'loaded';
  return 'loading';
};
