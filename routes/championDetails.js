const express = require("express");
const router = express.Router();

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
    burst: false,
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

router.get("/champions/:championName", (req, res, next) => {
  const { championName } = req.params;

  kayn.DDragon.Champion.get(championName)
    .then((oneChampion) => {
      res.json(oneChampion);
    })
    .catch((err) => next(err));
});

module.exports = router;
