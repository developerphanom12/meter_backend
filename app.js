const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const user = require('./routes/sellerRoutes')
const db = require('./Database/connection')

dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); 


const port = process.env.PORT || 5000;
const ipAddress = '127.0.0.1';


app.use('/api/user', user)


app.get('/meter/:meterId', async (req, res) => {
    const { meterId } = req.params;

 
    try {
        const result = await db.query(
            'INSERT INTO meters (meter_id) VALUES (?)',
            [meterId]
        );

        res.status(201).json({ message: 'Meter added successfully', meterId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});