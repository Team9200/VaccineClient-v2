<template>
    <v-layout>
        <v-flex xs12>
            <!-- <h1>Vaccine</h1> -->
            <!-- scan -->

            <v-card>
                <v-card-title primary-title>
                    <div>
                        <input type="file" @change="pathIn($event)" directory webkitdirectory>
                    </div>
                </v-card-title>

                <v-card-actions>
                    <v-dialog v-model="dialog" width="700">
                        <v-btn @click="scanStart()" slot="activator" color="green" dark>
                            Detect
                        </v-btn>

                        <v-card>
                            <v-card-title class="headline">
                                Send Report
                            </v-card-title>

                            <v-card-text>
                                * 검사 결과
                                <p v-text="scannedPaths"></p>
                                검사 결과를 보내실 겁니까?
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green" flat @click="dialog = false">
                                    I accept
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card>

            <!-- quarantine -->
            <!-- <v-card>
                <v-card-actions>
                    <v-dialog v-model="dialog2" width="500">
                        <v-btn @click="quarantine()" slot="activator" color="green" dark>
                            quarantine
                        </v-btn>
                        <v-card>
                            <v-card-title class="headline">
                                quarantine list
                            </v-card-title>

                            <v-card-text>
                                <p v-text="quarantineFileList"></p> 
                            </v-card-text>

                            <v-divider></v-divider>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card>

            <v-card>
                <v-card-actions>
                    <v-dialog v-model="dialog3" width="500">
                        <v-btn @click="getLog()" slot="activator" color="green" dark>
                            Log
                        </v-btn>
                        <v-card>
                            <v-card-title class="headline">
                                Log
                            </v-card-title>

                            <v-card-text>
                                <p v-text="log"></p> 
                            </v-card-text>

                            <v-divider></v-divider>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card> -->

        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'vaccine-view',
        data: () => {
            return {
                dialog: '',
                dialog2: '',
                dialog3: '',
                scanPath: new String(),
                scannedPaths: new Array(),
                // quarantineFileList: new Array(),
                // log: new Array(),
                vaccinePath: ''
            }
        },
        methods: {
            pathIn(e) {
                // console.log('Path in');
                this.scanPath = e.target.files[0].path;
                // console.log(this.scanPath)
            },
            scanStart() {
                // console.log('scan clicked', this.scanPath);
                ipcRenderer.send('scanStart', {
                    path: this.scanPath,
                    vaccinePath: this.vaccinePath
                });
            },
            // quarantine() {
            //     ipcRenderer.send('openQuarantine');
            // },
            // getLog() {
            //     ipcRenderer.send('getLog');
            // }
        },
        mounted() {
            const vm = this;
            this.$electron.ipcRenderer.on('scanResult', (event, message) => {
                const scanResult = JSON.parse(message);
                console.log(typeof (scanResult), scanResult);
                this.scannedPaths = scanResult.ScannedPaths;
                console.log(this.scannedPaths);
            });
            // this.$electron.ipcRenderer.on('quarantineFileList', (event, message) => {
            //     const quarantineFileList = message;
            //     this.quarantineFileList = quarantineFileList;
            //     console.log(this.quarantineFileList);
            // });
            // this.$electron.ipcRenderer.on('log', (event, message) => {
            //     const log = message;
            //     this.log = log;
            //     console.log(log);
            // });
            storage.has('vaccine', function (err, hasKey) {
                if (err) throw err;
                if (hasKey) {
                    storage.get('vaccine', function (err, data) {
                        if (err) throw err;
                        vm.vaccinePath = data.path;
                    });
                }
            });
        }
    }
</script>

<style>

</style>