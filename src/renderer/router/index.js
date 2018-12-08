import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/', 
      name: 'home-view',
      component: require('@/components/HomeView').default
    },
    {
      path: '/vaccine',
      name: 'vaccine-view',
      component: require('@/components/Collector/VaccineView').default
    },
    {
      path: '/quarantine',
      name: 'quarantine-view',
      component: require('@/components/Collector/QuarantineView').default
    },
    {
      path: '/log',
      name: 'log-view',
      component: require('@/components/Collector/LogView').default
    },
    {
      path: '/filelist',
      name: 'file-list-view',
      component: require('@/components/Storage/FileListView').default
    },
    {
      path: '/getfile',
      name: 'get-file-view',
      component: require('@/components/Storage/GetFileView').default
    },
    {
      path: '/wallet',
      name: 'wallet-view',
      component: require('@/components/Storage/WalletView').default
    },
    {
      path: '/send-wallet',
      name: 'send-wallet-view',
      component: require('@/components/Storage/SendWalletView').default
    },
    {
      path: '/setting',
      name: 'setting-view',
      component: require('@/components/SettingView').default
    },
    {
      path: '/first',
      name: 'first-view',
      component: require('@/components/FirstView').default
    },
    {
      path: '/error',
      name: 'error-view',
      component: require('@/components/ErrorView').default
    },
    {
      path: '*',
      redirect: '/error'
    }
  ]
})
