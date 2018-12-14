<template>
    <v-layout>
        <v-flex xs12>
            <h1>Wallet</h1>
            <div style="float: left; width:50%; padding:10px">
                <h4>Recent Transaction</h4>
                <v-flex>
                    <table class='tbl-scanResult'>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>In/Out</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, i) in txs" :key="i">
                                <td><span color="red">{{ item.date }}</span></td>
                                <td><span color="red">{{ item.inout }}</span></td>
                                <td><span color="red">{{ item.value }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </v-flex>
            </div>
            <div style="float:right; width:50%; padding:10px;">
                <v-flex>
                    <v-card>
                        <v-container style="height:120px">
                            <v-flex>
                                <v-card-title style="width:130px; float: left">
                                    Balance
                                </v-card-title>
                                <v-card-text style="width: 100px; float: right">
                                    asd
                                </v-card-text>
                            </v-flex>
                            <v-flex>
                                <v-card-title style="width:130px; float: left">
                                    My Address
                                </v-card-title>
                                <v-card-text style="width: 100px; float: right">
                                    asd
                                </v-card-text>
                            </v-flex>
                        </v-container>
                    </v-card>
                </v-flex>
                <v-flex>
                    <v-card>
                        <v-container style="height:260px">
                            <v-card-title>
                                <h3>Send Coin</h3>
                            </v-card-title>
                            <v-text-field label="Send To"></v-text-field>
                            <v-text-field label="Value"></v-text-field>
                            <v-btn style="float:right" @click="getMyBalance">
                                <v-icon color="indigo">send</v-icon>
                            </v-btn>
                        </v-container>
                    </v-card>
                </v-flex>
           </div>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'wallet-view',
        data: () => ({
            send_link: '/send-wallet',
            txs: [{
                date: '1/1',
                inout: 'out',
                value: 5                
            }]
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
        text-shadow: 0 1px 0 #000;	
    }

    .tbl-scanResult td {
        border-right: 1px solid #fff;
        border-left: 1px solid #e8e8e8;
        border-top: 1px solid #fff;
        border-bottom: 1px solid #e8e8e8;
        padding-left: 15px;
        color: #333;
        transition: all 300ms;
    }
</style>
