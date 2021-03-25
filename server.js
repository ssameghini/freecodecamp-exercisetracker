const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb')

// Initial setting
app.use(cors())
app.use(express.urlencoded())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let database;
let users;
MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, writeConcern: {w: 'majority'}})
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
  .then(client => {
    database = client.db(process.env.MONGO_DB);
    users = database.collection('users');
    users.deleteMany();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Your app is listening on port ${process.env.PORT}`);
    });
})


// API request handling
app.post('/api/exercise/new-user', async function (req, res) {
  let username = req.body.username;
  let match = await users.find({ username: username }).next();
  console.log(match);
  if (match) {
    res.json('Username already taken');
  } else if (match === null) {
    try {
      let { insertedId } = await users.insertOne({username: username});
      res.json({ _id: insertedId, username: username });
    } catch(e) {
      res.json(`There was an error: ${e}`);
    }
  }
});

app.get('/api/exercise/users', async function (req, res) {
  let list = await users.find().sort({username: 1});
  list = await list.toArray();
  console.log(list);
  res.json(list);
});
