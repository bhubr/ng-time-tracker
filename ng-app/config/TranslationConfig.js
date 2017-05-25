function TranslationConfig($translateProvider) {
  $translateProvider.translations('en', {
    ACTIVE_PROJECTS: 'Active projects',
    LAST_7_DAYS: 'last 7 days',
    LATEST_TIMERS: 'Latest timers',
  });
  $translateProvider.preferredLanguage('en');
}

module.exports = TranslationConfig;