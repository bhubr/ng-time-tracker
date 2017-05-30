function TranslationConfig($translateProvider) {
  $translateProvider.translations('en', {
    ACTIVE_PROJECTS: 'Active projects',
    LAST_7_DAYS: 'last 7 days',
    LATEST_TIMERS: 'Latest timers',
    SOURCE_CODE_HOST: 'Source code host',
    ACTIVE_ACCOUNTS: 'Active accounts',
    EDIT_ACCOUNT: 'Edit account',
    REQUEST_AUTHORIZATION: 'Request authorization',
    CREATE_PROJECT: 'Create project',
    EDIT_PROJECT: 'Edit project',
    PROJECT_LIST: 'Project list',
    PROJECT_NAME: 'Project name',
    PROJECT_DESC: 'Project description',
    NEW: 'New',
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
    PROJECT_COLORS: 'Color (colors by <a href="https://flatuicolors.com/" target="_blank">https://flatuicolors.com/</a>)'
  });
  $translateProvider.preferredLanguage('en');
}

module.exports = TranslationConfig;