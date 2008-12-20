var myExt_urlBarListener = {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onLocationChange: function(aProgress, aRequest, aURI)
  {
    smartdiggbutton.processNewURL(aURI);
  },

  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function() {},
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
};

function makeRequest(url, parameters) {
	  http_request = false;
	  http_request = new XMLHttpRequest();
	  if (http_request.overrideMimeType) {
		  http_request.overrideMimeType('text/xml');
		  }
	  if (!http_request) {
		  alert('Cannot create XMLHTTP instance');
		  return false;
		  }
	  http_request.onreadystatechange = alertContents;
	  http_request.open('GET', url + parameters, true);
	  http_request.send(null);
	  return true;
};

function alertContents() {
   if (http_request.readyState == 4) {
      if (http_request.status == 200) {
		 if (smartdiggbutton.sdbTimeout != null)
		 {
			 clearTimeout(smartdiggbutton.sdbTimeout);
			 smartdiggbutton.sdbTimeout = null;
		 }
         var xmlobject = http_request.responseXML;
         var stories = xmlobject.getElementsByTagName('stories')[0];
		 var count = stories.getAttribute('count');
		 if (count > 0)
		 {
			 var story = stories.getElementsByTagName("story")[0];
			 var diggs = story.getAttribute("diggs");
			 var url = story.getAttribute("href");

			 document.getElementById('smartdiggbutton-toolbar-button').width = 75;
			 document.getElementById('smartdiggbutton-toolbar-button').label = diggs + " Diggs";
			 smartdiggbutton.buttonURL = url;
		 }
		 else
		 {
			 document.getElementById('smartdiggbutton-toolbar-button').width = 75;
			 document.getElementById('smartdiggbutton-toolbar-button').label = "Digg This";
			 smartdiggbutton.buttonURL = "http://digg.com/submit?url=" + escape(smartdiggbutton.oldURL) + "&title=" + escape(document.title);
		 }
      } else {
		 if (smartdiggbutton.sdbTimeout != null)
		 {
			 clearTimeout(smartdiggbutton.sdbTimeout);
			 smartdiggbutton.sdbTimeout = null;
		 }
		 document.getElementById('smartdiggbutton-toolbar-button').width = 0;
		 document.getElementById('smartdiggbutton-toolbar-button').label = "";
		 smartdiggbutton.buttonURL = null;
      }
   }
};

function getDiggProps(url) {
	makeRequest('http://services.digg.com/stories?count=1&appkey=http%3A%2F%2Fneothoughts.com&link=' + escape(url), '');
	if (smartdiggbutton.sdbTimeout != null)
	{
		clearTimeout(smartdiggbutton.sdbTimeout);
		smartdiggbutton.sdbTimeout = null;
	}
	smartdiggbutton.sdbTimeout = self.setTimeout('getDiggProps()', 60000);
};

var smartdiggbutton = {
  oldURL: null,
  buttonURL: null,
  sdbTimeout: null,

  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("smartdiggbutton-strings");
    gBrowser.addProgressListener(myExt_urlBarListener,
        Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },
  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    //smartdiggbutton.onMenuItemCommand(e);

	if (this.buttonURL != null)
	{
		content.document.location.href = this.buttonURL;
	}
  },
  uninit: function() {
    gBrowser.removeProgressListener(myExt_urlBarListener);
  },
  processNewURL: function(aURI) {
    if (aURI.spec == this.oldURL)
      return;

   	if (aURI.spec.search("http") == 0)
	{
	    this.oldURL = aURI.spec;
		document.getElementById('smartdiggbutton-toolbar-button').width = 75;
		document.getElementById('smartdiggbutton-toolbar-button').label = "Checking...";
		getDiggProps(this.oldURL);
	}
	else
	{
		document.getElementById('smartdiggbutton-toolbar-button').width = 0;
		document.getElementById('smartdiggbutton-toolbar-button').label = "";
		this.buttonURL = null;
		this.oldURL = null;
	}
  }
};
window.addEventListener("load", function(e) { smartdiggbutton.onLoad(e); }, false);
window.addEventListener("unload", function() { smartdiggbutton.uninit(); }, false);