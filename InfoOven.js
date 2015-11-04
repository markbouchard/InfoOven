
function saveOptions() {
    alert("hello save");
    chrome.extension.getBackgroundPage().console.log('inside InfoOven.js saveOptions');
    /*
    var select = document.getElementById("color");
    var color = select.children[select.selectedIndex].value;
    localStorage["favColor"] = color;
    */
}