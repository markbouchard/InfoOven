
var INFOOVEN_PRIMARY_INTERVAL = "infooven_primary_interval";
var INFOOVEN_PRIMARY_COUNT = "infooven_primary_count";
var INFOOVEN_PRIMARY_REFRESH_INTERVAL = "infooven_primary_refresh_interval";
var INFOOVEN_SECONDARY_INTERVAL = "infooven_secondary_interval";
var INFOOVEN_SECONDARY_REFRESH_INTERVAL = "infooven_secondary_refresh_interval";
var INFOOVEN_SECONDARY_REFRESH_INTERVAL = "infooven_window_type";
var INFOOVEN_AUTO_START = "infooven_auto_start";

function save_options() {

	// get the input form values
	var primary_interval = document.getElementById('primary_interval').value;
	var primary_count = document.getElementById('primary_count').value;
	var primary_refresh_interval = document.getElementById('primary_refresh_interval').value;
	var secondary_interval = document.getElementById('secondary_interval').value;
	var secondary_refresh_interval = document.getElementById('secondary_refresh_interval').value;
	var autoStartYes = document.getElementById('autoStartYes').checked;
	
	chrome.extension.getBackgroundPage().console.log('inside options.js save_options');
	chrome.extension.getBackgroundPage().console.log('primary_interval = ' + primary_interval);
	chrome.extension.getBackgroundPage().console.log('primary_count = ' + primary_count);
	chrome.extension.getBackgroundPage().console.log('secondary_interval = ' + secondary_interval);
	chrome.extension.getBackgroundPage().console.log('autoStartYes = ' + autoStartYes);

	localStorage.setItem(INFOOVEN_PRIMARY_INTERVAL, primary_interval);
	localStorage.setItem(INFOOVEN_PRIMARY_REFRESH_INTERVAL, primary_refresh_interval);
	localStorage.setItem(INFOOVEN_PRIMARY_COUNT, primary_count);
	localStorage.setItem(INFOOVEN_SECONDARY_INTERVAL, secondary_interval);
	localStorage.setItem(INFOOVEN_SECONDARY_REFRESH_INTERVAL, secondary_refresh_interval);
	localStorage.setItem(INFOOVEN_AUTO_START, autoStartYes);

	chrome.extension.getBackgroundPage().console.log('save_options - auto_start = ' +autoStartYes);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

	chrome.extension.getBackgroundPage().console.log('restore_options loaded');

	// get the ol' items from storage	
	var primary_interval = localStorage.getItem(INFOOVEN_PRIMARY_INTERVAL) || 1.0;
    var primary_count = localStorage.getItem(INFOOVEN_PRIMARY_COUNT) || 1;
    var primary_refresh_interval = localStorage.getItem(INFOOVEN_PRIMARY_REFRESH_INTERVAL) || 1.0;
    var secondary_interval = localStorage.getItem(INFOOVEN_SECONDARY_INTERVAL) || 0.05;
    var secondary_refresh_interval = localStorage.getItem(INFOOVEN_SECONDARY_REFRESH_INTERVAL) || 1.0;
    var auto_start = localStorage.getItem(INFOOVEN_AUTO_START);

    // validate auto_start boolean
    if(auto_start != null)
    {
    	auto_start = JSON.parse(auto_start);

	}
	else
	{
		// default to true
		auto_start = true;
	}

	// set the items in the page 
	document.getElementById('primary_interval').value = primary_interval;
	document.getElementById('primary_count').value = primary_count;
	document.getElementById('primary_refresh_interval').value = primary_refresh_interval;
	document.getElementById('secondary_interval').value = secondary_interval;
	document.getElementById('secondary_refresh_interval').value = secondary_refresh_interval;

	// default the radio buttons
	document.getElementById('autoStartYes').checked = auto_start;	
	document.getElementById('autoStartNo').checked = !auto_start;		

  	chrome.extension.getBackgroundPage().console.log('done with restore_options');

}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);