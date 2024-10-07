const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://Pratik3311:Pratik3311@cluster0.9kkj7.mongodb.net/digiplus', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define SIM Card Schema
const simCardSchema = new mongoose.Schema({
  simNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  activationDate: { type: Date }
});

// Create SIM Card Model
const SimCard = mongoose.model('SimCard', simCardSchema);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the SIM Card Activation Service API!');
});

// Add SIM Card
app.post('/add-sim', async (req, res) => {
  const { simNumber } = req.body;

  if (!simNumber) {
    return res.status(400).json({ message: 'SIM Number is required' });
  }

  try {
    const simCard = new SimCard({ simNumber });
    await simCard.save();
    res.status(201).json({ message: 'SIM Card added successfully', simCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate SIM Card
app.post('/activate', async (req, res) => {
  const { simNumber } = req.body;

  if (!simNumber) {
    return res.status(400).json({ message: 'SIM Number is required' });
  }

  try {
    const simCard = await SimCard.findOne({ simNumber });
    if (!simCard) {
      return res.status(404).json({ message: 'SIM Card not found' });
    }

    if (simCard.status === 'active') {
      return res.status(400).json({ message: 'SIM Card is already active' });
    }

    simCard.status = 'active';
    simCard.activationDate = new Date();
    await simCard.save();

    res.json({ message: 'SIM card activated successfully', simCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate SIM Card
app.post('/deactivate', async (req, res) => {
  const { simNumber } = req.body;

  if (!simNumber) {
    return res.status(400).json({ message: 'SIM Number is required' });
  }

  try {
    const simCard = await SimCard.findOne({ simNumber });
    if (!simCard) {
      return res.status(404).json({ message: 'SIM Card not found' });
    }

    if (simCard.status === 'inactive') {
      return res.status(400).json({ message: 'SIM Card is already inactive' });
    }

    simCard.status = 'inactive';
    await simCard.save();

    res.json({ message: 'SIM card deactivated successfully', simCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SIM Details
app.get('/sim-details/:simNumber', async (req, res) => {
  const { simNumber } = req.params;

  try {
    const simCard = await SimCard.findOne({ simNumber });
    if (!simCard) {
      return res.status(404).json({ message: 'SIM Card not found' });
    }

    res.json({ simCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
