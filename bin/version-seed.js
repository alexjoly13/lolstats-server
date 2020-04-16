require("dotenv").config();

const mongoose = require("mongoose");

const Versions = require("../models/versions-model.js");

const firstVersion = [
  { latestVersion: "10.8.1", versionsArchive: [], id: 456 },
];

mongoose
  .connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });

Versions.insertMany(firstVersion)
  .then((versionResult) => {
    console.log(`Inserted ${versionResult.length} VERSION `);
  })
  .catch((err) => {
    console.log("Insert FAILURE !", err);
  });
