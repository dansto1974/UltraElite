(function () {
  "use strict";

  const missionTypes = {
    courier: {
      label: "Courier",
      category: "delivery",
      hooks: ["makeMission", "missionReadyForDockCompletion", "completeDockedMissions"]
    },
    cargo: {
      label: "Freight",
      category: "delivery",
      hooks: ["makeMission", "missionCargoUsed", "missionReadyForDockCompletion", "completeDockedMissions"]
    },
    bounty: {
      label: "Bounty",
      category: "target",
      hooks: ["spawnMissionTarget", "markMissionTargetDestroyed", "missionLegalDisposition"]
    },
    suppression: {
      label: "Pirate Suppression",
      category: "ambient-combat",
      hooks: ["spawnSuppressionPirates", "recordPirateSuppressionKill", "missionLegalDisposition"]
    },
    recovery: {
      label: "Recovery",
      category: "target-recovery",
      hooks: ["spawnMissionTarget", "markMissionTargetDestroyed", "spawnMissionDrop", "scoopMissionCargo"]
    },
    naval: {
      label: "Naval",
      category: "military-target",
      hooks: ["spawnMissionTarget", "markMissionTargetDestroyed", "missionLegalDisposition", "grantMissionLoanShip"]
    },
    traderDefence: {
      label: "Trader Defence",
      category: "group-combat",
      hooks: ["spawnMissionEncounter", "recordMissionEncounterKill", "assignHostileTarget", "missionLegalDisposition"]
    },
    navalBattle: {
      label: "Naval Battle",
      category: "group-combat",
      hooks: ["spawnMissionEncounter", "recordMissionEncounterKill", "assignHostileTarget", "missionLegalDisposition"]
    }
  };

  const npcBehaviours = {
    trader: {
      role: "trader",
      intent: ["route", "dock", "launch", "flee", "hyperspaceOut"],
      hooks: ["spawnShip", "spawnStationTraffic", "startNpcHyperspaceOut", "updateShipAI"]
    },
    pirate: {
      role: "pirate",
      intent: ["hunt", "attack", "breakOff", "hyperspaceOut"],
      hooks: ["spawnShip", "assignHostileTarget", "updateShipAI"]
    },
    police: {
      role: "police",
      intent: ["patrol", "intercept", "launchFromStation"],
      hooks: ["spawnShip", "spawnStationTraffic", "pickHostileFor", "updateShipAI"]
    },
    alien: {
      role: "alien",
      intent: ["attack", "launchThargon", "neverFlee"],
      hooks: ["alienNeverFlees", "launchThargon", "updateShipAI"]
    },
    missionAlly: {
      role: "missionAlly",
      intent: ["support", "drawFire", "fightMissionEnemies"],
      hooks: ["spawnMissionEncounter", "pickMissionEncounterTarget", "updateShipAI"]
    }
  };

  globalThis.ULTRA_ELITE_MISSION_NPC_DEFINITIONS = Object.freeze({
    version: 1,
    missionTypes: Object.freeze(missionTypes),
    npcBehaviours: Object.freeze(npcBehaviours)
  });
})();
