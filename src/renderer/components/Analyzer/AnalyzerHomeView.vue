<template>
    <div>
        <v-layout>
            <v-flex xs12>
                <div style="padding-top: 10px;"></div>

                <v-card>
                    <v-container>
                        <v-data-table v-model="selected" :headers="headers" :items="files" :pagination.sync="pagination"
                            select-all item-key="filename" class="elevation-1">
                            <template slot="headers" slot-scope="props">
                                <tr>
                                    &nbsp;
                                    <th v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                                        @click="changeSort(header.value)">
                                        <v-icon small>arrow_upward</v-icon>
                                        {{ header.text }}
                                    </th>
                                </tr>
                            </template>
                            <template slot="items" slot-scope="props">
                                <tr :active="props.selected" @click="props.selected = !props.selected">
                                    <td>
                                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
                                    </td>
                                    <td class="text-xs-right">{{ props.item.filename }}</td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-container>
                </v-card>
            </v-flex>

            <v-flex xs3 style="margin-left: 10px;">
                <v-btn style ="margin-top: 20px;" class="btn success" @click="getDownFileList">Download</v-btn>
                <v-btn class="btn red" @click="deleteFile">Delete</v-btn>
                <v-btn class="btn red" @click="deleteAllFile">Delete All</v-btn>
            </v-flex>
        </v-layout>
        <br>
        <v-flex>
            <v-card>
                <v-container>
                    <v-layout>
                        <v-flex xs12>
                            <v-text-field prepend-icon="attach_file" single-line v-model="storagePath" label="Select Storage Path"
                                @click.native="onFocus" ref="fileTextField"></v-text-field>
                            <input type="file" :multiple="false" ref="fileInput" @change="onFileChange" webkitdirectory
                                directory>
                        </v-flex>
                        <v-flex xs2>
                            <v-btn style="width: 50px;" @click="save" class="success">Save</v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-flex>
        <refresh-view :model="refresh" message="Saving data.."></refresh-view>
    </div>

</template>

<script>
    import RefreshView from '../RefreshView'
    export default {
        name: 'analyzer-home-view',
        data: () => ({
            storagePath: '',
            refresh: false,
            pagination: {},
            selected: [],
            headers: [{
                text: 'filename',
                align: 'right',
                value: 'filename'
            }],
            files: []
        }),
        components: {
            RefreshView
        },
        methods: {
            getDownFileList() {
                ipcRenderer.send('requestUnknownFile-tracker');
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
                        this.storagePath = [...files].map(file => file.path).join(', ');
                    } else {
                        this.storagePath = null;
                    }
                } else {
                    this.storagePath = $event.target.value.split('\\').pop();
                }
                this.$emit('input', this.storagePath);
                this.$emit('formData', form);
            },
            save() {
                storage.set('analyzer', {
                    path: this.storagePath
                })
                this.refresh = true
            },
            deleteFile() {
                var fs = require('fs');
                console.log(this.selected);
                for (var i = 0; i < this.selected.length; i++) {
                    fs.unlink(this.storagePath + '/' + this.selected[i].filename, function (err) { 
                        if (err) throw err; 
                        console.log('successfully deleted'); 
                    });
                }
            },
            deleteAllFile() {
                var fs = require('fs');
                var fileArray = fs.readdirSync(this.storagePath);
                for (var i = 0; i < fileArray.length; i++) {
                    fs.unlink(this.storagePath + '/' + fileArray[i], function (err) { 
                        if (err) throw err; 
                        console.log('successfully deleted'); 
                    });
                }
            },
            toggleAll() {
                if (this.selected.length) this.selected = []
                else this.selected = this.files.slice()
            },
            changeSort(column) {
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending
                } else {
                    this.pagination.sortBy = column
                    this.pagination.descending = false
                }
            }
        },
        mounted() {
            const vm = this;
            storage.has('analyzer', function (err, hasKey) {
                if (hasKey) {
                    storage.get('analyzer', function (err, analyzer) {
                        vm.storagePath = analyzer.path
                        console.log(analyzer.path);
                        var fs = require('fs');
                        var fileArray = fs.readdirSync(analyzer.path);
                        console.log(vm.files);
                        for(var i = 0; i < fileArray.length; i++) {
                            vm.files.push({value: false, filename: fileArray[i]});
                        }
                    })
                }
            }),
            this.$electron.ipcRenderer.on('requestUnknownFile-storage', (event, tracker, aPid) => {
                console.log(tracker);
                let yourConn;
                let dataChannel;
                //our username  
                var name = aPid; 
                var connectedUser; 

                //connecting to our signaling server 
                var conn = new WebSocket(tracker); 

                let malwareMeta;
                let pieceCnt = 0;

                //signaling server open
                conn.onopen = function () { 
                    console.log("Connected to the signaling server");
                    send({ 
                        type: "login", 
                        name: name
                    });
                };

                //signaling server message handle
                conn.onmessage = function (msg) { 
                    console.log("Got message", msg.data); 
                    var data = JSON.parse(msg.data); 
                    
                    switch(data.type) { 
                        case "login": 
                            handleLogin(data.success); 
                            break; 
                        //when somebody wants to call us 
                        case "offer": 
                            handleOffer(data.offer, data.name); 
                            break; 
                        case "answer": 
                            handleAnswer(data.answer); 
                            break; 
                        //when a remote peer sends an ice candidate to us 
                        case "candidate": 
                            handleCandidate(data.candidate); 
                            break; 
                        case "leave": 
                            handleLeave(); 
                            break; 
                        default: 
                            break; 
                    } 
                };

                //signaling server conn error
                conn.onerror = function (err) { 
                    console.log("Got error", err); 
                }; 

                //message send to signaling server
                function send(message) { 
                    //attach the other peer username to our messages
                    if (connectedUser) { 
                        message.name = connectedUser; 
                    } 
                    conn.send(JSON.stringify(message)); 
                };

                function handleLogin(success) { 
                    if (success === false) {
                        console.log("Ooops...try a different username");
                        // process.exit(1); 
                    } else {
                        //using Google public stun server 
                        var configuration = { 
                            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
                        }; 
                            
                        yourConn = new RTCPeerConnection(configuration); 

                        // Setup ice handling 
                        yourConn.onicecandidate = function (event) { 
                            if (event.candidate) { 
                                send({ 
                                type: "candidate", 
                                candidate: event.candidate 
                                }); 
                            } 
                        }; 
                        
                        //creating data channel 
                        console.log(yourConn.signalingState);

                        dataChannel = yourConn.createDataChannel("channel1"); 
                        
                        dataChannel.onerror = function (error) { 
                            console.log("Ooops...error:", error); 
                        }; 
                        yourConn.ondatachannel = function(event) {
                            event.channel.onopen = function() {
                                console.log('Data channel is open and ready to be used.');         
                            };
                                
                            event.channel.onmessage = function(event){
                                // console.log(event.data);
                                if(JSON.parse(event.data).type == 'meta') {
                                    malwareMeta = JSON.parse(event.data);
                                    ipcRenderer.send('receiveUnknownSample', malwareMeta);
                                    console.log('received malmeta', malwareMeta);
                                }
                                else {
                                    ipcRenderer.send('receiveUnknownSample', JSON.parse(event.data));
                                    console.log('received data', JSON.parse(event.data));
                                    console.log('total piece', malwareMeta.pieces);
                                    console.log('now num', JSON.parse(event.data).pieceNum)
                                    if(malwareMeta.pieces == JSON.parse(event.data).pieceNum) {
                                        send({ 
                                            type: "leave",
                                            name: name 
                                        }); 
                                        // pieceCnt = 0;
                                        dataChannel.close();
                                        console.log(name, "leave");
                                    }
                                }
                            };
                        };
                    
                        //when we receive a message from the other peer, display it on the screen 
                        /*
                        dataChannel.onmessage = function (event) { 
                            chatArea.innerHTML += connectedUser + ": " + event.data + "<br />"; 
                            ipcRenderer.send('receiveFile', JSON.parse(event.data));
                        }; 
                            */
                        dataChannel.onclose = function () { 
                            console.log("data channel is closed"); 
                        };
                    } 
                };

                function handleOffer(offer, name) { 
                    connectedUser = name; 
                    yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
                        
                    //create an answer to an offer 
                    yourConn.createAnswer(function (answer) { 
                        yourConn.setLocalDescription(answer); 
                        send({ 
                            type: "answer", 
                            answer: answer 
                        }); 
                    }, function (error) { 
                        console.log("Error when creating an answer"); 
                    });
                };
                // function sendFile() {
                //     var unknownSample = new Object();
                //     var unknownSampleMeta = new Object();
                //     // sendProgress.value = '40';
                //     ipcRenderer.send('unknownRequest');
                //     ipcRenderer.on('unknownRequest-meta', (event, type, filename, size, pieces) => {
                //         unknownSampleMeta.type = type;
                //         unknownSampleMeta.filename = filename;
                //         unknownSampleMeta.size = size;
                //         unknownSampleMeta.pieces = pieces;
                //         sendJSON(JSON.stringify(unknownSampleMeta));
                //         console.log(JSON.stringify(unknownSampleMeta));
                //     });
                //     ipcRenderer.on('unknownRequest-reply', (event, pieceNum, binary) => {
                //         unknownSample.pieceNum = pieceNum;
                //         unknownSample.binary = binary;
                //         sendJSON(JSON.stringify(unknownSample));
                //         console.log(JSON.stringify(unknownSample));
                //     });
                //     // sendProgress.value = '70';
                // };
                function handleAnswer(answer) { 
                    yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
                };
                
                //when we got an ice candidate from a remote user 
                function handleCandidate(candidate) { 
                    yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
                };
                function handleLeave() { 
                    connectedUser = null; 
                    // yourConn.close(); 
                    yourConn.onicecandidate = null; 
                    return;
                };
            })
        },
        watch: {
            refresh(val) {
                if (!val) return

                setTimeout(() => {
                    this.refresh = false;
                    window.location.reload()
                    // this.refreshing();
                }, 2000);
            },
        }
    }
</script>

<style>
    .btn {
        width: 120px;
        height: 60px;
        font-size: 15px;
    }

    input[type=file] {
        position: absolute;
        left: -99999px;
    }
</style>