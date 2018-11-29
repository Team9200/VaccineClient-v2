<template>
    <v-layout>
        <v-flex xs12>
            <h1>Setting</h1>
            <v-card>
                <v-list two-line>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">settings</v-icon>
                        </v-list-tile-action>

                        <v-list-tile-content>
                            <v-list-tile-title>Select Node</v-list-tile-title>
                            <v-list-tile-sub-title>You can select node!</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-dialog v-model="dialog" persistent scrollable max-width="300px">
                            <v-btn slot="activator" color="green" dark>Select</v-btn>
                            <v-card>
                                <v-card-title>Select Node (Current is "{{ mode }}")</v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="height: 300px;">
                                    <v-radio-group v-model="mode" column>
                                        <v-radio color="green" label="Collector" value="collector"></v-radio>
                                        <v-radio color="green" label="Analyzer" value="analyzer"></v-radio>
                                        <v-radio color="green" label="Storage" value="storage"></v-radio>
                                    </v-radio-group>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-btn color="green darken-1" flat @click="dialog = false">Close</v-btn>
                                    <v-btn color="green darken-1" flat @click="clickSave">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-list-tile>
                </v-list>
            </v-card>

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
                            <v-list-tile-title>Select Vaccine Engine Path</v-list-tile-title>
                            <v-list-tile-sub-title>You must be set vaccine path!</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-dialog v-model="dialog2" persistent scrollable max-width="300px">
                            <v-btn slot="activator" color="green" dark>Select</v-btn>
                            <v-card>
                                <v-card-title>Vaccine Engine Path</v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="height: 300px;">
                                    <!-- <input type="file" v-model="path" > -->
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-btn color="green darken-1" flat @click="dialog2 = false">Close</v-btn>
                                    <v-btn color="green darken-1" flat @click="clickSave">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'setting-view',
        data() {
            return {
                mode: '',
                path: '',
                dialog: false,
                dialog2: false
            }
        },
        methods: {
            setMode: function () {
                ipcRenderer.send('setMode', this.mode);
                // this.dialog = false;
            },
            clickSave: function () {
                this.dialog = false;
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
            mode: function () {
                this.setMode();
            }
        }
    }
</script>

<style>

</style>