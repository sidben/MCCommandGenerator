


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



	setMainMob(0, true);
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
	switch(selectedMob.EntityId) {
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




//	console.log(selectedMob.NBTInfo.Health%2);
//	function a(x) { console.log('hit'); return ~~x;  }

	//console.log(~~x);
	//console.log(Math.floor(x));
	//console.log(x%1);



/*
	mobBoxHtml = "<b>Customize your mob:</b><br/>";

	//--- mob picture ---
	mobBoxHtml += "<div class='boxMob'>";

	mobBoxHtml += "<div class='boxPortrait'>";
	mobBoxHtml += "<img src='assets/images/" + selectedMob.Picture + "' alt='" + selectedMob.PresetName + "' title='" + selectedMob.PresetName + "' />";
	mobBoxHtml += "</div>";

	mobBoxHtml += "</div>";


	//--- mob properties and modifiers ---
	mobBoxHtml += "Preset name: <input type='text' value='Custom " +  selectedMob.PresetName + "' /> <br/>"

	mobBoxHtml += "<br/><br/> <b>GLOBAL PROPERTIES</b><br/>"
	mobBoxHtml += "Health: <input type='text' value='" + selectedMob.NBTInfo.DefaultHealth + "' /> <br/>"
	mobBoxHtml += "Custom name: <input type='text' /> <br/>"
	mobBoxHtml += "Custom name visible: YES / NO <br/>"
	mobBoxHtml += "Can pick up loot: YES / NO <br/>"
	mobBoxHtml += "Persistent (will not despawn): YES / NO <br/>"

	mobBoxHtml += "<br/><br/> <b>UNIQUE PROPERTIES</b><br/>"
	switch(selectedMob.EntityId) {
		case 'Creeper':
			mobBoxHtml += "Charged: YES / NO <br/>"
			mobBoxHtml += "Explosion radius: <input type='text' value='3' /> <br/>"
			mobBoxHtml += "Fuse: <input type='text' value='30' /> ticks <br/>"
			break;

		case 'Enderman':
			mobBoxHtml += "Carried block: <input type='text' /> <br/>"
			break;

		case 'Guast':
			mobBoxHtml += "Explosion power: <input type='text' value='1' /> <br/>"
			break;

		case 'PigZombie':
			mobBoxHtml += "Angry: YES / NO <br/>"
			break;

		case 'Skeleton':
			mobBoxHtml += "Type: Regular / Wither / undefined<br/>"
			break;

		case 'Villager':
			mobBoxHtml += "Profession: <input type='text' value='1' /> <br/>"
			break;

		case 'VillagerGolem':
			mobBoxHtml += "Player created (don't attack players): YES / NO <br/>"
			break;

		case 'Wolf':
			mobBoxHtml += "Angry: YES / NO <br/>"
			break;

		case 'Zombie':
			mobBoxHtml += "Villager: YES / NO <br/>"
			mobBoxHtml += "Baby: YES / NO <br/>"
			mobBoxHtml += "Can break doors: YES / NO <br/>"
			break;

	}


	mobBoxHtml += "<br/><br/> <b>ATTRIBUTES</b><br/>"

	mobBoxHtml += "<br/><br/> <b>EQUIPMENT</b><br/>"

	mobBoxHtml += "<br/><br/> <b>POTION EFFECTS</b><br/>"


	mobBoxHtml += "<br/><br/> TODO: save as / reset to default (confirm) / Cancel (confirm)"

	container.innerHTML = mobBoxHtml;
*/
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


	// TODO: IS IS CUSTOM MOB, CREATE A COPY!!!!!!
}



function generateCommand() {
	captureForm();

	// DEBUG //
	console.log(mcStringify(mcCommand));

	txtResult.value = mcCommand.getCommand();
}




function getRadioValue(elementName) {
	var element = document.getElementsByName(elementName);
	if (!element) return '';
	for (var i=0; i<element.length; i++) {
		if (element[i].checked) { return element[i].value; }
	}
	return '';
}

function getRadioValueBoolean(elementName) {
	var value = getRadioValue(elementName);

	if (value == '') return undefined;
	if (value == true || value == 'true' || value == 1) { return true; }
	if (value == false || value == 'false' || value == 0) { return false; }
	return undefined;
}

function getRadioValueNumber(elementName) {
	var value = getRadioValue(elementName);

	if (value == '') return undefined;
	if (isNaN(value)) return undefined;
	return parseInt(value);
}


function setRadioValue(elementName, newValue) {
	var element = document.getElementsByName(elementName);
	if (!element) return;
	if (newValue === undefined) newValue = '';

	for (var i=0; i<element.length; i++) {
		element[i].checked = false;
		if (element[i].value == newValue.toString()) { element[i].checked = true; }
	}
}





function addDropdownItem(dropdown, name, value) {
	if (!dropdown) return;

	var opt = document.createElement("option");

	opt.text = name;
	opt.value = value;

	dropdown.options.add(opt);
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

	}

	// TODO: CREATE LIST WITH ALL EQUIPS, EACH ITEM HAVE A 'CATEGORY' TO MATCH THE SWITCH ABOVE
}







function showErrorMessage(msg) {
	alert("ERROR: " + msg);
}







var mcCommand = new MinecraftCommand('spawner');
var selectedMob;
var cmdTimer;


window.onload = start();







