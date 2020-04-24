const express = require("express");
const router = express.Router();
const championData = require("../data/champion.json");
const functionTools = require("../helpers/summoner-route-helper.js");

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

//// END GLOBAL KAYN SETTINGS

router.post("/summoner", (req, res, next) => {
  const summonerNameSearch = req.body;
  const globalData = new Object();
  const championArray = Object.values(championData.data);
  let trimmedSummonerName = Object.keys(summonerNameSearch);
  let summId;
  let summName;
  const matches = [];

  const infoRequest = async () => {
    await kayn.Summoner.by
      .name(trimmedSummonerName)
      .then(async (summoner) => {
        globalData.summoner = summoner;
        summName = summoner.name;
        otherId = summoner.id;
        summId = summoner.accountId;

        //// GET PLAYERS RANK

        if (summoner.summonerLevel >= 30) {
          await kayn.League.Entries.by
            .summonerID(otherId)
            .then((rank) => {
              globalData.summoner.ranks = rank[0];
            })
            .catch((error) => console.error(error));
        }

        //// END GET PLAYERS RANK

        // await kayn.Matchlist.by
        //   .accountID(summId)
        //   .query({
        //     season: 13,
        //     queue: [420],
        //   })
        //   .then((gamesList) => {
        //     console.log(gamesList);
        //   })
        //   .catch((err) => next(err));

        /////////////////

        await kayn.Matchlist.by
          .accountID(summId)
          .query({
            endIndex: 10,
          })
          .then(async (matchlist) => {
            matchlist.matches.map((oneMatch) => {
              matches.push(oneMatch.gameId);
            });

            const matchIndex = matches.map((oneQuery) => {
              return kayn.Match.get(oneQuery);
            });

            await Promise.all(matchIndex)
              .then((resultArray) => {
                //// SET LAST GAMES DATA

                globalData.lastGames = resultArray;

                //// END SET LAST GAMES DATA

                globalData.lastGamesStats = {
                  victories: 0,
                  defeats: 0,
                };

                //// GET SEARCHED PLAYER DETAILED GAME STATS

                globalData.lastGames.forEach((oneGame) => {
                  oneGame.participants.summonerName = functionTools.getDetailedTeams(
                    oneGame.participants,
                    oneGame.participantIdentities
                  );

                  oneGame.summonerGameDetails = functionTools.getSummonerGameDetails(
                    oneGame.participants,
                    summName
                  );

                  delete oneGame.participantIdentities;

                  const blueTeam = functionTools.splitTeams(
                    oneGame.participants,
                    100
                  );
                  const redTeam = functionTools.splitTeams(
                    oneGame.participants,
                    200
                  );

                  oneGame.teams[0].teamMembers = functionTools.orderTeams(
                    blueTeam
                  );
                  oneGame.teams[1].teamMembers = functionTools.orderTeams(
                    redTeam
                  );

                  //// END GET SEARCHED PLAYER DETAILED GAME STATS

                  //// GET V/L RATIO

                  oneGame.summonerGameDetails.stats.win == true
                    ? (globalData.lastGamesStats.victories += 1)
                    : (globalData.lastGamesStats.defeats += 1);

                  globalData.lastGamesStats.winrate =
                    Math.floor(
                      (globalData.lastGamesStats.victories /
                        (globalData.lastGamesStats.victories +
                          globalData.lastGamesStats.defeats)) *
                        100
                    ) + "%";

                  //// END V/L RATIO

                  //// GET PLAYERS CHAMPION NAME

                  championArray.forEach((oneChampion) => {
                    if (
                      parseInt(oneChampion.key) ===
                      oneGame.summonerGameDetails.championId
                    ) {
                      oneGame.summonerGameDetails.championPlayedName =
                        oneChampion.name;
                    }
                  });

                  //// END GET PLAYERS CHAMPION NAME
                });
              })
              .catch((error) => console.error(error));
          })
          .catch((error) => console.error(error));

        res.json(globalData);
      })
      .catch((error) => console.error(error));
  };
  infoRequest();
});

module.exports = router;
