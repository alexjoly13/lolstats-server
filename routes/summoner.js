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
    showKey: false
  },
  requestOptions: {
    shouldRetry: true,
    numberOfRetriesBeforeAbort: 3,
    delayBeforeRetry: 1000,
    burst: false,
    shouldExitOn403: false
  },
  cacheOptions: {
    cache: null,
    timeToLives: {
      useDefault: false,
      byGroup: {},
      byMethod: {}
    }
  }
});

router.post("/summoner", (req, res, next) => {
  const summonerNameSearch = req.body;
  let summId;
  const matches = [];
  const finalInfos = [];

  let infoRequest = async () => {
    await kayn.Summoner.by
      .name(Object.keys(summonerNameSearch))
      .then(summoner => {
        finalInfos.push(summoner);
        summId = summoner.accountId;
        kayn.Matchlist.by
          .accountID(summId)
          .query({
            endIndex: 5
          })
          .then(matchlist => {
            matchlist.matches.map(oneMatch => {
              matches.push(oneMatch.gameId);
            });

            const matchIndex = matches.map(oneQuery => {
              return kayn.Match.get(oneQuery);
            });

            Promise.all(matchIndex)
              .then(resultArray => {
                console.log(resultArray);
                finalInfos.push(resultArray);
              })
              .catch(error => console.error(error));
          })
          .catch(error => console.error(error));

        setTimeout(function() {
          res.json(finalInfos);
        }, 9000);
      })
      .catch(error => console.error(error));
  };
  infoRequest();
});

module.exports = router;
