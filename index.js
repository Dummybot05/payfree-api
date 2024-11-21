import express from 'express';
import login from './login.js';
import signup from './signup.js';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
const app = express();
config();
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Hello World!`);
});

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Access denied' });
    return 
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return; 
    }
    req.user = user;
    next();
  });
}

app.post('/login', login);
app.post('/signup', signup);
app.get('/home', authenticateToken, async (req, res) => {
  const result = await sql`SELECT * FROM users WHERE uuid=${req.user.userId}`;
  res.send(result[0]);
})

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});