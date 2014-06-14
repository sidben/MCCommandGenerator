//--- CONTANSTS AND GLOBAL VARIABLES ---//

var SPW_DEFAULT_SPAWNCOUNT 		= 4;
var SPW_DEFAULT_SPAWNRANGE 		= 4;
var SPW_DEFAULT_MINDELAY 		= 200;
var SPW_DEFAULT_MAXDELAY 		= 800;
var SPW_DEFAULT_MAXNEARBYMOBS 	= 6;
var SPW_DEFAULT_PLAYERRANGE 	= 16;



//--- Command ---//

function MinecraftCommand (type) {
	this.Type = type;
	this.NBTInfo = undefined;


	this.getCommand = function() {
		var cmd = '';
		var extraJson = ''
		var errorMsg = '';


		// Type of command
		switch(this.Type) {
			case 'spawner':
				if(typeof this.NBTInfo != 'undefined') errorMsg = this.NBTInfo.checkErrors()

				if(!errorMsg) {
					extraJson += JSON.stringify(this.NBTInfo, spawnerReplacer);
					cmd = '/setblock ~ ~ ~ minecraft:mob_spawner 0 replace ';
					cmd += extraJson.replace(/\"/g, "");
				}

				break;


			case 'summon':
				cmd = '/summon ';
				cmd += mcCommand.MainMob.EntityId;
				cmd += ' ~ ~ ~ ';
				// cmd += '{';
				// cmd += '}';
				break;


			case 'item':
				cmd = '/give @p ';
				break;


			case 'potion':
				cmd = '/give @p ';
				break;

		}


		// return the command text (or error message)
		if (errorMsg) return 'ERROR: ' + errorMsg;
		return cmd;
	}
}


//--- Spawner ---//

// This object should replect the ingame block and NBT data
function MinecraftMobSpawner () {
	this.EntityId = '';
	this.SpawnCount = SPW_DEFAULT_SPAWNCOUNT;
	this.SpawnRange = SPW_DEFAULT_SPAWNRANGE;
	this.Delay = undefined;
	this.MinSpawnDelay = SPW_DEFAULT_MINDELAY;
	this.MaxSpawnDelay = SPW_DEFAULT_MAXDELAY;
	this.MaxNearbyEntities = SPW_DEFAULT_MAXNEARBYMOBS;
	this.RequiredPlayerRange = SPW_DEFAULT_PLAYERRANGE;


	// Returns an error message, so if the message is empty, the object is valid.
	this.checkErrors = function() {
		if (!this.EntityId) return "No entity was selected.";
		if (this.MaxSpawnDelay < this.MinSpawnDelay) return "MaxSpawnDelay must be greater than MinSpawnDelay.";
		return "";
	}

}

function spawnerReplacer(key, value)
{
	if (key == "EntityId" && !value) return undefined;
    if (key == "SpawnCount" && (isNaN(value) || value == SPW_DEFAULT_SPAWNCOUNT || value < 1)) return undefined;
    if (key == "SpawnRange" && (isNaN(value) || value == SPW_DEFAULT_SPAWNRANGE || value < 1)) return undefined;
    if (key == "Delay" && (isNaN(value) || value < -1)) return undefined;
    if (key == "MinSpawnDelay" && (isNaN(value) || value == SPW_DEFAULT_MINDELAY || value < 0)) return undefined;
    if (key == "MaxSpawnDelay" && (isNaN(value) || value == SPW_DEFAULT_MAXDELAY || value < 1)) return undefined;
    if (key == "MaxNearbyEntities" && (isNaN(value) || value == SPW_DEFAULT_MAXNEARBYMOBS || value < 1)) return undefined;
    if (key == "RequiredPlayerRange" && (isNaN(value) || value == SPW_DEFAULT_PLAYERRANGE || value < 1)) return undefined;

    return value;
}
