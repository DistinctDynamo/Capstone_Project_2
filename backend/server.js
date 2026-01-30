const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('../routes/userRoutes.js')

const DB_URL = "mongodb+srv://nguyensteven578_db_user:KipuXKRBlZistryc@clustercomp3123.qnimjux.mongodb.net/?appName=ClusterComp3123";
const PORT = 8046;

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
    res.send("<h1>Capstone 2: Soccer Connect App</h1>");
});

app.use('/api', userRoutes);

mongoose.connect(DB_URL).then(() => {
    console.log("Successfully connected to the database mongoDB Atlas Server");    
    app.listen(PORT, () => {
    console.log("Server is listening on port 8046");
});
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});