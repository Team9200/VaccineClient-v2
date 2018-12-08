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
                                <v-btn color="green" flat @click="transferRequestToTracker">
                                    I accept
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card>

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
                scannedPaths: '검사중.......',
                vaccinePath: ''
            }
        },
        methods: {
            pathIn(e) {
                this.scanPath = e.target.files[0].path;
            },
            scanStart() {
                ipcRenderer.send('scanStart', {path: this.scanPath, vaccinePath: this.vaccinePath});
            },
            transferRequestToTracker() {
                ipcRenderer.send('transferRequestToTracker');
            },
            transfer() {
                let yourConn;
                let dataChannel;
                //our username  
                var name = 'test2'; 
                var connectedUser; 

                //connecting to our signaling server 
                var conn = new WebSocket('ws://211.193.58.164:9090'); 

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
                    process.exit(1); 
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
                        };
                            
                        event.channel.onmessage = function(event){
                            console.log(connectedUser + ": " + event.data);
                            ipcRenderer.send('receiveFile', JSON.parse(event.data));
                            // send({ 
                            //     type: "leave", 
                            //     name: name
                            // });   
                            // send({
                            //     type: "login",
                            //     name: name
                            // });
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

                function handleAnswer(answer) { 
                    yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
                };
                
                //when we got an ice candidate from a remote user 
                function handleCandidate(candidate) { 
                    yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
                };
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
            storage.has('vaccine', function (err, hasKey) {
                if (err) throw err;
                if (hasKey) {
                    storage.get('vaccine', function (err, data) {
                        if (err) throw err;
                        vm.vaccinePath = data.path;
                    });
                }
            });
            // this.transfer();
        }
    }
</script>

<style>

</style>
