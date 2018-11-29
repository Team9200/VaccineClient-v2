<template>
  <div id="app">
    <v-app dark>
      <v-navigation-drawer fixed :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" app>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title">
              {{ this.title }}
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
  
            <v-list-tile v-if="mode === 'collector'" router :to="collector.to" v-for="(collector, i) in collectors" :key="i">
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
  
            <v-list-tile v-if="mode === 'analyzer'" router :to="analyzer.to" v-for="(analyzer, i) in analyzers" :key="i">
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
  
            <v-list-tile v-if="mode === 'storage'" router :to="storage.to" v-for="(storage, i) in storages" :key="i">
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
        <v-btn color="green" @click="refresh">
          <v-icon>refresh</v-icon>
        </v-btn>
        <v-btn color="green" router :to="setting">
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
  </div>
</template>

<script>
  export default {
    name: 'linearvaccine',
    data: () => ({
      clipped: false,
      drawer: false,
      fixed: false,
      home: '/',
      mode: '',
      setting: '/setting',
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
          icon: 'mdl-file',
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
    created() {
      const vm = this;
      storage.has('mode', function (err, hasKey) {
        if (err) throw err;
        if (!hasKey) {
          if (process.env.NODE_ENV === 'production') {
            storage.setDataPath(os.tmpdir());
          }
          storage.set('mode', {mode: 'collector'});
          // vm.$router.push('/collector');
        }
        if (hasKey) {
          storage.get('mode', function (err, data) {
            if (err) throw err;
            vm.mode = data.mode;
            vm.$router.push('/');
          });
        }
      });
    },
    methods: {
      refresh: function () {
        ipcRenderer.send('reload', 'ping');
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  @import url('https://use.fontawesome.com/releases/v5.5.0/css/all.css');
  /* Global CSS */
</style>
