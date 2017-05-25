function TranslationConfig($translateProvider) {
  $translateProvider.translations('en', {
    ACTIVE_PROJECTS: 'Active projects',
    LAST_7_DAYS: 'last 7 days',
    LATEST_TIMERS: 'Latest timers',
    SOURCE_CODE_HOST: 'Source code host',
    ACTIVE_ACCOUNTS: 'Active accounts',
    EDIT_ACCOUNT: 'Edit account',
    REQUEST_AUTHORIZATION: 'Request authorization'
  });
  $translateProvider.preferredLanguage('en');
}

module.exports = TranslationConfig;