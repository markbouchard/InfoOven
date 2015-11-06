// Copyright (c) 2015 Mark Bouchard. All rights reserved.
// Use of this source code is governed by a GPL license that can be
// found in the LICENSE file.

// This was a hackweek project so it's not overly elegant, but it is functional!

// The goal of this Chrome extension is to allow an automatic cycle through an open browswer's tabs. 
// This should allow you to put this on a large screen to act as an information radiator for your team or business. 
// Read more about information radiators here:
// http://www.agileadvice.com/2005/05/10/bookreviews/information-radiators/

// globals for localStorage
var INFOOVEN_RUNNING = "infooven_running";

// TODO - these are duplicated in options.js
var INFOOVEN_PRIMARY_INTERVAL = "infooven_primary_interval";
var INFOOVEN_PRIMARY_COUNT = "infooven_primary_count";
var INFOOVEN_PRIMARY_REFRESH_INTERVAL = "infooven_primary_refresh_interval";
var INFOOVEN_SECONDARY_INTERVAL = "infooven_secondary_interval";
var INFOOVEN_SECONDARY_REFRESH_INTERVAL = "infooven_secondary_refresh_interval";

var INFOOVEN_AUTO_START = "infooven_auto_start";
var INFOOVEN_WINDOW_TYPE = "infooven_window_type";

var INFOOVEN_WINDOW_TYPE_ALL = "ALL";
var INFOOVEN_WINDOW_TYPE_FOCUSED = "FOCUSED";
var INFOOVEN_WINDOW_TYPE_BACKGROUND = "BACKGROUND";


document.addEventListener('DOMContentLoaded', function() {
    chrome.extension.getBackgroundPage().console.log('InfoOven loaded, setting status');
    setStatus();
});

function setStatus() {
  
  // try to retrieve our running status from local storage
  var running = localStorage.getItem(INFOOVEN_RUNNING);

  // if not set, set it to not running
  if(running == null || !getAutoStart())
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

  localStorage.setItem(INFOOVEN_RUNNING, running);
}

function getPrimaryInterval() {

  var primary_interval = localStorage.getItem(INFOOVEN_PRIMARY_INTERVAL) || 1.0;

  //chrome.extension.getBackgroundPage().console.log('getPrimaryInterval returning = ' + primary_interval);

  return JSON.parse(primary_interval);
}

function getPrimaryCount() {

  var primary_count = localStorage.getItem(INFOOVEN_PRIMARY_COUNT) || 1;

  //chrome.extension.getBackgroundPage().console.log('getPrimaryCount returning = ' + primary_count);

  return JSON.parse(primary_count);
}

function getSecondaryInterval() {

  var secondary_interval = localStorage.getItem(INFOOVEN_SECONDARY_INTERVAL) || 0.05;

  //chrome.extension.getBackgroundPage().console.log('getSecondaryInterval returning = ' + secondary_interval);

  return JSON.parse(secondary_interval);
}

function getRefreshInterval(isPrimaryTab) {

  var refresh_interval = undefined;

  //console.log("inside getRefreshInterval and isPrimaryTab = " + isPrimaryTab);
  if(isPrimaryTab)
  {
    refresh_interval = localStorage.getItem(INFOOVEN_PRIMARY_REFRESH_INTERVAL) || 10.0;
  }
  else
  {
    refresh_interval = localStorage.getItem(INFOOVEN_SECONDARY_REFRESH_INTERVAL) || 10.0;
  }
  //console.log("inside getRefreshInterval and refresh_interval = " + refresh_interval);
  
  // take the number of minutes and convert it to milliseconds to be used by the refresh timer
  return JSON.parse(refresh_interval) * 60000;
}

function getWindowType() {

  var window_type = localStorage.getItem(INFOOVEN_WINDOW_TYPE);
  return window_type;
}

function getAutoStart() {

  var auto_start = localStorage.getItem(INFOOVEN_AUTO_START) || true;

  return JSON.parse(auto_start);
}


function startMeUp() {

  chrome.extension.getBackgroundPage().console.log('inside startMeUp()');

  chrome.windows.getAll({populate: true}, function(allWindows)
  {
      allWindows.forEach(function(window){
          chrome.extension.getBackgroundPage().console.log('inside startMeUp() - window.id = ' + window.id);
          chrome.tabs.query({"windowId": window.id, "active": true}, function(tabArr) {
            chrome.extension.getBackgroundPage().console.log('inside startMeUp() - inside query result for tabs for window.id =  ' + window.id);

            var tabLength  = tabArr.length;
            var tabId = tabArr.id;

            chrome.extension.getBackgroundPage().console.log('inside startMeUp() - tabLength =  ' + tabLength + " and tabId = " + tabId);
              
            if(tabArr.length == 1)
            {
              var tab = tabArr[0];
              chrome.extension.getBackgroundPage().console.log('inside startMeUp() - tabLength =  ' + tabLength + " and tabId = " + tab.id + " and tabIndex = " +tab.index);
              if(tab.index < getPrimaryCount())
              {
                console.log("startingAlarm - using primary interval");
                startAlarms(window.id, getPrimaryInterval());                
              }
              else
              {
                console.log("startingAlarm - using secondary interval");
                  startAlarms(window.id, getSecondaryInterval());
              }
            }
            
          });
      });

  });

  chrome.alarms.onAlarm.addListener(loadNextTab);

  // get the open tab for each open window and store it
  saveCurrentTabIds();

}

function tearMeDown() {
  
  //Clears existing alarm
  clearAlarms();

  // clear our hash of refresh times
  m_refreshTabHash = new Object();
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
  var running = localStorage.getItem(INFOOVEN_RUNNING);

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

  localStorage.setItem(INFOOVEN_RUNNING, !running);
}

function loadNextTab(alarm) {
    
      chrome.extension.getBackgroundPage().console.log('trigger occurred, switching to the next tab - alarm id = ' + alarm.name);


      var winId = parseInt(alarm.name);
      chrome.windows.get(winId, {populate: true}, function (window)
      {
          chrome.extension.getBackgroundPage().console.log('FOUND WINDOW FOR ALARM ' + window.id);  

          var runWindowType = getWindowType();

          console.log("inside loadNextTab and runWindowType = " + runWindowType + " and window.focused = " + window.focused);

          if((runWindowType == INFOOVEN_WINDOW_TYPE_FOCUSED && !window.focused) || (runWindowType == INFOOVEN_WINDOW_TYPE_BACKGROUND && window.focused))
          {
            console.log("InfoOven option set to run for only " + runWindowType + " windows, therefore not loading next tab for this window");
            return;
          }

          var numTabs = window.tabs.length;
          var tabId = chrome.tabs.TAB_ID_NONE;
          var currentTabId = getCurrentSelectedTab(window.id);
          
          // if the currentTabId is not set, go about finding the active window
          if(currentTabId == -1)
          {
            console.log("querying for active tabs cause currentTabId = -1");
            chrome.tabs.query({"windowId": window.id, "active": true}, function(tabArr) {
              // should only have 1 active tab
              if(tabArr.length == 1)
              {
                var tab = tabArr[0];
                tabId = tab.id;
                changeTab(window.id, tabId, tab.index, tab.url);
              }
            });

            // validate tabId is set
            if(tabId == -1 && window.tabs.length >0)
            {
              var tab = tabArr[0];
              tabId = tab.id;
              changeTab(window.id, tabId, tab.index, tab.url);
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

            // get the tab
            tab = window.tabs[next];
            // get the id for the tab we're about to switch to
            tabId = tab.id;

            // switch that tab kid!
            changeTab(window.id, tabId, next, tab.url);
      
          }        
      });
}

// global object to store when each tab last refreshed
// stores tabId as key and the time of the last refresh as the value
var m_refreshTabHash = new Object();

function changeTab(windowId, tabId, indexId, url) {
  
  //console.log("inside changeTab for window: " + windowId + " and tab: " + tabId + " and indexId = " + indexId);

  var isPrimaryTab = indexId < getPrimaryCount();

  if(tabId !== undefined)
  {

    var lastRefresh = m_refreshTabHash[tabId];

    var now_ms = Date.now();
    if(lastRefresh === undefined)
    {
      console.log("last refresh is NOT DEFINED | could setting to now: " + Date.now()); 
      m_refreshTabHash[tabId] = now_ms;
      chrome.tabs.update(tabId, {"selected": true});   
    }
    else
    {
      console.log("lastRefresh = " + lastRefresh);
      var t = now_ms - lastRefresh;
      console.log("difference = " + t);
      console.log("Refresh Interval = " + getRefreshInterval(isPrimaryTab));



      if(now_ms - lastRefresh >= getRefreshInterval(isPrimaryTab))
      {
        console.log("REFRESH SELECTION AND URL: " + Date.now()); 
          // time for a refresh
          chrome.tabs.update(tabId, {"selected": true, "url": url});
          m_refreshTabHash[tabId] = now_ms;      
      }
      else
      {
        console.log("refresh selection only: " + Date.now()); 
          // just set the tab to be selected
          chrome.tabs.update(tabId, {"selected": true});   
      }
    }
    
    // write to storage our last open tabs
    setCurrentSelectedTab(windowId, tabId);

    console.log("changeTab - indexId = " +indexId);
    if(indexId !== undefined)
    {

      clearAlarm(windowId);
      if(indexId < getPrimaryCount())
      {
        console.log("changeTab - using primary interval");
        // update to long timer
        startAlarms(windowId, getPrimaryInterval());

      }
      else
      {
        console.log("changeTab - using secondary interval");
        // update to short timer
        startAlarms(windowId, getSecondaryInterval());
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
  var searchCriteria = "infooven_window"+windowId+"CurrentTabId";
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
  localStorage.setItem("infooven_window"+windowId+"CurrentTabId", tabId);
}

// React when our special command is hit
chrome.commands.onCommand.addListener(function(command) {
  if (command == "toggle-infooven") {
    chrome.extension.getBackgroundPage().console.log('InfoOven command received.');

    // get up and get going
    flipStatus();
  }
});

// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.extension.getBackgroundPage().console.log('InfoOven icon clicked.');

  // get up and get going
  flipStatus();


});