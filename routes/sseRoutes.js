const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); 

let connectedClients = [];

// SSE endpoint: this will stream updates to the client
router.get('/events', (req, res) => {
  try {
    const userId = req.query.userId;  


    if (!userId) {
      console.error('No userId provided in query');  
      return res.status(400).json({ error: 'userId is required' });  
    }

    const sessionId = uuidv4();  // Generate a unique session ID for each connection
    console.log(`New SSE connection for userId: ${userId}, sessionId: ${sessionId}`);  // Log userId and sessionId

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    // Flush headers and add the response object to the connectedClients array with a unique sessionId and userId
    res.flushHeaders();
    connectedClients.push({ userId, sessionId, res });

    // Log when a client connects
    console.log("Client added. Total connected clients:", connectedClients.length);

    // Log all connected clients for debugging
    console.log("Connected clients:", connectedClients);

    // Remove the client when the connection is closed
    req.on('close', () => {
      try {
        connectedClients = connectedClients.filter(client => client.sessionId !== sessionId);
        console.log("Client disconnected. Total connected clients:", connectedClients.length);
      } catch (err) {
        console.error('Error removing client from connectedClients:', err);
      }
    });
  } catch (err) {
    console.error('Error handling new SSE connection:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Function to send the event to a specific user
const sendStatusUpdateToClients = (userId, data) => {
  try {
    console.log("Sending update to userId----:", userId, data);  // Log the userId being used to broadcast
    console.log("All connected clients:", connectedClients);  // Log all connected clients

    userId = userId.toString();  // Convert userId to string
    
    // Find the client by userId (matching the correct userId and sessionId)
    const client = connectedClients.find(client => client.userId === userId);
    if (client) {
      // Add a success or failure message to the event data
      if (data.status === "Settled") {
        data.message = "Deposit successfully completed!";
      } else if (data.status === "Expired" || data.status === "Failed") {
        data.message = "Deposit failed. Please try again.";
      } else if (data.status==='Processing'){
        data.message = "Transaction is being processed.";
      }else{
        data.message = null;

      }

      console.log("Sending data with message:", data);  // Log the data being sent to the client
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } else {
      console.log("No client found for userId:", userId);  // Debugging - log if no client is found
    }
  } catch (err) {
    console.error('Error sending event to clients:', err);
  }
};
module.exports = { sendStatusUpdateToClients };
module.exports.router = router;
