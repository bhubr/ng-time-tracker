/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
TranslationService.$inject = ['$rootScope', '$translate'];

function TranslationService($rootScope, $translate) {

  return {
    init: function() {

      // Get preferred language is set, and tell $translate to use it
      var preferredLang = localStorage.getItem('preferred_lang');
      if(preferredLang) {
        $translate.use(preferredLang);
      }

      // Set preferred language and configure $translate,
      // so that language pref is remembered on page reload
      $rootScope.changeLanguage = function (key) {
        localStorage.setItem('preferred_lang', key);
        $translate.use(key);
      };
    }
  }

}

module.exports = TranslationService;