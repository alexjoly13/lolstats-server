const express = require("express");
const router = express.Router();
const championData = require("../data/champion.json");

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

  const getDetailedTeams = (participantsArray, participantsIdentitiesArray) => {
    return participantsArray.map((f, index) => {
      return (f.summonerName =
        participantsIdentitiesArray[index].player.summonerName);
    });
  };

  const splitTeams = (participantsArray, teamsId) => {
    return participantsArray.filter((player) => player.teamId === teamsId);
  };

  const orderTeams = (splitTeam) => {
    const filteredPositionsTeam = [];

    splitTeam.map((onePlayer) => {
      if (
        onePlayer.timeline.role === "SOLO" &&
        onePlayer.timeline.lane === "TOP"
      ) {
        filteredPositionsTeam[0] = onePlayer;
      } else if (
        onePlayer.timeline.role === "DUO" &&
        onePlayer.timeline.lane === "TOP"
      ) {
        filteredPositionsTeam[0] = onePlayer;
      } else if (
        onePlayer.timeline.role === "NONE" &&
        onePlayer.timeline.lane === "JUNGLE"
      ) {
        filteredPositionsTeam[1] = onePlayer;
      } else if (
        onePlayer.timeline.role === "DUO" &&
        onePlayer.timeline.lane === "MIDDLE"
      ) {
        filteredPositionsTeam[2] = onePlayer;
      } else if (
        onePlayer.timeline.role === "SOLO" &&
        onePlayer.timeline.lane === "MIDDLE"
      ) {
        filteredPositionsTeam[2] = onePlayer;
      } else if (
        onePlayer.timeline.role === "DUO_CARRY" &&
        onePlayer.timeline.lane === "BOTTOM"
      ) {
        filteredPositionsTeam[3] = onePlayer;
      } else if (
        onePlayer.timeline.role === "DUO" &&
        onePlayer.timeline.lane === "BOTTOM" &&
        onePlayer.timeline.creepsPerMinDeltas[10 - 20] > 2
      ) {
        filteredPositionsTeam[3] = onePlayer;
      } else {
        filteredPositionsTeam[4] = onePlayer;
      }
    });

    return filteredPositionsTeam;
  };

  let infoRequest = async () => {
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
                const participantIdentitiesArray = [];
                const participantsArray = [];
                let showcasedSummId = [];
                let showcasedSummoner = [];

                //// SET LAST GAMES DATA

                globalData.lastGames = resultArray;

                //// END SET LAST GAMES DATA

                resultArray.forEach((oneGame) => {
                  participantIdentitiesArray.push(
                    oneGame.participantIdentities
                  );
                  participantsArray.push(oneGame.participants);
                });

                participantIdentitiesArray.map((oneParticipant) => {
                  oneParticipant.map((blah) => {
                    if (blah.player.summonerName === summName) {
                      showcasedSummId.push(blah.participantId);
                    } else {
                      return;
                    }
                  });
                });

                participantsArray.map((onePlayer, index) => {
                  onePlayer.map((touche) => {
                    if (touche.participantId === showcasedSummId[index]) {
                      showcasedSummoner.push(Object.assign(touche));
                    } else {
                      return;
                    }
                  });
                });

                globalData.lastGamesStats = {};

                globalData.lastGamesStats.victories = 0;
                globalData.lastGamesStats.defeats = 0;

                //// GET SEARCHED PLAYER DETAILED GAME STATS

                globalData.lastGames.forEach((oneGame, index) => {
                  oneGame.summonerGameDetails = showcasedSummoner[index];

                  oneGame.participants.summonerName = getDetailedTeams(
                    oneGame.participants,
                    oneGame.participantIdentities,
                    100
                  );

                  delete oneGame.participantIdentities;

                  const blueTeam = splitTeams(oneGame.participants, 100);
                  const redTeam = splitTeams(oneGame.participants, 200);

                  oneGame.teams[0].teamMembers = orderTeams(blueTeam);
                  oneGame.teams[1].teamMembers = orderTeams(redTeam);

                  //// END GET SEARCHED PLAYER DETAILED GAME STATS

                  //// GET PLAYERS ITEMS

                  const playerItems = [];

                  playerItems.push(
                    oneGame.summonerGameDetails.stats.item0,
                    oneGame.summonerGameDetails.stats.item1,
                    oneGame.summonerGameDetails.stats.item2,
                    oneGame.summonerGameDetails.stats.item3,
                    oneGame.summonerGameDetails.stats.item4,
                    oneGame.summonerGameDetails.stats.item5,
                    oneGame.summonerGameDetails.stats.item6
                  );

                  oneGame.summonerGameDetails.playerItems = playerItems;

                  //// END GET PLAYERS ITEMS

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
