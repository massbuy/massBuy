const express = require('express');
const app = express.Router();

require('./endpoints/User')(app);
require('./endpoints/Product')(app);
require('./endpoints/Category')(app);

module.exports = app;