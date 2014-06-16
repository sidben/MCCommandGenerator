//--- CONTANSTS AND GLOBAL VARIABLES ---//

var SPW_DEFAULT_SPAWNCOUNT 		= 4;
var SPW_DEFAULT_SPAWNRANGE 		= 4;
var SPW_DEFAULT_MINDELAY 		= 200;
var SPW_DEFAULT_MAXDELAY 		= 800;
var SPW_DEFAULT_MAXNEARBYMOBS 	= 6;
var SPW_DEFAULT_PLAYERRANGE 	= 16;

var MOB_CATEGORY_PASSIVE	= 1;
var MOB_CATEGORY_NEUTRAL	= 2;
var MOB_CATEGORY_HOSTILE	= 3;
var MOB_CATEGORY_BOSS		= 4;

var MOB_BLAZE_DEFAULT_HEALTH 	= 20;

var MOB_CREEPER_DEFAULT_HEALTH	= 20;
var MOB_CREEPER_DEFAULT_CHARGED = false;
var MOB_CREEPER_DEFAULT_FUSE 	= 30;

var MOB_ENDERMAN_DEFAULT_HEALTH	= 40;

var MOB_SKELETON_DEFAULT_HEALTH	= 20;
var MOB_SKELETON_TYPE_NORMAL	= 0;
var MOB_SKELETON_TYPE_WITHER	= 1;

var MOB_SPIDER_DEFAULT_HEALTH 	= 16;

var MOB_WITCH_DEFAULT_HEALTH 	= 26;

var MOB_ZOMBIE_DEFAULT_HEALTH	= 20;









//======================= Utility =======================//

/*
Ref: http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
*/
function clone(obj) {
	var copy = new Object();

	for (var attr in obj) {
		//console.log(attr + ' (' + typeof obj[attr] + ')')

		switch(typeof obj[attr]) {
			case 'number':
			case 'string':
			case 'boolean':
				copy[attr] = obj[attr];
				break;

			case 'object':
				copy[attr] = clone(obj[attr].toJSON());
				break;

			default:
				//console.log('not cloned');
		}
	}

	return copy;
}


/*
Flattens the object, so JSON can stringify parent properties.
Source: //stackoverflow.com/questions/8779249/how-to-stringify-inherited-objects-to-json
*/
function mcStringify(x, removeQuotes) {
	var r = '';
	//var xClone = clone(x.toJSON ? x.toJSON() : x);
	var xClone = x;

/*
	console.log('mcStringify');
	console.log(x);
	console.log(xClone);
*/



    //r = JSON.stringify(xClone);
    r = JSON.stringify(x);
    if (removeQuotes) {
		r = r.replace(/\"/g, "");

		// removes empty values
		r = r.replace(",SpawnData:{}", "");
	}

    return r;
}

function isNonValidNumber(value, defaultValue, minValue, maxValue) {
	if (maxValue === undefined) maxValue = Number.MAX_VALUE;

	return (isNaN(value) || value == defaultValue || value < minValue || value > maxValue);
}







//======================= Command =======================//

function MinecraftCommand (type) {
	this.Type = type;
	this.NBTInfo = undefined;


	this.getCommand = function() {
		var cmd = '';
		var errorMsg = '';


		// Type of command
		switch(this.Type) {
			case 'spawner':
				if(typeof this.NBTInfo != 'undefined') errorMsg = this.NBTInfo.checkErrors();

				if(!errorMsg) {
					cmd = '/setblock ~ ~ ~ minecraft:mob_spawner 0 replace ';
					cmd += mcStringify(this.NBTInfo, true);
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



//======================= Spawner =======================//

/*----------------------------------------
Repesents the NBT data of a spawner block.
----------------------------------------*/
function MinecraftMobSpawner () {
	this.EntityId = '';
	this.SpawnCount = SPW_DEFAULT_SPAWNCOUNT;
	this.SpawnRange = SPW_DEFAULT_SPAWNRANGE;
	this.Delay = undefined;
	this.MinSpawnDelay = SPW_DEFAULT_MINDELAY;
	this.MaxSpawnDelay = SPW_DEFAULT_MAXDELAY;
	this.MaxNearbyEntities = SPW_DEFAULT_MAXNEARBYMOBS;
	this.RequiredPlayerRange = SPW_DEFAULT_PLAYERRANGE;
	this.SpawnData = undefined;


	// Returns an error message, so if the message is empty, the object is valid.
	this.checkErrors = function() {
		if (!this.EntityId) return "No entity was selected.";
		if (this.MaxSpawnDelay < this.MinSpawnDelay) return "MaxSpawnDelay must be greater than MinSpawnDelay.";
		return "";
	}

	//To be used with JSON.Stringify, remove invalid properties.
	this.toJSON = function() {
		// var copy = this;		// OBS: this way copy is useless, the main object is altered
		var copy = new Object();
		for(var i in this) {
			copy[i] = this[i];
    	}

		if (!copy.EntityId) copy.EntityId = undefined;
		if (isNonValidNumber(copy.SpawnCount, SPW_DEFAULT_SPAWNCOUNT, 1)) copy.SpawnCount = undefined;
		if (isNonValidNumber(copy.SpawnRange, SPW_DEFAULT_SPAWNRANGE, 1)) copy.SpawnRange = undefined;
		if (isNonValidNumber(copy.Delay, undefined, -1)) copy.Delay = undefined;
		if (isNonValidNumber(copy.MinSpawnDelay, SPW_DEFAULT_MINDELAY, 0)) copy.MinSpawnDelay = undefined;
		if (isNonValidNumber(copy.MaxSpawnDelay, SPW_DEFAULT_MAXDELAY, 1)) copy.MaxSpawnDelay = undefined;
		if (isNonValidNumber(copy.MaxNearbyEntities, SPW_DEFAULT_MAXNEARBYMOBS, 1)) copy.MaxNearbyEntities = undefined;
		if (isNonValidNumber(copy.RequiredPlayerRange, SPW_DEFAULT_PLAYERRANGE, 1)) copy.RequiredPlayerRange = undefined;

		return copy;
	}


}





//======================= Mobs =======================//

/*----------------------------------------
Repesents the NBT data of a mob Entity.
----------------------------------------*/
function MinecraftLivingEntity() {
	this.Health					= undefined;
	this.CanPickUpLoot			= undefined;
	this.CustomName				= '';
	this.CustomNameVisible 		= true;
	this.PersistenceRequired	= false;

	this.Attributes		= undefined;

	this.ActiveEffects	= undefined;

	this.Equipment		= undefined;
	this.DropChances	= undefined;


	//--- creates a copy of this object to customize JSON serialization ---//
	this.makeCopy = function() {
		var copy = clone(this);

		if (!copy.CustomName) {
			copy.CustomName = undefined;
			copy.CustomNameVisible = undefined;
		}
		if (!copy.PersistenceRequired) copy.PersistenceRequired = undefined;

		return copy;
	}

	this.toJSON = function() {
		return this.makeCopy();
	}

}


/*----------------------------------------
Repesents a type of mob.
----------------------------------------*/
function BaseMob(name, picture, vanilla) {
	this.EntityId 		= '';
	this.PresetName 	= name;
	this.Picture 		= picture;
	this.IsVanilla 		= vanilla;
	this.Category		= MOB_CATEGORY_NEUTRAL;

	//this.NBTInfo			= new MinecraftLivingEntity();
	/*
		OBS: Creating a new object here creates some conflit, where multiple
		instances of MobZombie, MobCreeper, etc share the same NBTInfo property.
		If the object is created in each child class, there is no problem.
	*/
	this.NBTInfo		= undefined;
}



function MobBlaze() {
	this.EntityId			= "Blaze";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_BLAZE_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_BLAZE_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobCreeper() {
	this.EntityId			= "Creeper";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_CREEPER_DEFAULT_HEALTH;

	this.NBTInfo.powered	= MOB_CREEPER_DEFAULT_CHARGED;
	this.NBTInfo.Fuse		= MOB_CREEPER_DEFAULT_FUSE;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();

		if (copy.Health	== MOB_CREEPER_DEFAULT_HEALTH) copy.Health = undefined;
		if (!copy.powered) copy.powered = undefined;
		if (copy.Fuse == MOB_CREEPER_DEFAULT_FUSE) copy.Fuse = undefined;

		return copy;
	}
}

function MobEnderman() {
	this.EntityId			= "Enderman";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_ENDERMAN_DEFAULT_HEALTH;

	this.carried			= undefined;
	this.carriedData		= undefined;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_ENDERMAN_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobSkeleton() {
	this.EntityId			= "Skeleton";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_SKELETON_DEFAULT_HEALTH;

	//this.NBTInfo.SkeletonType	= MOB_SKELETON_TYPE_NORMAL;
	this.NBTInfo.SkeletonType	= undefined;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_SKELETON_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobSpider() {
	this.EntityId			= "Spider";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_SPIDER_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_SPIDER_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobWitch() {
	this.EntityId			= "Wicth";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_WITCH_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_WITCH_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobZombie() {
	this.EntityId			= "Zombie";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_ZOMBIE_DEFAULT_HEALTH;

	this.NBTInfo.IsVillager		= undefined;
	this.NBTInfo.IsBaby			= undefined;
	this.NBTInfo.CanBreakDoors 	= undefined;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_ZOMBIE_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}


MobBlaze.prototype 		= new BaseMob("Blaze", "blaze.jpg", true);
MobCreeper.prototype 	= new BaseMob("Creeper", "creeper.jpg", true);
MobEnderman.prototype 	= new BaseMob("Enderman", "enderman.jpg", true);
MobSkeleton.prototype 	= new BaseMob("Skeleton", "skeleton.jpg", true);
MobSpider.prototype 	= new BaseMob("Spider", "spider.jpg", true);
MobWitch.prototype 		= new BaseMob("Witch", "witch.jpg", true);
MobZombie.prototype 	= new BaseMob("Zombie", "zombie.jpg", true);





/* !!!DEBUG!!! */
var mobList = [];


function loadMobList() {

	var vanillaZombie = new MobZombie();
	var vanillaSkelly = new MobSkeleton();
	var vanillaSpider = new MobSpider();
	var vanillaCrepper = new MobCreeper();
	var vanillaBlaze = new MobBlaze();


	var babyZombie = new MobZombie();
	babyZombie.PresetName 		= "Baby Zombie"
	babyZombie.Picture 			= "baby-zombie.jpg"
	babyZombie.IsVanilla 		= false;
	babyZombie.NBTInfo.IsBaby	= true;

	var powerCreeper = new MobCreeper();
	powerCreeper.PresetName 		= "Charged Creeper"
	powerCreeper.Picture 			= "charged-creeper.jpg"
	powerCreeper.IsVanilla 			= false;
	powerCreeper.NBTInfo.powered	= true;

	var witherSkelly = new MobSkeleton();
	witherSkelly.PresetName 			= "Wither Skeleton"
	witherSkelly.Picture 				= "wither-skeleton.jpg"
	witherSkelly.IsVanilla 				= false;
	witherSkelly.NBTInfo.SkeletonType	= MOB_SKELETON_TYPE_WITHER;





	mobList.push(vanillaZombie);
	mobList.push(vanillaSkelly);
	mobList.push(vanillaSpider);
	mobList.push(vanillaCrepper);
	mobList.push(vanillaBlaze);

	mobList.push(babyZombie);
	mobList.push(powerCreeper);
	mobList.push(witherSkelly);


	/*
	console.log(mobList.length + " mobs available");
	for (var i=0; i<mobList.length; i++) {
		console.log('MOB: ' + mcStringify(mobList[i]));
	}
	*/

}

