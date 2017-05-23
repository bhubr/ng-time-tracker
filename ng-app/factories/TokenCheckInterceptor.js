TokenCheckInterceptor.$inject = ['$q', '$location'];

function TokenCheckInterceptor($q, $location) {
    var responseInterceptor = {
        responseError: function(rejection) {
            if(typeof rejection.data === 'string' && rejection.data.includes('Token expired by')) {
                $location.path('/signin');
            }
            return rejection;
        }
    };

    return responseInterceptor;
}

module.exports = TokenCheckInterceptor;