module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "ng-time-tracker",
      script    : "server.js",
      env: {
        COMMON_VARIABLE: "true",
        NODE_ENV: "development"
      }
    }
  ]
}

