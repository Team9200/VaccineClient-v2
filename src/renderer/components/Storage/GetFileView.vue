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
        <div style="overflow-x: auto;" v-for="(item, i) in items" :key="i">
            <v-card width="100%">
                <v-card-title>
                    {{ item.title }}
                </v-card-title>
                <v-card-text>
                    {{ item.url }}
                </v-card-text>
            </v-card>
            <br>
        </div>
        <div>
            <v-spacer></v-spacer>
            <v-btn color="green">Pay for Sample</v-btn>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'get-file-view',
        data: () => ({
            keyword: '',
            items: [
                {
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },
                {
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },{
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },{
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                }
            ]
        })
    }
</script>

<style>

</style>