<template>
    <v-layout>
        <v-flex xs12>
            <v-layout>
                <h1>Setting</h1>
                <!-- <v-spacer></v-spacer>
                <v-btn color="green">Save</v-btn> -->
            </v-layout>

            <v-card>
                <v-list two-line>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">info</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Your Current Node</v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{ nodename }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>


                    </v-list-tile>
                </v-list>
            </v-card>

            <!-- <v-card>
                <v-list two-line>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">settings</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Select Node</v-list-tile-title>
                            <v-list-tile-sub-title>You can select node!</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-dialog v-model="dialog.node" persistent scrollable max-width="300px">
                            <v-btn slot="activator" color="green" dark>Select</v-btn>
                            <v-card>
                                <v-card-title>Select Node</v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="height: 190px;">
                                    <v-radio-group v-model="mode" column>
                                        <v-radio color="green" label="Collector" value="collector"></v-radio>
                                        <v-radio color="green" label="Analyzer" value="analyzer"></v-radio>
                                        <v-radio color="green" label="Storage" value="storage"></v-radio>
                                    </v-radio-group>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-btn color="green darken-1" flat @click="dialog.node = false">Close</v-btn>
                                    <v-btn color="green darken-1" flat @click="clickSave">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-list-tile>
                </v-list>
            </v-card> -->

            <v-card>
                <v-list two-line>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">settings</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Your Vaccine path</v-list-tile-title>
                            <v-list-tile-sub-title>{{ path }}</v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card>

            <!-- TODO: Add vaccine path dialog input -->
            <v-card>
                <v-list two-line>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">settings</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Select Vaccine path</v-list-tile-title>
                            <v-list-tile-sub-title>You must be set vaccine path!</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-dialog v-model="dialog.vaccine" persistent scrollable max-width="500px">
                            <v-btn slot="activator" color="green" dark>Select</v-btn>
                            <v-card>
                                <v-card-title>Set Vaccine path</v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="height: 200px;">
                                    <v-text-field v-model="path" label="Input vaccine path" prepend-icon='attach_file'></v-text-field>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-btn color="green darken-1" flat @click="dialog.vaccine = false">Close</v-btn>
                                    <v-btn color="green darken-1" flat @click="clickVaccineSave">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-list-tile>
                </v-list>
            </v-card>

        </v-flex>
        <refresh-view :model="refresh" :message="refreshString"></refresh-view>
    </v-layout>
</template>

<script>
    import RefreshView from './RefreshView';
    export default {
        name: 'setting-view',
        data() {
            return {
                mode: '',
                nodename: '',
                path: '',
                dialog: {
                    node: false,
                    vaccine: false
                },
                refresh: false,
                refreshString: 'Saving data..'
            }
        },
        components: {
            RefreshView
        },
        methods: {
            setMode: function () {
                ipcRenderer.send('setMode', this.mode);
            },
            setVaccinePath: function () {
                ipcRenderer.send('setVaccinePath', this.path);
            },
            clickSave: function () {
                this.setMode();
                this.dialog.node = false;
                this.refresh = true;
            },
            clickVaccineSave: function () {
                this.setVaccinePath();
                this.dialog.vaccine = false;
                this.refresh = true;
            },
            refreshing: function () {
                ipcRenderer.send('reload', 'ping');
            }
        },
        mounted() {
            const vm = this;
            storage.has('mode', function (err, hasKey) {
                if (err) throw err;
                if (hasKey) {
                    storage.get('mode', function (err, data) {
                        // console.log(data.mode);
                        if (err) throw err;
                        vm.mode = data.mode;
                    });
                }
            });

            storage.has('vaccine', function (err, hasKey) {
                if (err) throw err;
                if (hasKey) {
                    storage.get('vaccine', function (err, vaccine) {
                        if (err) throw err;
                        vm.path = vaccine.path;
                    });
                }
            });
        },
        watch: {
            refresh(val) {
                if (!val) return

                setTimeout(() => {
                    this.refresh = false;
                    this.refreshing();
                }, 3000);
            },
            mode(val) {
                switch (val) {
                    case 'collector':
                        this.nodename = 'Collector Node';
                        break;
                    case 'analyzer':
                        this.nodename = 'Analyzer Node';
                        break;
                    case 'storage':
                        this.nodename = 'Storage Node';
                        break;
                    default:
                        break;
                }
            }
        }
    }
</script>

<style>

</style>