require('dotenv').config();
const express = require('express');
const dbConnect = require('./utils/dbConnect');
const cors = require('cors');

const app = express();