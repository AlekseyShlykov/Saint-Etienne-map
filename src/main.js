import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import maplibregl from 'maplibre-gl';
import markersData from './data/markers.json';
import { MAPTILER_KEY as CONFIG_KEY, FORMSPREE_FORM_ID } from './config.js';

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
  ? `https://api.maptiler.com/maps/toner-v2/style.json?key=${MAPTILER_KEY}`
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
let geoPickMode = false;
let geoPickResolve = null;
let tempMarker = null;

const translations = {
  fr: {
    title: 'Saint-Étienne à travers les yeux des artistes',
    openArticle: "Ouvrir l'article",
    contact: 'Pour ajouter votre lieu préféré à Saint-Étienne sur notre carte, écrivez-nous à',
    contactOr: '',
    addPlaceBtn: 'Ajouter mon lieu préféré sur la carte',
    formTitle: 'Ajouter un lieu',
    formImage: 'Image',
    formPlaceTitle: "Titre de l'article",
    formPlaceTitlePlaceholder: 'Ex : Place Jean Jaurès',
    formImageReq: 'JPG ou PNG, max. 2 Mo, taille recommandée 1200×800 px.',
    formText: 'Texte',
    formTextPlaceholder: 'Décrivez ce lieu...',
    formAuthor: 'Auteur',
    formAuthorPlaceholder: 'Votre nom',
    formEmail: 'Votre e-mail',
    formEmailHint: 'Pour que nous puissions vous répondre en cas de refus.',
    formEmailPlaceholder: 'vous@exemple.fr',
    formModerationNote: 'Les lieux proposés sont modérés avant d’apparaître sur la carte.',
    formSuccessMessage: 'Merci ! Votre proposition a bien été envoyée. Elle sera modérée ; nous l’ajouterons à la carte après validation ou vous contacterons en cas de question.',
    formErrorMessage: 'Une erreur s’est produite. Vous pouvez nous écrire à buildtounderstand@gmail.com.',
    formGeo: 'Géo-point',
    formGeoHint: 'Cliquez sur le bouton puis sur la carte pour placer le point.',
    formPickMap: 'Choisir sur la carte',
    formPickHint: 'Cliquez sur la carte pour placer le point.',
    formCancel: 'Annuler',
    formSubmit: 'Envoyer',
  },
  en: {
    title: 'Saint-Étienne through the eyes of artists',
    openArticle: 'Open article',
    contact: 'To add your favourite place in Saint-Étienne to our map, write to us at',
    contactOr: '',
    addPlaceBtn: 'Add my favourite place to the map',
    formTitle: 'Add a place',
    formImage: 'Image',
    formPlaceTitle: 'Article title',
    formPlaceTitlePlaceholder: 'e.g. Place Jean Jaurès',
    formImageReq: 'JPG or PNG, max. 2 MB, recommended size 1200×800 px.',
    formText: 'Text',
    formTextPlaceholder: 'Describe this place...',
    formAuthor: 'Author',
    formAuthorPlaceholder: 'Your name',
    formEmail: 'Your email',
    formEmailHint: 'So we can reply to you if we have to decline or have questions.',
    formEmailPlaceholder: 'you@example.com',
    formModerationNote: 'Suggested places are moderated before they appear on the map.',
    formSuccessMessage: 'Thank you! Your submission has been sent. It will be reviewed; we will add it to the map after approval or contact you with feedback.',
    formErrorMessage: 'Something went wrong. Check your email (e.g. .com). You can email us at buildtounderstand@gmail.com.',
    formGeo: 'Location',
    formGeoHint: 'Click the button then click on the map to set the point.',
    formPickMap: 'Pick on map',
    formPickHint: 'Click on the map to place the point.',
    formCancel: 'Cancel',
    formSubmit: 'Submit',
  },
  de: {
    title: 'Saint-Étienne durch die Augen von Künstlern',
    openArticle: 'Artikel öffnen',
    contact: 'Um Ihren Lieblingsort in Saint-Étienne zu unserer Karte hinzuzufügen, schreiben Sie uns an',
    contactOr: '',
    addPlaceBtn: 'Meinen Lieblingsort auf die Karte setzen',
    formTitle: 'Ort hinzufügen',
    formImage: 'Bild',
    formPlaceTitle: 'Titel des Artikels',
    formPlaceTitlePlaceholder: 'z. B. Place Jean Jaurès',
    formImageReq: 'JPG oder PNG, max. 2 MB, empfohlene Größe 1200×800 px.',
    formText: 'Text',
    formTextPlaceholder: 'Beschreiben Sie diesen Ort...',
    formAuthor: 'Autor',
    formAuthorPlaceholder: 'Ihr Name',
    formEmail: 'Ihre E-Mail',
    formEmailHint: 'Damit wir Ihnen bei Ablehnung oder Rückfragen antworten können.',
    formEmailPlaceholder: 'sie@beispiel.de',
    formModerationNote: 'Vorgeschlagene Orte werden vor der Veröffentlichung auf der Karte geprüft.',
    formSuccessMessage: 'Vielen Dank! Ihre Einsendung wurde gesendet. Sie wird geprüft; wir nehmen den Ort nach Freigabe in die Karte auf oder melden uns bei Ihnen.',
    formErrorMessage: 'Ein Fehler ist aufgetreten. Sie können uns unter buildtounderstand@gmail.com schreiben.',
    formGeo: 'Standort',
    formGeoHint: 'Klicken Sie auf den Button und dann auf die Karte, um den Punkt zu setzen.',
    formPickMap: 'Auf Karte wählen',
    formPickHint: 'Klicken Sie auf die Karte, um den Punkt zu setzen.',
    formCancel: 'Abbrechen',
    formSubmit: 'Senden',
  },
  es: {
    title: 'Saint-Étienne a través de los ojos de los artistas',
    openArticle: 'Abrir artículo',
    contact: 'Para añadir su lugar favorito en Saint-Étienne a nuestro mapa, escríbanos a',
    contactOr: '',
    addPlaceBtn: 'Añadir mi lugar favorito al mapa',
    formTitle: 'Añadir un lugar',
    formImage: 'Imagen',
    formPlaceTitle: 'Título del artículo',
    formPlaceTitlePlaceholder: 'Ej.: Place Jean Jaurès',
    formImageReq: 'JPG o PNG, máx. 2 MB, tamaño recomendado 1200×800 px.',
    formText: 'Texto',
    formTextPlaceholder: 'Describa este lugar...',
    formAuthor: 'Autor',
    formAuthorPlaceholder: 'Su nombre',
    formEmail: 'Su correo electrónico',
    formEmailHint: 'Para poder responderle en caso de rechazo o consulta.',
    formEmailPlaceholder: 'usted@ejemplo.com',
    formModerationNote: 'Los lugares propuestos se moderan antes de aparecer en el mapa.',
    formSuccessMessage: '¡Gracias! Su propuesta ha sido enviada. Será revisada; la añadiremos al mapa tras la aprobación o le contactaremos.',
    formErrorMessage: 'Ha ocurrido un error. Puede escribirnos a buildtounderstand@gmail.com.',
    formGeo: 'Ubicación',
    formGeoHint: 'Pulse el botón y luego en el mapa para colocar el punto.',
    formPickMap: 'Elegir en el mapa',
    formPickHint: 'Haga clic en el mapa para colocar el punto.',
    formCancel: 'Cancelar',
    formSubmit: 'Enviar',
  },
  it: {
    title: 'Saint-Étienne attraverso gli occhi degli artisti',
    openArticle: 'Apri articolo',
    contact: 'Per aggiungere il tuo luogo preferito a Saint-Étienne sulla nostra mappa, scrivici a',
    contactOr: '',
    addPlaceBtn: 'Aggiungi il mio luogo preferito sulla mappa',
    formTitle: 'Aggiungi un luogo',
    formImage: 'Immagine',
    formPlaceTitle: 'Titolo dell\'articolo',
    formPlaceTitlePlaceholder: 'Es.: Place Jean Jaurès',
    formImageReq: 'JPG o PNG, max 2 MB, dimensione consigliata 1200×800 px.',
    formText: 'Testo',
    formTextPlaceholder: 'Descrivi questo luogo...',
    formAuthor: 'Autore',
    formAuthorPlaceholder: 'Il tuo nome',
    formEmail: 'La tua email',
    formEmailHint: 'Per poterti rispondere in caso di rifiuto o domande.',
    formEmailPlaceholder: 'tuo@esempio.it',
    formModerationNote: 'I luoghi proposti sono moderati prima di apparire sulla mappa.',
    formSuccessMessage: 'Grazie! La tua proposta è stata inviata. Sarà esaminata; la aggiungeremo alla mappa dopo l’approvazione o ti contatteremo.',
    formErrorMessage: 'Si è verificato un errore. Puoi scriverci a buildtounderstand@gmail.com.',
    formGeo: 'Punto sulla mappa',
    formGeoHint: 'Clicca il pulsante e poi sulla mappa per impostare il punto.',
    formPickMap: 'Scegli sulla mappa',
    formPickHint: 'Clicca sulla mappa per impostare il punto.',
    formCancel: 'Annulla',
    formSubmit: 'Invia',
  },
  ja: {
    title: '芸術家の目を通したサン＝テティエンヌ',
    openArticle: '記事を開く',
    contact: 'サン＝テティエンヌでお気に入りの場所を地図に追加するには、次のアドレスまでご連絡ください：',
    contactOr: '',
    addPlaceBtn: 'お気に入りの場所を地図に追加',
    formTitle: '場所を追加',
    formImage: '画像',
    formPlaceTitle: '記事のタイトル',
    formPlaceTitlePlaceholder: '例： Place Jean Jaurès',
    formImageReq: 'JPGまたはPNG、最大2MB、推奨サイズ1200×800px。',
    formText: 'テキスト',
    formTextPlaceholder: 'この場所について説明してください…',
    formAuthor: '著者',
    formAuthorPlaceholder: 'お名前',
    formEmail: 'メールアドレス',
    formEmailHint: 'お断りやご質問の際にご連絡できるように。',
    formEmailPlaceholder: 'you@example.com',
    formModerationNote: '提案された場所は地図に表示される前に審査されます。',
    formSuccessMessage: '送信ありがとうございます。審査後、承認されれば地図に追加するか、ご連絡いたします。',
    formErrorMessage: 'エラーが発生しました。buildtounderstand@gmail.com までご連絡ください。',
    formGeo: '位置',
    formGeoHint: 'ボタンをクリックしてから地図上をクリックし、ポイントを設定してください。',
    formPickMap: '地図で選ぶ',
    formPickHint: '地図をクリックしてポイントを設定してください。',
    formCancel: 'キャンセル',
    formSubmit: '送信',
  },
  ru: {
    title: 'Сент-Этьен глазами художников',
    openArticle: 'Открыть статью',
    contact: 'Чтобы добавить любимое место в Сент-Этьене на карту, напишите нам на',
    contactOr: '',
    addPlaceBtn: 'Добавить моё любимое место на карту',
    formTitle: 'Добавить место',
    formImage: 'Изображение',
    formPlaceTitle: 'Название статьи',
    formPlaceTitlePlaceholder: 'Напр.: Place Jean Jaurès',
    formImageReq: 'JPG или PNG, макс. 2 МБ, рекомендуемый размер 1200×800 px.',
    formText: 'Текст',
    formTextPlaceholder: 'Опишите это место…',
    formAuthor: 'Автор',
    formAuthorPlaceholder: 'Ваше имя',
    formEmail: 'Email',
    formEmailHint: 'Чтобы мы могли ответить при отказе или вопросах.',
    formEmailPlaceholder: 'you@example.com',
    formModerationNote: 'Предложенные места модерируются перед публикацией на карте.',
    formSuccessMessage: 'Спасибо! Ваша заявка отправлена. После проверки мы добавим место на карту или свяжемся с вами.',
    formErrorMessage: 'Произошла ошибка. Напишите нам на buildtounderstand@gmail.com.',
    formGeo: 'Точка на карте',
    formGeoHint: 'Нажмите кнопку, затем кликните по карте, чтобы указать точку.',
    formPickMap: 'Выбрать на карте',
    formPickHint: 'Кликните по карте, чтобы поставить точку.',
    formCancel: 'Отмена',
    formSubmit: 'Отправить',
  },
};

const LANG_KEY = 'semap-lang';
const DEFAULT_LANG = 'fr';

function getLang() {
  const stored = localStorage.getItem(LANG_KEY);
  return translations[stored] ? stored : DEFAULT_LANG;
}

function getMarkerTitle(marker) {
  if (typeof marker.title === 'object' && marker.title !== null) {
    const lang = getLang();
    return marker.title[lang] || marker.title[DEFAULT_LANG] || marker.title.en || Object.values(marker.title)[0];
  }
  return marker.title || '';
}

function getMarkerExcerpt(marker) {
  if (typeof marker.excerpt === 'object' && marker.excerpt !== null) {
    const lang = getLang();
    return marker.excerpt[lang] || marker.excerpt[DEFAULT_LANG] || marker.excerpt.en || Object.values(marker.excerpt)[0];
  }
  return marker.excerpt || '';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function applyLang(lang) {
  const t = translations[lang];
  const titleEl = document.getElementById('map-title');
  const contactEl = document.getElementById('footer-contact');
  const addBtnEl = document.getElementById('footer-add-btn');
  if (titleEl) titleEl.textContent = t.title;
  if (contactEl) {
    contactEl.innerHTML = t.contact + ' <a href="mailto:buildtounderstand@gmail.com">buildtounderstand@gmail.com</a>' + (t.contactOr || '');
  }
  if (addBtnEl) addBtnEl.textContent = t.addPlaceBtn;
  applyFormLang(lang);
  document.querySelectorAll('#lang-switcher button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
  });
  if (activeMarkerId) {
    const marker = markersData.find((m) => m.id === activeMarkerId);
    if (marker && !marker.hidden) openPopup(marker);
    else closePopup();
  }
}

function applyFormLang(lang) {
  const t = translations[lang];
  const ids = ['form-modal-title', 'form-label-image', 'form-image-requirements', 'form-label-title', 'form-label-text', 'form-label-author', 'form-label-email', 'form-email-hint', 'form-label-geo', 'form-geo-hint', 'form-pick-map-btn', 'form-cancel-btn', 'form-submit-btn', 'form-moderation-note', 'form-pick-hint-text', 'form-pick-cancel-btn'];
  const keys = ['formTitle', 'formImage', 'formImageReq', 'formPlaceTitle', 'formText', 'formAuthor', 'formEmail', 'formEmailHint', 'formGeo', 'formGeoHint', 'formPickMap', 'formCancel', 'formSubmit', 'formModerationNote', 'formPickHint', 'formCancel'];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && t[keys[i]]) el.textContent = t[keys[i]];
  });
  const textEl = document.getElementById('form-text');
  const authorEl = document.getElementById('form-author');
  const emailEl = document.getElementById('form-email');
  const titleEl = document.getElementById('form-title');
  if (textEl && t.formTextPlaceholder) textEl.placeholder = t.formTextPlaceholder;
  if (authorEl && t.formAuthorPlaceholder) authorEl.placeholder = t.formAuthorPlaceholder;
  if (emailEl && t.formEmailPlaceholder) emailEl.placeholder = t.formEmailPlaceholder;
  if (titleEl && t.formPlaceTitlePlaceholder) titleEl.placeholder = t.formPlaceTitlePlaceholder;
}

function articleUrl(slug) {
  const lang = getLang();
  const base = `${BASE}articles/${slug}.html`;
  return lang === DEFAULT_LANG ? base : `${base}?lang=${lang}`;
}

function imageUrl(filename) {
  return `${BASE}images/${filename}`;
}

function openPopup(marker) {
  if (marker.hidden) return;
  if (activeMarkerId === marker.id) return;
  activeMarkerId = marker.id;

  const url = articleUrl(marker.slug);
  const imgSrc = imageUrl(marker.image);
  const openArticleText = translations[getLang()].openArticle;
  const title = getMarkerTitle(marker);
  const excerpt = getMarkerExcerpt(marker);

  popupEl.innerHTML = `
    <article class="popup-card" role="article">
      <a href="${url}" class="popup-image-link" aria-label="${escapeHtml(openArticleText)}: ${escapeHtml(title)}">
        <img src="${imgSrc}" alt="" class="popup-image" loading="lazy" />
      </a>
      <div class="popup-body">
        <h2 class="popup-title">${escapeHtml(title)}</h2>
        <p class="popup-excerpt">${escapeHtml(excerpt)}</p>
        <a href="${url}" class="popup-cta">${escapeHtml(openArticleText)}</a>
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
  el.setAttribute('aria-label', `Show: ${getMarkerTitle(marker)}`);
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
  markersData.filter((m) => !m.hidden).forEach((marker) => {
    const el = createMarkerElement(marker);
    new maplibregl.Marker({ element: el })
      .setLngLat([marker.coordinates.lng, marker.coordinates.lat])
      .addTo(map);
  });
});

applyLang(getLang());
document.getElementById('lang-switcher').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-lang]');
  if (!btn) return;
  const lang = btn.getAttribute('data-lang');
  setLang(lang);
  applyLang(lang);
});

map.on('click', (e) => {
  if (geoPickMode && geoPickResolve) {
    const { lng, lat } = e.lngLat;
    geoPickResolve({ lng, lat });
    geoPickResolve = null;
    geoPickMode = false;
    if (tempMarker) {
      tempMarker.remove();
      tempMarker = null;
    }
    return;
  }
  closePopup();
});

popupEl.addEventListener('click', (e) => {
  if (e.target.closest('.popup-card a')) return;
  if (e.target === popupEl || e.target.closest('.popup-card') === null) closePopup();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const formOpen = document.getElementById('form-modal')?.classList.contains('is-open');
    if (formOpen) {
      if (geoPickMode) {
        geoPickMode = false;
        geoPickResolve = null;
        if (tempMarker) { tempMarker.remove(); tempMarker = null; }
        document.getElementById('form-pick-map-btn')?.classList.remove('is-picking');
      }
      closeFormModal();
    } else {
      closePopup();
    }
  }
});

function openFormModal() {
  const modal = document.getElementById('form-modal');
  const btn = document.getElementById('footer-add-btn');
  if (!modal || !btn) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  btn.setAttribute('aria-expanded', 'true');
  document.querySelectorAll('.form-success-message, .form-error-message').forEach((el) => el.remove());
  applyFormLang(getLang());
}

function closeFormModal() {
  const modal = document.getElementById('form-modal');
  const btn = document.getElementById('footer-add-btn');
  if (!modal || !btn) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  modal.classList.remove('is-picking');
  btn.setAttribute('aria-expanded', 'false');
  document.getElementById('add-place-form')?.classList.remove('is-hidden');
  const ph = document.getElementById('form-pick-hint');
  if (ph) { ph.setAttribute('aria-hidden', 'true'); ph.classList.remove('is-visible'); }
  if (geoPickMode) {
    geoPickMode = false;
    geoPickResolve = null;
    if (tempMarker) { tempMarker.remove(); tempMarker = null; }
    document.getElementById('form-pick-map-btn')?.classList.remove('is-picking');
  }
}

function initFormModal() {
  const openBtn = document.getElementById('footer-add-btn');
  const backdrop = document.getElementById('form-modal-backdrop');
  const cancelBtn = document.getElementById('form-cancel-btn');
  const form = document.getElementById('add-place-form');
  const pickMapBtn = document.getElementById('form-pick-map-btn');
  const geoValueEl = document.getElementById('form-geo-value');

  openBtn?.addEventListener('click', () => openFormModal());
  backdrop?.addEventListener('click', () => closeFormModal());
  cancelBtn?.addEventListener('click', () => closeFormModal());
  document.querySelector('.form-modal-box')?.addEventListener('click', (e) => e.stopPropagation());

  pickMapBtn?.addEventListener('click', () => {
    if (geoPickMode) return;
    geoPickMode = true;
    document.getElementById('form-modal')?.classList.add('is-picking');
    document.getElementById('add-place-form')?.classList.add('is-hidden');
    const pickHint = document.getElementById('form-pick-hint');
    if (pickHint) { pickHint.setAttribute('aria-hidden', 'false'); pickHint.classList.add('is-visible'); }
    pickMapBtn.classList.add('is-picking');
    const t = translations[getLang()];
    geoValueEl.textContent = '… ' + (t.formPickMap || '') + ' …';
    const resolve = ({ lng, lat }) => {
      geoValueEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      pickMapBtn.classList.remove('is-picking');
      document.getElementById('form-modal')?.classList.remove('is-picking');
      document.getElementById('add-place-form')?.classList.remove('is-hidden');
      const ph = document.getElementById('form-pick-hint');
      if (ph) { ph.setAttribute('aria-hidden', 'true'); ph.classList.remove('is-visible'); }
      pickMapBtn.dataset.lng = String(lng);
      pickMapBtn.dataset.lat = String(lat);
      if (tempMarker) tempMarker.remove();
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = '<svg class="marker-icon" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="5"/></svg>';
      tempMarker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    };
    geoPickResolve = resolve;
  });

  const pickCancelBtn = document.getElementById('form-pick-cancel-btn');
  if (pickCancelBtn) {
    pickCancelBtn.addEventListener('click', () => {
      if (!geoPickMode) return;
      geoPickMode = false;
      geoPickResolve = null;
      document.getElementById('form-modal')?.classList.remove('is-picking');
      document.getElementById('add-place-form')?.classList.remove('is-hidden');
      const ph = document.getElementById('form-pick-hint');
      if (ph) { ph.setAttribute('aria-hidden', 'true'); ph.classList.remove('is-visible'); }
      pickMapBtn?.classList.remove('is-picking');
      if (geoValueEl) geoValueEl.textContent = '—';
      if (tempMarker) { tempMarker.remove(); tempMarker = null; }
    });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('form-submit-btn');
    const text = document.getElementById('form-text').value.trim();
    const author = document.getElementById('form-author').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const title = document.getElementById('form-title').value.trim();
    const lng = pickMapBtn?.dataset.lng;
    const lat = pickMapBtn?.dataset.lat;
    const imageInput = document.getElementById('form-image');
    const t = translations[getLang()];

    function resetFormState() {
      form.reset();
      if (geoValueEl) geoValueEl.textContent = '—';
      if (pickMapBtn) { delete pickMapBtn.dataset.lng; delete pickMapBtn.dataset.lat; }
      if (tempMarker) { tempMarker.remove(); tempMarker = null; }
    }

    if (FORMSPREE_FORM_ID) {
      submitBtn.disabled = true;
      const prevSubmitText = submitBtn.textContent;
      submitBtn.textContent = '…';
      const data = new FormData();
      data.set('text', text || '(empty)');
      data.set('author', author || '(empty)');
      data.set('title', title || '(empty)');
      data.set('email', email || '(not provided)');
      data.set('latitude', lat || '');
      data.set('longitude', lng || '');
      data.set('image_filename', imageInput?.files?.[0]?.name || '(no file)');
      data.set('_replyto', email || '');
      try {
        const res = await fetch('https://formspree.io/f/' + FORMSPREE_FORM_ID, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const j = res.ok ? null : await res.json().catch(() => ({}));
        if (res.ok) {
          const successEl = document.createElement('p');
          successEl.className = 'form-success-message';
          const hasFile = imageInput?.files?.[0];
          successEl.textContent = (t.formSuccessMessage || 'Thank you!') + (hasFile ? ' Please send your image to buildtounderstand@gmail.com.' : '');
          form.prepend(successEl);
          setTimeout(() => {
            successEl.remove();
            closeFormModal();
            resetFormState();
            submitBtn.disabled = false;
            submitBtn.textContent = prevSubmitText;
          }, 3500);
        } else {
          throw new Error(j?.error || j?.message || 'Bad request');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevSubmitText;
        let errEl = form.querySelector('.form-error-message');
        if (!errEl) { errEl = document.createElement('p'); errEl.className = 'form-error-message'; form.prepend(errEl); }
        errEl.textContent = (err && err.message && err.message !== 'Bad request' ? err.message + '. ' : '') + (t.formErrorMessage || 'Something went wrong.');
      }
      return;
    }

    const fileName = imageInput?.files?.[0]?.name || '(no file)';
    const body = [
      'Place submission',
      '',
      'Title: ' + (title || '(empty)'),
      'Text: ' + (text || '(empty)'),
      'Author: ' + (author || '(empty)'),
      'Email: ' + (email || '(not provided)'),
      'Location: ' + (lat && lng ? `${lat}, ${lng}` : '(not set)'),
      'Image: ' + fileName,
      '',
      'Please attach your image when sending this email.',
    ].join('\n');
    const subject = 'SEmap: Add my place';
    window.location.href = 'mailto:buildtounderstand@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    closeFormModal();
    resetFormState();
  });
}

initFormModal();
