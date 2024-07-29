const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const user = require('./routes/sellerRoutes');
const db = require('./Database/connection');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();

app.use(express.json()); 
app.use(cors({ origin: true })); 

const port = process.env.PORT || 5000;

// Routes
app.use('/api/user', user);

app.get('/meter/:meterId', async (req, res) => {
    const { meterId } = req.params;
    try {
        const result = await db.query('INSERT INTO meters (meter_id) VALUES (?)', [meterId]);
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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: `/meter/1234` });

wss.on('connection', (ws, req) => {
    const { url } = req;
    console.log(`WebSocket connection established on ${url}`);

    ws.on('message', (message) => {
        console.log('Received:', message);
        try {
            const data = JSON.parse(message);

            if (Array.isArray(data)) {
                const [messageType, callId, action, payload] = data;

                switch (action) {
                    case 'BootNotification':
                        console.log('BootNotification:', payload);
                        ws.send(JSON.stringify([3, callId, { status: 'Accepted', currentTime: new Date().toISOString(), interval: 5 }]));
                        break;

                    case 'MeterValues':
                        console.log('MeterValues:', payload);
                        ws.send(JSON.stringify([3, callId, { currentTime: new Date().toISOString() }]));
                        break;

                    default:
                        console.log('Unknown action:', action);
                }
            }
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
