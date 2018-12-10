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
            this.$electron.ipcRenderer.send('waitCollector');
            this.$electron.ipcRenderer.send('getFSHeader');
            this.signalingServer();
            this.$electron.ipcRenderer.on('collectorPid', (event, cPid) => {this.transfer(cPid);});
            this.$electron.ipcRenderer.on('analyzerPid', (event, aPid) => {this.unknownToAnalyer(aPid);});
        },
        methods: {
            transfer(cPid) {
                let yourConn;
                let dataChannel;
                //our username  
                var name = '#' + cPid; 
                var connectedUser; 

                //connecting to our signaling server 
                var conn = new WebSocket('ws://localhost:19200'); 

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
                                    ipcRenderer.send('receiveFile', malwareMeta);
                                    console.log('received malmeta', malwareMeta);
                                }
                                else {
                                    ipcRenderer.send('receiveFile', JSON.parse(event.data));
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
            },

            unknownToAnalyer(aPid) {
                let yourConn;
                let dataChannel;
                //our username  
                var name = '#' + aPid; 
                var connectedUser; 

                //connecting to our signaling server 
                var conn = new WebSocket('ws://localhost:19200'); 

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
                                    ipcRenderer.send('receiveFile', malwareMeta);
                                    console.log('received malmeta', malwareMeta);
                                }
                                else {
                                    ipcRenderer.send('receiveFile', JSON.parse(event.data));
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
                function sendFile() {
                    var unknownSample = new Object();
                    var unknownSampleMeta = new Object();
                    // sendProgress.value = '40';
                    ipcRenderer.send('unknownRequest');
                    ipcRenderer.on('unknownRequest-meta', (event, type, filename, size, pieces) => {
                        unknownSampleMeta.type = type;
                        unknownSampleMeta.filename = filename;
                        unknownSampleMeta.size = size;
                        unknownSampleMeta.pieces = pieces;
                        sendJSON(JSON.stringify(unknownSampleMeta));
                        console.log(JSON.stringify(unknownSampleMeta));
                    });
                    ipcRenderer.on('fileRequest-reply', (event, pieceNum, binary) => {
                        unknownSample.pieceNum = pieceNum;
                        unknownSample.binary = binary;
                        sendJSON(JSON.stringify(unknownSample));
                        console.log(JSON.stringify(unknownSample));
                    });
                    // sendProgress.value = '70';
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
            },

            signalingServer() {
                var WebSocketServer = require('ws').Server;
                var wss = new WebSocketServer({port: 19200}); 
                var users = {};

                //when a user connects to our sever 
                wss.on('connection', function(connection) {
                    console.log("SIG: User connected");
                    
                    //when server gets a message from a connected user 
                    connection.on('message', function(message) {
                        var data; 
                        //accepting only JSON messages 
                        try { 
                            data = JSON.parse(message); 
                        } catch (e) { 
                            console.log("SIG: Invalid JSON"); 
                            data = {}; 
                        }
                            
                        //switching type of the user message 
                        switch (data.type) { 
                            case "login": 
                                console.log("SIG: User logged", data.name); 
                                //if anyone is logged in with this username then refuse 
                                if(users[data.name]) { 
                                    sendTo(connection, { 
                                        type: "login", 
                                        success: false 
                                    });
                                    console.log("SIG: User logged fail", data.name); 
                                } else { 
                                    //save user connection on the server 
                                    users[data.name] = connection; 
                                    connection.name = data.name; 
                                            
                                    sendTo(connection, { 
                                            type: "login", 
                                            success: true 
                                        });
                                    console.log("SIG: User logged success", data.name); 
                                }
                                    
                                break;
                                    
                            case "offer": 
                                console.log("SIG: Sending offer to: ", data.name); 
                                    
                                var conn = users[data.name]; 
                                    
                                if(conn != null) { 
                                    //setting that UserA connected with UserB 
                                    connection.otherName = data.name; 
                                            
                                    sendTo(conn, { 
                                            type: "offer", 
                                            offer: data.offer, 
                                            name: connection.name 
                                        }); 
                                } 
                                break;
                                    
                            case "answer": 
                                console.log("SIG: Sending answer to: ", data.name); 
                                var conn = users[data.name]; 
                                if(conn != null) { 
                                connection.otherName = data.name; 
                                    sendTo(conn, { 
                                        type: "answer", 
                                        answer: data.answer 
                                    }); 
                                } 
                                break;
                                    
                            case "candidate": 
                                console.log("SIG: Sending candidate to:",data.name);
                                var conn = users[data.name];  
                                    
                                if(conn != null) { 
                                    sendTo(conn, { 
                                        type: "candidate", 
                                        candidate: data.candidate 
                                    }); 
                                } 
                                break;
                                    
                            case "leave": 
                                console.log("SIG: Disconnecting from", data.name); 
                        
                                var leaveUser = data.name;
                                var conn = users[data.name]; 
                                // conn.otherName = null; 
                                
                                //notify the other user so he can disconnect his peer connection 
                                if(conn != null) { 
                                    sendTo(conn, { 
                                        type: "leave"
                                    });
                                }
                                console.log(users);
                                delete users['#'+leaveUser];
                                delete users[leaveUser];

                                console.log('SIG: leave after users', users);
                                break;
                                    
                            default: 
                                sendTo(connection, { 
                                    type: "error", 
                                    message: "Command not found: " + data.type 
                                }); 
                                    
                                break;
                        }  
                    });
                    
                    //when user exits, for example closes a browser window 
                    //this may help if we are still in "offer","answer" or "candidate" state 
                    connection.on("close", function() { 
                        if(connection.name) { 
                            delete users[connection.name]; 
                                
                            if(connection.otherName) { 
                                console.log("SIG: Disconnecting from ", connection.otherName); 
                                var conn = users[connection.otherName]; 
                                //conn.otherName = null;
                                    
                                if(conn != null) { 
                                sendTo(conn, { 
                                    type: "leave" 
                                }); 
                                }  
                            } 
                        } 
                    });
                });
                
                function sendTo(connection, message) { 
                    connection.send(JSON.stringify(message)); 
                }
            },
        }
    }
</script>
