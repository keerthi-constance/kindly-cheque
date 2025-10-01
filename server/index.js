import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "mongodb+srv://akrfuture:Keerthi30@cluster0.crixmfc.mongodb.net/multicomplex?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== Mongoose Models =====
const outgoingChequeSchema = new mongoose.Schema(
  {
    issueDate: { type: String, required: true },
    startDate: { type: String, required: true },
    chequeNumber: { type: String, required: true },
    payeeName: { type: String, required: true },
    purpose: { type: String },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedDate: { type: String },
  },
  { timestamps: true }
);

const incomingChequeSchema = new mongoose.Schema(
  {
    receivedDate: { type: String, required: true },
    chequeDate: { type: String, required: true },
    chequeNumber: { type: String, required: true },
    payerName: { type: String, required: true },
    purpose: { type: String },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'deposited'], default: 'pending' },
    depositedDate: { type: String },
  },
  { timestamps: true }
);

const OutgoingCheque = mongoose.model('OutgoingCheque', outgoingChequeSchema);
const IncomingCheque = mongoose.model('IncomingCheque', incomingChequeSchema);
const { ObjectId } = mongoose.Types;

// Normalize docs to the shape frontend expects (id mirror)
function normalize(doc) {
  if (!doc) return doc;
  const json = doc.toObject ? doc.toObject() : doc;
  return { ...json, id: json._id };
}

// ===== API Routes =====
// Outgoing
app.get('/api/outgoing', async (req, res) => {
  const list = await OutgoingCheque.find().sort({ createdAt: -1 });
  res.json(list.map(normalize));
});

app.post('/api/outgoing', async (req, res) => {
  const body = req.body || {};
  const created = await OutgoingCheque.create({ ...body, status: 'pending' });
  res.json(normalize(created));
});

app.post('/api/outgoing/:id/complete', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
  const today = new Date().toISOString().split('T')[0];
  const updated = await OutgoingCheque.findByIdAndUpdate(
    id,
    { status: 'completed', completedDate: today },
    { new: true }
  );
  if (!updated) return res.status(404).send('Not found');
  res.json(normalize(updated));
});

app.post('/api/outgoing/:id/delete', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
  await OutgoingCheque.findByIdAndDelete(id);
  res.json({ ok: true });
});

// Incoming
app.get('/api/incoming', async (req, res) => {
  const list = await IncomingCheque.find().sort({ createdAt: -1 });
  res.json(list.map(normalize));
});

app.post('/api/incoming', async (req, res) => {
  const body = req.body || {};
  const created = await IncomingCheque.create({ ...body, status: 'pending' });
  res.json(normalize(created));
});

app.post('/api/incoming/:id/deposit', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
  const today = new Date().toISOString().split('T')[0];
  const updated = await IncomingCheque.findByIdAndUpdate(
    id,
    { status: 'deposited', depositedDate: today },
    { new: true }
  );
  if (!updated) return res.status(404).send('Not found');
  res.json(normalize(updated));
});

app.post('/api/incoming/:id/delete', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });
  await IncomingCheque.findByIdAndDelete(id);
  res.json({ ok: true });
});

// Connect to MongoDB
async function connectDB() {
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Please create a .env file with MONGO_URI.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
  }
}

// Connect to database
connectDB();

// For Vercel serverless functions, export the app
export default app;


