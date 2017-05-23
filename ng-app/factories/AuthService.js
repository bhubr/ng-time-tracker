AuthService.$inject = ['$http'];

function AuthService($http) {

  function getToken() {
    return localStorage.getItem('id_token');
  }

  function setToken(jwt) {
    return localStorage.setItem('id_token', jwt);
  }

  return {
    setToken,

    getToken,

    signup: function(attributes) {
      return $http.post('/api/v1/users', { data:
       { type: "users", attributes } 
     })
      .then(function(response) {
        // var token = response.data.token;
        // self.user = jwtHelper.decodeToken(token);
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
        self.user = user;
        console.log(self);
      });
      //   return { token: token, user: self.user };
      // });
    }
  };
}

module.exports = AuthService;
