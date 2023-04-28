const path = require('path')

const http = require('http')
const express = require("express")

const socketio = require('socket.io')

const formatMessages = require('./utils/messages')

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express()

const server = http.createServer(app)

const io = socketio(server)

// set static folder

app.use(express.static(path.join(__dirname, 'public')))

// run when client connects

io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {

        const user =  userJoin(socket.id, username, room)
        
        socket.join(user.room)

        // Welcome curent user

        socket.emit('message', formatMessages('ChatCord Bot','Welcome to chatCorde'))

        // Broadcast when a user connects

        socket.broadcast.to(user.room).emit('message', formatMessages('ChatCord Bot',`${user.username} has joined to the chat`))

        // Send users and room info

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    

    

    // Listen for chat message
    
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        // console.log("user", user);
        // console.log("chatMessage", formatMessages(`${user}`, msg))

        io.to(user.room).emit('message', formatMessages(`${user.username}`,msg))
    })

    // Runs when client disconects 

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user) {

            io.to(user.room).emit('message', formatMessages('chatCord Bot', `${user.username} has left the chat`))
            
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        
        }

        
        
    })
})


const PORT = 3000 || process.env.port

server.listen(PORT, () => console.log(`server running on port ${PORT}`))