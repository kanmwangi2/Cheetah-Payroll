// Entry point for backend API (Express + Firestore + Firebase Auth)
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cheetah Payroll API running' });
});

// TODO: Add authentication, Firestore integration, and API routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
