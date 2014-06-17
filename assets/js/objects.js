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
var MOB_CATEGORY_UTILITY	= 5;

var MOB_BLAZE_DEFAULT_HEALTH 	= 20;

var MOB_CAVESPIDER_DEFAULT_HEALTH 	= 12;

var MOB_CREEPER_DEFAULT_HEALTH	= 20;
var MOB_CREEPER_DEFAULT_CHARGED = false;
var MOB_CREEPER_DEFAULT_RADIUS	= 3;
var MOB_CREEPER_DEFAULT_FUSE 	= 30;

var MOB_GHAST_DEFAULT_HEALTH 	= 10;
var MOB_GHAST_DEFAULT_EXPLOSION = 1;

var MOB_ENDERMAN_DEFAULT_HEALTH	= 40;

var MOB_IRONGOLEM_DEFAULT_HEALTH	= 100;

var MOB_SILVERFISH_DEFAULT_HEALTH	= 8;

var MOB_SKELETON_DEFAULT_HEALTH	= 20;
var MOB_SKELETON_TYPE_NORMAL	= 0;
var MOB_SKELETON_TYPE_WITHER	= 1;

var MOB_SLIME_SIZE_TINY 		= 0;
var MOB_SLIME_SIZE_SMALL 		= 1;
var MOB_SLIME_SIZE_BIG  		= 3;

var MOB_SNOWMAN_DEFAULT_HEALTH	= 4;

var MOB_SPIDER_DEFAULT_HEALTH 	= 16;

var MOB_WITCH_DEFAULT_HEALTH 	= 26;

var MOB_WOLFWILD_DEFAULT_HEALTH	= 8;

var MOB_ZOMBIE_DEFAULT_HEALTH	= 20;

var MOB_ZOMBIEPIG_DEFAULT_HEALTH	= 20;











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
function BaseMob(name, picture, fixed) {
	this.EntityId 		= '';
	this.PresetName 	= name;
	this.Picture 		= picture;
	this.FixedPreset 	= fixed;
	this.Category		= MOB_CATEGORY_NEUTRAL;

	//this.NBTInfo			= new MinecraftLivingEntity();
	/*
		OBS: Creating a new object here creates some conflit, where multiple
		instances of MobZombie, MobCreeper, etc share the same NBTInfo property.
		If the object is created in each child class, there is no problem.

		OBS 2: maybe this was related to the toJSON conflict, need more tests.
	*/
	this.NBTInfo		= undefined;
}



/*------------------------------ HOSTILE MOBS ------------------------------*/

function MobBlaze() {
	this.EntityId			= "Blaze";
	this.Category			= MOB_CATEGORY_HOSTILE;

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
	this.ExplosionRadius	= MOB_CREEPER_DEFAULT_RADIUS;
	this.NBTInfo.Fuse		= MOB_CREEPER_DEFAULT_FUSE;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();

		if (copy.Health	== MOB_CREEPER_DEFAULT_HEALTH) copy.Health = undefined;
		if (!copy.powered) copy.powered = undefined;
		if (copy.ExplosionRadius == MOB_CREEPER_DEFAULT_RADIUS) copy.ExplosionRadius = undefined;
		if (copy.Fuse == MOB_CREEPER_DEFAULT_FUSE) copy.Fuse = undefined;

		return copy;
	}
}

function MobGhast() {
	this.EntityId			= "Ghast";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_GHAST_DEFAULT_HEALTH;

	this.ExplosionPower		= MOB_GHAST_DEFAULT_EXPLOSION;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_GHAST_DEFAULT_HEALTH) copy.Health = undefined;
		if (copy.ExplosionPower	== MOB_GHAST_DEFAULT_EXPLOSION) copy.ExplosionPower = undefined;
		return copy;
	}
}

function MobMagmaCube() {
	this.EntityId			= "LavaSlime";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= undefined;	// each magma cube size have a different health

	this.Size				= undefined;
}

function MobSilverfish() {
	this.EntityId			= "Silverfish";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_SILVERFISH_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_SILVERFISH_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}

function MobSlime() {
	this.EntityId			= "Slime";
	this.Category			= MOB_CATEGORY_HOSTILE;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= undefined;	// each alime size have a different health

	this.Size				= undefined;
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

function MobWitch() {
	this.EntityId			= "Wicth";
	this.Category			= MOB_CATEGORY_HOSTILE;

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
MobGhast.prototype 		= new BaseMob("Ghast", "ghast.jpg", true);
MobMagmaCube.prototype 	= new BaseMob("Magma Cube", "magma-cube.jpg", true);
MobSilverfish.prototype = new BaseMob("Silverfish", "silverfish.jpg", true);
MobSlime.prototype 		= new BaseMob("Slime", "slime.jpg", true);
MobSkeleton.prototype 	= new BaseMob("Skeleton", "skeleton.jpg", true);
MobWitch.prototype 		= new BaseMob("Witch", "witch.jpg", true);
MobZombie.prototype 	= new BaseMob("Zombie", "zombie.jpg", true);



/*------------------------------ NEUTRAL MOBS ------------------------------*/

function MobCaveSpider() {
	this.EntityId			= "CaveSpider";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_CAVESPIDER_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_CAVESPIDER_DEFAULT_HEALTH) copy.Health = undefined;
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

function MobWolf() {
	this.EntityId			= "Wolf";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_WOLFWILD_DEFAULT_HEALTH;

	this.NBTInfo.Angry		= false;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_WOLFWILD_DEFAULT_HEALTH) copy.Health = undefined;
		if (!copy.Angry) copy.Angry = undefined;
		return copy;
	}
}

function MobZombiePigman() {
	this.EntityId			= "PigZombie";

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_ZOMBIEPIG_DEFAULT_HEALTH;

	this.NBTInfo.IsBaby		= undefined;
	this.NBTInfo.Anger		= 0;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_ZOMBIEPIG_DEFAULT_HEALTH) copy.Health = undefined;
		if (copy.Anger < 1) copy.Anger = undefined;
		return copy;
	}
}


MobCaveSpider.prototype 	= new BaseMob("Cave Spider", "cave-spider.jpg", true);
MobSpider.prototype 		= new BaseMob("Spider", "spider.jpg", true);
MobEnderman.prototype 		= new BaseMob("Enderman", "enderman.jpg", true);
MobWolf.prototype 			= new BaseMob("Wolf", "wolf-wild.jpg", true);
MobZombiePigman.prototype 	= new BaseMob("Zombie Pigman", "zombie-pigman.jpg", true);



/*------------------------------ UTILITY MOBS ------------------------------*/

function MobIronGolem() {
	this.EntityId			= "VillagerGolem";
	this.Category			= MOB_CATEGORY_UTILITY;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_IRONGOLEM_DEFAULT_HEALTH;

	this.NBTInfo.PlayerCreated	= false;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_IRONGOLEM_DEFAULT_HEALTH) copy.Health = undefined;
		if (!copy.PlayerCreated) copy.PlayerCreated = undefined;
		return copy;
	}
}

function MobSnowGolem() {
	this.EntityId			= "SnowMan";
	this.Category			= MOB_CATEGORY_UTILITY;

	this.NBTInfo			= new MinecraftLivingEntity();
	this.NBTInfo.Health		= MOB_SNOWMAN_DEFAULT_HEALTH;


	this.NBTInfo.toJSON = function() {
		var copy = this.makeCopy();
		if (copy.Health	== MOB_SNOWMAN_DEFAULT_HEALTH) copy.Health = undefined;
		return copy;
	}
}


MobIronGolem.prototype 		= new BaseMob("Iron Golem", "iron-golem.jpg", true);
MobSnowGolem.prototype 		= new BaseMob("Snow Golem", "snow-golem.jpg", true);


/*------------------------------ PASSIVE MOBS ------------------------------*/