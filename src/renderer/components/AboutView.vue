<template>
  <v-layout row justify-center>
    <v-dialog v-model="this.model" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="model = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>About</v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- <v-toolbar-items>
            <v-btn dark flat>Save</v-btn>
          </v-toolbar-items> -->
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Abouts</v-subheader>
          <v-list-tile avatar>
            <v-list-tile-content>
              <v-list-tile-title>License</v-list-tile-title>
              <v-list-tile-sub-title>hi</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// TODO: Fix error: Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated
export default {
    name: 'about-view',
    props: {
        model: {
            type: Boolean,
            default: false
        }
    }
}
</script>
