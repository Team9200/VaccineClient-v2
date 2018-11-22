<template>
  <div id="app">
    <v-app blue>
      <v-navigation-drawer fixed :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" app>
        <v-list>
          <v-list-tile router :to="item.to" :key="i" v-for="(item, i) in items" exact>
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
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
        <v-toolbar-items class="hidden-sm-and-down">
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
        </v-toolbar-items>
  
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
        <span>&copy; 2017</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'linearvaccine',
    data: () => ({
      clipped: false,
      drawer: true,
      fixed: false,
      items: [{
          icon: 'apps',
          title: 'Main',
          to: '/'
        },
        {
          icon: 'bubble_chart',
          title: 'Inspire',
          to: '/inspire'
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
