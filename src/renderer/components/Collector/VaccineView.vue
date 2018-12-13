<template>
    <v-layout>
        <v-flex xs12>
            <!-- <h1>Vaccine</h1> -->
            <!-- scan -->
            <!-- 이전 뷰 -->
            <!-- <v-card>
                <v-card-title primary-title>
                    <div>
                        <input type="file" @change="pathIn($event)" directory webkitdirectory>
                    </div>
                </v-card-title>

                <v-card-actions>
                    <v-dialog v-model="dialog" width="700">
                        <v-btn @click="scanStart" slot="activator" color="green" dark>  
                            Detect
                        </v-btn>

                        <v-card>
                            <v-card-title class="headline">
                                Send Report
                            </v-card-title>

                            <v-card-text>
                                    <p v-text="scannedPaths"></p>
                                    검사 결과를 보내실 겁니까?
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green" flat @click="transferRequestToTracker">
                                    I accept
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card> -->

            <v-card>
                <v-card-title primary-title>
                    <div>
                        <input type="file" @change="pathIn($event)" directory webkitdirectory>
                    </div>
                    <v-btn @click="scanStart" slot="activator" color="green" dark>  
                            Detect
                    </v-btn>
                </v-card-title>
            </v-card>
            <v-card>
                <v-dialog v-model="dialog" width="700">
                    <v-btn  slot="activator" color="green" dark>  
                        전송
                    </v-btn>

                    <v-card>
                        <v-card-title class="headline">
                            Send Report
                        </v-card-title>

                        <v-card-text>
                                검사 결과를 보내실 겁니까?
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="green" flat @click="transferRequestToTracker">
                                I accept
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <table class='tbl-scanResult'>
                    <thead>
                        <tr>
                            <th>Infected List</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in InfectedPaths" :key="i">
                            <td><span color="red">{{ item }}</span></td>
                        </tr>
                    </tbody>
                </table>
                <table class='tbl-scanResult'>
                    <thead>
                        <tr>
                            <th>Scanned List (Unknown)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in scannedPaths" :key="i">
                            <td>{{ item }}</td>
                        </tr>
                    </tbody>
                </table>
            </v-card>


        </v-flex>
    </v-layout>
</template>

<script>
    // var callId = require('random-uuid-v4');
    export default {
        name: 'vaccine-view',
        data: () => {
            return {
                dialog: '',
                dialog2: '',
                dialog3: '',
                scanPath: new String(),
                scannedPaths: [''],
                infectedPaths: ['']
                // vaccinePath: '',
            }
        },
        methods: {
            pathIn(e) {
                this.scanPath = e.target.files[0].path;
            },
            scanStart() {
                ipcRenderer.send('scanStart', {
                    path: this.scanPath
                });
            },
            transferRequestToTracker() {
                ipcRenderer.send('transferRequestToTracker');
                ipcRenderer.on('getCPid', (event, signalingServer, cPid) => {
                    let yourConn;
                    let dataChannel;
                    //our username  
                    var name = cPid; 
                    var connectedUser; 

                    //connecting to our signaling server 
                    var conn = new WebSocket(signalingServer); 

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
                            
                            yourConn = new webkitRTCPeerConnection(configuration); 

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
                                    
                            yourConn.ondatachannel = function (event) {
                                event.channel.onopen = function() {
                                    console.log('Data channel is open and ready to be used.');         
                                    sendFile();
                                };
                                    
                                event.channel.onmessage = function(event){
                                    console.log(connectedUser + ": " + event.data);
                                    ipcRenderer.send('receiveFile', JSON.parse(event.data));
                                    ipcRenderer.on('end', (message) => {dataChannel.close()})
                                    //send({ 
                                        //type: "leave", 
                                        //name: name
                                    //});   
                                };
                            };
                        
                            //when we receive a message from the other peer, display it on the screen 
                            dataChannel.onclose = function () { 
                                // yourConn = null;
                                // dataChannel.close();
                                //our username  
                                // name = null; 
                                // connectedUser; 
                                
                                console.log("data channel is closed", dataChannel);

                                // ipcRenderer.send('refresh')
                                return;
                            };
                            sendOffer(cPid);
                        } 
                    };

                    function sendOffer (cPid) { 
                    var callToUsername = '#' + cPid;

                    if (callToUsername.length > 0) { 
                        connectedUser = callToUsername; 
                        yourConn.createOffer(function (offer) { 
                            sendSignal({ 
                                type: "offer", 
                                offer: offer 
                            }); 
                            yourConn.setLocalDescription(offer); 
                        }, function (error) { 
                            alert("Error when creating an offer"); 
                        }); 
                    }
                    };
                    function sendSignal(message) { 
                        if (connectedUser) { 
                            message.name = connectedUser; 
                        } 
                        conn.send(JSON.stringify(message)); 
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

                    function handleAnswer(answer) { 
                        yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
                    };
                    
                    //when we got an ice candidate from a remote user 
                    function handleCandidate(candidate) { 
                        yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
                    };
                    function sendFile() {
                        var Malware = new Object();
                        var malwareMeta = new Object();
                        // sendProgress.value = '40';
                        ipcRenderer.send('fileRequest');
                        ipcRenderer.on('fileRequest-meta', (event, type, filename, size, pieces) => {
                            malwareMeta.type = type;
                            malwareMeta.filename = filename;
                            malwareMeta.size = size;
                            malwareMeta.pieces = pieces;
                            bufferedSend(JSON.stringify(malwareMeta));
                            console.log(JSON.stringify(malwareMeta));
                        });
                        ipcRenderer.on('fileRequest-reply', (event, pieceNum, binary) => {
                            Malware.pieceNum = pieceNum;
                            Malware.binary = binary;
                            bufferedSend(JSON.stringify(Malware));
                            // console.log(JSON.stringify(Malware));
                            console.log('total piece', malwareMeta.pieces);
                            console.log('now num', Malware.pieceNum);
                        });
                        // sendProgress.value = '70';
                    };
                    function handleLeave() { 
                        connectedUser = null; 
                        // yourConn.close(); 
                        yourConn.onicecandidate = null; 
                        return;
                    };
                    function sendJSON(data) {
                        //yourConn.ondatachannel = function (event) {
                            //event.channel.onopen = function() { 
                                var val = data; 
                                // chatArea.innerHTML += "send JSON <br />"; 

                                dataChannel.send(val);
                            //}
                        //} 
                    };
                    var buffer = [];
                    var buffering = false;
                    var bufferSize = 0;

                    function sendJSON(data) {
                        function buffering() {
                            buffering = true;
                            setTimeout(function() {
                                buffering = false;
                                tryBuffer();
                            }, 100);
                            return false;
                        }
                        if (dataChannel.bufferedAmount > 15 * 1024 * 1024) {
                            return buffering();
                        } else {
                            try{
                                var val = data;
                                dataChannel.send(val);
                            }
                            catch(e) {
                                return buffering();
                            }
                            return true;
                        }
                    };

                    function bufferedSend(msg) {
                        if (buffering || !sendJSON(msg)) {
                            buffer.push(msg);
                            bufferSize = buffer.size;
                        }
                    }
                    
                    function tryBuffer() {
                        if (buffer.length === 0) {
                            return;
                        }

                        var msg = buffer[0];

                        if (sendJSON(msg)) {
                            buffer.shift();
                            bufferSize = buffer.length;
                            tryBuffer();
                        }
                    }
                });
            }
        },
        mounted () {
            const vm = this;
            this.$electron.ipcRenderer.on('scanResult', (event, message) => {
                const scanResult = JSON.parse(message);
                console.log(typeof(scanResult), scanResult);
                this.scannedPaths = scanResult.ScannedPaths;
                console.log(this.scannedPaths);
            });

            // this.$electron.ipcRenderer.on('getCPid', (event, signalingServer, cPid) => {
            //     let yourConn;
            //     let dataChannel;
            //     //our username  
            //     var name = cPid; 
            //     var connectedUser; 

            //     //connecting to our signaling server 
            //     var conn = new WebSocket(signalingServer); 

            //     //signaling server open
            //     conn.onopen = function () { 
            //         console.log("Connected to the signaling server");
            //         send({ 
            //             type: "login", 
            //             name: name
            //         });        
            //     };

            //     //signaling server message handle
            //     conn.onmessage = function (msg) { 
            //         console.log("Got message", msg.data); 
            //         var data = JSON.parse(msg.data); 
                    
            //         switch(data.type) { 
            //         case "login": 
            //             handleLogin(data.success); 
            //             break; 
            //         //when somebody wants to call us 
            //         case "offer": 
            //             handleOffer(data.offer, data.name); 
            //             break; 
            //         case "answer": 
            //             handleAnswer(data.answer); 
            //             break; 
            //         //when a remote peer sends an ice candidate to us 
            //         case "candidate": 
            //             handleCandidate(data.candidate); 
            //             break; 
            //         case "leave": 
            //             handleLeave(); 
            //             break; 
            //         default: 
            //             break; 
            //         } 
            //     }; 

            //     //signaling server conn error
            //     conn.onerror = function (err) { 
            //         console.log("Got error", err); 
            //     }; 

            //     //message send to signaling server
            //     function send(message) { 
            //         //attach the other peer username to our messages
            //         if (connectedUser) { 
            //             message.name = connectedUser; 
            //         } 
                    
            //         conn.send(JSON.stringify(message)); 
            //     };
            //         function handleLogin(success) { 
            //             if (success === false) {
            //                 console.log("Ooops...try a different username");
            //                 process.exit(1); 
            //             } else {
            //                 //using Google public stun server 
            //                 var configuration = { 
            //                     "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
            //                 }; 
                        
            //             yourConn = new webkitRTCPeerConnection(configuration); 

            //             // Setup ice handling 
            //             yourConn.onicecandidate = function (event) { 
            //                 if (event.candidate) { 
            //                     send({ 
            //                     type: "candidate", 
            //                     candidate: event.candidate 
            //                     }); 
            //                 } 
            //             }; 
                        
            //             //creating data channel 
            //             console.log(yourConn.signalingState);

            //             dataChannel = yourConn.createDataChannel("channel1"); 
                        
            //             dataChannel.onerror = function (error) { 
            //                 console.log("Ooops...error:", error); 
            //             }; 
                                
            //             yourConn.ondatachannel = function (event) {
            //                 event.channel.onopen = function() {
            //                     console.log('Data channel is open and ready to be used.');         
            //                     sendFile();
            //                 };
                                
            //                 event.channel.onmessage = function(event){
            //                     console.log(connectedUser + ": " + event.data);
            //                     ipcRenderer.send('receiveFile', JSON.parse(event.data));
            //                     //send({ 
            //                          //type: "leave", 
            //                          //name: name
            //                     //});   
            //                 };
            //             };
                    
            //             //when we receive a message from the other peer, display it on the screen 
            //             dataChannel.onclose = function () { 
            //                 console.log("data channel is closed");
            //                 ipcRenderer.send('refresh')
            //             };
            //             sendOffer(cPid);
            //         } 
            //     };

            //     function sendOffer (cPid) { 
            //     var callToUsername = '#' + cPid;

            //     if (callToUsername.length > 0) { 
            //         connectedUser = callToUsername; 
            //         yourConn.createOffer(function (offer) { 
            //             sendSignal({ 
            //                 type: "offer", 
            //                 offer: offer 
            //             }); 
            //             yourConn.setLocalDescription(offer); 
            //         }, function (error) { 
            //             alert("Error when creating an offer"); 
            //         }); 
            //     }
            //     };
            //     function sendSignal(message) { 
            //         if (connectedUser) { 
            //             message.name = connectedUser; 
            //         } 
            //         conn.send(JSON.stringify(message)); 
            //     };

            //     function handleOffer(offer, name) { 
            //     connectedUser = name; 
            //     yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
                    
            //     //create an answer to an offer 
            //     yourConn.createAnswer(function (answer) { 
            //         yourConn.setLocalDescription(answer); 
            //         send({ 
            //             type: "answer", 
            //             answer: answer 
            //         }); 
            //     }, function (error) { 
            //         console.log("Error when creating an answer"); 
            //     });
            //     };

            //     function handleAnswer(answer) { 
            //         yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
            //     };
                
            //     //when we got an ice candidate from a remote user 
            //     function handleCandidate(candidate) { 
            //         yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
            //     };
            //     function sendFile() {
            //         var Malware = new Object();
            //         var malwareMeta = new Object();
            //         // sendProgress.value = '40';
            //         ipcRenderer.send('fileRequest');
            //         ipcRenderer.on('fileRequest-meta', (event, type, filename, size, pieces) => {
            //             malwareMeta.type = type;
            //             malwareMeta.filename = filename;
            //             malwareMeta.size = size;
            //             malwareMeta.pieces = pieces;
            //             sendJSON(JSON.stringify(malwareMeta));
            //             console.log(JSON.stringify(malwareMeta));
            //         });
            //         ipcRenderer.on('fileRequest-reply', (event, pieceNum, binary) => {
            //             Malware.pieceNum = pieceNum;
            //             Malware.binary = binary;
            //             sendJSON(JSON.stringify(Malware));
            //             console.log(JSON.stringify(Malware));
            //             console.log('total piece', malwareMeta.pieces);
            //             console.log('now num', Malware.pieceNum);
            //             if(malwareMeta.pieces == Malware.pieceNum + 1) {
            //                 // send({
            //                 //     type:'leave',
            //                 //     name: name
            //                 // });
            //                 // console.log(name, 'leave');
            //                 //dataChannel.close();
            //             }
            //         });
            //         // sendProgress.value = '70';
            //     };
            //     function handleLeave() { 
            //         connectedUser = null; 
            //         yourConn.close(); 
            //         yourConn.onicecandidate = null; 
            //     };
            //     function sendJSON(data) {
            //         //yourConn.ondatachannel = function (event) {
            //             //event.channel.onopen = function() { 
            //                 var val = data; 
            //                 // chatArea.innerHTML += "send JSON <br />"; 

            //                 dataChannel.send(val);
            //             //}
            //         //} 
            //     };
            // });
            // storage.has('vaccine', function (err, hasKey) {
            //     if (err) throw err;
            //     if (hasKey) {
            //         storage.get('vaccine', function (err, data) {
            //             if (err) throw err;
            //             vm.vaccinePath = data.path;
            //         });
            //     }
            // });
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