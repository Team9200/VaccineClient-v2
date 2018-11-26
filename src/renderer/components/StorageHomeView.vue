<template>
    <v-layout row>
        <v-flex xs12 sm6 offset-sm3>
            <h1>Storage Home</h1>
            <v-card>
                <v-list two-line>
                    <v-list-tile >
                        <v-list-tile-action>
                            <v-icon color="indigo">folder</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Storage Used</v-list-tile-title>
                            <v-list-tile-sub-title>55%</v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
    
                    <v-list-tile >
                        <v-list-tile-action></v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Response Rate</v-list-tile-title>
                            <v-list-tile-sub-title>90%</v-list-tile-sub-title>
                        </v-list-tile-content>
    
                        <!-- <v-list-tile-action>
                            <v-icon>chat</v-icon>
                        </v-list-tile-action> -->
                    </v-list-tile>
    
                    <v-divider inset></v-divider>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="indigo">mail</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Wallet</v-list-tile-title>
                            <v-list-tile-sub-title>500 coins</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-btn router :to="send_link">
                            <v-icon color="indigo">send</v-icon>
                        </v-btn>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'storage-home-view',
        data: () => ({
            send_link: '/send-wallet'
        })
    }
</script>
