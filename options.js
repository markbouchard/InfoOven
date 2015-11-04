
function save_options() {


    alert("hello save");
    chrome.extension.getBackgroundPage().console.log('inside options.js saveOptions');

/*
    var color = document.getElementById('color').value;
	var likesColor = document.getElementById('like').checked;
	chrome.storage.sync.set({
	favoriteColor: color,
	likesColor: likesColor
	}, function() {
	// Update status to let user know options were saved.
	var status = document.getElementById('status');
	status.textContent = 'Options saved.';
	setTimeout(function() {
	  status.textContent = '';
	}, 750);
	});
*/
    /*
    var select = document.getElementById("color");
    var color = select.children[select.selectedIndex].value;
    localStorage["favColor"] = color;
    */
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.

  //alert("inside restore_options");
  /*
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
*/
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);