module.exports = {
  getDetailedTeams: (participantsArray, participantsIdentitiesArray) => {
    return participantsArray.map((f, index) => {
      return (f.summonerName =
        participantsIdentitiesArray[index].player.summonerName);
    });
  },
  splitTeams: (participantsArray, teamsId) => {
    return participantsArray.filter((player) => player.teamId === teamsId);
  },
  orderTeams: (splitTeam) => {
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
  },
  getSummonerGameDetails: (participantsArray) => {
    return participantsArray.filter(
      (player) => player.summonerName == summName
    )[0];
  },
};
