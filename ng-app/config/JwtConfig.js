function JwtConfig($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    whiteListedDomains: 'bitbucket.org',
    tokenGetter: ['authService', 'options', function(authService, options) {

      console.log('tokenGetter url', options.url);
      if (options.url.indexOf('https://api.bitbucket.org') === 0) {
        console.log('other token for url', options.url);
        return localStorage.getItem('bb_at');
      } else {
        console.log('getting app token');
        return localStorage.getItem('id_token');
      }

      return authService.getToken();
    }]

  });

  $httpProvider.interceptors.push('jwtInterceptor');
}

module.exports = JwtConfig;