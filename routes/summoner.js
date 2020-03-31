const express = require("express");
const router = express.Router();
const axios = "axios";

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
  const globalData = new Object();
  let easier = Object.keys(summonerNameSearch);
  let summId;
  let summName;
  const matches = [];

  let infoRequest = async () => {
    await kayn.Summoner.by
      .name(easier)
      .then(summoner => {
        globalData.summoner = summoner;
        summName = summoner.name;
        otherId = summoner.id;
        summId = summoner.accountId;

        kayn.League.Entries.by
          .summonerID(otherId)
          .then(rank => {
            globalData.summoner.ranks = rank[0];
          })
          .catch(error => console.error(error));

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
                const a = [];
                const b = [];
                let showcasedSummId = [];
                let showcasedSummoner = [];
                resultArray.map(oneGame => {
                  a.push(oneGame.participantIdentities);
                  b.push(oneGame.participants);
                });
                a.map(oneParticipant => {
                  oneParticipant.map(blah => {
                    if (blah.player.summonerName === summName) {
                      showcasedSummId.push(blah.participantId);
                    } else {
                      return;
                    }
                  });
                });

                b.map((onePlayer, index) => {
                  onePlayer.map(touche => {
                    if (touche.participantId === showcasedSummId[index]) {
                      showcasedSummoner.push(Object.assign(touche));
                    } else {
                      return;
                    }
                  });
                });

                globalData.lastGames = resultArray;

                globalData.lastGames.map((oneGame, index) => {
                  oneGame.summonerGameDetails = showcasedSummoner[index];

                  kayn.DDragon.Champion.list().callback(function(
                    error,
                    champions
                  ) {
                    const champArray = Object.values(champions.data);
                    champArray.forEach(oneChamp => {
                      if (
                        parseInt(oneChamp.key) ===
                        oneGame.summonerGameDetails.championId
                      ) {
                        oneGame.summonerGameDetails.championPlayedName =
                          oneChamp.name;
                      }
                    });
                  });
                });
              })
              .catch(error => console.error(error));
          })
          .catch(error => console.error(error));

        setTimeout(function() {
          res.json(globalData);
        }, 9000);
      })
      .catch(error => console.error(error));
  };
  infoRequest();
});

module.exports = router;
