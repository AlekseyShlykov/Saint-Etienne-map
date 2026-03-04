import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import maplibregl from 'maplibre-gl';
import markersData from './data/markers.json';
import { MAPTILER_KEY as CONFIG_KEY } from './config.js';

const BASE = import.meta.env.BASE_URL;
const MAPTILER_KEY = (import.meta.env.VITE_MAPTILER_KEY || CONFIG_KEY || '').trim();
const useMapTiler = MAPTILER_KEY && MAPTILER_KEY !== 'undefined';

const CENTER = [4.3872, 45.4397];
const BOUNDS = [
  [4.0, 45.17],
  [4.77, 45.71],
];
const MIN_ZOOM = 9;
const MAX_ZOOM = 17;
const INITIAL_ZOOM = 11.5;

const DEMO_STYLE = 'https://demotiles.maplibre.org/style.json';

const styleUrl = useMapTiler
  ? `https://api.maptiler.com/maps/bright/style.json?key=${MAPTILER_KEY}`
  : DEMO_STYLE;

const map = new maplibregl.Map({
  container: 'map',
  style: styleUrl,
  center: CENTER,
  zoom: INITIAL_ZOOM,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  maxBounds: BOUNDS,
  attributionControl: true,
});

let styleErrorHandled = false;
map.on('error', (e) => {
  if (styleErrorHandled) return;
  const msg = e?.error?.message || '';
  if (/style|401|403|key|tile/.test(msg)) {
    styleErrorHandled = true;
    map.setStyle(DEMO_STYLE);
  }
});
map.on('style.load', () => { styleErrorHandled = true; });

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const popupEl = document.getElementById('popup');
let activeMarkerId = null;

function articleUrl(slug) {
  return `${BASE}articles/${slug}.html`;
}

function imageUrl(filename) {
  return `${BASE}images/${filename}`;
}

function openPopup(marker) {
  if (activeMarkerId === marker.id) return;
  activeMarkerId = marker.id;

  const url = articleUrl(marker.slug);
  const imgSrc = imageUrl(marker.image);

  popupEl.innerHTML = `
    <article class="popup-card" role="article">
      <a href="${url}" class="popup-image-link" aria-label="Open article: ${marker.title}">
        <img src="${imgSrc}" alt="" class="popup-image" loading="lazy" />
      </a>
      <div class="popup-body">
        <h2 class="popup-title">${escapeHtml(marker.title)}</h2>
        <p class="popup-excerpt">${escapeHtml(marker.excerpt)}</p>
        <a href="${url}" class="popup-cta">Open article</a>
      </div>
    </article>
  `;
  popupEl.setAttribute('aria-hidden', 'false');
  popupEl.classList.add('is-open');
}

function closePopup() {
  activeMarkerId = null;
  popupEl.classList.remove('is-open');
  popupEl.setAttribute('aria-hidden', 'true');
  popupEl.innerHTML = '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createMarkerElement(marker) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'map-marker';
  el.setAttribute('aria-label', `Show: ${marker.title}`);
  el.innerHTML = `
    <svg class="marker-icon" viewBox="0 0 24 36" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"/>
      <circle cx="12" cy="12" r="5"/>
    </svg>
  `;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    openPopup(marker);
  });
  return el;
}

map.on('load', () => {
  markersData.forEach((marker) => {
    const el = createMarkerElement(marker);
    new maplibregl.Marker({ element: el })
      .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
      .addTo(map);
  });
});

map.on('click', () => closePopup());

popupEl.addEventListener('click', (e) => {
  if (e.target.closest('.popup-card a')) return;
  if (e.target === popupEl || e.target.closest('.popup-card') === null) closePopup();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});
