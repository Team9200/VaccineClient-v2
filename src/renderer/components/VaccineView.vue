<template>
    <v-layout>
        <v-flex xs12 sm6 offset-sm3>
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <input type="file">
                    </div>
                </v-card-title>
    
                <v-card-actions>
                    <v-btn flat color="blue">Detect</v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'vaccine-view'
    }
</script>

<style>
    
</style>
