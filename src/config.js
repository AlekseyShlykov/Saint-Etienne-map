// MapTiler API key — подставляется при сборке (локально и на GitHub Actions).
// Можно переопределить через секрет VITE_MAPTILER_KEY в GitHub Actions.
export const MAPTILER_KEY = '7fFBRVTPK8vzuPADdnr6';

// Formspree form ID (formspree.io). Set form email to buildtounderstand@gmail.com. Submissions are stored and emailed.
export const FORMSPREE_FORM_ID = (import.meta.env.VITE_FORMSPREE_FORM_ID || 'mjgenllg').trim();
