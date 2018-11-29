<template>
    <v-layout row>
        <v-flex xs12>
            <h1>Wallet</h1>
            <v-card>
                <v-list two-line>
                    <v-list-tile >
                        <!-- <v-list-tile-action>
                            <v-icon color="indigo">mail</v-icon>
                        </v-list-tile-action> -->
    
                        <v-list-tile-content>
                            <v-list-tile-title>Address</v-list-tile-title>
                            <v-list-tile-sub-title>
                                4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
    
                    <v-divider inset></v-divider>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="indigo">money</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Amount</v-list-tile-title>
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
        name: 'wallet-view',
        data: () => ({
            send_link: '/send-wallet'
        })
    }
</script>
