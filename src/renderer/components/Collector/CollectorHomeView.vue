<template>
    <div style="width: 100%">
        <v-container fluid grid-list-md>
            <h1>Home</h1>
            <v-layout row wrap>
                <v-flex d-flex xs12 sm6>
                    <v-btn style="height: 206px; font-size: 15px;" router :to="items[0].to" block color="green" dark>{{
                        items[0].title }}</v-btn>
                </v-flex>
                <v-flex xs12 sm6>
                    <v-btn style="height: 100px; font-size: 15px;" router :to="items[1].to" block color="green"
                                dark>{{ items[1].title }}</v-btn>
                    <v-btn style="height: 100px; font-size: 15px;" router :to="items[2].to" block color="green" dark>{{ items[2].title }}</v-btn>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
    export default {
        name: 'collector-home-view',
        data: () => ({
            clipped: false,
            drawer: false,
            fixed: false,
            items: [{
                    title: 'Vaccine',
                    to: '/vaccine'
                },
                {
                    title: 'Quarantine',
                    to: '/quarantine'
                },
                {
                    title: 'Log',
                    to: '/log'
                }
            ]
        })
    }
</script>