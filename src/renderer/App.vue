<template>
  <div id="app">
    <v-app dark>
      <v-navigation-drawer fixed :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" app>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title">
              LinearVaccine
            </v-list-tile-title>
          </v-list-tile>

          <v-list-tile router :to="home">
            <v-list-tile-action>
              <v-icon>home</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile>


          <!-- <v-list-tile router :to="item.to" :key="i" v-for="(item, i) in items" exact>
                  <v-list-tile-action>
                    <v-icon v-html="item.icon"></v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title v-text="item.title"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile> -->

          <!-- <v-list-group v-if="mode === 'collector'">
            <v-list-tile slot="activator">
              <v-list-tile-title>Collector</v-list-tile-title>
            </v-list-tile> -->

          <v-list-tile ripple v-if="mode === 'collector'" router :to="collector.to" v-for="(collector, i) in collectors" :key="i">
            <v-list-tile-action>
              <v-icon v-text="collector.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-title v-text="collector.title"></v-list-tile-title>
          </v-list-tile>
          <!-- </v-list-group> -->

          <!-- <v-list-group v-if="mode === 'analyzer'">
            <v-list-tile slot="activator">
              <v-list-tile-title>Analyzer</v-list-tile-title>
            </v-list-tile> -->

          <v-list-tile ripple v-if="mode === 'analyzer'" router :to="analyzer.to" v-for="(analyzer, i) in analyzers" :key="i">
            <v-list-tile-action>
              <v-icon v-text="analyzer.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-title v-text="analyzer.title"></v-list-tile-title>
          </v-list-tile>
          <!-- </v-list-group> -->

          <!-- <v-list-group v-if="mode === 'storage'">
            <v-list-tile slot="activator">
              <v-list-tile-action>
                <v-icon small>fas fa-box</v-icon>
                 </v-list-tile-action>
              <v-list-tile-title>Storage</v-list-tile-title>
            </v-list-tile> -->

          <v-list-tile ripple v-if="mode === 'storage'" router :to="storage.to" v-for="(storage, i) in storages" :key="i">
            <v-list-tile-action>
              <v-icon v-text="storage.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-title v-text="storage.title"></v-list-tile-title>
          </v-list-tile>
          <!-- </v-list-group> -->
        </v-list>
      </v-navigation-drawer>
      <v-toolbar color="green" fixed app :clipped-left="clipped">
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <!-- <v-btn 
                      icon
                      @click.native.stop="miniVariant = !miniVariant"
                    >
                      <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
                    </v-btn> -->
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon color="green" @click="refresh = true">
          <v-icon>refresh</v-icon>
        </v-btn>
        <v-btn icon color="green" router :to="setting">
          <v-icon>settings</v-icon>
        </v-btn>
        <!-- <v-icon router :to="setting">settings</v-icon> -->

        <!-- <v-toolbar-items class="hidden-sm-and-down">
            <v-menu offset-y>
              <v-btn slot="activator" color="" blue>
                Mode
              </v-btn>
              <v-list>
                <v-list-tile v-for="(mode, index) in modes" :key="index">
                  <v-list-tile-title>{{ mode.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-toolbar-items> -->

      </v-toolbar>
      <v-content>
        <v-container fluid fill-height>
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>
      <v-footer :fixed="fixed" app>
        <v-spacer></v-spacer>
        <span>&copy; 2018 Team9200 &nbsp;&nbsp;&nbsp;</span>
      </v-footer>
    </v-app>

    <refresh-view :model="refresh"></refresh-view>
  </div>
</template>

<script>
  import RefreshView from './components/RefreshView';
  export default {
    name: 'linearvaccine',
    data: () => ({
      first: false,
      clipped: false,
      drawer: false,
      fixed: false,
      home: '/',
      mode: '',
      setting: '/setting',
      refresh: false,
      vaccinePath: '',
      collectors: [{
        icon: 'search',
        title: 'Vaccine',
        to: '/vaccine'
      }, {
        icon: '',
        title: 'Quarantine',
        to: '/quarantine'
      }, {
        icon: '',
        title: 'Log',
        to: '/log'
      }],
      analyzers: [],
      storages: [{
          icon: 'list',
          title: 'File List',
          to: '/filelist'
        },
        {
          icon: 'folder',
          title: 'Get File',
          to: '/getfile'
        },
        {
          icon: 'fas fa-wallet',
          title: 'Wallet',
          to: '/wallet'
        }
      ],
      modes: [{
        title: 'Collector'
      }, {
        title: 'Analyzer'
      }, {
        title: 'Storage'
      }],
      miniVariant: false,
      title: 'LinearVaccine'
    }),
    components: {
      RefreshView
    },
    created() {
      const vm = this;
      storage.has('mode', function (err, hasKey) {
        if (err) throw err;
        if (hasKey) {
          storage.get('mode', function (err, data) {
            if (err) throw err;
            vm.mode = data.mode;
            vm.$router.push('/');
          });
        }
      });

      storage.has('setting', function (err, hasKey) {
        if (err) throw err;
        if (!hasKey) {
          vm.first = true;
        }
      });
    },
    methods: {
      pathIn(e) {
        this.vaccinePath = e.target.files[0].path;
      },
      refreshing: function () {
        ipcRenderer.send('reload', 'ping');
      },
    },
    watch: {
      refresh (val) {
        if (!val) return

        setTimeout(() => {
          this.refresh = false;
          window.location.reload()
          // this.refreshing();
        }, 2000);
      },
      mode (value) {
        var appname = 'LinearVaccine';
        switch (value) {
          case 'collector':
            this.title = appname;
            break;
          case 'analyzer':
            this.title = appname + ' - Analyzer';
            break;
          case 'storage':
            this.title = appname + ' - Storage';
            break;
          default:
            break;
        }
      },
      first (value) {
        if (!value) return
        if (value === true) this.$router.push('/first')
      }
    }
  }
</script>

<style>
  /* @import url('/static/css/icons.css'); */
  /* @import url('/static/css/font-awesome.css'); */
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  @import url('https://use.fontawesome.com/releases/v5.5.0/css/all.css');
  /* Global CSS */
</style>