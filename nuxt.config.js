const pkg = require('./package')
const bodyParser = require('body-parser');
const axios = require('axios');

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', ref: 'https://fonts.googleapis.com/css?family=Open+Sans' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070', height: '4px', duration: 5000 },

  /*
  ** Global CSS
  */
  css: [
    '~assets/styles/main.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    // Load certain functionalities before app is fully rendered and mounted
    // important since we don't have access to main.js like in typical vue apps
    '~plugins/core-components.js',
    '~plugins/date-filter.js'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [

  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      
    }
  },
  env: {

  },

  serverMiddleware: [
    // executed prior to NUXT rendering
    bodyParser.json(),
    '~/api'
  ],
  generate: {
    routes: function() {
      return axios.get('https://nuxt-blog-98ead.firebaseio.com/posts.json')
      .then(res => {
        let routes = [];
        for (const key in res.data) {
          routes.push(
            {
            route: '/posts/' + key, 
            payload: {
              postData: res.data[key]
            }
          });
        }
        return routes;
      });
    }
  },
  // For all auth.
  // router: {
  //   middleware: 'log'
  // },
  transition: {
    name: 'fade',
    mode: 'out-in'
  }
}
