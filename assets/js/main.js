


var txtResult 	= document.getElementById("txtResult");
var radType 	= document.getElementsByName("radCmdType");





function start() {
	var tempButton = document.getElementById("btDebug");




	loadMobList();



	//--- Attach events
	if(tempButton.addEventListener){
		tempButton.addEventListener("click", function() { updateOutput(); }, true);
	}else{
		tempButton.attachEvent("click", function() { updateOutput(); });
	};

	radType[0].addEventListener("click", function() { setCommandType('spawner'); }, true);
	radType[1].addEventListener("click", function() { setCommandType('summon'); }, true);
	radType[2].addEventListener("click", function() { setCommandType('item'); }, true);
	radType[3].addEventListener("click", function() { setCommandType('potion'); }, true);



	//-- Initial values
	txtResult.value = '';
	setCommandType('spawner');
	document.getElementById("hfdCurrentMob").value = '';

	document.getElementById("radSkelTypeNormal").value = MOB_SKELETON_TYPE_NORMAL;
	document.getElementById("radSkelTypeWither").value = MOB_SKELETON_TYPE_WITHER;



	//getRadioValue(radType)



	//-- begin the command update timer
	cmdTimer = setInterval(function(){ updateOutput(); }, 1000);



//	setMainMob(0, true);
}



// Refresh the form output elements
function updateOutput() {
	if (document.getElementById("boxMobCustomizer").offsetParent != null) { updateMobCustomizer(); }

	generateCommand();
}



function initializeSpawnerProperties() {
	document.getElementById("txtSPWSpawnCount").value = SPW_DEFAULT_SPAWNCOUNT;
	document.getElementById("txtSPWSpawnRange").value = SPW_DEFAULT_SPAWNRANGE;
	document.getElementById("txtSPWDelayMin").value = SPW_DEFAULT_MINDELAY;
	document.getElementById("txtSPWDelayMax").value = SPW_DEFAULT_MAXDELAY;
	document.getElementById("txtSPWMaxMobs").value = SPW_DEFAULT_MAXNEARBYMOBS;
	document.getElementById("txtSPWPlayerRange").value = SPW_DEFAULT_PLAYERRANGE;
}



// Captures the values of the form and send it to the command internal object.
function captureForm() {

	if (mcCommand.NBTInfo instanceof MinecraftMobSpawner) {

		//--- capture mob spawner propeties ---//
		mcCommand.NBTInfo.SpawnCount 			= parseInt(document.getElementById("txtSPWSpawnCount").value);
		mcCommand.NBTInfo.SpawnRange 			= parseInt(document.getElementById("txtSPWSpawnRange").value);
		mcCommand.NBTInfo.Delay 				= parseInt(document.getElementById("txtSPWDelayNext").value);
		mcCommand.NBTInfo.MinSpawnDelay 		= parseInt(document.getElementById("txtSPWDelayMin").value);
		mcCommand.NBTInfo.MaxSpawnDelay 		= parseInt(document.getElementById("txtSPWDelayMax").value);
		mcCommand.NBTInfo.MaxNearbyEntities 	= parseInt(document.getElementById("txtSPWMaxMobs").value);
		mcCommand.NBTInfo.RequiredPlayerRange 	= parseInt(document.getElementById("txtSPWPlayerRange").value);

		//--- capture custom mob properties ---//
		if (document.getElementById("boxMobCustomizer").offsetParent != null) {
			selectedMob.PresetName		= document.getElementById("txtMobPresetName").value;

			selectedMob.NBTInfo.Health 				= parseInt(document.getElementById("txtMobHealth").value);
			selectedMob.NBTInfo.CustomName 			= document.getElementById("txtMobCustomName").value;
			selectedMob.NBTInfo.CustomNameVisible	= getRadioValueBoolean("radNameVisible");
			selectedMob.NBTInfo.CanPickUpLoot		= getRadioValueBoolean("radPickLoot");
			selectedMob.NBTInfo.PersistenceRequired	= getRadioValueBoolean("radPersistent");

			switch(selectedMob.EntityId) {
				case 'Skeleton':
					selectedMob.NBTInfo.SkeletonType	= getRadioValueNumber("radSkelType");
					break;

				case 'Zombie':
					selectedMob.NBTInfo.IsBaby			= getRadioValueBoolean("radZombBaby");
					selectedMob.NBTInfo.IsVillager		= getRadioValueBoolean("radZombVillager");
					selectedMob.NBTInfo.CanBreakDoors	= getRadioValueBoolean("radZombDoors");
					break;

			}
		}

	}

}



function createMobSelector(container) {
	var mobBoxHtml = '';


	container.innerHTML = "<b>Select the mob type:</b><br/>";

	for (var i=0; i<mobList.length; i++) {
		mobBoxHtml = "<div class='boxMob' id='mob" + i + "'>";

		mobBoxHtml += "<div class='boxPortrait' onclick='setMainMob(" + i + ")' ondblclick='setMainMob(" + i + ", true)'>";
		mobBoxHtml += "<img src='assets/images/" + mobList[i].Picture + "' alt='" + mobList[i].PresetName + "' title='" + mobList[i].PresetName + "' />";
		mobBoxHtml += "<div class='mobName'>" + mobList[i].PresetName + "</div>"
		mobBoxHtml += "</div>";

		mobBoxHtml += "<div class='boxCommand'>";
		mobBoxHtml += "<span class='cmdSelect' onclick='setMainMob(" + i + ")'>Select</span>";
		mobBoxHtml += "<span class='cmdEdit' onclick='setMainMob(" + i + ", true)'>Edit</span>";
		mobBoxHtml += "</div>";

		mobBoxHtml += "</div>";
		container.innerHTML += mobBoxHtml;
	}

	// OBS 1 (?): Create groups: vanilla (basic) mobs | Presets (?) | My mobs (saved locally)
}




function createMobCustomizer(container) {
	var mobBoxHtml = '';


	//--- validation ---
	if (selectedMob === undefined) { showErrorMessage("No mob selected"); return; }

	updateMobCustomizer();


	//--- mob picture ---
	document.getElementById("imgMobPreset").src = 'assets/images/' + selectedMob.Picture;
	document.getElementById("txtMobPresetName").value = selectedMob.PresetName;


	//--- default properties ---
	document.getElementById("txtMobHealth").value = selectedMob.NBTInfo.Health;
	setRadioValue("radNameVisible", selectedMob.NBTInfo.CustomNameVisible);
	setRadioValue("radPickLoot", selectedMob.NBTInfo.CanPickUpLoot);
	setRadioValue("radPersistent", selectedMob.NBTInfo.PersistenceRequired);


	//--- unique properties ---
	document.getElementById("prop_crep").style.display = 'none';
	document.getElementById("prop_skel").style.display = 'none';
	document.getElementById("prop_zomb").style.display = 'none';
	document.getElementById("prop_endm").style.display = 'none';

	switch(selectedMob.EntityId) {
		case 'Creeper':
			document.getElementById("prop_crep").style.display = 'block';
			setRadioValue("radCrepCharged", selectedMob.NBTInfo.powered);
			document.getElementById("txtCrepFuse").value = selectedMob.NBTInfo.Fuse;
			break;

		case 'Enderman':
			document.getElementById("prop_endm").style.display = 'block';
			fillDropdownItens("ddlEndmBlock", "all")
			break;

		case 'Skeleton':
			document.getElementById("prop_skel").style.display = 'block';
			setRadioValue("radSkelType", selectedMob.NBTInfo.SkeletonType);
			break;

		case 'Zombie':
			document.getElementById("prop_zomb").style.display = 'block';
			setRadioValue("radZombBaby", selectedMob.NBTInfo.IsBaby);
			setRadioValue("radZombVillager", selectedMob.NBTInfo.IsVillager);
			setRadioValue("radZombDoors", selectedMob.NBTInfo.CanBreakDoors);
			break;
	}


	//--- equipments ---
	fillDropdownItens("ddlEquipHand", "hand")
	fillDropdownItens("ddlEquipHead", "head")
	fillDropdownItens("ddlEquipBody", "body")
	fillDropdownItens("ddlEquipLegs", "legs")
	fillDropdownItens("ddlEquipFeet", "feet")



//	console.log(document.getElementById("boxMobCustomizer").offsetParent != null);
//	console.log(document.getElementById("boxMobType").offsetParent != null);


}



function updateMobCustomizer() {
	var containerHearts = document.getElementById("boxMobHearts");

	var hearts = 0;
	var heartsHtml = '';


	if (selectedMob === undefined) { return; }


	//--- mob hearts ---
	if (selectedMob.NBTInfo.Health > 0 && selectedMob.NBTInfo.Health < 1000) {
		hearts = Math.floor(selectedMob.NBTInfo.Health / 2);

		for (i=0; i<hearts; i++) { heartsHtml += '<img src="assets/images/heart.svg" /> '; }
		if (selectedMob.NBTInfo.Health % 2) heartsHtml += '<img src="assets/images/half_heart.svg" /> ';
	}
	containerHearts.innerHTML = heartsHtml;


	//console.log(hearts);
	//console.log(selectedMob.NBTInfo);


}






function setCommandType(type) {
	mcCommand.Type = type;

	switch(type) {
		case 'spawner':
			mcCommand.NBTInfo = new MinecraftMobSpawner();

			radType[0].checked = true;
			showPropertiesBox('spawnerBasic');
			break;

		case 'summon':
			radType[1].checked = true;
			showPropertiesBox('summon');
			break;

		case 'item':
			radType[2].checked = true;
			showPropertiesBox('item');		// ToDo
			break;

		case 'potion':
			radType[3].checked = true;
			showPropertiesBox('potion');	// ToDo
			break;

		default:
			mcCommand.type = "INVALID";
	}
}




function showPropertiesBox(boxType) {
	var bMobType 		= document.getElementById("boxMobType");
	var bSpawnerProps 	= document.getElementById("boxSpawnerCustomizer");
	var bMobProps 		= document.getElementById("boxMobCustomizer");


	bMobType.style.display 			= 'none';
	bSpawnerProps.style.display 	= 'none';
	bMobProps.style.display 		= 'none';


	switch(boxType) {
		case 'spawnerBasic':
			bMobType.style.display = 'block';
			bSpawnerProps.style.display = 'block';
			initializeSpawnerProperties();
			createMobSelector(bMobType);
			break;

		case 'spawnerCustom':
			bMobProps.style.display = 'block';
			bSpawnerProps.style.display = 'block';
			initializeSpawnerProperties();
			createMobCustomizer(bMobProps);
			break;

		case 'summon':
			bMobType.style.display = 'block';
			createMobSelector(bMobType);
			break;

	}
}





function setMainMob(index, customize) {
	console.log('setMainMob(' + index + ', ' + customize + ')')

	// OBS: If in the future 'boxSelected' gets reused, change this to a loop on mobList

	//-- remove the 'selected' class from everyone --
	var currentSelectedList = document.getElementsByClassName('boxSelected');
	for (var j=0; j<currentSelectedList.length; j++) {
		currentSelectedList[j].className = currentSelectedList[j].className.replace('boxSelected', '');
	}

	//-- add the 'selected' class to the actual selection --
	document.getElementById("mob" + index).className += ' boxSelected';

	//-- Save what mob was selected --
	document.getElementById("hfdCurrentMob").value = index;
	selectedMob = mobList[index];

	//--- add the selected mob to the spawner ---//
	if (mcCommand.NBTInfo instanceof MinecraftMobSpawner) {
		mcCommand.NBTInfo.EntityId 	= selectedMob.EntityId;
		mcCommand.NBTInfo.SpawnData = selectedMob.NBTInfo;
	}

	//-- Show the customization/edit box if needed --
	if (customize === true) {
		selectedMob.PresetName = 'Custom ' + selectedMob.PresetName;
		showPropertiesBox('spawnerCustom');
	}


	// TODO: IF IS CUSTOM MOB, CREATE A COPY!!!!!!
}



function generateCommand() {
	captureForm();

	// DEBUG //
	console.log(mcStringify(mcCommand));

	txtResult.value = mcCommand.getCommand();
}










function fillDropdownItens(elementId, listType) {
	var dropdown = document.getElementById(elementId);
	if (!dropdown) return;

	addDropdownItem(dropdown, "- none -", "");
	switch(listType) {
		case "hand":
			addDropdownItem(dropdown, "Diamond Sword", "dSword");
			addDropdownItem(dropdown, "Gold Sword", "gSword");
			break;

		case "head":
			addDropdownItem(dropdown, "Pumpkin", "pumpkin");
			addDropdownItem(dropdown, "Glass Block", "glass");
			break;

		case "body":
			break;

		case "legs":
			break;

		case "foot":
			break;

		case "all":
			addDropdownItem(dropdown, "TNT", "tnt");
			break;

	}

	// TODO: CREATE LIST WITH ALL EQUIPS, EACH ITEM HAVE A 'CATEGORY' TO MATCH THE SWITCH ABOVE
}







function showErrorMessage(msg) {
	alert("ERROR: " + msg);
}






function loadMobList() {

	var vanillaZombie = new MobZombie();
	var vanillaSkelly = new MobSkeleton();
	var vanillaSpider = new MobSpider();
	var vanillaCrepper = new MobCreeper();
	var vanillaBlaze = new MobBlaze();
	var vanillaEnderman = new MobEnderman();
	var vanillaWitch = new MobWitch();



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
	mobList.push(vanillaEnderman);
	mobList.push(vanillaWitch);
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





var mcCommand = new MinecraftCommand('spawner');
var mobList = [];
var selectedMob;
var cmdTimer;


window.onload = start();







