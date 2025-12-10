require('dotenv').config();
const express = require ("express");
const dbConnection = require("./config/dbConfig");
const app = express();
const port = 3000;

//connect to database
dbConnection();

app.get('/', (req, res) =>{
    res.send('Hello World');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})