import express from 'express';
import login from './login.js';
import signup from './signup.js';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
const app = express();
config();

import QRCode from 'qrcode'

import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT'],
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
  jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return; 
    }
    console.log(token)
    req.token = token;
    next();
  });
}

app.post('/login', login);
app.post('/signup', signup);

app.post("/update-transaction", authenticateToken, async (req, res) => {
  var userId = req.token.userId;
  var { reciever_id, money } = req.body;
  console.log(req.body)
  const result = await sql`INSERT INTO transactions (reciever_id, sent_money, uuid) VALUES (${reciever_id}, ${money}, ${userId}) returning 1`;
  if(result) {
    res.send('success');
  } else {
    res.send('failed');
  }
})

app.get('/all', async (req, res) => {
  const result = await sql`SELECT * FROM users`;
  res.send(result);
})
app.get('/profile', authenticateToken, async (req, res) => {
  console.log(req.token)
  const result = await sql`SELECT * FROM users WHERE uuid=${req.token.userId}`;
  res.send(result[0]);
})

app.get('/home', authenticateToken, async (req, res) => {
  console.log(req.token)
  const result = await sql`SELECT * FROM users WHERE uuid=${req.token.userId}`;
  res.send(result[0]);
})

app.get('/showqr', authenticateToken, async (req, res) => {
  const result = await sql`SELECT uuid FROM users WHERE uuid=${req.token.userId}`;
  QRCode.toDataURL(result[0].uuid)
  .then(url => {
    res.send(url)
  })
  .catch(err => {
    res.send(err.message)
  })
})

app.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM transactions WHERE uuid=${req.token.userId}`;
    const output = [];

    for (const data of result) {
      const result2 = await sql`SELECT user_name, profile_picture_url FROM users WHERE uuid=${data.reciever_id}`;
      const enrichedData = {
        user_name: result2[0].user_name,
        profile_picture_url: result2[0].profile_picture_url,
        money: data.sent_money,
        date: data.created_date,
      };
      output.push(enrichedData);
    }

    res.send(output);
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    res.status(500).send("An error occurred while fetching transaction history.");
  }
});

app.put('/cashupdate', authenticateToken, async (req, res) => {
  const { money } = req.body;
  var result = await sql`UPDATE users SET balance=${money} WHERE uuid=${req.token.userId} returning 1`;

  if (result) {
    res.send('success')
  } else {
    res.send('not success')
  }
})

app.put('/editdetails', authenticateToken, async (req, res) => {
   var token = req.token;
   const { firstname, lastname } = req.body;
   console.log(firstname)

   var result = await sql`UPDATE users SET first_name=${firstname}, last_name=${lastname} WHERE uuid=${token.userId} returning *`;
   // console.log(result)
   if (result) {
    res.send('success')
  } else {
    res.send('not success')
  }
})

app.put('/update', async (req, res) => {
  var num = 9876543210;
  const { uuid } = req.body;
  console.log(uuid);
  QRCode.toDataURL(uuid)
  .then(url => {
    console.log(url)
  })
  .catch(err => {
    console.error(err)
  })
  const result = await sql`UPDATE users SET phone_number=${num} WHERE uuid=${uuid} returning *`;
  res.send(result);
})

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
