<template>
    <v-layout row>
        <v-flex>
            <h1>Home</h1>
            <v-card>
                <v-list two-line>
                    <v-list-tile >
                        <v-list-tile-action>
                            <v-icon color="green">fas fa-hdd</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Storage Used</v-list-tile-title>
                            <!-- TODO: progress bar -->
                            <!-- <v-list-tile-sub-title><v-progress-linear color="green" v-model="value" :active="show" :indeterminate="query" :query="true"></v-progress-linear></v-list-tile-sub-title> -->
                        </v-list-tile-content>
                    </v-list-tile>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">far fa-smile</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Response Rate</v-list-tile-title>
                            <!-- TODO: progress bar -->
                            <!-- <v-list-tile-sub-title><v-progress-linear color="green" v-model="value" :active="show" :indeterminate="query" :query="true"></v-progress-linear></v-list-tile-sub-title> -->
                        </v-list-tile-content>
    
                        <!-- <v-list-tile-action>
                            <v-icon>chat</v-icon>
                        </v-list-tile-action> -->
                    </v-list-tile>
    
                    <v-divider inset></v-divider>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">fas fa-wallet</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Wallet</v-list-tile-title>
                            <v-list-tile-sub-title>500 coins</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-btn router :to="send_link">
                            <v-icon color="green">send</v-icon>
                        </v-btn>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    import { signalingServer } from '../../util/signalingServer';
    import { fileReceive, fileSend } from '../../util/webRTCModule'
    export default {
        name: 'storage-home-view',
        data: () => ({
            send_link: '/send-wallet'
        }),
        mounted () {
            //Storage Init
            this.$electron.ipcRenderer.send('storageInit');
            this.$electron.ipcRenderer.send('waitCollector');

            //Signaling Server On
            signalingServer();

            //Wait File Request Event
            this.$electron.ipcRenderer.on('collectorPid', (event, cPid) => { fileReceive(cPid) });
            this.$electron.ipcRenderer.on('analyzerPid', (event, aPid) => { fileSend(aPid) });
        },
        methods: {
            
        }
    }
</script>
