<template>
    <v-container>
        <v-stepper v-model="step">
            <v-stepper-header>
                <v-stepper-step :complete="step > 1" step="1">Node Selection</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="step > 2" step="2">Other Setting</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="3">Recheck</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-card class="mb-5" height="200px">
                        <v-layout>
                            <v-container>
                                <v-flex xs12>
                                    <v-combobox v-model="node" :items="items" label="select node"></v-combobox>
                                </v-flex>
                            </v-container>
                        </v-layout>
                    </v-card>

                    <v-btn color="primary" @click="step = 2">
                        Continue
                    </v-btn>

                    <!-- <v-btn flat>Back</v-btn> -->
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-card class="mb-5" height="250px">
                        <v-layout>
                            <v-container>
                                <v-flex v-if="mode == 'collector'" xs12>
                                    <v-text-field prepend-icon="attach_file" single-line v-model="vaccinePath" label="vaccine path"
                                        @click.native="onFocus" ref="fileTextField"></v-text-field>
                                    <input type="file" :multiple="false" ref="fileInput"
                                        @change="onFileChange" webkitdirectory directory>
                                </v-flex>
                                <v-flex v-if="mode == 'storage'" xs12>
                                    <v-text-field prepend-icon="link" v-model="storageSize" label="storage size"></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field prepend-icon="vpn_key" v-model="pk" label="public key" style="font-size:13px"></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field prepend-icon="vpn_key" v-model="sk" label="secret key" style="font-size:13px"></v-text-field>
                                </v-flex>
                            </v-container>
                        </v-layout>
                    </v-card>

                    <v-btn color="primary" @click="step = 3">
                        Continue
                    </v-btn>

                    <v-btn @click="step = 1" flat>Back</v-btn>
                </v-stepper-content>

                <v-stepper-content step="3">
                    <v-card class="mb-5" height="200px">
                        <v-layout>
                            <v-container>
                                <v-flex>
                                    <h2>Your Info</h2>
                                </v-flex>
                                <v-flex xs12>
                                    <ul>
                                        <li>node: {{ mode }}</li>
                                        <li v-if="node === 'collector'">vaccine path: {{ vaccinePath }}</li>
                                        <li v-if="node === 'storage'">storage size: {{ storageSize }}</li>
                                        <li>public key: {{ pk }}</li>
                                        <li>secret key: {{ sk }}</li>
                                    </ul>
                                </v-flex>
                            </v-container>
                        </v-layout>
                    </v-card>

                    <v-btn color="primary" @click="save">
                        Continue
                    </v-btn>

                    <v-btn @click="step = 2" flat>Back</v-btn>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
        <refresh-view :model="refresh"></refresh-view>
    </v-container>
</template>

<script>
    import RefreshView from './RefreshView';
    import secp256k1 from 'secp256k1';
    import bs58check from 'bs58check';
    import { randomBytes } from 'crypto';
    export default {
        data() {
            return {
                step: 0,
                node: '',
                mode: '',
                disabled: false,
                vaccinePath: '',
                storageSize: 0,
                pk: '',
                sk: '',
                refresh: false,
                items: [
                    'Collector',
                    'Analyzer',
                    'Storage'
                ],
                publicKey: '',
                secretKey: ''
            }
        },
        components: {
            RefreshView
        },
        methods: {
            getPrivKey() {
                let privKey;
                do {
                    privKey = randomBytes(32)
                } while (!secp256k1.privateKeyVerify(privKey))
                return privKey;
            },
            getPubKey (privKey) {
                let pubKey = secp256k1.publicKeyCreate(privKey);
                return pubKey;
            },
            getFormData(files) {
                const data = new FormData();
                [...files].forEach(file => {
                    data.append('data', file, file.path); // currently only one file at a time
                });
                return data;
            },
            onFocus() {
                if (!this.disabled) {
                    debugger;
                    this.$refs.fileInput.click();
                }
            },
            onFileChange($event) {
                const files = $event.target.files || $event.dataTransfer.files;
                const form = this.getFormData(files);
                if (files) {
                    if (files.length > 0) {
                        this.vaccinePath = [...files].map(file => file.path).join(', ');
                    } else {
                        this.vaccinePath = null;
                    }
                } else {
                    this.vaccinePath = $event.target.value.split('\\').pop();
                }
                this.$emit('input', this.vaccinePath);
                this.$emit('formData', form);
            },
            save() {
                storage.set('mode', {
                    mode: this.mode
                })
                storage.set('vaccine', {
                    path: this.vaccinePath
                })
                storage.set('account', {
                    pk: this.pk,
                    sk: this.sk
                })
                storage.set('storage', {
                    size: this.size
                })
                storage.set('setting', {
                    setting: true
                })
                this.refresh = true
            },
            refreshing: function () {
                ipcRenderer.send('reload', 'ping');
                this.$router.push('/')
            }
        },
        mounted () {
            var sk = this.getPrivKey();
            var pk = this.getPubKey(sk);
            this.sk = sk.toString('hex');
            this.pk = pk.toString('hex');
            console.log(typeof(this.secretKey), this.secretKey);
            console.log(this.publicKey);
        },
        watch: {
            node(val) {
                if (!val) return
                if (val === 'Collector')
                    this.mode = 'collector'
                if (val === 'Analyzer')
                    this.mode = 'analyzer'
                if (val === 'Storage')
                    this.mode = 'storage'
            },
            step(val) {
                if (!val) return
                if (val === 2 && this.node === '')
                    this.step = 1

                if (val === 3 && (this.pk === '' || this.sk === ''))
                    this.step = 2

                if (val === 3 && this.node === 'collector' && this.vaccinePath === '')
                    this.step = 2

                if (val === 3 && this.node === 'storage' && this.storageSize === 0)
                    this.step = 2

            },
            refresh(val) {
                if (!val) return

                setTimeout(() => {
                    this.refresh = false;
                    this.refreshing()
                }, 3000);
            },
        }
    }
</script>

<style scoped>
    input[type=file] {
        position: absolute;
        left: -99999px;
    }
</style>