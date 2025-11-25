const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const RedisStore = require('connect-redis').default || require('connect-redis');
const { createClient } = require('redis');

const app = express();
app.use(express.urlencoded({ extended: true }));

//redis
const redisClient = createClient({
  socket: { host: "redis", port: 6379 }
});

redisClient.connect().catch(console.error);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: "segredo_super",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 }
}));

//bd
const dbConfig = {
  host: "mysql",
  user: "root",
  password: "root",
  database: "trabalho"
};

let db;

function connectWithRetry() {
  console.log("Tentando conectar ao MySQL...");

  db = mysql.createConnection(dbConfig);

  db.connect(err => {
    if (err) {
      console.log("MySQL ainda não pronto. Tentando novamente em 5s...");
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Conectado ao MySQL com sucesso!");
    }
  });
}

connectWithRetry();

//rotas

app.get('/', (req, res) => {
  res.send("Backend funcionando");
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {

      if (err) return res.send("Erro no banco");

      if (result.length > 0) {
        req.session.user = result[0];
        req.session.loginTime = new Date();
        res.redirect('/perfil');
      } else {
        res.send("Login inválido");
      }
    }
  );
});

app.get('/perfil', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const loginTimeBR = new Date(req.session.loginTime).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  res.send(`
    <h1>Usuário: ${req.session.user.name}</h1>
    <h2>Servidor: ${process.env.SERVER_NAME}</h2>
    <h3>Login: ${loginTimeBR}</h3>
    <h3>Sessão: ${req.sessionID}</h3>
  `);
});


//STATUS

app.get('/status', (req, res) => {
  res.json({
    server: process.env.SERVER_NAME,
      time: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
  });
});

//Timer

setInterval(() => {
  console.log(` Servidor ativo: ${process.env.SERVER_NAME}`);
}, 3000);

app.listen(3000, '0.0.0.0', () => {
  console.log(` Backend ${process.env.SERVER_NAME} rodando`);
});
