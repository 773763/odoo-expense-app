const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('TEST SERVER IS WORKING!');
});

app.listen(PORT, () => {
  console.log(`******* TEST SERVER IS RUNNING SUCCESSFULLY on port ${PORT} *******`);
});