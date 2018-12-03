<template>
    <v-layout>
        <h1>Quarantine</h1>
        <p v-text="quarantineFileList"></p>
    </v-layout>
</template>

<script>
export default {
    name: 'quarantine-view',
    data: () => {
        return { 
            quarantineFileList: new Array()
        }
    },
    methods: {
        // getLog() {
        //     ipcRenderer.send('getLog');
        // }
    },
    mounted () { 
        this.$electron.ipcRenderer.send('getQuarantine');
        this.$electron.ipcRenderer.on('quarantineFileList', (event, message) => {
            const quarantineFileList = message;
            this.quarantineFileList = quarantineFileList;
            console.log(this.quarantineFileList);
        });
    }
}
</script>
