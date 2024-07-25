const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversation');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect('mongodb://localhost:27017/socialmedia').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});


app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/users', userRoutes);
app.use('/api', uploadRoutes);
app.use('/api', messageRoutes);
app.use('/api/conversations', conversationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});