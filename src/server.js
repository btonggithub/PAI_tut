const app = require('./app');
const { connect } = require('./config/db');

const startServer = async () => {
  try {
    await connect();

    const env = require('./config/env');

    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error(err.message);
    process.exit(1);
  }
};

startServer();
