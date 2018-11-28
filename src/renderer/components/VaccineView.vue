<template>
    <v-layout>
        <v-flex xs12>
            <!-- <h1>Vaccine</h1> -->
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <input type="file">
                    </div>
                </v-card-title>
    
                <v-card-actions>
                    <v-dialog v-model="dialog" width="500">
                        <v-btn slot="activator" color="blue lighten-1" dark>
                            Detect
                        </v-btn>
    
                        <v-card>
                            <v-card-title class="headline">
                                Send Report
                            </v-card-title>
    
                            <v-card-text>
                                * 검사 결과 <br><br> 검사 결과를 보내실 겁니까?
                            </v-card-text>
    
                            <v-divider></v-divider>
    
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" flat @click="dialog = false">
                                    I accept
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
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
