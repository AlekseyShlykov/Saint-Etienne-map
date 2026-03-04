(function () {
  var params = new URLSearchParams(window.location.search);
  var lang = params.get('lang') || 'fr';
  var backToMap = {
    fr: 'Retour à la carte',
    en: 'Back to map',
    de: 'Zurück zur Karte',
    es: 'Volver al mapa',
    it: 'Torna alla mappa',
    ja: '地図に戻る',
    ru: 'Назад к карте'
  };
  var el = document.querySelector('.article-back');
  if (el) el.textContent = '← ' + (backToMap[lang] || backToMap.fr);

  var htmlLang = { fr: 'fr', en: 'en', de: 'de', es: 'es', it: 'it', ja: 'ja', ru: 'ru' }[lang] || 'fr';
  if (document.documentElement) document.documentElement.lang = htmlLang;

  if (window.ARTICLE_CONTENT) {
    var content = window.ARTICLE_CONTENT[lang] || window.ARTICLE_CONTENT['fr'] || window.ARTICLE_CONTENT['en'];
    if (content) {
      var main = document.querySelector('.article-content');
      if (main) {
        var h1 = main.querySelector('h1');
        if (h1) h1.textContent = content.title;
        var paragraphs = content.paragraphs || [];
        var pNodes = main.querySelectorAll('p');
        for (var i = 0; i < paragraphs.length; i++) {
          if (pNodes[i]) {
            pNodes[i].textContent = paragraphs[i];
          } else {
            var p = document.createElement('p');
            p.textContent = paragraphs[i];
            main.appendChild(p);
          }
        }
        for (var j = pNodes.length - 1; j >= paragraphs.length; j--) {
          pNodes[j].parentNode.removeChild(pNodes[j]);
        }
      }
      if (document.title && content.title) {
        document.title = content.title + ' — SEmap';
      }
    }
  }
})();
