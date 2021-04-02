const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const formatMessages = require("./utils/messages")
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// setting static dir
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Botz'

// runs when client connects
io.on('connection', socket => {

  // join room
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    // welcome user
    socket.emit('message', formatMessages(botName, `Welcome ${user.username}`))

    // broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${user.username} has joined the chat`))

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  // listen for chatMessage
  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessages(user.username, message))
  })

  // runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeaves(socket.id)
    if (user) {
      io.to(user.room).emit('message', formatMessages(botName, `${user.username} has left the chat`))
      // send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

const PORT = process.env.port || 3003

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`))