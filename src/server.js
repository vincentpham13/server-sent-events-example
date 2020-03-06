import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import socket from 'socket.io';
import socketAuth from 'socketio-auth';
import adapter from 'socket.io-redis';
import bluebird from 'bluebird';
import redis from 'redis';

const app = express();

bluebird.promisifyAll(redis);

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

var whitelist = ['http://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use('*', cors(corsOptionsDelegate));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 6000;

app.get('/ping', (req, res) => {
  res.send("Pong");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  console.log(req.file);
  res.send('OK');
});

app.get('/video-stream', (req, res) => {
  const videoPath = path.join(process.cwd(), 'uploads', '/Huong Ngoc Lan.mp4');
  const stats = fs.statSync(videoPath);
  const { size, } = stats;
  const range = req.headers.range
  console.log('range|', range);
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : size - 1;

    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': size,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(videoPath).pipe(res)
  }
});

let users = [
  {
    id: '6516',
    name: 'Grady Lackeye',
    status: 'N/A',
    token: '1935:4f61:d3be:379a:9b6b:3fd4:e772:a4c5'
  },
  {
    id: '2172',
    name: 'Morty Dundin',
    status: 'N/A',
    token: 'c327:3aa6:6086:3b7d:f020:7449:8a33:57c2'
  },
  {
    id: '3038',
    name: 'Den Giuroni',
    status: 'N/A',
    token: '2ebf:e7f4:0b89:3906:5797:8f08:1b68:e851'
  },
  {
    id: '2512',
    name: 'Bartlett Gorstidge',
    status: 'N/A',
    token: '33b0:3eaa:e95a:1ad0:1795:b2ce:7485:c097'
  },
  {
    id: '1934',
    name: 'Geri Stormes',
    status: 'N/A',
    token: '9d0d:bc83:d205:f07b:27b2:8a3d:6dc8:bc2f'
  },
  {
    id: '3519',
    name: 'Staford Tobias',
    status: 'N/A',
    token: '17c0:48d5:be05:cc77:5667:4192:7621:be5d'
  },
  {
    id: '3256',
    name: 'Remus Peartree',
    status: 'N/A',
    token: '4d95:9d97:041b:50bf:71dd:c964:5af5:4337'
  },
  {
    id: '3184',
    name: 'Esteban Antcliffe',
    status: 'N/A',
    token: '9473:2c5f:d6d7:1c1d:26dd:89db:9ca2:c09c'
  },
  {
    id: '6485',
    name: 'Lelah Aloshkin',
    status: 'N/A',
    token: '315a:1dfc:4197:8af0:1c11:83cf:5013:d2ad'
  },
  {
    id: '5185',
    name: 'Beverley Wippermann',
    status: 'N/A',
    token: '6848:618d:8ee7:8ea8:075d:74bc:39a9:8352'
  },
  {
    id: '1538',
    name: 'Tallulah Penwright',
    status: 'N/A',
    token: 'cfa0:e34b:9bf1:5dfe:833a:336a:b467:13f7'
  },
  {
    id: '4699',
    name: 'Appolonia Eyckel',
    status: 'N/A',
    token: '19b4:49be:1bfc:eb9a:b917:fd6b:d5b5:1d7d'
  },
  {
    id: '2353',
    name: 'Eldon Redshaw',
    status: 'N/A',
    token: 'b631:8005:ecd8:aae1:390b:8482:5726:54bb'
  },
  {
    id: '7171',
    name: 'Tracie Spir',
    status: 'N/A',
    token: '8ef3:6ec5:ec6b:6b96:bb62:b3eb:8699:da78'
  },
  {
    id: '1542',
    name: 'Lyon Macak',
    status: 'N/A',
    token: '5f59:7817:ec37:076d:1e8d:5522:827f:89e2'
  },
];

const verifyUser = async (token) => {
  return new Promise((resolve, reject) => {
    const user = users.find(f => f.token == token);
    if (!user) {
      return reject('USER_NOT_FOUND');
    }

    return resolve(user);
  })

}



app.get('/users', cors(corsOptionsDelegate), (req, res) => {
  const usersReq = req.query.users.split(',') || [];
  console.log('usersReq', usersReq);
  res.status(200).json(users.filter(m => { if (usersReq.findIndex((f) => f === m.id) !== -1) return m }));
});



// const server = createServer(app, {
//   handlePreflightRequest: (req, res) => {
//     const headers = {
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       "Access-Control-Allow-Origin": '*',
//       "Access-Control-Allow-Credentials": true
//     };
//     res.writeHead(200, headers);
//     res.end();
//   }
// });

const server = app.listen(PORT, () => {
  console.log('Server is starting at port:', PORT);
});

const io = socket(server, {
  // pingTimeout: 10000,
  pingInterval: 5000,
});
const redisAdapter = adapter({
  host: 'localhost',
  port: 6379
});

io.origins('*:*');
io.adapter(redisAdapter);

io.on('connection', (client) => {
  console.log(`Socket ${client.id} connected.`);

  client.conn.on('packet', (packet) => {
    console.log(packet);
  });

  client.conn.on('packetCreate', packet => {
    if (packet.type === 'pong') {
      console.log(`Sending pong to client.`);
    }
  });

  // client.on('login', (login) => {
  //   client.join(login.id);
  //   console.log('a client is logined', login);
  //   const uInd = users.findIndex((u => u.id == login.id));
  //   users[uInd].status = 'online';

  //   io.in(login.id).emit('someoneLogined', login.id);
  // });

  // authentication
  // client.on('authentication', (token) => {
  //   console.log('a client is authenticating', client.id);
  //   client.emit('authenticated', token);
  // });

  // client.on('logout', (logout) => {
  //   console.log('a client is logouted', logout);
  //   const uInd = users.findIndex((u => u.id == logout.id));
  //   // client.leaveAll();
  //   users[uInd].status = 'offline';
  //   io.in(logout.id).emit('someoneLogouted', logout.id);
  // });

  // client.on('sync', (dataSync) => {
  //   if (dataSync && dataSync.length) {
  //     dataSync.forEach(roomId => {
  //       client.join(roomId);
  //     });
  //   }
  // });

  // client.on('disconnect', () => {
  //   console.log(`Socket ${client.id} disconnected.`);
  //   client.leaveAll();
  // });
});

io.on('disconnection', (client) => {
  console.log('a user disconnected');
});


socketAuth(io, {
  authenticate: async (socket, data, callback) => {
    const { token } = data;
    try {
      const user = await verifyUser(token);

      const canConnect = await redisClient
        .setAsync(`users:${user.id}`, socket.id, 'NX', 'EX', 30);

      if (!canConnect) {
        return callback({ message: 'ALREADY_LOGGED_IN' });
      }

      socket.user = user;

      return callback(null, true);
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized.`);
      return callback({ message: 'UNAUTHORIZED' });
    }
  },
  postAuthenticate: async(socket) => {
    console.log(`Socket ${socket.id} authenticated.`);

    socket.conn.on('packet', async (packet) => {
      if (socket.auth && packet.type === 'ping') {
        await redisClient.setAsync(`users:${socket.user.id}`, socket.id, 'XX', 'EX', 30);
      }
    });
  },
  disconnect: async (socket) => {
    console.log(`Socket ${socket.id} disconnected.`);

    if (socket.user) {
      await redisClient.delAsync(`users:${socket.user.id}`);
    }
  },
});