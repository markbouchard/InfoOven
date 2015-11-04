// Copyright (c) 2015 Mark Bouchard. All rights reserved.
// Use of this source code is governed by a GPL license that can be
// found in the LICENSE file.
// The goal of this Chrome extension is to allow an automatic cycle through an open browswer's tabs. 
// This should allow you to put this on a large screen to act as an information radiator for your team or business. 
// Read more about information radiators here:
// http://www.agileadvice.com/2005/05/10/bookreviews/information-radiators/

document.addEventListener('DOMContentLoaded', function() {
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

  chrome.windows.getAll({populate: true}, function(allWindows)
  {
      allWindows.forEach(function(window){
          startAlarms(window.id, 0.05);
      });

  });

  chrome.alarms.onAlarm.addListener(loadNextTab);

  //startAlarms("test", 0.05);

  // get the open tab for each open window and store it
  saveCurrentTabIds();

}

function tearMeDown() {
  
  //Clears existing alarm
  clearAlarms();
    
}

function startAlarms(windowId, interval) {

  //setTimeout( "alert('ping')", 5000); // attempt 1
  chrome.alarms.create(windowId.toString(), {periodInMinutes: interval});
  
  //chrome.alarms.onAlarm.addListener(loadNextTab);
}

function clearAlarm(windowId) {

  chrome.alarms.clear(windowId.toString());
  //chrome.alarms.onAlarm.removeListener(loadNextTab);
}

function clearAlarms() {
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
    
      chrome.extension.getBackgroundPage().console.log('trigger occurred, switching to the next tab - alarm id = ' + alarm.name);


      var winId = parseInt(alarm.name);
      chrome.windows.get(winId, {populate: true}, function (window)
      {
        chrome.extension.getBackgroundPage().console.log('FOUND WINDOW FOR ALARM ' + window.id);  

          var numTabs = window.tabs.length;
          var tabId = chrome.tabs.TAB_ID_NONE;
          var currentTabId = getCurrentSelectedTab(window.id);
          console.log("window: " + window.id + " has  " + numTabs + " tabs and the currentSelectedTab = " + currentTabId);

          // TODO - investigate using
          // chrome.tabs.getSelected(integer windowId, function callback)
          // Deprecated since Chrome 33. Please use tabs.query {active: true}.

          if(currentTabId == -1)
          {
            console.log("querying for active tabs cause currentTabId = -1");
            chrome.tabs.query({"windowId": window.id, "active": true}, function(tabArr) {
              if(tabArr.length == 1)
              {
                var tab = tabArr[0];
                console.log("found an active tab");
                tabId = tab.id;
                changeTab(window.id, tabId, tab.index);
              }
            });

            console.log("checking tabId got set");
            if(tabId == -1 && window.tabs.length >0)
            {
              var tab = tabArr[0];
              tabId = tab.id;
              changeTab(window.id, tabId, tab.index);
            }
          }
          else
          {
            var tabId = 0;
            var next = 0;
            var tab;

            // loop through the set of tabs looking for the selected tab
            // then set the next pointer to either be the next index if it's within bounds, or 0 otherwise
            for(i=0; i < window.tabs.length; i++)
            {
                tab = window.tabs[i];
                
                // we selected and is their a next tab?  if so, set that to be our next tab to see.
                if(tab.selected && window.tabs.length > i + 1)
                {
                  next = i +1;
                  break;
                }
            }

            // get the id for the tab we're about to switch to
            tabId = window.tabs[next].id;

            // switch that tab kid!
            changeTab(window.id, tabId, next);
      
          }        
      });
}

function changeTab(windowId, tabId, indexId) {
  
  console.log("inside changeTab for window: " + windowId + " and tab: " + tabId + " and indexId = " + indexId);
  if(tabId !== undefined)
  {
    // gotta use the tabId to set it to be selected;
    chrome.tabs.update(tabId, {"selected": true});

    // write to memory our last open tabs
    setCurrentSelectedTab(windowId, tabId);

    if(indexId !== undefined)
    {
      clearAlarm(windowId);
      if(indexId == 0)
      {
        // update to long timer
        startAlarms(windowId, 1);

      }
      else
      {
        // update to short timer
        startAlarms(windowId, 0.05);
      }
    }
  }
}

function saveCurrentTabIds() {

  // loop through the windows and set the current open tab for each
  chrome.windows.getAll({populate: true}, function(allWindows)
  {
    var numWindows = allWindows.length;
    allWindows.forEach(function(window){
      
      chrome.tabs.query({"windowId": window.id, "active": true}, function(tabArr) {
          if(tabArr.length == 1)
          {
            var tab = tabArr[0];
            chrome.extension.getBackgroundPage().console.log('setting currentTabId for window ' + window.id + " to tab id " + tab.id);

            setCurrentSelectedTab(window.id, tab.id);
          }
          
      });
          
    });

  });

}

function getCurrentSelectedTab(windowId) {
  var searchCriteria = "window"+windowId+"CurrentTabId";
  var currentTabId = localStorage.getItem(searchCriteria);

  chrome.extension.getBackgroundPage().console.log('fetching from localstorage: ' +searchCriteria + " and found: " +currentTabId);
  // if not set, set it to not running
  if(currentTabId === undefined || currentTabId == "undefined" || currentTabId == null)
  {
    currentTabId = chrome.tabs.TAB_ID_NONE;
  }
  
  currentTabId = JSON.parse(currentTabId);

  return currentTabId;
  
}

function setCurrentSelectedTab(windowId, tabId) {
  // set the current tab open for this window

  chrome.extension.getBackgroundPage().console.log('writing to localstorage: currentTabId for window ' + windowId + " to tab id " + tabId);
  localStorage.setItem("window"+windowId+"CurrentTabId", tabId);
}

// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
  //alert("hello world");

  chrome.extension.getBackgroundPage().console.log('clicked on the infooven icon');

  // user clicked us, update our status based on 
  flipStatus();


});