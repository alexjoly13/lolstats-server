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

router.get("/", (req, res, next) => {
  // const { summonerName } = req.body;
  // console.log(summonerName);
  // kayn.Summoner.by
  //   .name("KσsmοS")
  //   .then(summoner => console.log(summoner))
  //   .catch(error => console.error(error));
});

/* GET home page */
// router.get("/", (req, res, next) => {
//   const riotApiKey = process.env.RIOT_API_KEY;
//   const url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/K%CF%83sm%CE%BFS?api_key=${riotApiKey}`;

//   axios
//     .get(url)
//     .then(response => {
//       // console.log(response.data);
//       let summId = response.data.id;
//       const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summId}?api_key=${riotApiKey}`;
//       axios
//         .get(url)
//         .then(result => {
//           console.log(result.data);
//         })
//         .catch(err => {
//           next(err);
//         });
//     })
//     .catch(err => {
//       next(err);
//     });
// });

module.exports = router;
