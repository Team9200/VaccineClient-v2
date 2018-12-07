<template>
    <v-layout row>
        <v-flex>
            <h1>Home</h1>
            <v-card>
                <v-list two-line>
                    <v-list-tile >
                        <v-list-tile-action>
                            <v-icon color="green">fas fa-hdd</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Storage Used</v-list-tile-title>
                            <!-- TODO: progress bar -->
                            <!-- <v-list-tile-sub-title><v-progress-linear color="green" v-model="value" :active="show" :indeterminate="query" :query="true"></v-progress-linear></v-list-tile-sub-title> -->
                        </v-list-tile-content>
                    </v-list-tile>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">far fa-smile</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Response Rate</v-list-tile-title>
                            <!-- TODO: progress bar -->
                            <!-- <v-list-tile-sub-title><v-progress-linear color="green" v-model="value" :active="show" :indeterminate="query" :query="true"></v-progress-linear></v-list-tile-sub-title> -->
                        </v-list-tile-content>
    
                        <!-- <v-list-tile-action>
                            <v-icon>chat</v-icon>
                        </v-list-tile-action> -->
                    </v-list-tile>
    
                    <v-divider inset></v-divider>
    
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon color="green">fas fa-wallet</v-icon>
                        </v-list-tile-action>
    
                        <v-list-tile-content>
                            <v-list-tile-title>Wallet</v-list-tile-title>
                            <v-list-tile-sub-title>500 coins</v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-btn router :to="send_link">
                            <v-icon color="green">send</v-icon>
                        </v-btn>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'storage-home-view',
        data: () => ({
            send_link: '/send-wallet'
        }),
        mounted () {
            this.$electron.ipcRenderer.send('storageWatch');
            this.transfer();
        },
        methods: {
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
                            send({ 
                                type: "leave", 
                                name: name
                            });   
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
        }
    }
</script>
