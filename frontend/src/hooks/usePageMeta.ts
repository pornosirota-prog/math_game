import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://math-game-8q8.pages.dev').replace(/\/+$/, '');
const DEFAULT_OG_IMAGE = new URL('/og-image.svg', SITE_URL).toString();

type PageMetaOptions = {
  noindex?: boolean;
  canonicalPath?: string;
};

const upsertMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertPropertyTag = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const usePageMeta = (title: string, description: string, options: PageMetaOptions = {}) => {
  const location = useLocation();
  const canonicalPath = options.canonicalPath ?? location.pathname;
  const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();
  const robots = options.noindex ? 'noindex, nofollow' : 'index, follow';

  useEffect(() => {
    document.title = title;
    upsertMetaTag('description', description);
    upsertMetaTag('robots', robots);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    upsertPropertyTag('og:title', title);
    upsertPropertyTag('og:description', description);
    upsertPropertyTag('og:type', 'website');
    upsertPropertyTag('og:url', canonicalUrl);
    upsertPropertyTag('og:site_name', 'Math Game');
    upsertPropertyTag('og:locale', 'ru_RU');
    upsertPropertyTag('og:image', DEFAULT_OG_IMAGE);

    upsertMetaTag('twitter:card', 'summary_large_image');
    upsertMetaTag('twitter:title', title);
    upsertMetaTag('twitter:description', description);
    upsertMetaTag('twitter:image', DEFAULT_OG_IMAGE);
  }, [canonicalUrl, description, robots, title]);
};
