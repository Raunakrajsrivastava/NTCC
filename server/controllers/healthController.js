import mongoose from 'mongoose';

export const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.status(200).json({
    status: 'OK',
    message: 'AI Software Architecture Advisor API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      connected: dbState === 1
    },
    uptime: `${Math.floor(process.uptime())}s`
  });
};
