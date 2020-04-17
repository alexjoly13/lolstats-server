const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/esport", (req, res, next) => {
  const apiKey = process.env.PANDASCORE_API_TOKEN;
  const url = `https://api.pandascore.co/leagues?filter[id]=4197,4198,294,293&token=${apiKey}`;

  axios
    .get(url)
    .then((leagueList) => {
      res.json(leagueList.data);
    })
    .catch((err) => next(err));
});

module.exports = router;
