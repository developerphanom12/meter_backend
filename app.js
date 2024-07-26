const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const user = require('./routes/userRoutes')
dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); 


const port = process.env.PORT || 6000;
const ipAddress = '127.0.0.1';


app.use('/api/user', user)



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});