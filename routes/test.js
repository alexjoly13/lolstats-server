Promise.all(matchIndex)
              .then(resultArray => {
                const a = [];
                const b = [];
                let showcasedSummId = [];
                resultArray.map(oneGame => {
                  a.push(oneGame.participantIdentities);
                  b.push(oneGame.participants);
                });
                a.map(oneParticipant => {
                  oneParticipant.map(blah => {
                    if (
                      blah.player.summonerName.toLowerCase() ===
                      easier.toString()
                    ) {
                      showcasedSummId.push(blah.participantId);
                    } else {
                      return;
                    }
                  });
                });

                const graille = [];
                b.map(oneElement =>
                  oneElement.map(oneCrack => graille.push(oneCrack))
                );

                const resultshowCase = graille.filter(function(e) {
                  return showcasedSummId.includes(e.participantId);
                });

                console.log(showcasedSummId);

                finalInfos.push(resultArray, resultshowCase);

                console.log(finalInfos);