const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const jobs = new Map();

const authCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.API_KEY;
  
  if (expectedKey && (!authHeader || authHeader !== `Bearer ${expectedKey}`)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use(authCheck);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'autoklips-backend' });
});

// 1. IMPORT PROVIDER ENDPOINT
app.post('/import', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    // Return a reliable, direct MP4 file URL for editing and rendering tests
    return res.json({
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
      duration: 30.0
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. RENDER BACKEND: CREATE JOB
app.post('/jobs', (req, res) => {
  const { sourceUrl } = req.body;
  
  const jobId = `job_${Date.now()}`;
  const newJob = {
    id: jobId,
    status: 'completed',
    progress: 1.0,
    outputUrl: sourceUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    error: null
  };

  jobs.set(jobId, newJob);
  return res.json({ id: jobId });
});

// 3. RENDER BACKEND: GET JOB STATUS
app.get('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`autoklips backend running on port ${PORT}`));
