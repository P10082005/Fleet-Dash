require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL
};