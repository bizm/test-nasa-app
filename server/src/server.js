const app = require('./app');

const APP_PORT = process.env.PORT || 80;
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}`));
