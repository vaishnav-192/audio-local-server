const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors'); // Import CORS
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*", // Allow this origin
        methods: ["GET", "POST"],
        credentials: true,
    }
});

app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Listen for user login and assign username
    socket.on('user_online', (username) => {
        if (username) {
            socket.username = username; // Store the username in socket instance
            console.log(`User ${username} is online.`);
            io.emit('active_users', getActiveUsers());
        } else {
            console.log('Username not provided!');
        }
    });

    // User disconnects
    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`User disconnected: ${socket.username}`);
            io.emit('active_users', getActiveUsers());
        } else {
            console.log('User disconnected but no username was set');
        }
    });

    // Handle request for active users
    socket.on('request_active_users', () => {
        const activeUsers = getActiveUsers();
        socket.emit('active_users', activeUsers);
    });
});

// Function to get the list of active users
function getActiveUsers() {
    return [...io.sockets.sockets].map(([id, socket]) => ({
        username: socket.username,
        ipAddress: socket.request.connection.remoteAddress
    })).filter(user => user.username); // Filter out users without usernames
}

server.listen(4000, () => {
    console.log('Local Server running on port 4000.');
});
