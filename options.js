
function save_options() {

	// get the input form values
	var primary_interval = document.getElementById('primary_interval').value;
	var primary_count = document.getElementById('primary_count').value;
	var secondary_interval = document.getElementById('secondary_interval').value;
	var autoStartYes = document.getElementById('autoStartYes').checked;
	
	chrome.extension.getBackgroundPage().console.log('inside options.js save_options');
	chrome.extension.getBackgroundPage().console.log('primary_interval = ' + primary_interval);
	chrome.extension.getBackgroundPage().console.log('primary_count = ' + primary_count);
	chrome.extension.getBackgroundPage().console.log('secondary_interval = ' + secondary_interval);
	chrome.extension.getBackgroundPage().console.log('autoStartYes = ' + autoStartYes);

	localStorage.setItem("infooven_primary_interval", primary_interval);
	localStorage.setItem("infooven_primary_count", primary_count);
	localStorage.setItem("infooven_secondary_interval", secondary_interval);
	localStorage.setItem("infooven_auto_start", autoStartYes);

	chrome.extension.getBackgroundPage().console.log('save_options - auto_start = ' +autoStartYes);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

	chrome.extension.getBackgroundPage().console.log('restore_options loaded');

	// get the ol' items from storage	
	var primary_interval = localStorage.getItem("infooven_primary_interval") || 1.0;
    var primary_count = localStorage.getItem("infooven_primary_count") || 1;
    var secondary_interval = localStorage.getItem("infooven_secondary_interval") || 0.05;
    var auto_start = localStorage.getItem("infooven_auto_start");

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
	document.getElementById('secondary_interval').value = secondary_interval;

	// default the radio buttons
	document.getElementById('autoStartYes').checked = auto_start;	
	document.getElementById('autoStartNo').checked = !auto_start;		

  	chrome.extension.getBackgroundPage().console.log('done with restore_options');

}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);