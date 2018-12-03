<template>
    <v-layout>
        <h1>Log</h1>
        <p v-text="log"></p>
    </v-layout>
</template>

<script>
export default {
    name: 'log-view',
    data: () => {
        return { 
            log: new Array(),
        }
    },
    methods: {
        // getLog() {
        //     ipcRenderer.send('getLog');
        // }
    },
    mounted () { 
        this.$electron.ipcRenderer.send('getLog');
        this.$electron.ipcRenderer.on('log', (event, message) => {
            const log = message;
            this.log = log;
            console.log(log);
        });
    }
}
</script>
