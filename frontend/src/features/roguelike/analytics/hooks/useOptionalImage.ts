import { useEffect, useState } from 'react';
import { getOptionalAsset, OptionalImageStatus, resolveOptionalAssetState } from '../../assets/optionalAssets';

export const useOptionalImage = (path: string | null | undefined) => {
  const src = getOptionalAsset(path);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setErrored(true);
      return;
    }

    let active = true;
    const img = new Image();
    setLoaded(false);
    setErrored(false);

    img.onload = () => {
      if (!active) return;
      setLoaded(true);
    };

    img.onerror = () => {
      if (!active) return;
      setErrored(true);
    };

    img.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  const status: OptionalImageStatus = resolveOptionalAssetState(loaded, errored);

  return { src, status, isLoaded: status === 'loaded', isMissing: status === 'missing' };
};
