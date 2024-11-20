const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const fs = require('node:fs');
const YAML = require('yaml');
const userRouter = require('./routes/user');
const { clientId, jwksUri, dbUrl } = require('./config');

const PORT = 3000;

const file  = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

const app = express();
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  if (!req.get('Authorization')) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }
  const client = jwksClient({ jwksUri });
  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, function(err, key) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }
  jwt.verify(req.get('Authorization').replace(/Bearer\s+/, ''), getKey, {}, (err, claims) => {
    if (err || claims?.client_id !== clientId) {
      return res.status(401).json({
        error: 'Unauthenticated',
      });
    } else {
      next();
    }
  });
})

app.use(userRouter);

app.use((err, req, res, next) => {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || 'Internal Server Error';
  res.status(errStatus).json({
    error: errMsg,
  });
});

mongoose.connect(dbUrl)
  .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`User API listening on ${PORT}`)))
  .catch((err) => {
    throw err;
  });
