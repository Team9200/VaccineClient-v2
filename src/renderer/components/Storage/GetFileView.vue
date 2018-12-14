<template>
    <div>
        <v-layout>
            <v-flex>
                <v-text-field style="width: 550px;" v-model="keyword" label="keyword"></v-text-field>
            </v-flex>
            <v-flex>
                <v-btn color="green" style="width: 280px" @click="requestMalwareTracker">Search Malware Sample</v-btn>
            </v-flex>
        </v-layout>
        <div style="overflow-x: auto;" v-for="(item, i) in items" :key="i">
            <v-card width="100%">
                <v-card-title>
                    {{ item.title }}
                </v-card-title>
                <v-card-text>
                    {{ item.url }}
                </v-card-text>
            </v-card>
            <br>
        </div>
        <v-layout>
            <v-card height="150px" width="100%">
                <v-card-title style="font-size:20px; font-weight:bold">
                    Search Result
                </v-card-title>
                <v-flex>
                    <v-card-text v-text="searchResult">
                    </v-card-text>
                </v-flex>
                <v-flex>
                    <v-card-title style="width:130px; float: left; font-weight:bold">Sample Cost</v-card-title>
                    <v-card-text style="font-size:13px; width:50px; float: left">1</v-card-text>
                    <v-card-text style="font-size:13px; width:70px; float: left">OTC</v-card-text>
                </v-flex>
                <v-flex>
                    <v-card-title style="width:100px; float: left; font-weight:bold">Balance</v-card-title>
                    <v-card-text v-text="nowBalance" style="font-size:13px; width:50px; float: left">OTC</v-card-text>
                    <v-card-text style="font-size:13px; width:70px; float: left">OTC</v-card-text>
                </v-flex>
                <v-btn color="gray" style="float: right; position: relative; right:30px;" @click="requestMalwareTracker">Download</v-btn>
            </v-card>
        </v-layout>
        <!-- <div style="overflow-x: auto;" v-for="(item, i) in items" :key="i">
            <v-card width="100%">
                <v-card-title
                    {{ item.title }}
                </v-card-title>
                <v-card-text>
                    {{ item.url }}
                </v-card-text>
            </v-card>
            <br>
        </div> -->
        <!-- <div>
            <v-spacer></v-spacer>
            <v-btn color="green" @click="requestMalwareTracker">Pay for Sample</v-btn>
        </div> -->
    </div>
</template>

<script>
    export default {
        name: 'get-file-view',
        data: () => ({
            keyword: '',
            searchResult: '',
            nowBalance: '100',
            items: [
                {
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },
                {
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },{
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                },{
                    title: 'Ransomware | 0.34 Coin | 2018.11.27',
                    url: 'http://openti.info/?num=123'
                }
            ]
        }),
        methods: {
            requestMalwareTracker() {
                ipcRenderer.send('requestMalware-tracker');
            }
        },
        mounted () {
            this.$electron.ipcRenderer.on('requestUnknownFile-storage', (event, tracker, sPid) => {
                console.log(tracker);
                let yourConn;
                let dataChannel;
                //our username  
                var name = sPid; 
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
                                    ipcRenderer.send('receiveMalware', malwareMeta);
                                    console.log('received malmeta', malwareMeta);
                                }
                                else {
                                    ipcRenderer.send('receiveMalware', JSON.parse(event.data));
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
        }
    }
</script>

<style>

</style>