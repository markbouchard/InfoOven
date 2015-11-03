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


/*
    chrome.extension.getBackgroundPage().console.log('starting the extension');
    count = 0;
    windowId = null; //undefined # window in which TabCarousel was started
  
    var ms = 1000;

    chrome.windows.getCurrent (w) =>
      windowId = w.id
  
    //chrome.browserAction.setIcon(path: 'images/icon_32_exp_1.75_stop_emblem.png')
    //chrome.browserAction.setTitle(title: 'Stop Carousel')
  
    continuation = () =>
      @select(windowId, count)
      count += 1
      @lastTimeout = setTimeout(continuation, ms)
  
    continuation()
    */
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
      //alert("hello");
      chrome.extension.getBackgroundPage().console.log('trigger occurred, switching to the next tab');
}

// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
  //alert("hello world");

  chrome.extension.getBackgroundPage().console.log('clicked on the infooven icon');

  // user clicked us, update our status based on 
  flipStatus();


  
  /*
  var viewTabUrl = chrome.extension.getURL('image.html');
  var imageUrl = "https://lh3.googleusercontent.com/-aD8wHAKhgP0/UDevt-IGWjI/AAAAAAAAA6g/9Sw3qQVTYfM/s426/Mark%2BBouchard%2B-%2BSmall.JPG";

  // Look through all the pages in this extension to find one we can use.
  var views = chrome.extension.getViews();
  for (var i = 0; i < views.length; i++) {
    var view = views[i];

    // If this view has the right URL and hasn't been used yet...
    if (view.location.href == viewTabUrl && !view.imageAlreadySet) {

      // ...call one of its functions and set a property.
      view.setImageUrl(imageUrl);
      view.imageAlreadySet = true;
      break; // we're done
    }
  }
  */


});