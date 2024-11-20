const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const jwksClient = require('jwks-rsa');
const paymentRouter = require('./routes/payment');
const redirectRouter = require('./routes/redirect');
const fs = require('node:fs');
const YAML = require('yaml');
const { clientId, jwksUri } = require('./config');

const PORT = 3002;

const file  = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

const app = express();
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(redirectRouter);

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

app.use(paymentRouter);

app.use((err, req, res, next) => {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || 'Internal Server Error';
  res.status(errStatus).json({
    error: errMsg,
  });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Payment API listening on ${PORT}`));
