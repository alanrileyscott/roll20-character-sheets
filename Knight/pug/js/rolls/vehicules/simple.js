on(`clicked:rollVehicule`, async function(info) {
    let roll = info.htmlAttributes.value;

    let exec = "";

    let listAttrs = [
        "desVehicule",
        "jetModifDes",
        "ODVehicule",
    ];

    let attrs = await getAttrsAsync(listAttrs);

    let base = +attrs["desVehicule"] || 0;
    let mod = +attrs["jetModifDes"] || 0;
    let bonus = +attrs["ODVehicule"] || 0;
    var rollT = base+mod;

    exec = roll+"{{jet=[[ {[[{"+rollT+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}} {{OD=true}} {{vOD="+bonus+"}} {{tBonus=[["+bonus+"]]}} {{Exploit=[["+rollT+"]]}}";      

    startRoll(exec, (results) => {
        let tJet = results.results.jet.result;
        let tBonus = results.results.tBonus.result;
        let tExploit = results.results.Exploit.result;

        let total = tJet+tBonus;

        finishRoll(
            results.rollId, 
            {
                jet:total
            }
        );

        if(tJet != 0 && tJet == tExploit)
            startRoll(roll+"@{jetGM} &{template:simple} {{Nom=@{name}}} {{special1="+i18n_exploit+"}} {{jet=[[ {[[{"+rollT+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
                let tExploit = exploit.results.jet.result;

                finishRoll(
                    exploit.rollId, 
                    {
                        jet:tExploit
                    }
                );
        });
        
    });
});