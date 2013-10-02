// quickIO.js - quickIO's module
// author: jongo45
/*
https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIFilePicker
https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIFile

*/



var {Cc,Ci,Cu}=require("chrome");

//var timers=require("timers");


function FilePick(){
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
       
    var mrWindow = wm.getMostRecentWindow("navigator:browser");
	
	var nsIFilePicker = Ci.nsIFilePicker;
    
    this.quick=null;

	this.open=function(callback){
        callback=callback||function(){};
		var filepick = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

		var dialogTitle=this.quick.dialogOpenTitle||"Open File";
		filepick.init(mrWindow,dialogTitle,nsIFilePicker.modeOpen);
		setFilters(this.quick,filepick);
		
		var rv = filepick.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			var file = filepick.file;
			// Get the path as string. Note that you usually won't 
			// need to work with the string paths.
			var path = filepick.file.path;	//string
			callback(file, path);
		}
		else{
			callback();
		}
	};
	
	this.save=function(callback){
        callback=callback||function(){};
		var filepick = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		var dialogTitle=this.quick.dialogSaveTitle||"Save File";
		filepick.init(mrWindow, dialogTitle, nsIFilePicker.modeSave);
		setFilters(this.quick,filepick);
		filepick.defaultString=this.quick.defaultSaveFilename;
		filepick.defaultExtension=this.quick.defaultSaveExtension;
		//filepick.appendFilter("txt","*.txt");
		//filepick.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		//filepick.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
		//filepick.defaultString="prettyprint_test_output.json.txt";
		//filepick.defaultExtension="txt";

		var rv = filepick.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			var file = filepick.file;
			// Get the path as string. Note that you usually won't 
			// need to work with the string paths.
			var path = filepick.file.path;	//string
    		callback(file, path);
		}
		else{
			callback();
		}
	};
	
	function setFilters(quick,fp){
        if(quick && fp){
    		var filter=0;
    
    		[
    			"filterAll",
    			"filterHTML",
    			"filterText",
    			"filterImages",
    			"filterXML",
    			"filterXUL",
    			"filterApps",
    			"filterAllowURLs",
    			"filterAudio",
    			"filterVideo"
    		].forEach(function(k){
    			// just like windows flags... you OR them together into one composite flag and pass to .appendFilters() method
    			filter |= quick[k] ? nsIFilePicker[k] : 0;
                
                //debug
                //console.log(filter.toString());
    		});
    		fp.appendFilters(filter);
    		
    		quick.filterExtra.forEach(function(e){
    			// filterExtra is array of arrays.  or array[] of array[2] to be precise.
    			// here, e would look something like ["text","*.txt"] resulting in the following call to .appendFilter()
    			//fp.appendFilter("text","*.txt");
    			if(e && e.length==2){
    				fp.appendFilter(e[0],e[1]);
    			}
    		});
            if(quick.addToRecentDocs)fp.addToRecentDocs=quick.addToRecentDocs;
            if(quick.filterIndex)fp.filterIndex=quick.filterIndex;
        }
	}
	
}

function quickIO(){
	//var async=new AsyncFileOperations();
	var filepicker=new FilePick();

	var qIO={
		filterAll: true,
		filterHTML: false,
		filterText: false,
		filterImages: false,
		filterXML: false,
		filterXUL: false,
		filterApps: false,
		filterAllowURLs: false,
		filterAudio: false,
		filterVideo: false,
		filterExtra: [],
        filterIndex:0,   
        
		dialogOpenTitle:"Open File",
		dialogSaveTitle:"Save File",
		defaultSaveFilename:"sample_filename.txt",
		defaultSaveExtension:"txt",
        
        addToRecentDocs:false,
    
		open: function(callback){
            //callback parameters:  callback( file.path, file.leafName);
			filepicker.open(callback);
		},
        
		save: function(data,callback){
            //callback parameters:  callback( file.path, file.leafName);
			filepicker.save(callback);
		},
	};
    filepicker.quick=qIO;
	return qIO;
	

}



exports.quickIO=quickIO;





