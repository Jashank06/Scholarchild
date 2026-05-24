const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/institution', require('./routes/institution'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/services', require('./routes/services'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/files', require('./routes/files'));
app.use('/api/file-nodes', require('./routes/fileNodes'));
app.use('/api/results', require('./routes/results'));
app.use('/api/news', require('./routes/news'));
app.use('/api/school-config', require('./routes/schoolConfig'));
app.use('/api/faqs', require('./routes/faqs'));

// Public stats for landing page
app.get('/api/public-stats', async (req, res) => {
  try {
    const Opportunity = require('./models/Opportunity');
    const User = require('./models/User');
    const totalScholarships = await Opportunity.countDocuments({ type: 'scholarship', status: 'active' });
    const totalCompetitions = await Opportunity.countDocuments({ type: 'competition', status: 'active' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    res.json({
      success: true,
      data: {
        opportunities: totalScholarships + totalCompetitions,
        students: totalStudents,
        rewards: '₹10 Cr+', // Placeholder for now or calculate from rewards field
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const { getAgentStatus } = require('./aiAgent/scheduler');
  res.json({ status: 'ok', message: 'Kushaagra API is running 🚀', timestamp: new Date().toISOString(), agent: getAgentStatus() });
});


// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Create uploads dir
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Kushaagra API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Initialize AI Agent Scheduler
  const { startScheduler } = require('./aiAgent/scheduler');
  const { runCrawlerEngine } = require('./aiAgent/crawlerEngine');
  const scanIntervalMs = parseInt(process.env.AGENT_SCAN_INTERVAL_MS) || 24 * 60 * 60 * 1000; // 24 hours
  
  startScheduler(scanIntervalMs, async () => {
    console.log('🤖 Agent: Scheduled multi-strategy scan triggered');
    await runCrawlerEngine(null);
  });
  console.log(`🤖 AI Agent v2.0 Scheduler initialized — Multi-Strategy Crawler active`);
  console.log(`🧠 AI Brain: Gemini 2.5 Flash (Primary) + Groq/Cerebras/OpenRouter (Fallback)`);
});
