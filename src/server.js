import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 4000;
const app = express();


const whitelist = ['http://localhost:3000']
const corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200
}

app.use('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/ping', (req, res) => {
  res.send("Pong");
});

app.get('/stream-random-number', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Allow-Control-Allow-Credentials', true);

  res.flushHeaders();
  const interval = setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 1000);
    const message = {
      id: new Date().getTime(),
      number: randomNumber,
    };

    const response = `event: random_number\ndata: ${JSON.stringify(message)}\n\n`;
    res.write(response);
  }, 1000);

  res.on('close', () => {
    clearInterval(interval);

    res.end();
  });
});

app.listen(PORT, () => {
  console.log('server is running at port:', PORT);
})