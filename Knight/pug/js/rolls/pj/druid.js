//DRUID
const druidRollSimple = [
    "druidLionChair", "druidLionBete", "druidLionMachine", "druidLionDame", "druidLionMasque",
    "druidWolfChair", "druidWolfBete", "druidWolfMachine", "druidWolfDame", "druidWolfMasque",
    "druidCrowChair", "druidCrowBete", "druidCrowMachine", "druidCrowDame", "druidCrowMasque"
];

druidRollSimple.forEach(button => {
    on(`clicked:${button}Roll`, async function(info) {
        let roll = info.htmlAttributes.value;
    
        let attributs = [
            "jetModifDesComp",
        ];

        let attrs = await getAttrsAsync(attributs);

        let exec = [];
        let cRoll = [];
        let bonus = [];

        let mod = +attrs["jetModifDesComp"];

        let aspect = button;
        let aNom = aspectCompanionsDruid[aspect];

        let attrsAspects = await getAttrsAsync([
            `${aspect}Base`,
            `${aspect}Evol`,
            `${aspect}AE`,
        ]);

        let aValue = totalADruid(attrsAspects, aspect);

        if(button != "druidCrowChair" && button != "druidCrowBete" && button != "druidCrowMachine" && button != "druidCrowDame"  && button != "druidCrowMasque") {
            let aAE = +attrsAspects[`${aspect}AE`];
            exec.push("{{vAE="+aAE+"}}");
            bonus.push(aAE);
        }
        else
            bonus.push(0);

        cRoll.push(aValue);
        cRoll.push(mod);
        
        exec.push(roll);
        exec.push("{{cBase="+aNom+"}}")
        exec.push("{{jet=[[ {{[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0}]]}}");
        exec.push("{{Exploit=[["+cRoll.join("+")+"]]}}");
        exec.push("{{tBonus=[["+bonus.join("+")+"]]}}");

        startRoll(exec.join(" "), (results) => {
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
                startRoll(roll+"@{jetGM} &{template:simple} {{Nom=@{name}}} {{special1="+i18n_exploit+"}}{{jet=[[ {[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
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
});

on(`clicked:druidLionArmeBase`, async function(info) {
    let roll = info.htmlAttributes.value;

    let attributs = [
        "aspectDruidLionBase",
        "jetModifDesComp",
        "druidLionChairBase",
        "druidLionChairEvol",
        "druidLionBeteBase",
        "druidLionBeteEvol",
        "druidLionBeteAE",
    ];

    let arme = [
        "druidLionBaseNom",
        "druidLionBaseDegats",
        "druidLionBaseDegatsBonus",
        "druidLionBaseViolence",
        "druidLionBaseViolenceBonus",
        "druidLionBasePortee"
    ]

    let special = [
        "coupBDDiversTotal",
        "bDDiversD6",
        "bDDiversFixe",
        "coupBVDiversTotal",
        "bVDiversD6",
        "bVDiversFixe"
    ]

    attributs = attributs.concat(arme, special);

    let attrs = await getAttrsAsync(attributs);

    let exec = [];
    exec.push(roll);

    let isConditionnelA = false;
    let isConditionnelD = false;
    let isConditionnelV = false;

    let diceDegats = 0;
    let degats = [];
    let bonusDegats = [];

    let diceViolence = 0;
    let violence = [];
    let bonusViolence = [];

    let portee = attrs["druidLionBasePortee"];

    let mod = +attrs["jetModifDesComp"];

    let aspect = attrs["aspectDruidLionBase"];

    let aspectNom = aspectCompanionsDruid[aspect];

    let attrsAspects = await getAttrsAsync([
        `${aspect}Base`,
        `${aspect}Evol`,
        `${aspect}AE`,
    ]);

    let aspectValue = totalADruid(attrsAspects, aspect);
    let AEValue = +attrsAspects[`${aspect}AE`];

    let vChair = totalADruid(attrs, "druidLionChair");

    let bete = totalADruid(attrs, "druidLionBete");
    let AEBete = +attrs["druidLionBeteAE"];

    let cRoll = [];
    let AE = [];
    let bonus = [];

    AE.push(AEValue);
    
    if(AE.length == 0)
        exec.push("{{vAE=0}}");
    else 
        exec.push("{{vAE="+AEValue+"}}");

    cRoll.push(aspectValue);

    diceDegats = +attrs["druidLionBaseDegats"];
    bonusDegats.push(attrs["druidLionBaseDegatsBonus"]);

    diceViolence = +attrs["druidLionBaseViolence"];
    bonusViolence.push(attrs["druidLionBaseViolenceBonus"]);

    //GESTION DES BONUS DIVERS
    let bChairD = Math.ceil(vChair/2);

    bonusDegats.push(bChairD);
    exec.push("{{vChair="+bChairD+"}}");
    //FIN DE GESTION DES BONUS DIVERS

    //GESTION DES ASPECTS EXCEPTIONNELS
    if(AEBete > 0) {
        let bonusBete = AEBete;

        if(AEBete > 5) 
            bonusBete += bete;

        exec.push("{{vBeteD=+"+bonusBete+"}}");
        bonusDegats.push(bonusBete);
    }
    //FIN DE GESTION DES ASPECTS EXCEPTIONNELS
    
    //GESTION DES BONUS SPECIAUX
    let sBonusDegats = attrs["coupBDDiversTotal"];
    let sBonusDegatsD6 = attrs["bDDiversD6"];
    let sBonusDegatsFixe = attrs["bDDiversFixe"];

    let sBonusViolence = attrs["coupBVDiversTotal"];
    let sBonusViolenceD6 = attrs["bVDiversD6"];
    let sBonusViolenceFixe = attrs["bVDiversFixe"];

    if(sBonusDegats != "0") {
        exec.push("{{vMSpecialD=+"+sBonusDegatsD6+"D6+"+sBonusDegatsFixe+"}}");
        diceDegats += Number(sBonusDegatsD6);
        bonusDegats.push(sBonusDegatsFixe);
    }

    if(sBonusViolence != "0") {
        exec.push("{{vMSpecialV=+"+sBonusViolenceD6+"D6+"+sBonusViolenceFixe+"}}");
        diceViolence += Number(sBonusViolenceD6);
        bonusViolence.push(sBonusViolenceFixe);
    }
    //FIN DE GESTION DES BONUS SPECIAUX

    exec.push("{{cBase="+aspectNom+"}}");

    if(mod != 0) {
        cRoll.push(mod);
        exec.push("{{mod="+mod+"}}");
    }

    if(cRoll.length == 0)
        cRoll.push(0);

    bonus = bonus.concat(AE);

    exec.push("{{jet=[[ {{[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0}]]}}");
    exec.push("{{Exploit=[["+cRoll.join("+")+"]]}}");
    exec.push("{{bonus=[["+bonus.join("+")+"]]}}");

    degats.push(diceDegats+"D6");
    degats = degats.concat(bonusDegats);

    violence.push(diceViolence+"D6");
    violence = violence.concat(bonusViolence);

    exec.push("{{portee="+i18n_portee+" "+portee+"}}");
    exec.push("{{degats=[["+degats.join("+")+"]]}}");
    exec.push("{{violence=[["+violence.join("+")+"]]}}");

    if(isConditionnelA == true)
        exec.push("{{succesConditionnel=true}}");

    if(isConditionnelD == true)
        exec.push("{{degatsConditionnel=true}}");

    if(isConditionnelV == true)
        exec.push("{{violenceConditionnel=true}}");
    
    startRoll(exec.join(" "), (results) => {
        let tJet = results.results.jet.result;
        let tBonus = results.results.bonus.result;
        let tExploit = results.results.Exploit.result;

        let tDegats = results.results.degats.result;
        let tViolence = results.results.violence.result;

        finishRoll(
            results.rollId, 
            {
                jet:tJet+tBonus,
                degats:tDegats,
                violence:tViolence
            }
        );

        if(tJet != 0 && tJet == tExploit)
            startRoll(roll+"@{jetGM} &{template:simple} {{Nom=@{name}}} {{special1="+i18n_exploit+"}}{{jet=[[ {[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
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

on(`clicked:repeating_armeDruidLion:combatdruidroll`, async function(info) {
    let roll = info.htmlAttributes.value;

    let attributs = [
        "repeating_armeDruidLion_armeDruidLion",
        "repeating_armeDruidLion_aspectDruidLion",
        "jetModifDesComp",
        "druidLionPEAct",
        "druidLionChairBase",
        "druidLionChairEvol",
        "druidLionBeteBase",
        "druidLionBeteEvol",
        "druidLionBeteAE",
        "druidLionMachineBase",
        "druidLionMachineEvol",
        "druidLionMachineAE",
        "druidLionMasqueBase",
        "druidLionMasqueEvol",
        "druidLionMasqueAE",
    ];

    let wpn = [
        "repeating_armeDruidLion_druidLionBaseNom",
        "repeating_armeDruidLion_degatDruidLion",
        "repeating_armeDruidLion_degatBonusDruidLion",
        "repeating_armeDruidLion_violenceDruidLion",
        "repeating_armeDruidLion_violenceBonusDruidLion",
        "repeating_armeDruidLion_porteeDruidLion"
    ]

    let effets = [
        "repeating_armeDruidLion_antiAnatheme",
        "repeating_armeDruidLion_antiVehicule",
        "repeating_armeDruidLion_artillerie",
        "repeating_armeDruidLion_assassin",
        "repeating_armeDruidLion_assassinValue",
        "repeating_armeDruidLion_assistanceAttaque",
        "repeating_armeDruidLion_barrage",
        "repeating_armeDruidLion_barrageValue",
        "repeating_armeDruidLion_cadence",
        "repeating_armeDruidLion_cadenceValue",
        "repeating_armeDruidLion_chargeur",
        "repeating_armeDruidLion_chargeurValue",
        "repeating_armeDruidLion_choc",
        "repeating_armeDruidLion_chocValue",
        "repeating_armeDruidLion_defense",
        "repeating_armeDruidLion_defenseValue",
        "repeating_armeDruidLion_degatContinue",
        "repeating_armeDruidLion_degatContinueValue",
        "repeating_armeDruidLion_deuxMains",
        "repeating_armeDruidLion_demoralisant",
        "repeating_armeDruidLion_designation",
        "repeating_armeDruidLion_destructeur",
        "repeating_armeDruidLion_dispersion",
        "repeating_armeDruidLion_dispersionValue",
        "repeating_armeDruidLion_enChaine",
        "repeating_armeDruidLion_esperance",
        "repeating_armeDruidLion_fureur",
        "repeating_armeDruidLion_ignoreArmure",
        "repeating_armeDruidLion_ignoreCdF",
        "repeating_armeDruidLion_akimbo",
        "repeating_armeDruidLion_ambidextrie",
        "repeating_armeDruidLion_leste",
        "repeating_armeDruidLion_lourd",
        "repeating_armeDruidLion_lumiere",
        "repeating_armeDruidLion_lumiereValue",
        "repeating_armeDruidLion_meurtrier",
        "repeating_armeDruidLion_obliteration",
        "repeating_armeDruidLion_orfevrerie",
        "repeating_armeDruidLion_parasitage",
        "repeating_armeDruidLion_parasitageValue",
        "repeating_armeDruidLion_penetrant",
        "repeating_armeDruidLion_penetrantValue",
        "repeating_armeDruidLion_perceArmure",
        "repeating_armeDruidLion_perceArmureValue",
        "repeating_armeDruidLion_precision",
        "repeating_armeDruidLion_reaction",
        "repeating_armeDruidLion_reactionValue",
        "repeating_armeDruidLion_silencieux",
        "repeating_armeDruidLion_soumission",
        "repeating_armeDruidLion_tenebricite",
        "repeating_armeDruidLion_tirRafale",
        "repeating_armeDruidLion_tirSecurite",
        "repeating_armeDruidLion_ultraViolence"
    ]

    let ameliorations = [
        "repeating_armeDruidLion_chargeurGrappes",
        "repeating_armeDruidLion_canonLong",
        "repeating_armeDruidLion_canonRaccourci",
        "repeating_armeDruidLion_chambreDouble",
        "repeating_armeDruidLion_interfaceGuidage",
        "repeating_armeDruidLion_jumelage",
        "repeating_armeDruidLion_jumelageValue",
        "repeating_armeDruidLion_jumelageType",
        "repeating_armeDruidLion_lunetteIntelligente",
        "repeating_armeDruidLion_munitionsHyperVelocite",
        "repeating_armeDruidLion_munitionsDrone",
        "repeating_armeDruidLion_chargeurExplosives",
        "repeating_armeDruidLion_munitionsIEM",
        "repeating_armeDruidLion_munitionsNonLetales",
        "repeating_armeDruidLion_munitionsSubsoniques",
        "repeating_armeDruidLion_pointeurLaser",
        "repeating_armeDruidLion_protectionArme",
        "repeating_armeDruidLion_revetementOmega",
        "repeating_armeDruidLion_structureElement",
        "repeating_armeDruidLion_systemeRefroidissement"
    ]

    let special = [
        "repeating_armeDruidLion_bDDiversTotal",
        "repeating_armeDruidLion_bDDiversD6",
        "repeating_armeDruidLion_bDDiversFixe",
        "repeating_armeDruidLion_bVDiversTotal",
        "repeating_armeDruidLion_bVDiversD6",
        "repeating_armeDruidLion_bVDiversFixe",
        "repeating_armeDruidLion_energie",
        "repeating_armeDruidLion_energieValue"
    ]

    attributs = attributs.concat(wpn, effets, ameliorations, special);

    let attrs = await getAttrsAsync(attributs);

    let exec = [];
    exec.push(roll);

    let isConditionnelA = false;
    let isConditionnelD = false;
    let isConditionnelV = false;

    let arme = attrs["repeating_armeDruidLion_armeDruidLion"];

    let diceDegats = 0;
    let degats = [];
    let bonusDegats = [];

    let diceViolence = 0;
    let violence = [];
    let bonusViolence = [];

    let attaquesSurprises = [];
    let attaquesSurprisesValue = [];
    let attaquesSurprisesCondition = "";

    let eASAssassin = "";
    let eASAssassinValue = 0;

    let energie = +attrs["druidLionPEAct"];
    let nEnergie = "druidLionPEAct";
    let portee = attrs["repeating_armeDruidLion_porteeDruidLion"];
    let autresEffets = [];
    let autresAmeliorations = [];
    let autresSpecial = [];

    let mod = +attrs["jetModifDesComp"];

    let aspect = attrs["repeating_armeDruidLion_aspectDruidLion"];

    let aspectNom = aspectCompanionsDruid[aspect];

    let attrsAspects = await getAttrsAsync([
        `${aspect}Base`,
        `${aspect}Evol`,
        `${aspect}AE`,
    ]);

    let aspectValue = totalADruid(attrsAspects, aspect);
    let AEValue = +attrsAspects[`${aspect}AE`];

    let vChair = totalADruid(attrs, "druidLionChair");

    let vBete = totalADruid(attrs, "druidLionBete");
    let vAEBete = +attrs[`druidLionBeteAE`];

    let vMachine = totalADruid(attrs, "druidLionMachine");
    let vAEMachine = +attrs[`druidLionMachineAE`];

    let vMasque = totalADruid(attrs, "druidLionMasque");
    let vAEMasque = +attrs[`druidLionMasqueAE`];

    let cRoll = [];
    let AE = [];
    let bonus = [];

    AE.push(AEValue);

    exec.push("{{special1B="+arme+"}}");
    
    if(AE.length == 0)
        exec.push("{{vAE=0}}");
    else 
        exec.push("{{vAE="+AEValue+"}}");

    cRoll.push(aspectValue);

    diceDegats = Number(attrs["repeating_armeDruidLion_degatDruidLion"]);
    bonusDegats.push(attrs["repeating_armeDruidLion_degatBonusDruidLion"]);

    diceViolence = Number(attrs["repeating_armeDruidLion_violenceDruidLion"]);
    bonusViolence.push(attrs["repeating_armeDruidLion_violenceBonusDruidLion"]);

    //GESTION DES BONUS DIVERS
    let bChairD = Math.ceil(vChair/2);

    if(portee == "^{portee-contact}") {
        
        bonusDegats.push(bChairD);
        exec.push("{{vChair="+bChairD+"}}");
    }
    //FIN DE GESTION DES BONUS DIVERS

    //GESTION DES ASPECTS EXCEPTIONNELS
    if(vAEBete > 0) {
        let bonusBete = vAEBete;

        if(vAEBete > 5) 
            bonusBete += vBete;

        exec.push("{{vBeteD=+"+bonusBete+"}}");
        bonusDegats.push(bonusBete);
    }
    //FIN DE GESTION DES ASPECTS EXCEPTIONNELS

    //GESTION DES EFFETS
    let rCadence = 0;

    let eAntiAnatheme = attrs["repeating_armeDruidLion_antiAnatheme"];
    let eAntiVehicule = attrs["repeating_armeDruidLion_antiVehicule"];
    let eArtillerie = attrs["repeating_armeDruidLion_artillerie"];
    let eAssassin = attrs["repeating_armeDruidLion_repeating_armeDruidLion_assassin"];
    let eAssassinV = attrs["repeating_armeDruidLion_assassinValue"];
    let eAssistanceAttaque = attrs["repeating_armeDruidLion_assistanceAttaque"];
    let eBarrage = attrs["repeating_armeDruidLion_barrage"];
    let eBarrageV = attrs["repeating_armeDruidLion_barrageValue"];
    let eCadence = attrs["repeating_armeDruidLion_cadence"];
    let eCadenceV = attrs["repeating_armeDruidLion_cadenceValue"];
    let eChargeur = attrs["repeating_armeDruidLion_chargeur"];
    let eChargeurV = attrs["repeating_armeDruidLion_chargeurValue"];
    let eChoc = attrs["repeating_armeDruidLion_choc"];
    let eChocV = attrs["repeating_armeDruidLion_chocValue"];
    let eDefense = attrs["repeating_armeDruidLion_defense"];
    let eDefenseV = attrs["repeating_armeDruidLion_defenseValue"];
    let eDegatsContinus = attrs["repeating_armeDruidLion_degatContinue"];
    let eDegatsContinusV = attrs["repeating_armeDruidLion_degatContinueValue"];
    let eDeuxMains = attrs["repeating_armeDruidLion_deuxMains"];
    let eDemoralisant = attrs["repeating_armeDruidLion_demoralisant"];
    let eDesignation = attrs["repeating_armeDruidLion_designation"];
    let eDestructeur = attrs["repeating_armeDruidLion_destructeur"];
    let eDestructeurV = 2;
    let eDispersion = attrs["repeating_armeDruidLion_dispersion"];
    let eDispersionV = attrs["repeating_armeDruidLion_dispersionValue"];
    let eEnChaine = attrs["repeating_armeDruidLion_enChaine"];
    let eEsperance = attrs["repeating_armeDruidLion_esperance"];
    let eFureur = attrs["repeating_armeDruidLion_fureur"];
    let eFureurV = 4;
    let eIgnoreArmure = attrs["repeating_armeDruidLion_ignoreArmure"];
    let eIgnoreCDF = attrs["repeating_armeDruidLion_ignoreCdF"];
    let eJAkimbo = attrs["repeating_armeDruidLion_akimbo"];
    let eJAmbidextrie = attrs["repeating_armeDruidLion_ambidextrie"];
    let eLeste = attrs["repeating_armeDruidLion_leste"];
    let eLourd = attrs["repeating_armeDruidLion_lourd"];
    let eLumiere = attrs["repeating_armeDruidLion_lumiere"];
    let eLumiereV = attrs["repeating_armeDruidLion_lumiereValue"];
    let eMeurtrier = attrs["repeating_armeDruidLion_meurtrier"];
    let eMeurtrierV = 2;
    let eObliteration = attrs["repeating_armeDruidLion_obliteration"];
    let eOrfevrerie = attrs["repeating_armeDruidLion_orfevrerie"];
    let eParasitage = attrs["repeating_armeDruidLion_parasitage"];
    let eParasitageV = attrs["repeating_armeDruidLion_parasitageValue"];
    let ePenetrant = attrs["repeating_armeDruidLion_penetrant"];
    let ePenetrantV = attrs["repeating_armeDruidLion_penetrantValue"];
    let ePerceArmure = attrs["repeating_armeDruidLion_perceArmure"];
    let ePerceArmureV = attrs["repeating_armeDruidLion_perceArmureValue"];
    let ePrecision = attrs["repeating_armeDruidLion_precision"];
    let eReaction = attrs["repeating_armeDruidLion_reaction"];
    let eReactionV = attrs["repeating_armeDruidLion_reactionValue"];
    let eSilencieux = attrs["repeating_armeDruidLion_silencieux"];
    let eSoumission = attrs["repeating_armeDruidLion_soumission"];
    let eTenebricide = attrs["repeating_armeDruidLion_tenebricite"];
    let eTirRafale = attrs["repeating_armeDruidLion_tirRafale"];
    let eTirSecurite = attrs["repeating_armeDruidLion_tirSecurite"];
    let eUltraviolence = attrs["repeating_armeDruidLion_ultraViolence"];
    let eUltraviolenceV = 2;

    if(eAntiAnatheme != "0") {
        isConditionnelD = true;
        isConditionnelV = true;
        exec.push("{{antiAnatheme="+i18n_antiAnatheme+"}}");
        exec.push("{{antiAnathemeCondition="+i18n_antiAnathemeCondition+"}}");
    }
    
    if(eAssistanceAttaque != "0") {
        isConditionnelD = true;
        isConditionnelV = true;

        exec.push("{{assistanceAttaque="+i18n_assistanceAttaque+"}}");
        exec.push("{{assistanceAttaqueCondition="+i18n_assistanceAttaqueCondition+"}}");
    }
    
    if(eArtillerie != "0") {
        isConditionnelA = true;
        exec.push("{{artillerie="+i18n_artillerie+"}}");
        exec.push("{{artillerieCondition="+i18n_artillerieCondition+"}}");
    }
    
    if(eAssassin != "0") {
        eASAssassin = i18n_assassin;
        eASAssassinValue = eAssassinV;

        if(attaquesSurprisesCondition == "")
            attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
    }

    if(eCadence != "0") { 
        rCadence = "?{Plusieurs cibles ?|Oui, 3|Non, 0}";
    }

    if(eChoc != "0") {
        isConditionnelA = true;
        exec.push("{{choc="+i18n_choc+" "+eChocV+"}}");
        exec.push("{{chocCondition="+i18n_chocCondition+"}}");
    }
                    
    if(eDemoralisant != "0") {
        isConditionnelA = true;
        exec.push("{{demoralisant="+i18n_demoralisant+"}}");
        exec.push("{{demoralisantCondition="+i18n_demoralisantCondition+"}}");
    }
                    
    if(eDestructeur != "0") {
        isConditionnelD = true;
        exec.push("{{destructeur="+i18n_destructeur+"}}");
        exec.push("{{destructeurValue=[["+eDestructeurV+"D6]]}}");
        exec.push("{{destructeurCondition="+i18n_destructeurCondition+"}}");
    }
    
    if(eEnChaine != "0") {
        isConditionnelD = true;
        exec.push("{{enChaine="+i18n_enChaine+"}}");
        exec.push("{{enChaineCondition="+i18n_enChaineCondition+"}}");
    }
    
    if(eEsperance != "0") {
        isConditionnelD = true;
        isConditionnelV = true;
        exec.push("{{esperance="+i18n_esperance+"}}");
        exec.push("{{esperanceConditionD="+i18n_esperanceConditionD+"}}");
        exec.push("{{esperanceConditionV="+i18n_esperanceConditionV+"}}");
    }
            
    if(eFureur != "0") {
        isConditionnelV = true;
        exec.push("{{fureur="+i18n_fureur+"}}");
        exec.push("{{fureurValue=[["+eFureurV+"D6]]}}");
        exec.push("{{fureurCondition="+i18n_fureurCondition+"}}");
    }
            
    if(eLeste != "0") {
        if(portee != "^{portee-contact}") 
            bChairD = vChair;

        bonusDegats.push(bChairD);
        exec.push("{{vLeste="+bChairD+"}}");
    }
            
    if(eMeurtrier != "0") {
        isConditionnelD = true;
        exec.push("{{meurtrier="+i18n_meurtrier+"}}");
        exec.push("{{meurtrierValue=[["+eMeurtrierV+"D6]]}}");
        exec.push("{{meurtrierCondition="+i18n_meurtrierCondition+"}}");
    }
            
    if(eObliteration != "0") {
        isConditionnelD = true;
        exec.push("{{obliteration="+i18n_obliteration+"}}");
        exec.push("{{obliterationCondition="+i18n_obliterationCondition+"}}");
    }
            
    if(eOrfevrerie != "0") {
        let vOrfevrerie = Math.ceil((vMasque/2)+vAEMasque);

        bonusDegats.push(vOrfevrerie);
        exec.push("{{vOrfevrerie="+vOrfevrerie+"}}");
    }
            
    if(eParasitage != "0") {
        isConditionnelA = true;
        exec.push("{{parasitage="+i18n_parasitage+" "+eParasitageV+"}}");
        exec.push("{{parasitageCondition="+i18n_parasitageCondition+"}}");
    }
            
    if(ePrecision != "0") {
        isConditionnelD = true;
        let vPrecision = Math.ceil((vMachine/2)+vAEMachine);

        bonusDegats.push(vPrecision);
        exec.push("{{vPrecision="+vPrecision+"}}");
    }

    if(eSilencieux != "0") {
        let totalSilencieux = Math.ceil((vMasque/2)+vAEMasque);

        attaquesSurprises.push(i18n_silencieux);
        attaquesSurprisesValue.push(totalSilencieux);

        if(attaquesSurprisesCondition == "")
            attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
    }

    if(eSoumission != "0") {
        isConditionnelA = true;
        exec.push("{{soumission="+i18n_soumission+"}}");
        exec.push("{{soumissionCondition="+i18n_soumissionCondition+"}}");
    }
    
    if(eTenebricide != "0") {
        exec.push("{{tenebricide="+i18n_tenebricide+"}}");
        exec.push("{{tenebricideConditionD="+i18n_tenebricideConditionD+"}}");
        exec.push("{{tenebricideConditionV="+i18n_tenebricideConditionV+"}}");
    }

    if(eTirRafale != "0") {
        exec.push("{{tirRafale="+i18n_tirRafale+"}}");
        exec.push("{{tirRafaleCondition="+i18n_tirRafaleCondition+"}}");
    }
    
    if(eUltraviolence != "0") {
        exec.push("{{ultraviolence="+i18n_ultraviolence+"}}");
        exec.push("{{ultraviolenceValue=[["+eUltraviolenceV+"D6]]}}");
        exec.push("{{ultraviolenceCondition="+i18n_ultraviolenceCondition+"}}");
    }        

    if(eAntiVehicule != "0") 
        autresEffets.push(i18n_antiVehicule);

    if(eBarrage != "0") 
        autresEffets.push(i18n_barrage+" "+eBarrageV);

    if(eChargeur != "0") 
        autresEffets.push(i18n_chargeur+" "+eChargeurV);

    if(eDefense != "0") 
        autresEffets.push(i18n_defense+" "+eDefenseV);
    
    if(eDegatsContinus != "0") 
        autresEffets.push(i18n_degatsContinus+" "+eDegatsContinusV+" ([[1d6]] "+i18n_tours+")");
    
    if(eDeuxMains != "0") 
        autresEffets.push(i18n_deuxMains);
    
    if(eDesignation != "0") 
        autresEffets.push(i18n_designation);

    if(eDispersion != "0") 
        autresEffets.push(i18n_dispersion+" "+eDispersionV);

    if(eIgnoreArmure != "0") 
        autresEffets.push(i18n_ignoreArmure);

    if(eIgnoreCDF != "0") 
        autresEffets.push(i18n_ignoreCDF);

    if(eJAkimbo != "0") 
        autresEffets.push(i18n_jAkimbo);

    if(eJAmbidextrie != "0") 
        autresEffets.push(i18n_jAmbidextrie);

    if(eLourd != "0") 
        autresEffets.push(i18n_lourd);

    if(eLumiere != "0") 
        autresEffets.push(i18n_lumiere+" "+eLumiereV);
    
    if(ePenetrant != "0") 
        autresEffets.push(i18n_penetrant+" "+ePenetrantV);
    
    if(ePerceArmure != "0") 
        autresEffets.push(i18n_perceArmure+" "+ePerceArmureV);
    
    if(eReaction != "0") 
        autresEffets.push(i18n_reaction+" "+eReactionV);
    
    if(eTirSecurite != "0") 
        autresEffets.push(i18n_tirSecurite);

    //FIN GESTION DES EFFETS

    //GESTION DES AMELIORATIONS
    let rChambreDouble = 0;

    let aChargeurGrappes = attrs["repeating_armeDruidLion_chargeurGrappes"];
    let aCanonLong = attrs["repeating_armeDruidLion_canonLong"];
    let aCanonRaccourci = attrs["repeating_armeDruidLion_canonRaccourci"];
    let aChambreDouble = attrs["repeating_armeDruidLion_chambreDouble"];
    let aInterfaceGuidage = attrs["repeating_armeDruidLion_interfaceGuidage"];
    let aJumelage = attrs["repeating_armeDruidLion_jumelage"];
    let aJumelageV = attrs["repeating_armeDruidLion_jumelageValue"];
    let aJumelageT = attrs["repeating_armeDruidLion_jumelageType"];
    let aLunetteIntelligente = attrs["repeating_armeDruidLion_lunetteIntelligente"];
    let aMunitionsDrone = attrs["repeating_armeDruidLion_munitionsDrone"];
    let aMunitionsHyperVelocite = attrs["repeating_armeDruidLion_munitionsHyperVelocite"];        
    let aChargeurExplosives = attrs["repeating_armeDruidLion_chargeurExplosives"];
    let aMunitionsIEM = attrs["repeating_armeDruidLion_munitionsIEM"];
    let aMunitionsNonLetales = attrs["repeating_armeDruidLion_munitionsNonLetales"];
    let aMunitionsSubsoniques = attrs["repeating_armeDruidLion_munitionsSubsoniques"];
    let aPointeurLaser = attrs["repeating_armeDruidLion_pointeurLaser"];
    let aProtectionArme = attrs["repeating_armeDruidLion_protectionArme"];
    let aRevetementOmega = attrs["repeating_armeDruidLion_revetementOmega"];
    let aStructureElement = attrs["repeating_armeDruidLion_structureElement"];
    let aSystemeRefroidissement = attrs["repeating_armeDruidLion_systemeRefroidissement"];

    if(aChargeurGrappes != "0") {
        exec.push("{{vMGrappeD=-1D6}}");
        exec.push("{{vMGrappeV=+1D6}}");
        diceDegats -= 1;
        diceViolence += 1;
    }

    if(aCanonLong != "0") {
        isConditionnelA = true;
        exec.push("{{canonLong="+i18n_canonLong+"}}");
        exec.push("{{canonLongCondition="+i18n_canonLongCondition+"}}");
    }

    if(aCanonRaccourci != "0") {
        isConditionnelA = true;
        exec.push("{{canonRaccourci="+i18n_canonRaccourci+"}}");
        exec.push("{{canonRaccourciCondition="+i18n_canonRaccourciCondition+"}}");
    }

    if(aChambreDouble != "0") { 
        if(eCadence != 0)
            autresAmeliorations.push(i18n_chambreDouble);
        else if(eCadence == 0)
            rChambreDouble = "?{Plusieurs cibles ?|Oui, 3|Non, 0}";
    }

    if(aLunetteIntelligente != "0") {
        isConditionnelA = true;
        exec.push("{{lunetteIntelligente="+i18n_lunetteIntelligente+"}}");
        exec.push("{{lunetteIntelligenteCondition="+i18n_lunetteIntelligenteCondition+"}}");
    }

    if(aMunitionsDrone != "0") {
        exec.push("{{vMDrone=+3}}");
        bonus.push(3);
    }

    if(aMunitionsHyperVelocite != "0") {
        if(eAssistanceAttaque != "0")
            autresAmeliorations.push(i18n_munitionsHyperVelocite);
        else if(eAssistanceAttaque == "0") {
            isConditionnelD = true;
            isConditionnelV = true;

            exec.push("{{assistanceAttaque="+i18n_munitionsHyperVelocite+"}}");
            exec.push("{{assistanceAttaqueCondition="+i18n_assistanceAttaqueCondition+"}}");
        }
    }
    
    if(aChargeurExplosives != "0") {
        exec.push("{{vMExplosiveD=+1D6}}");
        exec.push("{{vMExplosiveV=-1D6}}");
        diceDegats += 1;
        diceViolence -= 1;
    }
    
    if(aMunitionsIEM != "0") {
        exec.push("{{vMIEMD=-1D6}}");
        exec.push("{{vMIEMV=-1D6}}");
        diceDegats -= 1;
        diceViolence -= 1;
        autresAmeliorations.push(i18n_munitionsIEMParasitage);
    }
    
    if(aMunitionsSubsoniques != "0") {

        if(eSilencieux != "0")
            autresAmeliorations.push(i18n_munitionsSubsoniques);
        else if(eSilencieux == "0") {
            let totalSubsonique = vDiscretion+oDiscretion;

            attaquesSurprises.push(i18n_munitionsSubsoniques);
            attaquesSurprisesValue.push(totalSubsonique);

            if(attaquesSurprisesCondition == "")
                attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
        }
    }
    
    if(aPointeurLaser != "0") {
        exec.push("{{vMPLaser=+1}}");
        bonus.push(1);
    }

    if(aSystemeRefroidissement != "0") {
        if(eTirRafale != "0")
            autresAmeliorations.push(i18n_systemeRefroidissement+" ("+i18n_barrage+" 1)");
        else if(eTirRafale == "0") {
            exec.push("{{tirRafale="+i18n_systemeRefroidissement+" + "+i18n_barrage+" 1}}");
            exec.push("{{tirRafaleCondition="+i18n_tirRafaleCondition+"}}");
        }   
    }

    if(aRevetementOmega != "0") {
        if(eASAssassinValue < 2) {
            eASAssassin = i18n_revetementOmega;
            eASAssassinValue = 2;

            if(eASAssassinValue != 0)
                autresEffets.push(i18n_assassin);

        } else if(eASAssassinValue > 2)
            autresAmeliorations.push(i18n_revetementOmega);
    }            
    
    if(aInterfaceGuidage != "0") 
        autresAmeliorations.push(i18n_interfaceGuidage);
    
    if(aJumelage != "0") 
        autresAmeliorations.push(i18n_jumelage+" ("+aJumelageV+")");
    
    if(aMunitionsNonLetales != "0") 
        autresAmeliorations.push(i18n_munitionsNonLetales);

    if(aProtectionArme != "0") 
        autresAmeliorations.push(i18n_protectionArme);

    if(aStructureElement != "0") 
        autresAmeliorations.push(i18n_structureElementAlpha);

    //FIN GESTION DES AMELIORATIONS
    
    //GESTION DES BONUS SPECIAUX
    let sBonusDegats = attrs["repeating_armeDruidLion_bDDiversTotal"];
    let sBonusDegatsD6 = attrs["repeating_armeDruidLion_bDDiversD6"];
    let sBonusDegatsFixe = attrs["repeating_armeDruidLion_bDDiversFixe"];

    let sBonusViolence = attrs["repeating_armeDruidLion_bVDiversTotal"];
    let sBonusViolenceD6 = attrs["repeating_armeDruidLion_bVDiversD6"];
    let sBonusViolenceFixe = attrs["repeating_armeDruidLion_bVDiversFixe"];

    let sEnergie = attrs["repeating_armeDruidLion_energie"];
    let sEnergieValue = attrs["repeating_armeDruidLion_energieValue"];

    let pasDEnergie = false;
    let sEnergieText = "";

    if(sBonusDegats != "0") {
        exec.push("{{vMSpecialD=+"+sBonusDegatsD6+"D6+"+sBonusDegatsFixe+"}}");

        diceDegats += Number(sBonusDegatsD6);
        bonusDegats.push(sBonusDegatsFixe);
    }

    if(sBonusViolence != "0") {
        exec.push("{{vMSpecialV=+"+sBonusViolenceD6+"D6+"+sBonusViolenceFixe+"}}");

        diceViolence += Number(sBonusViolenceD6);
        bonusViolence.push(sBonusViolenceFixe);
    }

    if(sEnergie != "0") {
        autresSpecial.push(i18n_energieRetiree+" ("+sEnergieValue+")");

        var newEnergie = Number(energie)-Number(sEnergieValue);

        if(newEnergie == 0) {
            sEnergieText = i18n_plusEnergie;

        } else if(newEnergie < 0) {

            newEnergie = 0;
            sEnergieText = i18n_pasEnergie;
            pasDEnergie = true;
        }
        
        exec.push("{{energieR="+newEnergie+"}}");
    }
    //FIN DE GESTION DES BONUS SPECIAUX

    exec.push("{{cBase="+aspectNom+"}}");

    if(mod != 0) {
        cRoll.push(mod);
        exec.push("{{mod="+mod+"}}");
    }

    if(cRoll.length == 0)
        cRoll.push(0);

    bonus = bonus.concat(AE);

    exec.push("{{jet=[[ {[[{"+cRoll.join("+")+"-"+rCadence+"-"+rChambreDouble+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}");
    exec.push("{{Exploit=[["+cRoll.join("+")+"-"+rCadence+"-"+rChambreDouble+"]]}}");
    exec.push("{{bonus=[["+bonus.join("+")+"]]}}");

    if(diceDegats < 0)
        diceDegats = 0;

    degats.push(diceDegats+"D6");
    degats = degats.concat(bonusDegats);

    if(diceViolence < 0)
        diceViolence = 0;

    violence.push(diceViolence+"D6");
    violence = violence.concat(bonusViolence);

    exec.push("{{portee="+i18n_portee+" "+portee+"}}");
    exec.push("{{degats=[["+degats.join("+")+"]]}}");
    exec.push("{{violence=[["+violence.join("+")+"]]}}");

    if(eTenebricide != "0") {
        let degatsTenebricide = [];
        let ASTenebricide = [];
        let ASValueTenebricide = [];

        let violenceTenebricide = [];

        diceDegatsTenebricide = Math.floor(diceDegats/2);
        diceViolenceTenebricide = Math.floor(diceViolence/2);

        degatsTenebricide.push(diceDegatsTenebricide+"D6");
        degatsTenebricide = degatsTenebricide.concat(bonusDegats);

        violenceTenebricide.push(diceViolenceTenebricide+"D6");
        violenceTenebricide = violenceTenebricide.concat(bonusViolence);
        
        exec.push("{{tenebricideValueD=[["+degatsTenebricide.join("+")+"]]}}");
        exec.push("{{tenebricideValueV=[["+violenceTenebricide.join("+")+"]]}}");

        if(eASAssassinValue > 0) {
            eAssassinTenebricideValue = Math.ceil(eASAssassinValue/2);

            ASTenebricide.unshift(eASAssassin);
            ASValueTenebricide.unshift(eAssassinTenebricideValue+"D6");

            if(attaquesSurprises.length > 0) {
                ASTenebricide = ASTenebricide.concat(attaquesSurprises);
                ASValueTenebricide = ASValueTenebricide.concat(attaquesSurprisesValue);
            }

            exec.push("{{tenebricideAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{tenebricideASValue=[["+ASValueTenebricide.join("+")+"]]}}");
        } else if(attaquesSurprises.length > 0) {

            ASTenebricide = ASTenebricide.concat(attaquesSurprises);
            ASValueTenebricide = ASValueTenebricide.concat(attaquesSurprisesValue);

            exec.push("{{tenebricideAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{tenebricideASValue=[["+ASValueTenebricide.join("+")+"]]}}");
        }
    }

    if(eObliteration != "0") {
        let ASObliteration = [];
        let ASValueObliteration = [];

        diceDegatsObliteration = diceDegats*6;
        
        degatsFObliteration = _.reduce(bonusDegats, function(n1, n2){return Number(n1) + Number(n2);});

        let vObliteration = diceDegatsObliteration+degatsFObliteration;

        exec.push("{{obliterationValue="+vObliteration+"}}");

        if(eMeurtrier != "0")
            exec.push("{{obliterationMeurtrierValue="+eMeurtrierV*6+"}}");

        if(eDestructeur != "0")
            exec.push("{{obliterationDestructeurValue="+eDestructeurV*6+"}}");

        if(eASAssassinValue > 0) {
            eAssassinTenebricideValue = eASAssassinValue*6;

            ASObliteration.unshift(eASAssassin);
            ASValueObliteration.unshift(eAssassinTenebricideValue);

            if(attaquesSurprises.length > 0) {
                ASObliteration = ASObliteration.concat(attaquesSurprises);
                ASValueObliteration = ASValueObliteration.concat(attaquesSurprisesValue);
            }

            exec.push("{{obliterationAS="+ASObliteration.join("\n+")+"}}");
            exec.push("{{obliterationASValue=[["+ASValueObliteration.join("+")+"]]}}");
        } else if(attaquesSurprises.length > 0) {

            ASObliteration = ASObliteration.concat(attaquesSurprises);
            ASValueObliteration = ASValueObliteration.concat(attaquesSurprisesValue);

            exec.push("{{obliterationAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{obliterationASValue="+_.reduce(ASValueObliteration, function(n1, n2){ return n1 + n2; }, 0)+"}}");
        }
    }

    if(rCadence != 0) {
        exec.push("{{rCadence="+i18n_cadence+" "+eCadenceV+" "+i18n_inclus+"}}");
        exec.push("{{vCadence="+rCadence+"D6}}");
    }
        
    if(rChambreDouble != 0)
        exec.push("{{vChambreDouble="+rChambreDouble+"}}");

    if(eASAssassinValue > 0)
    {
        attaquesSurprises.unshift(eASAssassin);
        attaquesSurprisesValue.unshift(eASAssassinValue+"D6");
    }

    if(attaquesSurprises.length > 0) {
        exec.push("{{attaqueSurprise="+attaquesSurprises.join("\n+")+"}}");
        exec.push("{{attaqueSurpriseValue=[["+attaquesSurprisesValue.join("+")+"]]}}");
        exec.push(attaquesSurprisesCondition);
    }

    if(autresEffets.length > 0)
        exec.push("{{effets="+autresEffets.join(" / ")+"}}");

    if(autresAmeliorations.length > 0)
        exec.push("{{ameliorations="+autresAmeliorations.join(" / ")+"}}");

    if(autresSpecial.length > 0)
        exec.push("{{special="+autresSpecial.join(" / ")+"}}");

    if(isConditionnelA == true)
        exec.push("{{succesConditionnel=true}}");

    if(isConditionnelD == true)
        exec.push("{{degatsConditionnel=true}}");

    if(isConditionnelV == true)
        exec.push("{{violenceConditionnel=true}}");

    if(pasDEnergie == false) {
        startRoll(exec.join(" "), (results) => {
            let tJet = results.results.jet.result;
            let tJetDice = results.results.jet.dice.length;

            let tBonus = results.results.bonus.result;
            let tExploit = results.results.Exploit.result;

            let tDegats = results.results.degats.result;
            let tViolence = results.results.violence.result;

            let tMeurtrier = results.results.meurtrierValue;
            let vTMeurtrier = 0;

            if(tMeurtrier != undefined)
                vTMeurtrier = tMeurtrier.dice[0];

            let tDestructeur = results.results.destructeurValue;
            let vTDestructeur = 0;

            if(tDestructeur != undefined)
                vTDestructeur = tDestructeur.dice[0];
            
            let tFureur = results.results.fureurValue;
            let vTFureur = 0;

            if(tFureur != undefined)
                vTFureur = tFureur.dice[0]+tFureur.dice[1];
            
            let tUltraviolence = results.results.ultraviolenceValue;
            
            let vTUltraviolence = 0;

            if(tUltraviolence != undefined)
                vTUltraviolence = tUltraviolence.dice[0];

            finishRoll(
                results.rollId, 
                {
                    jet:tJet+tBonus,
                    degats:tDegats,
                    violence:tViolence,
                    meurtrierValue:vTMeurtrier,
                    destructeurValue:vTDestructeur,
                    fureurValue:vTFureur,
                    ultraviolenceValue:vTUltraviolence,
                }
            );                

            if(tJet != 0 && tJet == tExploit) 
                startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+i18n_exploit+"}} {{jet=[[ {[[{"+tJetDice+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
                    let tExploit = exploit.results.jet.result;

                    finishRoll(
                        exploit.rollId, 
                        {
                            jet:tExploit
                        }
                    );
                });
                

            if(sEnergie != "0") {
                setAttrs({
                    [nEnergie]: newEnergie
                });

                if(newEnergie == 0) {
                    startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+arme+"}} {{text="+sEnergieText+"}}", (exploit) => {    
                        finishRoll(
                            exploit.rollId,{}
                        );
                    });
                }
            }

            
        });
    } else {
        startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+arme+"}} {{text="+sEnergieText+"}}", (text) => {
            finishRoll(
                text.rollId,{}
            );
        });
    }
});

//MALDRUID
const MALDruidRollSimple = [
    "MALDruidLionChair", "MALDruidLionBete", "MALDruidLionMachine", "MALDruidLionDame", "MALDruidLionMasque",
    "MALDruidWolfChair", "MALDruidWolfBete", "MALDruidWolfMachine", "MALDruidWolfDame", "MALDruidWolfMasque",
    "MALDruidCrowChair", "MALDruidCrowBete", "MALDruidCrowMachine", "MALDruidCrowDame", "MALDruidCrowMasque"
];

MALDruidRollSimple.forEach(button => {
    on(`clicked:${button}Roll`, async function(info) {
        let roll = info.htmlAttributes.value;
    
        let attributs = [
            "MALJetModifDesComp",
        ];

        let attrs = await getAttrsAsync(attributs);

        let exec = [];
        let cRoll = [];
        let bonus = [];

        let mod = +attrs["MALJetModifDesComp"];

        let aspect = button;
        let aNom = aspectCompanionsDruid[aspect];

        let attrsAspects = await getAttrsAsync([
            `${aspect}Base`,
            `${aspect}Evol`,
            `${aspect}AE`,
        ]);

        let aValue = totalADruid(attrsAspects, aspect);

        if(button != "MALDruidCrowChair" && button != "MALDruidCrowBete" && button != "MALDruidCrowMachine" && button != "MALDruidCrowDame"  && button != "MALDruidCrowMasque") {
            let aAE = attrsAspects[`${aspect}AE`];
            exec.push("{{vAE="+aAE+"}}");
            bonus.push(aAE);
        }
        else
            bonus.push(0);

        cRoll.push(aValue);
        cRoll.push(mod);

        exec.push(roll);
        exec.push("{{cBase="+aNom+"}}")
        exec.push("{{jet=[[ {{[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0}]]}}");
        exec.push("{{Exploit=[["+cRoll.join("+")+"]]}}");
        exec.push("{{tBonus=[["+bonus.join("+")+"]]}}");

        startRoll(exec.join(" "), (results) => {
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
                startRoll(roll+"@{jetGM} &{template:simple} {{Nom=@{name}}} {{special1="+i18n_exploit+"}}{{jet=[[ {[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
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
});

on(`clicked:MALDruidLionArmeBase`, async function(info) {
    let roll = info.htmlAttributes.value;

    let attributs = [
        "MALAspectDruidLionBase",
        "MALJetModifDesComp",
        "MALDruidLionChairBase",
        "MALDruidLionChairEvol",
        "MALDruidLionBeteBase",
        "MALDruidLionBeteEvol",
        "MALDruidLionBeteAE",
    ];

    let arme = [
        "MALDruidLionBaseNom",
        "MALDruidLionBaseDegats",
        "MALDruidLionBaseDegatsBonus",
        "MALDruidLionBaseViolence",
        "MALDruidLionBaseViolenceBonus",
        "MALDruidLionBasePortee"
    ]

    let special = [
        "MALCoupBDDiversTotal",
        "MALBDDiversD6",
        "MALBDDiversFixe",
        "MALCoupBVDiversTotal",
        "MALBVDiversD6",
        "MALBVDiversFixe"
    ]

    attributs = attributs.concat(arme, special);

    let attrs = await getAttrsAsync(attributs);

    let exec = [];
    exec.push(roll);

    let isConditionnelA = false;
    let isConditionnelD = false;
    let isConditionnelV = false;

    let diceDegats = 0;
    let degats = [];
    let bonusDegats = [];

    let diceViolence = 0;
    let violence = [];
    let bonusViolence = [];

    let portee = attrs["MALDruidLionBasePortee"];

    let mod = Number(attrs["MALJetModifDesComp"]);

    let aspect = attrs["MALAspectDruidLionBase"];

    let aspectNom = aspectCompanionsDruid[aspect];

    let attrsAspects = await getAttrsAsync([
        `${aspect}Base`,
        `${aspect}Evol`,
        `${aspect}AE`,
    ]);

    let aspectValue = totalADruid(attrsAspects, aspect);
    let AEValue = +attrsAspects[`${aspect}AE`] || 0;

    let vChair = totalADruid(attrs, "MALDruidLionChair");

    let bete = totalADruid(attrs, "MALDruidLionBete");
    let AEBete = +attrs[`MALDruidLionBeteAE`];

    let cRoll = [];
    let AE = [];
    let bonus = [];

    AE.push(AEValue);
    
    exec.push("{{vAE="+AEValue+"}}");

    cRoll.push(aspectValue);

    diceDegats = Number(attrs["MALDruidLionBaseDegats"]);
    bonusDegats.push(attrs["MALDruidLionBaseDegatsBonus"]);

    diceViolence = Number(attrs["MALDruidLionBaseViolence"]);
    bonusViolence.push(attrs["MALDruidLionBaseViolenceBonus"]);

    //GESTION DES BONUS DIVERS
    let bChairD = Math.ceil(vChair/2);

    bonusDegats.push(bChairD);
    exec.push("{{vChair="+bChairD+"}}");
    //FIN DE GESTION DES BONUS DIVERS

    //GESTION DES ASPECTS EXCEPTIONNELS
    if(AEBete > 0) {
        let bonusBete = AEBete;

        if(AEBete > 5) 
            bonusBete += bete;

        exec.push("{{vBeteD=+"+bonusBete+"}}");
        bonusDegats.push(bonusBete);
    }
    //FIN DE GESTION DES ASPECTS EXCEPTIONNELS
    
    //GESTION DES BONUS SPECIAUX
    let sBonusDegats = attrs["MALCoupBDDiversTotal"];
    let sBonusDegatsD6 = attrs["MALBDDiversD6"];
    let sBonusDegatsFixe = attrs["MALBDDiversFixe"];

    let sBonusViolence = attrs["MALCoupBVDiversTotal"];
    let sBonusViolenceD6 = attrs["MALBVDiversD6"];
    let sBonusViolenceFixe = attrs["MALBVDiversFixe"];

    if(sBonusDegats != "0") {
        exec.push("{{vMSpecialD=+"+sBonusDegatsD6+"D6+"+sBonusDegatsFixe+"}}");
        diceDegats += Number(sBonusDegatsD6);
        bonusDegats.push(sBonusDegatsFixe);
    }

    if(sBonusViolence != "0") {
        exec.push("{{vMSpecialV=+"+sBonusViolenceD6+"D6+"+sBonusViolenceFixe+"}}");
        diceViolence += Number(sBonusViolenceD6);
        bonusViolence.push(sBonusViolenceFixe);
    }
    //FIN DE GESTION DES BONUS SPECIAUX

    exec.push("{{cBase="+aspectNom+"}}");

    if(mod != 0) {
        cRoll.push(mod);
        exec.push("{{mod="+mod+"}}");
    }

    if(cRoll.length == 0)
        cRoll.push(0);

    bonus = bonus.concat(AE);

    exec.push("{{jet=[[ {{[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0}]]}}");
    exec.push("{{Exploit=[["+cRoll.join("+")+"]]}}");
    exec.push("{{bonus=[["+bonus.join("+")+"]]}}");

    degats.push(diceDegats+"D6");
    degats = degats.concat(bonusDegats);

    violence.push(diceViolence+"D6");
    violence = violence.concat(bonusViolence);

    exec.push("{{portee="+i18n_portee+" "+portee+"}}");
    exec.push("{{degats=[["+degats.join("+")+"]]}}");
    exec.push("{{violence=[["+violence.join("+")+"]]}}");

    if(isConditionnelA == true)
        exec.push("{{succesConditionnel=true}}");

    if(isConditionnelD == true)
        exec.push("{{degatsConditionnel=true}}");

    if(isConditionnelV == true)
        exec.push("{{violenceConditionnel=true}}");
    
    startRoll(exec.join(" "), (results) => {
        let tJet = results.results.jet.result;
        let tBonus = results.results.bonus.result;
        let tExploit = results.results.Exploit.result;

        let tDegats = results.results.degats.result;
        let tViolence = results.results.violence.result;

        finishRoll(
            results.rollId, 
            {
                jet:tJet+tBonus,
                degats:tDegats,
                violence:tViolence
            }
        );

        if(tJet != 0 && tJet == tExploit)
            startRoll(roll+"@{jetGM} &{template:simple} {{Nom=@{name}}} {{special1="+i18n_exploit+"}}{{jet=[[ {[[{"+cRoll.join("+")+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
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

on(`clicked:repeating_armeMALDruidLion:combatdruidroll`, async function(info) {
    let roll = info.htmlAttributes.value;

    let attributs = [
        "repeating_armeMALDruidLion_armeDruidLion",
        "repeating_armeMALDruidLion_aspectDruidLion",
        "MALJetModifDesComp",
        "MALDruidLionPEAct",
        "MALDruidLionChairBase",
        "MALDruidLionChairEvol",
        "MALDruidLionBeteBase",
        "MALDruidLionBeteEvol",
        "MALDruidLionBeteAE",
        "MALDruidLionMachineBase",
        "MALDruidLionMachineEvol",
        "MALDruidLionMachineAE",
        "MALDruidLionMasqueBase",
        "MALDruidLionMasqueEvol",
        "MALDruidLionMasqueAE",
    ];

    let wpn = [
        "repeating_armeMALDruidLion_druidLionBaseNom",
        "repeating_armeMALDruidLion_degatDruidLion",
        "repeating_armeMALDruidLion_degatBonusDruidLion",
        "repeating_armeMALDruidLion_violenceDruidLion",
        "repeating_armeMALDruidLion_violenceBonusDruidLion",
        "repeating_armeMALDruidLion_porteeDruidLion"
    ]

    let effets = [
        "repeating_armeMALDruidLion_antiAnatheme",
        "repeating_armeMALDruidLion_antiVehicule",
        "repeating_armeMALDruidLion_artillerie",
        "repeating_armeMALDruidLion_assassin",
        "repeating_armeMALDruidLion_assassinValue",
        "repeating_armeMALDruidLion_assistanceAttaque",
        "repeating_armeMALDruidLion_barrage",
        "repeating_armeMALDruidLion_barrageValue",
        "repeating_armeMALDruidLion_cadence",
        "repeating_armeMALDruidLion_cadenceValue",
        "repeating_armeMALDruidLion_chargeur",
        "repeating_armeMALDruidLion_chargeurValue",
        "repeating_armeMALDruidLion_choc",
        "repeating_armeMALDruidLion_chocValue",
        "repeating_armeMALDruidLion_defense",
        "repeating_armeMALDruidLion_defenseValue",
        "repeating_armeMALDruidLion_degatContinue",
        "repeating_armeMALDruidLion_degatContinueValue",
        "repeating_armeMALDruidLion_deuxMains",
        "repeating_armeMALDruidLion_demoralisant",
        "repeating_armeMALDruidLion_designation",
        "repeating_armeMALDruidLion_destructeur",
        "repeating_armeMALDruidLion_dispersion",
        "repeating_armeMALDruidLion_dispersionValue",
        "repeating_armeMALDruidLion_enChaine",
        "repeating_armeMALDruidLion_esperance",
        "repeating_armeMALDruidLion_fureur",
        "repeating_armeMALDruidLion_ignoreArmure",
        "repeating_armeMALDruidLion_ignoreCdF",
        "repeating_armeMALDruidLion_akimbo",
        "repeating_armeMALDruidLion_ambidextrie",
        "repeating_armeMALDruidLion_leste",
        "repeating_armeMALDruidLion_lourd",
        "repeating_armeMALDruidLion_lumiere",
        "repeating_armeMALDruidLion_lumiereValue",
        "repeating_armeMALDruidLion_meurtrier",
        "repeating_armeMALDruidLion_obliteration",
        "repeating_armeMALDruidLion_orfevrerie",
        "repeating_armeMALDruidLion_parasitage",
        "repeating_armeMALDruidLion_parasitageValue",
        "repeating_armeMALDruidLion_penetrant",
        "repeating_armeMALDruidLion_penetrantValue",
        "repeating_armeMALDruidLion_perceArmure",
        "repeating_armeMALDruidLion_perceArmureValue",
        "repeating_armeMALDruidLion_precision",
        "repeating_armeMALDruidLion_reaction",
        "repeating_armeMALDruidLion_reactionValue",
        "repeating_armeMALDruidLion_silencieux",
        "repeating_armeMALDruidLion_soumission",
        "repeating_armeMALDruidLion_tenebricite",
        "repeating_armeMALDruidLion_tirRafale",
        "repeating_armeMALDruidLion_tirSecurite",
        "repeating_armeMALDruidLion_ultraViolence"
    ]

    let ameliorations = [
        "repeating_armeMALDruidLion_chargeurGrappes",
        "repeating_armeMALDruidLion_canonLong",
        "repeating_armeMALDruidLion_canonRaccourci",
        "repeating_armeMALDruidLion_chambreDouble",
        "repeating_armeMALDruidLion_interfaceGuidage",
        "repeating_armeMALDruidLion_jumelage",
        "repeating_armeMALDruidLion_jumelageValue",
        "repeating_armeMALDruidLion_jumelageType",
        "repeating_armeMALDruidLion_lunetteIntelligente",
        "repeating_armeMALDruidLion_munitionsHyperVelocite",
        "repeating_armeMALDruidLion_munitionsDrone",
        "repeating_armeMALDruidLion_chargeurExplosives",
        "repeating_armeMALDruidLion_munitionsIEM",
        "repeating_armeMALDruidLion_munitionsNonLetales",
        "repeating_armeMALDruidLion_munitionsSubsoniques",
        "repeating_armeMALDruidLion_pointeurLaser",
        "repeating_armeMALDruidLion_protectionArme",
        "repeating_armeMALDruidLion_revetementOmega",
        "repeating_armeMALDruidLion_structureElement",
        "repeating_armeMALDruidLion_systemeRefroidissement"
    ]

    let special = [
        "repeating_armeMALDruidLion_bDDiversTotal",
        "repeating_armeMALDruidLion_bDDiversD6",
        "repeating_armeMALDruidLion_bDDiversFixe",
        "repeating_armeMALDruidLion_bVDiversTotal",
        "repeating_armeMALDruidLion_bVDiversD6",
        "repeating_armeMALDruidLion_bVDiversFixe",
        "repeating_armeMALDruidLion_energie",
        "repeating_armeMALDruidLion_energieValue"
    ]

    attributs = attributs.concat(wpn, effets, ameliorations, special);

    let attrs = await getAttrsAsync(attributs);

    let exec = [];
    exec.push(roll);

    let isConditionnelA = false;
    let isConditionnelD = false;
    let isConditionnelV = false;

    let arme = attrs["repeating_armeMALDruidLion_armeDruidLion"];

    let diceDegats = 0;
    let degats = [];
    let bonusDegats = [];

    let diceViolence = 0;
    let violence = [];
    let bonusViolence = [];

    let attaquesSurprises = [];
    let attaquesSurprisesValue = [];
    let attaquesSurprisesCondition = "";

    let eASAssassin = "";
    let eASAssassinValue = 0;

    let energie = attrs["MALDruidLionPEAct"];
    let nEnergie = "MALDruidLionPEAct";
    let portee = attrs["repeating_armeMALDruidLion_porteeDruidLion"];
    let autresEffets = [];
    let autresAmeliorations = [];
    let autresSpecial = [];

    let mod = +attrs["MALJetModifDesComp"];

    let aspect = attrs["repeating_armeMALDruidLion_aspectDruidLion"];

    let aspectNom = aspectCompanionsDruid[aspect];

    let attrsAspects = await getAttrsAsync([
        `${aspect}Base`,
        `${aspect}Evol`,
        `${aspect}AE`,
    ]);

    let aspectValue = totalADruid(attrsAspects, aspect);
    let AEValue = +attrsAspects[`${aspect}AE`] || 0;

    let vChair = totalADruid(attrs, "MALDruidLionChair");

    let vBete = totalADruid(attrs, "MALDruidLionBete");
    let vAEBete = +attrs["MALDruidLionBeteAE"];

    let vMachine = totalADruid(attrs, "MALDruidLionMachine");
    let vAEMachine = +attrs["MALDruidLionMachineAE"];

    let vMasque = totalADruid(attrs, "MALDruidLionMasque");
    let vAEMasque = +attrs["MALDruidLionMasqueAE"];

    let cRoll = [];
    let AE = [];
    let bonus = [];

    AE.push(AEValue);

    exec.push("{{special1B="+arme+"}}");
    
    exec.push("{{vAE="+AEValue+"}}");

    cRoll.push(aspectValue);

    diceDegats = +attrs["repeating_armeMALDruidLion_degatDruidLion"];
    bonusDegats.push(attrs["repeating_armeMALDruidLion_degatBonusDruidLion"]);

    diceViolence = +attrs["repeating_armeMALDruidLion_violenceDruidLion"];
    bonusViolence.push(attrs["repeating_armeMALDruidLion_violenceBonusDruidLion"]);

    //GESTION DES BONUS DIVERS
    let bChairD = Math.ceil(vChair/2);

    if(portee == "^{portee-contact}") {
        
        bonusDegats.push(bChairD);
        exec.push("{{vChair="+bChairD+"}}");
    }
    //FIN DE GESTION DES BONUS DIVERS

    //GESTION DES ASPECTS EXCEPTIONNELS
    if(vAEBete > 0) {
        let bonusBete = vAEBete;

        if(vAEBete > 5) 
            bonusBete += vBete;

        exec.push("{{vBeteD=+"+bonusBete+"}}");
        bonusDegats.push(bonusBete);
    }
    //FIN DE GESTION DES ASPECTS EXCEPTIONNELS

    //GESTION DES EFFETS
    let rCadence = 0;

    let eAntiAnatheme = attrs["repeating_armeMALDruidLion_antiAnatheme"];
    let eAntiVehicule = attrs["repeating_armeMALDruidLion_antiVehicule"];
    let eArtillerie = attrs["repeating_armeMALDruidLion_artillerie"];
    let eAssassin = attrs["repeating_armeMALDruidLion_repeating_armeMALDruidLion_assassin"];
    let eAssassinV = attrs["repeating_armeMALDruidLion_assassinValue"];
    let eAssistanceAttaque = attrs["repeating_armeMALDruidLion_assistanceAttaque"];
    let eBarrage = attrs["repeating_armeMALDruidLion_barrage"];
    let eBarrageV = attrs["repeating_armeMALDruidLion_barrageValue"];
    let eCadence = attrs["repeating_armeMALDruidLion_cadence"];
    let eCadenceV = attrs["repeating_armeMALDruidLion_cadenceValue"];
    let eChargeur = attrs["repeating_armeMALDruidLion_chargeur"];
    let eChargeurV = attrs["repeating_armeMALDruidLion_chargeurValue"];
    let eChoc = attrs["repeating_armeMALDruidLion_choc"];
    let eChocV = attrs["repeating_armeMALDruidLion_chocValue"];
    let eDefense = attrs["repeating_armeMALDruidLion_defense"];
    let eDefenseV = attrs["repeating_armeMALDruidLion_defenseValue"];
    let eDegatsContinus = attrs["repeating_armeMALDruidLion_degatContinue"];
    let eDegatsContinusV = attrs["repeating_armeMALDruidLion_degatContinueValue"];
    let eDeuxMains = attrs["repeating_armeMALDruidLion_deuxMains"];
    let eDemoralisant = attrs["repeating_armeMALDruidLion_demoralisant"];
    let eDesignation = attrs["repeating_armeMALDruidLion_designation"];
    let eDestructeur = attrs["repeating_armeMALDruidLion_destructeur"];
    let eDestructeurV = 2;
    let eDispersion = attrs["repeating_armeMALDruidLion_dispersion"];
    let eDispersionV = attrs["repeating_armeMALDruidLion_dispersionValue"];
    let eEnChaine = attrs["repeating_armeMALDruidLion_enChaine"];
    let eEsperance = attrs["repeating_armeMALDruidLion_esperance"];
    let eFureur = attrs["repeating_armeMALDruidLion_fureur"];
    let eFureurV = 4;
    let eIgnoreArmure = attrs["repeating_armeMALDruidLion_ignoreArmure"];
    let eIgnoreCDF = attrs["repeating_armeMALDruidLion_ignoreCdF"];
    let eJAkimbo = attrs["repeating_armeMALDruidLion_akimbo"];
    let eJAmbidextrie = attrs["repeating_armeMALDruidLion_ambidextrie"];
    let eLeste = attrs["repeating_armeMALDruidLion_leste"];
    let eLourd = attrs["repeating_armeMALDruidLion_lourd"];
    let eLumiere = attrs["repeating_armeMALDruidLion_lumiere"];
    let eLumiereV = attrs["repeating_armeMALDruidLion_lumiereValue"];
    let eMeurtrier = attrs["repeating_armeMALDruidLion_meurtrier"];
    let eMeurtrierV = 2;
    let eObliteration = attrs["repeating_armeMALDruidLion_obliteration"];
    let eOrfevrerie = attrs["repeating_armeMALDruidLion_orfevrerie"];
    let eParasitage = attrs["repeating_armeMALDruidLion_parasitage"];
    let eParasitageV = attrs["repeating_armeMALDruidLion_parasitageValue"];
    let ePenetrant = attrs["repeating_armeMALDruidLion_penetrant"];
    let ePenetrantV = attrs["repeating_armeMALDruidLion_penetrantValue"];
    let ePerceArmure = attrs["repeating_armeMALDruidLion_perceArmure"];
    let ePerceArmureV = attrs["repeating_armeMALDruidLion_perceArmureValue"];
    let ePrecision = attrs["repeating_armeMALDruidLion_precision"];
    let eReaction = attrs["repeating_armeMALDruidLion_reaction"];
    let eReactionV = attrs["repeating_armeMALDruidLion_reactionValue"];
    let eSilencieux = attrs["repeating_armeMALDruidLion_silencieux"];
    let eSoumission = attrs["repeating_armeMALDruidLion_soumission"];
    let eTenebricide = attrs["repeating_armeMALDruidLion_tenebricite"];
    let eTirRafale = attrs["repeating_armeMALDruidLion_tirRafale"];
    let eTirSecurite = attrs["repeating_armeMALDruidLion_tirSecurite"];
    let eUltraviolence = attrs["repeating_armeMALDruidLion_ultraViolence"];
    let eUltraviolenceV = 2;

    if(eAntiAnatheme != "0") {
        isConditionnelD = true;
        isConditionnelV = true;
        exec.push("{{antiAnatheme="+i18n_antiAnatheme+"}}");
        exec.push("{{antiAnathemeCondition="+i18n_antiAnathemeCondition+"}}");
    }
    
    if(eAssistanceAttaque != "0") {
        isConditionnelD = true;
        isConditionnelV = true;

        exec.push("{{assistanceAttaque="+i18n_assistanceAttaque+"}}");
        exec.push("{{assistanceAttaqueCondition="+i18n_assistanceAttaqueCondition+"}}");
    }
    
    if(eArtillerie != "0") {
        isConditionnelA = true;
        exec.push("{{artillerie="+i18n_artillerie+"}}");
        exec.push("{{artillerieCondition="+i18n_artillerieCondition+"}}");
    }
    
    if(eAssassin != "0") {
        eASAssassin = i18n_assassin;
        eASAssassinValue = eAssassinV;

        if(attaquesSurprisesCondition == "")
            attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
    }

    if(eCadence != "0") { 
        rCadence = "?{Plusieurs cibles ?|Oui, 3|Non, 0}";
    }

    if(eChoc != "0") {
        isConditionnelA = true;
        exec.push("{{choc="+i18n_choc+" "+eChocV+"}}");
        exec.push("{{chocCondition="+i18n_chocCondition+"}}");
    }
                    
    if(eDemoralisant != "0") {
        isConditionnelA = true;
        exec.push("{{demoralisant="+i18n_demoralisant+"}}");
        exec.push("{{demoralisantCondition="+i18n_demoralisantCondition+"}}");
    }
                    
    if(eDestructeur != "0") {
        isConditionnelD = true;
        exec.push("{{destructeur="+i18n_destructeur+"}}");
        exec.push("{{destructeurValue=[["+eDestructeurV+"D6]]}}");
        exec.push("{{destructeurCondition="+i18n_destructeurCondition+"}}");
    }
    
    if(eEnChaine != "0") {
        isConditionnelD = true;
        exec.push("{{enChaine="+i18n_enChaine+"}}");
        exec.push("{{enChaineCondition="+i18n_enChaineCondition+"}}");
    }
    
    if(eEsperance != "0") {
        isConditionnelD = true;
        isConditionnelV = true;
        exec.push("{{esperance="+i18n_esperance+"}}");
        exec.push("{{esperanceConditionD="+i18n_esperanceConditionD+"}}");
        exec.push("{{esperanceConditionV="+i18n_esperanceConditionV+"}}");
    }
            
    if(eFureur != "0") {
        isConditionnelV = true;
        exec.push("{{fureur="+i18n_fureur+"}}");
        exec.push("{{fureurValue=[["+eFureurV+"D6]]}}");
        exec.push("{{fureurCondition="+i18n_fureurCondition+"}}");
    }
            
    if(eLeste != "0") {
        if(portee != "^{portee-contact}") 
            bChairD = vChair;

        bonusDegats.push(bChairD);
        exec.push("{{vLeste="+bChairD+"}}");
    }
            
    if(eMeurtrier != "0") {
        isConditionnelD = true;
        exec.push("{{meurtrier="+i18n_meurtrier+"}}");
        exec.push("{{meurtrierValue=[["+eMeurtrierV+"D6]]}}");
        exec.push("{{meurtrierCondition="+i18n_meurtrierCondition+"}}");
    }
            
    if(eObliteration != "0") {
        isConditionnelD = true;
        exec.push("{{obliteration="+i18n_obliteration+"}}");
        exec.push("{{obliterationCondition="+i18n_obliterationCondition+"}}");
    }
            
    if(eOrfevrerie != "0") {
        let vOrfevrerie = Math.ceil((vMasque/2)+vAEMasque);

        bonusDegats.push(vOrfevrerie);
        exec.push("{{vOrfevrerie="+vOrfevrerie+"}}");
    }
            
    if(eParasitage != "0") {
        isConditionnelA = true;
        exec.push("{{parasitage="+i18n_parasitage+" "+eParasitageV+"}}");
        exec.push("{{parasitageCondition="+i18n_parasitageCondition+"}}");
    }
            
    if(ePrecision != "0") {
        isConditionnelD = true;
        let vPrecision = Math.ceil((vMachine/2)+vAEMachine);

        bonusDegats.push(vPrecision);
        exec.push("{{vPrecision="+vPrecision+"}}");
    }

    if(eSilencieux != "0") {
        let totalSilencieux = Math.ceil((vMasque/2)+vAEMasque);

        attaquesSurprises.push(i18n_silencieux);
        attaquesSurprisesValue.push(totalSilencieux);

        if(attaquesSurprisesCondition == "")
            attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
    }

    if(eSoumission != "0") {
        isConditionnelA = true;
        exec.push("{{soumission="+i18n_soumission+"}}");
        exec.push("{{soumissionCondition="+i18n_soumissionCondition+"}}");
    }
    
    if(eTenebricide != "0") {
        exec.push("{{tenebricide="+i18n_tenebricide+"}}");
        exec.push("{{tenebricideConditionD="+i18n_tenebricideConditionD+"}}");
        exec.push("{{tenebricideConditionV="+i18n_tenebricideConditionV+"}}");
    }

    if(eTirRafale != "0") {
        exec.push("{{tirRafale="+i18n_tirRafale+"}}");
        exec.push("{{tirRafaleCondition="+i18n_tirRafaleCondition+"}}");
    }
    
    if(eUltraviolence != "0") {
        exec.push("{{ultraviolence="+i18n_ultraviolence+"}}");
        exec.push("{{ultraviolenceValue=[["+eUltraviolenceV+"D6]]}}");
        exec.push("{{ultraviolenceCondition="+i18n_ultraviolenceCondition+"}}");
    }        

    if(eAntiVehicule != "0") 
        autresEffets.push(i18n_antiVehicule);

    if(eBarrage != "0") 
        autresEffets.push(i18n_barrage+" "+eBarrageV);

    if(eChargeur != "0") 
        autresEffets.push(i18n_chargeur+" "+eChargeurV);

    if(eDefense != "0") 
        autresEffets.push(i18n_defense+" "+eDefenseV);
    
    if(eDegatsContinus != "0") 
        autresEffets.push(i18n_degatsContinus+" "+eDegatsContinusV+" ([[1d6]] "+i18n_tours+")");
    
    if(eDeuxMains != "0") 
        autresEffets.push(i18n_deuxMains);
    
    if(eDesignation != "0") 
        autresEffets.push(i18n_designation);

    if(eDispersion != "0") 
        autresEffets.push(i18n_dispersion+" "+eDispersionV);

    if(eIgnoreArmure != "0") 
        autresEffets.push(i18n_ignoreArmure);

    if(eIgnoreCDF != "0") 
        autresEffets.push(i18n_ignoreCDF);

    if(eJAkimbo != "0") 
        autresEffets.push(i18n_jAkimbo);

    if(eJAmbidextrie != "0") 
        autresEffets.push(i18n_jAmbidextrie);

    if(eLourd != "0") 
        autresEffets.push(i18n_lourd);

    if(eLumiere != "0") 
        autresEffets.push(i18n_lumiere+" "+eLumiereV);
    
    if(ePenetrant != "0") 
        autresEffets.push(i18n_penetrant+" "+ePenetrantV);
    
    if(ePerceArmure != "0") 
        autresEffets.push(i18n_perceArmure+" "+ePerceArmureV);
    
    if(eReaction != "0") 
        autresEffets.push(i18n_reaction+" "+eReactionV);
    
    if(eTirSecurite != "0") 
        autresEffets.push(i18n_tirSecurite);

    //FIN GESTION DES EFFETS

    //GESTION DES AMELIORATIONS
    let rChambreDouble = 0;

    let aChargeurGrappes = attrs["repeating_armeMALDruidLion_chargeurGrappes"];
    let aCanonLong = attrs["repeating_armeMALDruidLion_canonLong"];
    let aCanonRaccourci = attrs["repeating_armeMALDruidLion_canonRaccourci"];
    let aChambreDouble = attrs["repeating_armeMALDruidLion_chambreDouble"];
    let aInterfaceGuidage = attrs["repeating_armeMALDruidLion_interfaceGuidage"];
    let aJumelage = attrs["repeating_armeMALDruidLion_jumelage"];
    let aJumelageV = attrs["repeating_armeMALDruidLion_jumelageValue"];
    let aJumelageT = attrs["repeating_armeMALDruidLion_jumelageType"];
    let aLunetteIntelligente = attrs["repeating_armeMALDruidLion_lunetteIntelligente"];
    let aMunitionsDrone = attrs["repeating_armeMALDruidLion_munitionsDrone"];
    let aMunitionsHyperVelocite = attrs["repeating_armeMALDruidLion_munitionsHyperVelocite"];        
    let aChargeurExplosives = attrs["repeating_armeMALDruidLion_chargeurExplosives"];
    let aMunitionsIEM = attrs["repeating_armeMALDruidLion_munitionsIEM"];
    let aMunitionsNonLetales = attrs["repeating_armeMALDruidLion_munitionsNonLetales"];
    let aMunitionsSubsoniques = attrs["repeating_armeMALDruidLion_munitionsSubsoniques"];
    let aPointeurLaser = attrs["repeating_armeMALDruidLion_pointeurLaser"];
    let aProtectionArme = attrs["repeating_armeMALDruidLion_protectionArme"];
    let aRevetementOmega = attrs["repeating_armeMALDruidLion_revetementOmega"];
    let aStructureElement = attrs["repeating_armeMALDruidLion_structureElement"];
    let aSystemeRefroidissement = attrs["repeating_armeMALDruidLion_systemeRefroidissement"];

    if(aChargeurGrappes != "0") {
        exec.push("{{vMGrappeD=-1D6}}");
        exec.push("{{vMGrappeV=+1D6}}");
        diceDegats -= 1;
        diceViolence += 1;
    }

    if(aCanonLong != "0") {
        isConditionnelA = true;
        exec.push("{{canonLong="+i18n_canonLong+"}}");
        exec.push("{{canonLongCondition="+i18n_canonLongCondition+"}}");
    }

    if(aCanonRaccourci != "0") {
        isConditionnelA = true;
        exec.push("{{canonRaccourci="+i18n_canonRaccourci+"}}");
        exec.push("{{canonRaccourciCondition="+i18n_canonRaccourciCondition+"}}");
    }

    if(aChambreDouble != "0") { 
        if(eCadence != 0)
            autresAmeliorations.push(i18n_chambreDouble);
        else if(eCadence == 0)
            rChambreDouble = "?{Plusieurs cibles ?|Oui, 3|Non, 0}";
    }

    if(aLunetteIntelligente != "0") {
        isConditionnelA = true;
        exec.push("{{lunetteIntelligente="+i18n_lunetteIntelligente+"}}");
        exec.push("{{lunetteIntelligenteCondition="+i18n_lunetteIntelligenteCondition+"}}");
    }

    if(aMunitionsDrone != "0") {
        exec.push("{{vMDrone=+3}}");
        bonus.push(3);
    }

    if(aMunitionsHyperVelocite != "0") {
        if(eAssistanceAttaque != "0")
            autresAmeliorations.push(i18n_munitionsHyperVelocite);
        else if(eAssistanceAttaque == "0") {
            isConditionnelD = true;
            isConditionnelV = true;

            exec.push("{{assistanceAttaque="+i18n_munitionsHyperVelocite+"}}");
            exec.push("{{assistanceAttaqueCondition="+i18n_assistanceAttaqueCondition+"}}");
        }
    }
    
    if(aChargeurExplosives != "0") {
        exec.push("{{vMExplosiveD=+1D6}}");
        exec.push("{{vMExplosiveV=-1D6}}");
        diceDegats += 1;
        diceViolence -= 1;
    }
    
    if(aMunitionsIEM != "0") {
        exec.push("{{vMIEMD=-1D6}}");
        exec.push("{{vMIEMV=-1D6}}");
        diceDegats -= 1;
        diceViolence -= 1;
        autresAmeliorations.push(i18n_munitionsIEMParasitage);
    }
    
    if(aMunitionsSubsoniques != "0") {

        if(eSilencieux != "0")
            autresAmeliorations.push(i18n_munitionsSubsoniques);
        else if(eSilencieux == "0") {
            let totalSubsonique = vDiscretion+oDiscretion;

            attaquesSurprises.push(i18n_munitionsSubsoniques);
            attaquesSurprisesValue.push(totalSubsonique);

            if(attaquesSurprisesCondition == "")
                attaquesSurprisesCondition = "{{attaqueSurpriseCondition="+i18n_attaqueSurpriseCondition+"}}";
        }
    }
    
    if(aPointeurLaser != "0") {
        exec.push("{{vMPLaser=+1}}");
        bonus.push(1);
    }

    if(aSystemeRefroidissement != "0") {
        if(eTirRafale != "0")
            autresAmeliorations.push(i18n_systemeRefroidissement+" ("+i18n_barrage+" 1)");
        else if(eTirRafale == "0") {
            exec.push("{{tirRafale="+i18n_systemeRefroidissement+" + "+i18n_barrage+" 1}}");
            exec.push("{{tirRafaleCondition="+i18n_tirRafaleCondition+"}}");
        }   
    }

    if(aRevetementOmega != "0") {
        if(eASAssassinValue < 2) {
            eASAssassin = i18n_revetementOmega;
            eASAssassinValue = 2;

            if(eASAssassinValue != 0)
                autresEffets.push(i18n_assassin);

        } else if(eASAssassinValue > 2)
            autresAmeliorations.push(i18n_revetementOmega);
    }            
    
    if(aInterfaceGuidage != "0") 
        autresAmeliorations.push(i18n_interfaceGuidage);
    
    if(aJumelage != "0") 
        autresAmeliorations.push(i18n_jumelage+" ("+aJumelageV+")");
    
    if(aMunitionsNonLetales != "0") 
        autresAmeliorations.push(i18n_munitionsNonLetales);

    if(aProtectionArme != "0") 
        autresAmeliorations.push(i18n_protectionArme);

    if(aStructureElement != "0") 
        autresAmeliorations.push(i18n_structureElementAlpha);

    //FIN GESTION DES AMELIORATIONS
    
    //GESTION DES BONUS SPECIAUX
    let sBonusDegats = attrs["repeating_armeMALDruidLion_bDDiversTotal"];
    let sBonusDegatsD6 = attrs["repeating_armeMALDruidLion_bDDiversD6"];
    let sBonusDegatsFixe = attrs["repeating_armeMALDruidLion_bDDiversFixe"];

    let sBonusViolence = attrs["repeating_armeMALDruidLion_bVDiversTotal"];
    let sBonusViolenceD6 = attrs["repeating_armeMALDruidLion_bVDiversD6"];
    let sBonusViolenceFixe = attrs["repeating_armeMALDruidLion_bVDiversFixe"];

    let sEnergie = attrs["repeating_armeMALDruidLion_energie"];
    let sEnergieValue = attrs["repeating_armeMALDruidLion_energieValue"];

    let pasDEnergie = false;
    let sEnergieText = "";

    if(sBonusDegats != "0") {
        exec.push("{{vMSpecialD=+"+sBonusDegatsD6+"D6+"+sBonusDegatsFixe+"}}");

        diceDegats += Number(sBonusDegatsD6);
        bonusDegats.push(sBonusDegatsFixe);
    }

    if(sBonusViolence != "0") {
        exec.push("{{vMSpecialV=+"+sBonusViolenceD6+"D6+"+sBonusViolenceFixe+"}}");

        diceViolence += Number(sBonusViolenceD6);
        bonusViolence.push(sBonusViolenceFixe);
    }

    if(sEnergie != "0") {
        autresSpecial.push(i18n_energieRetiree+" ("+sEnergieValue+")");

        var newEnergie = Number(energie)-Number(sEnergieValue);

        if(newEnergie == 0) {
            sEnergieText = i18n_plusEnergie;

        } else if(newEnergie < 0) {

            newEnergie = 0;
            sEnergieText = i18n_pasEnergie;
            pasDEnergie = true;
        }
        
        exec.push("{{energieR="+newEnergie+"}}");
    }
    //FIN DE GESTION DES BONUS SPECIAUX

    exec.push("{{cBase="+aspectNom+"}}");

    if(mod != 0) {
        cRoll.push(mod);
        exec.push("{{mod="+mod+"}}");
    }

    if(cRoll.length == 0)
        cRoll.push(0);

    bonus = bonus.concat(AE);

    exec.push("{{jet=[[ {[[{"+cRoll.join("+")+"-"+rCadence+"-"+rChambreDouble+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}");
    exec.push("{{Exploit=[["+cRoll.join("+")+"-"+rCadence+"-"+rChambreDouble+"]]}}");
    exec.push("{{bonus=[["+bonus.join("+")+"]]}}");

    if(diceDegats < 0)
        diceDegats = 0;

    degats.push(diceDegats+"D6");
    degats = degats.concat(bonusDegats);

    if(diceViolence < 0)
        diceViolence = 0;

    violence.push(diceViolence+"D6");
    violence = violence.concat(bonusViolence);

    exec.push("{{portee="+i18n_portee+" "+portee+"}}");
    exec.push("{{degats=[["+degats.join("+")+"]]}}");
    exec.push("{{violence=[["+violence.join("+")+"]]}}");

    if(eTenebricide != "0") {
        let degatsTenebricide = [];
        let ASTenebricide = [];
        let ASValueTenebricide = [];

        let violenceTenebricide = [];

        diceDegatsTenebricide = Math.floor(diceDegats/2);
        diceViolenceTenebricide = Math.floor(diceViolence/2);

        degatsTenebricide.push(diceDegatsTenebricide+"D6");
        degatsTenebricide = degatsTenebricide.concat(bonusDegats);

        violenceTenebricide.push(diceViolenceTenebricide+"D6");
        violenceTenebricide = violenceTenebricide.concat(bonusViolence);
        
        exec.push("{{tenebricideValueD=[["+degatsTenebricide.join("+")+"]]}}");
        exec.push("{{tenebricideValueV=[["+violenceTenebricide.join("+")+"]]}}");

        if(eASAssassinValue > 0) {
            eAssassinTenebricideValue = Math.ceil(eASAssassinValue/2);

            ASTenebricide.unshift(eASAssassin);
            ASValueTenebricide.unshift(eAssassinTenebricideValue+"D6");

            if(attaquesSurprises.length > 0) {
                ASTenebricide = ASTenebricide.concat(attaquesSurprises);
                ASValueTenebricide = ASValueTenebricide.concat(attaquesSurprisesValue);
            }

            exec.push("{{tenebricideAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{tenebricideASValue=[["+ASValueTenebricide.join("+")+"]]}}");
        } else if(attaquesSurprises.length > 0) {

            ASTenebricide = ASTenebricide.concat(attaquesSurprises);
            ASValueTenebricide = ASValueTenebricide.concat(attaquesSurprisesValue);

            exec.push("{{tenebricideAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{tenebricideASValue=[["+ASValueTenebricide.join("+")+"]]}}");
        }
    }

    if(eObliteration != "0") {
        let ASObliteration = [];
        let ASValueObliteration = [];

        diceDegatsObliteration = diceDegats*6;
        
        degatsFObliteration = _.reduce(bonusDegats, function(n1, n2){return Number(n1) + Number(n2);});

        let vObliteration = diceDegatsObliteration+degatsFObliteration;
        
        exec.push("{{obliterationValue="+vObliteration+"}}");

        if(eMeurtrier != "0")
            exec.push("{{obliterationMeurtrierValue="+eMeurtrierV*6+"}}");

        if(eDestructeur != "0")
            exec.push("{{obliterationDestructeurValue="+eDestructeurV*6+"}}");

        if(eASAssassinValue > 0) {
            eAssassinTenebricideValue = eASAssassinValue*6;

            ASObliteration.unshift(eASAssassin);
            ASValueObliteration.unshift(eAssassinTenebricideValue);

            if(attaquesSurprises.length > 0) {
                ASObliteration = ASObliteration.concat(attaquesSurprises);
                ASValueObliteration = ASValueObliteration.concat(attaquesSurprisesValue);
            }

            exec.push("{{obliterationAS="+ASObliteration.join("\n+")+"}}");
            exec.push("{{obliterationASValue=[["+ASValueObliteration.join("+")+"]]}}");
        } else if(attaquesSurprises.length > 0) {

            ASObliteration = ASObliteration.concat(attaquesSurprises);
            ASValueObliteration = ASValueObliteration.concat(attaquesSurprisesValue);

            exec.push("{{obliterationAS="+ASTenebricide.join("\n+")+"}}");
            exec.push("{{obliterationASValue="+_.reduce(ASValueObliteration, function(n1, n2){ return n1 + n2; }, 0)+"}}");
        }
    }

    if(rCadence != 0) {
        exec.push("{{rCadence="+i18n_cadence+" "+eCadenceV+" "+i18n_inclus+"}}");
        exec.push("{{vCadence="+rCadence+"D6}}");
    }
        
    if(rChambreDouble != 0)
        exec.push("{{vChambreDouble="+rChambreDouble+"}}");

    if(eASAssassinValue > 0)
    {
        attaquesSurprises.unshift(eASAssassin);
        attaquesSurprisesValue.unshift(eASAssassinValue+"D6");
    }

    if(attaquesSurprises.length > 0) {
        exec.push("{{attaqueSurprise="+attaquesSurprises.join("\n+")+"}}");
        exec.push("{{attaqueSurpriseValue=[["+attaquesSurprisesValue.join("+")+"]]}}");
        exec.push(attaquesSurprisesCondition);
    }

    if(autresEffets.length > 0)
        exec.push("{{effets="+autresEffets.join(" / ")+"}}");

    if(autresAmeliorations.length > 0)
        exec.push("{{ameliorations="+autresAmeliorations.join(" / ")+"}}");

    if(autresSpecial.length > 0)
        exec.push("{{special="+autresSpecial.join(" / ")+"}}");

    if(isConditionnelA == true)
        exec.push("{{succesConditionnel=true}}");

    if(isConditionnelD == true)
        exec.push("{{degatsConditionnel=true}}");

    if(isConditionnelV == true)
        exec.push("{{violenceConditionnel=true}}");

    if(pasDEnergie == false) {
        startRoll(exec.join(" "), (results) => {
            let tJet = results.results.jet.result;
            let tJetDice = results.results.jet.dice.length;

            let tBonus = results.results.bonus.result;
            let tExploit = results.results.Exploit.result;

            let tDegats = results.results.degats.result;
            let tViolence = results.results.violence.result;

            let tMeurtrier = results.results.meurtrierValue;
            let vTMeurtrier = 0;

            if(tMeurtrier != undefined)
                vTMeurtrier = tMeurtrier.dice[0];

            let tDestructeur = results.results.destructeurValue;
            let vTDestructeur = 0;

            if(tDestructeur != undefined)
                vTDestructeur = tDestructeur.dice[0];
            
            let tFureur = results.results.fureurValue;
            let vTFureur = 0;

            if(tFureur != undefined)
                vTFureur = tFureur.dice[0]+tFureur.dice[1];
            
            let tUltraviolence = results.results.ultraviolenceValue;
            
            let vTUltraviolence = 0;

            if(tUltraviolence != undefined)
                vTUltraviolence = tUltraviolence.dice[0];

            finishRoll(
                results.rollId, 
                {
                    jet:tJet+tBonus,
                    degats:tDegats,
                    violence:tViolence,
                    meurtrierValue:vTMeurtrier,
                    destructeurValue:vTDestructeur,
                    fureurValue:vTFureur,
                    ultraviolenceValue:vTUltraviolence,
                }
            );                

            if(tJet != 0 && tJet == tExploit) 
                startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+i18n_exploit+"}} {{jet=[[ {[[{"+tJetDice+", 0}kh1]]d6cs2cs4cs6cf1cf3cf5s%2}=0]]}}", (exploit) => {
                    let tExploit = exploit.results.jet.result;

                    finishRoll(
                        exploit.rollId, 
                        {
                            jet:tExploit
                        }
                    );
                });
                

            if(sEnergie != "0") {
                setAttrs({
                    [nEnergie]: newEnergie
                });

                if(newEnergie == 0) {
                    startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+arme+"}} {{text="+sEnergieText+"}}", (exploit) => {    
                        finishRoll(
                            exploit.rollId,{}
                        );
                    });
                }
            }
        });
    } else {
        startRoll("@{jetGM} &{template:simple} {{Nom=^{druid-companion-lion}}} {{special1=@{name}}} {{special1B="+arme+"}} {{text="+sEnergieText+"}}", (text) => {
            finishRoll(
                text.rollId,{}
            );
        });
    }
});

const druidRollInit = [
    "druidLionInitiative", "MALDruidLionInitiative", "druidWolfInitiative", "MALDruidWolfInitiative", "druidCrowInitiative", "MALDruidCrowInitiative"
];

druidRollInit.forEach(button => {
    on(`clicked:${button}Roll`, async function(info) {
        let roll = info.htmlAttributes.value;
    
        let attributs = [
            `${button}Base`,
            `${button}Evol`,
            `druidLionMasqueAE`,
            `MALDruidLionMasqueAE`,
            `druidWolfMasqueAE`,
            `MALDruidWolfMasqueAE`,
        ];

        let attrs = await getAttrsAsync(attributs);

        let exec = [];
        let cRoll = [];  

        let total = totalADruid(attrs, button);

        let masqueAE = 0;

        if(button != "druidCrowInitiative" && button != "MALDruidCrowInitiative") {
            if(button == "druidLionInitiative")
                masqueAE = attrs["druidLionMasqueAE"];
            else if(button == "MALDruidLionInitiative")
                masqueAE = +attrs["MALDruidLionMasqueAE"];
            else if(button == "druidWolfInitiative") {
                total = 2;
                masqueAE = +attrs["druidWolfMasqueAE"];
            }
            else if(button == "MALDruidWolfInitiative") {
                total = 2;
                masqueAE = +attrs["MALDruidWolfMasqueAE"];
            }
                


            if(masqueAE > 5)
                cRoll.push(30);
            else {
                cRoll.push("3D6");
                cRoll.push(total);
            }
        }
        else {
            cRoll.push(1);
        }

        exec.push(roll);
        exec.push("{{initiative=[["+cRoll.join("+")+" &{tracker}]]}}");

        startRoll(exec.join(" "), (results) => {    
            finishRoll(
                results.rollId, 
                {}
            );                
        });
    });
});

const druidRollFighter = [
    "DWolfFighterRoll", "MALDWolfFighterN1Roll"
];

druidRollFighter.forEach(button => {
    on(`clicked:${button}`, async function(info) {
        let roll = info.htmlAttributes.value;

        let attributs = [];
        let nbreW = "";

        if(button == "DWolfFighterRoll")
            nbreW = "druidNombreCompagnon";
        else if(button == "MALDWolfFighterN1Roll")
            nbreW = "MALDruidNombreCompagnon";

        attributs.push(nbreW);

        let attrs = await getAttrsAsync(attributs);

        let nbre = attrs[nbreW];

        let exec = [];
        exec.push(roll);

        let degats = [];
        let violence = [];

        degats.push(nbre+"D6");
        violence.push(nbre+"D6");

        exec.push("{{degats=[["+degats.join("+")+"]]}}");
        exec.push("{{violence=[["+violence.join("+")+"]]}}");
        
        startRoll(exec.join(" "), (results) => {
            let tDegats = results.results.degats.result;
            let tViolence = results.results.violence.result;

            finishRoll(
                results.rollId, 
                {
                    degats:tDegats,
                    violence:tViolence
                }
            );
        });
    });
});

const druidRollCrow = [
    "druidCrowAttaque", "MALDruidCrowAttaque"
];

druidRollCrow.forEach(button => {
    on(`clicked:${button}`, async function(info) {
        let roll = info.htmlAttributes.value;

        let attributs = [];

        if(button == "druidCrowAttaque") {
            attributs.push("druidCrowTAttaque");
            attributs.push("druidNiveauCrow");
        }
        else if(button == "MALDruidCrowAttaque") {
            attributs.push("MALDruidCrowTAttaque");
        }

        let attrs = await getAttrsAsync(attributs);

        let tour = 0;
        let valeur = 0;

        if(button == "druidCrowAttaque") {
            tour = attrs["druidCrowTAttaque"];
            valeur = "[[2*"+attrs["druidNiveauCrow"]+"]]";
        }
        else if(button == "MALDruidCrowAttaque") {
            tour = attrs["MALDruidCrowTAttaque"];
            valeur = 4;
        }

        let exec = [];
        exec.push(roll);

        let debordement = tour+"*"+valeur;

        exec.push("{{debordement=[["+debordement+"]]}}");
        
        startRoll(exec.join(" "), (results) => {
            finishRoll(
                results.rollId, 
                {}
            );
        });
    });
});