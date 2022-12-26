require('dotenv').config()
require('./database/db')()
const express = require('express')
const authRoutes = require('./routes/auth-routes')
const roomRoutes = require('./routes/room-routes')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const ACTIONS = require('./actions')
const server = require('http').createServer(app)

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
})


app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}))

app.use('/storage', express.static('storage'))
app.use(express.json({limit: '8mb'}))
app.use('/api',authRoutes)
app.use('/api',roomRoutes)


app.get('/',(req,res)=>{
    res.send('Hello from the server')
})

// Sockets

const socketUserMap = {}

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMap[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user
            })
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMap[clientId] 
            });
        })
        socket.join(roomId);
    })

    // Handle Relay Ice event
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });

    // Handle Relay SDP
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    // Handle mute-unmute

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    const leaveRoom = () => {
        const { rooms } = socket;
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMap[socket.id]?.id,
                });

                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMap[clientId]?.id,
                });

                socket.leave(roomId);
            });
        });

        delete socketUserMap[socket.id];
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);

})

const PORT = process.env.PORT || 8000

server.listen(PORT, ()=> console.log(`Listening on PORT ${PORT}`))