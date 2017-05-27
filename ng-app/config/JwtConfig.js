function JwtConfig($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    whiteListedDomains: 'bitbucket.org',
    tokenGetter: ['authService', 'options', function(authService, options) {

      if (options.url.indexOf('https://api.bitbucket.org') === 0) {
        return localStorage.getItem('bb_at');
      } else {
        return localStorage.getItem('id_token');
      }

      return authService.getToken();
    }]

  });

  $httpProvider.interceptors.push('jwtInterceptor');
}

module.exports = JwtConfig;