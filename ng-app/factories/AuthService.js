AuthService.$inject = ['$rootScope', '$http', 'jwtHelper'];

function AuthService($rootScope, $http, jwtHelper) {

  let currentUser = null;

  function getToken() {
    return localStorage.getItem('id_token');
  }

  function setToken(jwt) {
    return localStorage.setItem('id_token', jwt);
  }

  function getCurrentUser() {
    return currentUser;
  }

  function init() {
    const token = getToken();
    if(token !== null) {
      console.log(token, typeof token);
      $rootScope.currentUser = currentUser = jwtHelper.decodeToken(token);
    }
    console.log('AuthService.init currentUser: ', currentUser);
  }


  return {
    setToken,
    getToken,
    getCurrentUser,
    init,

    signup: function(attributes) {
      return $http.post('/api/v1/users', { data:
       { type: "users", attributes } 
     })
      .then(function(response) {
        // var token = response.data.token;
        // self.
        // return { token: token, user: self.user };
        console.log(response);
      });
    },

    signin: function(attributes) {
      let token;
      const self = this;
      return $http.post('/api/v1/signin', { data: { attributes } })
      .then(response => {
        const { jwt, userId } = response.data.data;
        token = jwt;
        return $http.get('/api/v1/users/' + userId);
      })
      .then(response => {
        return response.data.data.attributes;
      })
      .then(user => {
        console.log(user, token);
        // localStorage.getItem('id_token');
        setToken(token);
        $rootScope.currentUser = currentUser = user;
        console.log(currentUser);
      });
      //   return { token: token, user: self.user };
      // });
    },

    signout: function() {
      localStorage.removeItem('id_token');
      $rootScope.currentUser = currentUser = null;
    } 

  };
}

module.exports = AuthService;
