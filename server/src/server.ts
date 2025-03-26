import express from 'express';
import cors from 'cors';
import mcpRoutes from './routes/mcp.js';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/mcp', mcpRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});