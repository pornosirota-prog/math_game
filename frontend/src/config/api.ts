const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const readApiBaseUrl = () => {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!value) {
    return '';
  }

  return trimTrailingSlash(value);
};

export const API_BASE_URL = readApiBaseUrl();
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
export const GOOGLE_OAUTH_URL = API_BASE_URL
  ? `${API_BASE_URL}/oauth2/authorization/google`
  : '/oauth2/authorization/google';
