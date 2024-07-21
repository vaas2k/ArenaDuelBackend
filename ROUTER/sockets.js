import { io } from "../server.mjs";

export function socket_connection () { 

    
    io.on('connection', (socket) => {
        console.log('New client connected');
        
        socket.on('match_start', async (data) => {

            // data : { userid , room id , testCasesPassed }
            // send to match_started() to make socket based on room id
            io.emit(`${room_id}`,data);
        })


        // Listen for a custom event from the client if needed
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
    
    
}