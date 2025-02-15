require("dotenv").config();
const express = require("express");
const connection = require("./connection");

const authRoute = require("./routes/authRoute");
const route = require("./routes/route");
const orderRoute = require("./routes/orderRoutes");
const productRoute = require("./routes/productRoutes");
const adminRoute = require("./routes/adminRoutes");
const downloadRoute = require("./routes/downloadRoute");
const analyticsRoute = require("./routes/analytics");
const depositRoute = require("./routes/depositRoutes");
const sseRoutes = require('./routes/sseRoutes');
const crypto = require('crypto');
const Transaction = require("./models/Transaction");
const User = require("./models/user");
const { sendStatusUpdateToClients } = require('./routes/sseRoutes');
const authenticateToken = require('./middleware/authMiddleware');



const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT;

app.use(sseRoutes.router);

// connection
connection();

// webhooks
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['btcpay-sig'];
  if (!signature) return res.status(401).send('Unauthorized');

  try {
    // Use the stored raw body
    const rawBody = req.rawBody.toString('utf8');
    console.log('ℹ️ Raw body:', rawBody); // Should show actual JSON now

    const secret = process.env.BTCPAY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = `sha256=${hmac.update(rawBody).digest('hex')}`;

    console.log('ℹ️ Computed:', computedSignature);
    console.log('ℹ️ Received:', signature);

    if (signature !== computedSignature) {
      return res.status(401).send('Unauthorized');
    }

    req.body = JSON.parse(rawBody);
    next();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Bad Request');
  }
};

// Webhook endpoint to handle payment updates
app.post('/deposits/webhook/btcpay', 
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  verifyWebhookSignature,
  async (req, res) => {
    try {
      const { invoiceId, type: eventType, amount } = req.body;

      // Find the transaction
      const transaction = await Transaction.findOne({ invoiceId });
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Status mapping for the payment events
      const statusMapping = {
        'InvoiceSettled': 'Settled',
        'InvoicePaid': 'Paid',
        'InvoiceExpired': 'Expired',
        'InvoiceInvalid': 'Failed',
        'InvoiceProcessing': 'Processing',
        'InvoiceReceivedPayment': 'Processing',
      };

      const newStatus = statusMapping[eventType] || transaction.status;
      transaction.status = newStatus;
      await transaction.save();

      // Only update balance when payment is settled
      if (eventType === 'InvoiceSettled') {
        await User.findByIdAndUpdate(
          transaction.userId,
          { $inc: { balance: transaction.amount } }  // Update balance
        );
        
        // Get updated user balance
        const updatedUser = await User.findById(transaction.userId);

        // Send the status update along with the new balance to all connected clients

        console.log("INDEX.JS:"+transaction.userId )
        sendStatusUpdateToClients(transaction.userId, {
          invoiceId,
          status: newStatus,
          balance: updatedUser ? updatedUser.balance : undefined,
        });
        
      } else {
        // Send status update only (no balance change)
        sendStatusUpdateToClients(transaction.userId,{ invoiceId, status: newStatus });
      }

      res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Internal server error');
    }
  }
);



// Middleware
app.use(cookieParser());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", route);
app.use("/api/auth", authRoute);
app.use("/orders", orderRoute);
app.use("/products", productRoute);
app.use("/admin", adminRoute);
app.use("/download", downloadRoute);
app.use("/analytics", analyticsRoute);
app.use("/deposits", depositRoute);


// const ngrok = require("@ngrok/ngrok");
// app.listen(PORT, async () => {
//   console.log(`Server running on port ${PORT}`);

//   // Open a tunnel to your local server
//   try {
//     const url = await ngrok.connect(PORT); // This exposes your local server to the web
//     console.log("ngrok tunnel opened at:", url);

//     // You can use this URL for your webhook
//     // Now your local server is accessible at this ngrok URL (e.g., https://<random_subdomain>.ngrok.io)
//   } catch (error) {
//     console.error("Error while setting up ngrok:", error);
//   }
// });

Listen
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
