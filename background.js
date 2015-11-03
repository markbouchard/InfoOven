// Copyright (c) 2015 Mark Bouchard. All rights reserved.
// Use of this source code is governed by a GPL license that can be
// found in the LICENSE file.
// The goal of this Chrome extension is to allow an automatic cycle through an open browswer's tabs. 
// This should allow you to put this on a large screen to act as an information radiator for your team or business. 
// Read more about information radiators here:
// http://www.agileadvice.com/2005/05/10/bookreviews/information-radiators/

document.addEventListener('DOMContentLoaded', function() {
  //getCurrentTabUrl(function(url) {
    //alert("hi. i am here.");
    chrome.extension.getBackgroundPage().console.log('InfoOven loaded, setting status');
    setStatus();
});

function setStatus() {
  
  // try to retrieve our running status from local storage
  var running = localStorage.getItem("infoOvenRunning");

  // if not set, set it to not running
  if(running == null)
  {
    running = false;
  }
  
  running = JSON.parse(running);
  if(running)
  {
    chrome.extension.getBackgroundPage().console.log('InfoOven was previously running, turning back on');
    chrome.browserAction.setIcon({path: 'icon-running.png'});
    chrome.browserAction.setTitle({title: 'Stop cookin\'!'});  

    startMeUp();  
  }
  else
  {
    chrome.extension.getBackgroundPage().console.log('InfoOven was previously not running, turning back off');
    chrome.browserAction.setIcon({path: 'icon.png'});
    chrome.browserAction.setTitle({title: 'Start cookin\'!'});

    // stop the timer that causes refreshes
    tearMeDown();
  }

  localStorage.setItem("infoOvenRunning", running);
}

function startMeUp() {

  //setTimeout( "alert('ping')", 5000); // attempt 1
  chrome.alarms.create("Start", {periodInMinutes: 0.05});
  
  chrome.alarms.onAlarm.addListener(loadNextTab);


}

function tearMeDown() {
  
  //Clears existing alarm
  chrome.alarms.clearAll();
  chrome.alarms.onAlarm.removeListener(loadNextTab);
    
}

function flipStatus() {
  //document.getElementById('status').textContent = statusText;
  // Retrieve
  var running = localStorage.getItem("infoOvenRunning");

  if(running == null)
  {
    running = false;
  }
  
  running = JSON.parse(running);
  if(running)
  {
    chrome.extension.getBackgroundPage().console.log('running, turning off');

    // stop the timer that causes refreshes
    tearMeDown();

    // update our status
    chrome.browserAction.setIcon({path: 'icon.png'});
    chrome.browserAction.setTitle({title: 'Start cookin\'!'});
  }
  else
  {
    chrome.extension.getBackgroundPage().console.log('not running, turning on');

    // start up the timer that will cause refreshes
    startMeUp();

    // update our status
    chrome.browserAction.setIcon({path: 'icon-running.png'});
    chrome.browserAction.setTitle({title: 'Stop cookin\'!'});
    
  }

  localStorage.setItem("infoOvenRunning", !running);
}

function loadNextTab(alarm) {
    
      chrome.extension.getBackgroundPage().console.log('trigger occurred, switching to the next tab');

      chrome.tabs.query({"currentWindow": true, "windowType": "normal"}, function(tabs) {
        
    
          chrome.extension.getBackgroundPage().console.log('Looping through tabs and tab length = ' + tabs.length);
          
      });

      chrome.extension.getBackgroundPage().console.log('Now looping through all windows to get tab counts');
      
      chrome.windows.getAll({populate: true}, function(allWindows)
      {
        var numWindows = allWindows.length;
        allWindows.forEach(function(window){
          window.tabs.forEach(function(tab){
            
            //console.log(tab.url);

            // not that tab id does not equal the order in which they are currently displayed, so need to use length or order
            console.log("window: " + window.id + " | tab: " + tab.id + " | url = " +tab.url);
          });
        });
      });
      

      // wait for next tab
      // if last tab in the browswer, reset wait time to MAIN_TAB_DISPLAY_LENGTH
      // if not first tab in the browser, reset wait time to AUX_TAB_DISPLAY_LENGTH


    
}

// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
  //alert("hello world");

  chrome.extension.getBackgroundPage().console.log('clicked on the infooven icon');

  // user clicked us, update our status based on 
  flipStatus();


});