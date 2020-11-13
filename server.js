require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Characters = require("./models/Characters");
const axios = require("axios");
// const routes = require("./routes");

const PORT = process.env.PORT || 5000;

const app = express();

// const authController = require("./controllers/authController");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(authController);

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/spellbook-characters-db",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("Mongoose successfully connected.");
});

connection.on("error", (err) => {
  console.log("Mongoose connection error: ", err);
});

app.get("/api/config", (req, res) => {
  res.json({
    success: true,
  });
});

app.get("/", async (req, res) => {
  const charArr = await axios.get(`https://www.dnd5eapi.co/api/classes/`);
  console.log(charArr);
  charArr.data.results.forEach(async (char) => {
    const character = await Characters.findOne({ name: char.name });
    if (character === null) {
      await Characters.create({ name: char.name }).then((c) => {
        c.index = char.index;
        c.url = char.url;
        c.save();
      });
    }
  });
});

app.get("/chars", async (req, res) => {
  const name = await Characters.find();
  //   console.log((name))
  res.json({ name });
});

app.get("/classNames", async (req, res) => {
  const classes = await Characters.find();
  const CharacterClasses = classes.map(async (char) => {
    const item = await axios.get(
      `https://www.dnd5eapi.co/api/classes/${char.index}`
    );
    return item.data;
  });
  Promise.all(CharacterClasses).then((results)=>{
      res.json({results})
  })
  //   console.log(await CharacterClasses)
  //   res.json({ CharacterClasses });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
