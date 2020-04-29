const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/esport", (req, res, next) => {
  const apiKey = process.env.PANDASCORE_API_TOKEN;

  const leagueIds = [293, 294, 4197, 4198];

  const url = `https://api.pandascore.co/leagues?filter[id]=4197,4198,294,293&token=${apiKey}`;

  const eSportData = new Object();

  const infosObject = async () => {
    await axios
      .get(url)
      .then(async (leagueList) => {
        eSportData.leaguesList = leagueList.data;
      })
      .then(async () => {
        const upcomingMatchesIndex = leagueIds.map((oneQuery) => {
          return axios.get(
            `https://api.pandascore.co/leagues/${oneQuery}/matches/upcoming?token=${apiKey}`
          );
        });

        await Promise.all(upcomingMatchesIndex)
          .then((matches) => {
            const matchArray = matches.map((r) => {
              return r.data;
            });

            eSportData.matchList = matchArray;
          })
          .catch((err) => next(err));
        console.log(eSportData);
        res.json(eSportData);
      })
      .catch((err) => next(err));
  };
  infosObject();
});

module.exports = router;
