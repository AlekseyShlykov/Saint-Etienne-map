(function () {
  var params = new URLSearchParams(window.location.search);
  var lang = params.get('lang') || 'fr';
  var backToMap = {
    fr: 'Retour à la carte',
    en: 'Back to map',
    de: 'Zurück zur Karte',
    es: 'Volver al mapa',
    it: 'Torna alla mappa'
  };
  var el = document.querySelector('.article-back');
  if (el) el.textContent = '← ' + (backToMap[lang] || backToMap.fr);
})();
