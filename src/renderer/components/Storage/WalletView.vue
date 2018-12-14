<template>
    
    <div style="width: 100%">
        <v-container fluid grid-list-md>
            <h1>Wallet</h1>

            <v-layout row wrap>
                <v-flex lg3 sm7 xs12>
                    asd
                </v-flex>
                <v-flex lg3 sm5 xs12>
                    <v-btn @click="getMyBalance">
                        <v-icon color="indigo">send</v-icon>
                    </v-btn>
                </v-flex>
                
            </v-layout>
        </v-container>
    </div>

</template>

<script>
    export default {
        name: 'wallet-view',
        data: () => ({
            send_link: '/send-wallet'
        }),
        methods : {
            getMyBalance() {
                this.$electron.ipcRenderer.send('getMyBalance');
            }
        }
    }
</script>


<style>
    .tbl-scanResult {
        background: #eee;
        border-collapse: separate;
        box-shadow: inset 0 1px 0 #fff;
        font-size: 12px;
        line-height: 24px;
        margin: 30px auto;
        text-align: left;
        width: 100%;
    }	

    .tbl-scanResult th {
        background: #444;
        border-left: 1px solid #555;
        border-right: 1px solid #777;
        border-top: 1px solid #555;
        border-bottom: 1px solid #333;
        box-shadow: inset 0 1px 0 #999;
        color: #fff;
        font-weight: bold;
        padding-left: 15px;
        position: relative;
        text-shadow: 0 1px 0 #000;	
    }

    .tbl-scanResult td {
        border-right: 1px solid #fff;
        border-left: 1px solid #e8e8e8;
        border-top: 1px solid #fff;
        border-bottom: 1px solid #e8e8e8;
        position: relative;
        padding-left: 15px;
        color: #333;
        transition: all 300ms;
    }
</style>
