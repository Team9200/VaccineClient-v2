<template>
    <div>
        <v-layout>
            <v-flex>
                <v-text-field style="width: 800px;" v-model="keyword" label="keyword"></v-text-field>
            </v-flex>
            <v-flex>
                <v-btn color="green">Search</v-btn>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-card width="100%">
                <v-card-title>
                    Ransomware | 0.34 Coin | 2018.11.27
                </v-card-title>
                <v-card-text>
                    http://openti.info/?num=123
                </v-card-text>
            </v-card>
           
        </v-layout>
        
    </div>
</template>

<script>
    export default {
        name: 'get-file-view',
        data: () => ({
            keyword: ''
        })
    }
</script>

<style>

</style>