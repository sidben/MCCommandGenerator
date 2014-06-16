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


function cloneStrongType(obj) {
	var copy = new Object();
	if (obj instanceof BaseMob) copy = new BaseMob();
	if (obj instanceof MinecraftLivingEntity) copy = new MinecraftLivingEntity();


	for (var attr in obj) {
		switch(typeof obj[attr]) {
			case 'number':
			case 'string':
			case 'boolean':
				copy[attr] = obj[attr];
				break;

			case 'object':
				copy[attr] = cloneStrongType(obj[attr]);
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