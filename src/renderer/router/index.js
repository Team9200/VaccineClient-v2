import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/', 
      name: 'main-view',
      component: require('@/components/MainView').default
    },{
      path: '/vaccine',
      name: 'vaccine-view',
      component: require('@/components/VaccineView').default
    },
    {
      path: '/analyzer',
      name: 'analyzer-home-view',
      component: require('@/components/AnalyzerHomeView').default
    },
    {
      path: '/filelist',
      name: 'file-list-view',
      component: require('@/components/FileListView').default
    },
    {
      path: '/getfile',
      name: 'get-file-view',
      component: require('@/components/GetFileView').default
    },
    {
      path: '/wallet',
      name: 'wallet-view',
      component: require('@/components/WalletView').default
    },
    // {
    //   path: '/',
    //   name: 'welcome-view',
    //   component: require('@/components/WelcomeView').default
    // },
    {
      path: '/inspire',
      name: 'inspire',
      component: require('@/components/InspireView').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
