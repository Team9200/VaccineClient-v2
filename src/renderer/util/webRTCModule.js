const fileReceive = (cPid) => {
    let yourConn;
    let dataChannel;

    //our username  
    var name = '#' + cPid; 
    var connectedUser; 

    //connecting to our signaling server 
    var conn = new WebSocket('ws://localhost:19200'); 

    let malwareMeta;

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
                    if(JSON.parse(event.data).type == 'meta') {
                        malwareMeta = JSON.parse(event.data);
                        ipcRenderer.send('receiveFile', malwareMeta);
                    }
                    else {
                        ipcRenderer.send('receiveFile', JSON.parse(event.data));
                        if(malwareMeta.pieces == JSON.parse(event.data).pieceNum) {
                            send({ 
                                type: "leave",
                                name: name 
                            }); 
                            dataChannel.close();
                        }
                    }
                };
            };
        
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
};

const fileSend = (aPid) => {
    let yourConn;
    let dataChannel;
    //our username  
    var name = '#' + aPid; 
    var connectedUser; 

    //connecting to our signaling server 
    var conn = new WebSocket('ws://localhost:19200'); 

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
                    ipcRenderer.send('unknownFileSample', JSON.parse(event.data));
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
            sendOffer(aPid);
        } 
    };

    function sendOffer (aPid) { 
        var callToUsername = aPid;

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
        ipcRenderer.send('unknownSlice');
        ipcRenderer.on('unknownStoA-meta', (event, type, filename, size, pieces) => {
            malwareMeta.type = type;
            malwareMeta.filename = filename;
            malwareMeta.size = size;
            malwareMeta.pieces = pieces;
            sendJSON(JSON.stringify(malwareMeta));
            console.log(JSON.stringify(malwareMeta));
        });
        ipcRenderer.on('unknownStoA-reply', (event, pieceNum, binary) => {
            Malware.pieceNum = pieceNum;
            Malware.binary = binary;
            sendJSON(JSON.stringify(Malware));
            console.log(JSON.stringify(Malware));
            console.log('total piece', malwareMeta.pieces);
            console.log('now num', Malware.pieceNum);
        });
    };

    function handleLeave() { 
        connectedUser = null; 
        yourConn.onicecandidate = null; 
        return;
    };

    function sendJSON(data) {
        var val = data; 
        dataChannel.send(val);
    };
}



export {
    fileReceive,
    fileSend
}