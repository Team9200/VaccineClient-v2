const signalingServer = () => {
    console.log('SIG SERV start');
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
}

function sendTo(connection, message) { 
    connection.send(JSON.stringify(message)); 
}

export { signalingServer }