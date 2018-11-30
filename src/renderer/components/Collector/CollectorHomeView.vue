<template>
    <div style="width: 100%">
        <h1>Home</h1>
        <!-- <v-layout> -->
            <v-btn style="height: 100px; font-size: 25px;" router :to="items[0].to" block color="green" dark>{{ items[0].title }}</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 100px; font-size: 25px;" router :to="items[1].to" block color="green" dark>{{ items[1].title }}</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 100px; font-size: 25px;" router :to="items[2].to" block color="green" dark>{{ items[2].title }}</v-btn>
        <!-- </v-layout> -->
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
