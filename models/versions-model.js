const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const versionSchema = new Schema(
  {
    latestVersion: { type: String, required: true },
    versionsArchive: { type: Array },
    id: { type: Number, required: true },
  },
  { timestamps: true }
);

const Versions = mongoose.model("Versions", versionSchema);

module.exports = Versions;
