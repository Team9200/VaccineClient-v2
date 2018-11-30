<template>
    <v-dialog
      v-model="this.model"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          {{ message }}
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'refresh-view',
    props: {
      model: {
        type: Boolean
      },
      message: {
        type: String,
        default: 'Refreshing this page..'
      }
    }
}
</script>
