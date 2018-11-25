<template>
    <div style="width: 100%">
        <v-layout>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[0].to" block color="red" dark>Collector</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[1].to" block color="green" dark>Analyzer</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[2].to" block color="blue" dark>Storage</v-btn>
        </v-layout>
    </div>
</template>

<script>
    export default {
        name: 'home-view',
        data: () => ({
            clipped: false,
            drawer: false,
            fixed: false,
            items: [{
                    title: 'Collector',
                    to: '/vaccine'
                },
                {
                    title: 'Analyzer',
                    to: '/analyzer'
                },
                {
                    title: 'Storage',
                    to: '/storage'
                }
            ]
        })
    }
</script>
