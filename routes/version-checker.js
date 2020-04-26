const express = require("express");
const router = express.Router();
const Version = require("../models/versions-model");

//// GLOBAL KAYN SETTINGS

const { Kayn, REGIONS } = require("kayn");

const riotApiKey = process.env.RIOT_API_KEY;

const kayn = Kayn(riotApiKey)({
  region: REGIONS.EUROPE_WEST,
  apiURLPrefix: "https://%s.api.riotgames.com",
  locale: "en_US",
  debugOptions: {
    isEnabled: true,
    showKey: false,
  },
  requestOptions: {
    shouldRetry: true,
    numberOfRetriesBeforeAbort: 3,
    delayBeforeRetry: 1000,
    burst: true,
    shouldExitOn403: false,
  },
  cacheOptions: {
    cache: null,
    timeToLives: {
      useDefault: false,
      byGroup: {},
      byMethod: {},
    },
  },
});

router.get("/version", (req, res, next) => {
  let versionsComparaisonObject = new Object();

  Version.find({ id: 456 })
    .then((version) => {
      versionsComparaisonObject.dbVersion = version[0].latestVersion;
      versionsComparaisonObject.dbId = version[0]._id;
    })
    .catch((err) => next(err));

  kayn.DDragon.Version.list()
    .then((versionList) => {
      versionsComparaisonObject.currentVersion = versionList[0];

      if (
        versionsComparaisonObject.dbVersion ===
        versionsComparaisonObject.currentVersion
      ) {
        res.send(versionsComparaisonObject.dbVersion);
      } else {
        Version.findByIdAndUpdate(versionsComparaisonObject.dbId, {
          latestVersion: versionsComparaisonObject.currentVersion,
        }).then((newVersion) => {
          res.json(newVersion.latestVersion);
        });
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
