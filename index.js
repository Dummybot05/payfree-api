import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import login from './components/login.js';
import signup from './components/signup.js';
import { editDetails } from './components/db.js';

const corsOption = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

const sql = neon(process.env.DATABASE_URL);
const app = express();
dotenv.config();

app.use(express.json());
app.use(cors(corsOption));

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.json({ accept: false, message: 'Access denied' });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
    if (error) {
      res.json({ accept: false, message: error.message });
      return;
    }
    req.user = data;
    next();
  });
}

app.get('/', (req, res) => {
  res.send(`Hello World!`);
});

app.post('/login', login);

app.post('/signup', signup);

app.get('/home', authenticateToken, async (req, res) => {
  const uuid = req.user.uuid;
  try {
    const [ result ] = await sql`SELECT user_name, uuid, balance FROM users WHERE uuid=${uuid}`;
    res.send({ accept: true, message: result });
  } catch (error) {
    res.send({ accept: false, message: `SQL Error: ${error.message}` })
  }
})

app.get('/profile', authenticateToken, async (req, res) => {
  const uuid = req.user.uuid;
  try {
    const [ result ] = await sql`SELECT * FROM users WHERE uuid=${uuid}`;
    res.send({ accept: true, message: result });
  } catch (error) {
    res.send({ accept: false, message: `SQL Error: ${error.message}` })
  }
})

app.get('/showqr', authenticateToken, async (req, res) => {
  const uuid = req.user.uuid;
  const qrcode = await QRCode.toDataURL(uuid);
  res.send(qrcode);
})

app.put('/editdetails', authenticateToken, async (req, res) => {
  const uuid = req.user.uuid;
  const { propicurl, username, firstname, lastname, email, dob, phone_number, language, gender, region, bio } = req.body;
  const saveDetails = await editDetails(uuid, username, firstname, lastname, email, dob, phone_number, language, gender, region, bio, propicurl, uuid);
  if (saveDetails.accept) {
    res.send(saveDetails.message);
  } else {
    res.send(saveDetails);
  }
})

app.post('/paycid', authenticateToken, async(req, res) => {
  const token = req.user.uuid;
  const { reciever_id, money } = req.body;
  const result = await sql`INSERT INTO transactions (reciever_id, sent_money, uuid) VALUES (${reciever_id}, ${money}, ${token}) returning *`;
  if (result.length == 1) {
    res.send('success');
  } else {
    res.send('failed');
  }
})

app.post("/update-transaction", authenticateToken, async (req, res) => {
  var userId = req.user.uuid;
  var { reciever_id, money } = req.body;
  const actualMon = await sql`select balance from users where uuid=${userId}`
  if (actualMon[0].balance > money) {
    const result = await sql`INSERT INTO transactions (reciever_id, sent_money, uuid) VALUES (${reciever_id}, ${money}, ${userId}) returning 1`;
    if (result) {
      const updateMon = await sql`UPDATE users SET balance=${parseInt(actualMon[0].balance) - parseInt(money)} WHERE uuid=${userId} returning 1`;
      if (updateMon) {
        res.send('success');
      } else {
        res.send('failed');
      }
    }
  } else {
    res.send(`UH-OH send money less than ${actualMon[0].balance}`)
  }
})

app.get('/history', authenticateToken, async (req, res) => {
  const uuid = req.user.uuid;
  try {
    const [ senderResult ] = await sql`SELECT * FROM transactions WHERE uuid=${uuid}`;
    const [ recieverResult ] = await sql`SELECT * FROM transactions WHERE reciever_id=${uuid}`;
  
    for (const data of senderResult) {
      for (const data2 of recieverResult) {

      }
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
    res.send("An error occurred while fetching transaction history.");
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



const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
