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

  //setTimeout( "alert('ping')", 5000); // attempt 1
  chrome.alarms.create("Start", {periodInMinutes: 0.05});
  
  chrome.alarms.onAlarm.addListener(loadNextTab);

  // get the open tab for each open window and store it
  saveCurrentTabIds();

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

/*
      chrome.tabs.query({"currentWindow": true, "windowType": "normal"}, function(tabs) {
        
    
          chrome.extension.getBackgroundPage().console.log('Looping through tabs and tab length = ' + tabs.length);
          
      });
*/

      chrome.extension.getBackgroundPage().console.log('Now looping through all windows to get tab counts');
      
      chrome.windows.getAll({populate: true}, function(allWindows)
      {
        var numWindows = allWindows.length;
        allWindows.forEach(function(window){
          

          console.log("inside loop for window: " + window.id);

          var numTabs = window.tabs.length;
          var tabId = chrome.tabs.TAB_ID_NONE;
          var currentTabId = getCurrentSelectedTab(window.id);
          console.log("window: " + window.id + " has  " + numTabs + " tabs and the currentSelectedTab = " + currentTabId);

          if(currentTabId == -1)
          {
            console.log("querying for active tabs cause currentTabId = -1");
            chrome.tabs.query({"windowId": window.id, "active": true}, function(tabArr) {
              if(tabArr.length == 1)
              {
                var tab = tabArr[0];
                console.log("found an active tab");
                tabId = tab.id;
                changeTab(window.id, tabId);
              }
            });

            console.log("checking tabId got set");
            if(tabId == -1 && window.tabs.length >0)
            {
              tabId = window.tabs[0].id;
              changeTab(window.id, tabId);
            }
          }
          else
          {
            var tabId = 0;
            var next = 0;
            var tab;
            for(i=0; i < window.tabs.length; i++)
            {
                tab = window.tabs[i];
                next = i +1;
                if(tab.selected && window.tabs.length > next)
                {
                  tabId = next;
                  break;
                }
            }

            tabId = window.tabs[tabId].id;

            changeTab(window.id, tabId);
            /*
            console.log("currentTabId != -1, so getting that tab for tabId " + currentTabId);
            chrome.tabs.query({"windowId": window.id, "index": currentTabId}, function(tabArr)
            {
              console.log("got a result for the tab by index query - count = " + tabArr.length);
              if(tabArr.length == 1)
              {
                 var tab = tabArr[0];
                 var tabIndex = tab.index;
                 if(tabIndex < numTabs -1)
                 {
                    tabId = window.tabs[tabIndex+1].id;
                    changeTab(window.id, tabId);
                 }
                 else
                 {
                    tabId = window.tabs[0].id;
                    changeTab(window.id, tabId);
                 }
             }
            });
            */
          }
          
        });
      });
      

      // wait for next tab
      // if last tab in the browswer, reset wait time to MAIN_TAB_DISPLAY_LENGTH
      // if not first tab in the browser, reset wait time to AUX_TAB_DISPLAY_LENGTH
}

function changeTab(windowId, tabId) {
  
  console.log("inside changeTab for window: " + windowId + "and tab: " + tabId);
  if(tabId !== undefined)
  {
    // gotta use the tabId to set it to be selected;
    chrome.tabs.update(tabId, {"selected": true});

    // write to memory our last open tabs
    setCurrentSelectedTab(windowId, tabId);;
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