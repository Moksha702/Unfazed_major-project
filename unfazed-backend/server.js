require('dotenv').config();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initChatSocket = require('./src/sockets/chatSocket');
const SubscriptionTierConfig = require('./src/models/SubscriptionTierConfig');
const { DEFAULT_CONFIGS } = require('./src/services/entitlementService');

const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Connect to MongoDB
connectDB().then(async () => {
  // Ensure default tier configs exist in DB
  try {
    for (const key of Object.keys(DEFAULT_CONFIGS)) {
      const exists = await SubscriptionTierConfig.findOne({ tier: key });
      if (!exists) {
        await SubscriptionTierConfig.create(DEFAULT_CONFIGS[key]);
      }
    }
    console.log('[Subscription Tiers] Initialized default tier configurations.');
  } catch (err) {
    console.warn('Subscription tier init notice:', err.message);
  }
});

// Create HTTP and Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket listeners
initChatSocket(io);

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Unfazed Backend API running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
