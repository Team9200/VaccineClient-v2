<template>
    <div style="width: 100%">
        <v-container fluid grid-list-md>
            <!-- 이전 뷰 -->
            <!-- <v-layout row wrap>
                <v-flex lg3 sm6 xs12>
                    <status-component title="100+" sub-title="Warning" color="yellow darken-3">
                    </status-component>
                </v-flex>
                <v-flex lg3 sm6 xs12>
                    <status-component title="150+" sub-title="Danger" color="red">
                    </status-component>
                </v-flex>
                
            </v-layout>

            <v-layout row wrap>
               <v-flex d-flex xs12 sm6>
                    <v-btn style="height: 206px; font-size: 15px;" router :to="items[0].to" block color="green" dark>{{
                        items[0].title }}</v-btn>
                </v-flex>
            </v-layout> -->

            <v-layout row wrap>
                <v-flex lg3 sm6 xs12>
                    <v-btn style="height: 180px; font-size: 15px; border-radius: 60px; border: 5px solid #5B7F29" router :to="items[0].to" block color="#8dc540" dark>
                        <v-icon class="mainIcon" x-large>security</v-icon><span class="menuText">{{ items[0].title }}</span></v-btn>
                </v-flex>
                <v-flex lg3 sm6 xs12>
                    <v-dialog style="width: 100%;" v-model="dialog">
                        <v-btn style="width: 100%; height: 180px; font-size: 15px; border-radius: 60px; border: 5px solid #03787F" @click="feedback" block color="#05b7c3" slot="activator">
                            <v-icon class="mainIcon" x-large>add_comment</v-icon><span class="menuText">Feedback</span>
                        </v-btn>

                        <v-card>
                            <v-card-title class="headline">
                                Feedback
                            </v-card-title>

                            <v-card-text v-text="feedbackLink">
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green" @click='dialog = false' flat >
                                    close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                </v-flex>

            </v-layout>

            <v-layout row wrap>
               <v-flex d-flex xs12 sm4>
                    <v-btn style="height: 180px; font-size: 15px; border-radius: 30px; border: 5px solid #3B2B40;" router :to="items[2].to" block color="#77567F" dark>
                        <v-icon class="mainIcon" x-large>history</v-icon><span class="menuText">{{ items[2].title }}</span></v-btn>
                </v-flex>
                <v-flex d-flex xs12 sm4>
                    <v-btn style="height: 180px; font-size: 15px; border-radius: 30px; border: 5px solid #7F590D;" router :to="items[1].to" block color="#f4ab18" dark>
                        <v-icon class="mainIcon" x-large>gavel</v-icon><span class="menuText">{{ items[1].title }}</span></v-btn>
                </v-flex>
                <v-flex d-flex xs12 sm4>
                    <v-btn style="height: 180px; font-size: 15px; border-radius: 30px; border: 5px solid #7F590D;" router :to="items[3].to" block color="#f6782d" dark>
                        <v-icon class="mainIcon" x-large>account_balance_wallet</v-icon><span class="menuText">{{ items[3].title }}</span></v-btn>
                </v-flex>
            </v-layout>

        </v-container>
    </div>
</template>

<script>
    import StatusComponent from '../StatusComponent'
    export default {
        name: 'collector-home-view',
        components: {
            StatusComponent
        },
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
                },
                {
                    title: 'Wallet',
                    to: '/wallet'
                }
            ],
            feedbackLink: '',
            dialog:''
        }),
        methods: {
            feedback() {
                this.$electron.ipcRenderer.send('getFeedback');
                this.$electron.ipcRenderer.on('feedbackData', (event, message) => {
                    console.log(message);
                    console.log(message.permlink);
                    this.feedbackLink = message;
                });
            }
        }
    }
</script>
<style>
    .mainIcon {
        position: absolute;
        top: -30px;
    }
    .menuText {
        position: absolute;
        top: 10px;
    }
</style>
