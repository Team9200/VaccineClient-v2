<template>
  <div id="app">
    <v-app blue>
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
  
          <v-list-group>
            <v-list-tile slot="activator">
              <v-list-tile-title>Collector</v-list-tile-title>
            </v-list-tile>
  
            <v-list-tile router :to="collector.to" v-for="(collector, i) in collectors" :key="i">
              <v-list-tile-action>
                <v-icon v-text="collector.icon"></v-icon>
              </v-list-tile-action>
              <v-list-tile-title v-text="collector.title"></v-list-tile-title>
            </v-list-tile>
          </v-list-group>
  
          <v-list-group>
            <v-list-tile slot="activator">
              <v-list-tile-title>Analyzer</v-list-tile-title>
            </v-list-tile>
  
            <v-list-tile router :to="analyzer.to" v-for="(analyzer, i) in analyzers" :key="i">
              <v-list-tile-action>
                <v-icon v-text="analyzer.icon"></v-icon>
              </v-list-tile-action>
              <v-list-tile-title v-text="analyzer.title"></v-list-tile-title>
            </v-list-tile>
          </v-list-group>
  
          <v-list-group>
            <v-list-tile slot="activator">
              <v-list-tile-title>Storage</v-list-tile-title>
            </v-list-tile>
  
            <v-list-tile router :to="storage.to" v-for="(storage, i) in storages" :key="i">
              <v-list-tile-action>
                <v-icon v-text="storage.icon"></v-icon>
              </v-list-tile-action>
              <v-list-tile-title v-text="storage.title"></v-list-tile-title>
            </v-list-tile>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar fixed app :clipped-left="clipped">
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <!-- <v-btn 
                      icon
                      @click.native.stop="miniVariant = !miniVariant"
                    >
                      <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
                    </v-btn> -->
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
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
      <v-navigation-drawer temporary fixed :right="right" v-model="rightDrawer" app>
        <v-list>
          <v-list-tile @click.native="right = !right">
            <v-list-tile-action>
              <v-icon light>compare_arrows</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-footer :fixed="fixed" app>
        <v-spacer></v-spacer>
        <!-- <span>&copy; 2017</span> -->
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
      collectors: [{
        icon: 'search',
        title: 'Vaccine',
        to: '/vaccine'
      }],
      analyzers: [{
        icon: 'home',
        title: 'Home',
        to: '/analyzer'
      }],
      storages: [{
          icon: 'home',
          title: 'Home',
          to: '/storage'
        },{
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
      right: true,
      rightDrawer: false,
      title: 'LinearVaccine'
    })
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  
  /* Global CSS */
</style>
