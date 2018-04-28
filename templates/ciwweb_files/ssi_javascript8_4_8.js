/*
SSI Web - Web Surveying System
Copyright Sawtooth Software, Inc. All rights reserved.
Orem, UT  USA  801-477-4700 
*/

var GlobalGraphicalSelect = false;
var blnSubmitClicked = false;
var GlobalTimeOutEvents = [];

function SSI_SubmitMe()
{
	if(document.mainform.hid_previous.value == 1 || SSI_Verify() == true)
	{
		if(!blnSubmitClicked)
		{
			SSI_ClearHiddenContainerData();
			window.document.mainform.hid_javascript.value = 1;

			document.mainform.submit();
			blnSubmitClicked = true;
			SSI_SubmitProgressBar();
		}
	}
}

//This is especially important for Firefox
jQuery(window).unload(function() 
{
	SSI_RemoveProgressBar();
});

//This is for ios 5.  Regular browser back does not reload the JavaScript
if (window.addEventListener && typeof window.addEventListener) 
{
	window.addEventListener("pagehide", function () 
	{
		SSI_RemoveProgressBar();
	});
}

function SSI_SubmitProgressBar()
{
	GlobalTimeOutEvents[0] = window.setTimeout(function() 
	{
		if(blnSubmitClicked)
		{
			blnSubmitClicked = false;
			
			$("#submit_overlay").show();
		}
	}, 2000); 

	//After 10 seconds submit again
	GlobalTimeOutEvents[1] = window.setTimeout(function() 
	{
		if(!TestLocalHost())
		{
			document.mainform.submit();
		}
	}, 10000);

	//After 20 seconds remove progress bar.
	GlobalTimeOutEvents[2] = window.setTimeout(function() 
	{
		if(!TestLocalHost())
		{
			document.mainform.submit();
		}

		SSI_RemoveProgressBar();
	}, 20000); 
}

function SSI_RemoveProgressBar()
{
	blnSubmitClicked = false;
	$("#submit_overlay").hide();

	//Remove timer events.
	window.clearTimeout(GlobalTimeOutEvents[0]);
	window.clearTimeout(GlobalTimeOutEvents[1]);
	window.clearTimeout(GlobalTimeOutEvents[2]);
}

//This mainly helps debugging.  Don't need to multi submit on localhost.
function TestLocalHost()
{
	var local = false;
	var url = document.URL;
	var string_index = url.indexOf("localhost");
	var ip_index = url.indexOf("127.0.0.1");

	//If https://localhost or http://localhost
	if(string_index == 7 || string_index == 8)
	{
		local = true;
	}
	else if (ip_index == 7)
	{
		local = true;
	}


	return local;
}

function SSI_PageInitialize()
{
	blnSubmitClicked = false;

	//If inner table is bigger than question adjust question width
	jQuery(".question").each(function(){

		var QuestionObj = jQuery(this);
		var intQuestionWidth = parseInt(QuestionObj.css("width"));
		var InnerTableObj = jQuery(this).find(".inner_table");

		if(InnerTableObj.length)
		{
			var intInnerTableWidth = parseInt(InnerTableObj.css("width"));

			if (intInnerTableWidth > intQuestionWidth)
			{
				QuestionObj.css("width", intInnerTableWidth + 10);
			}
		}
	});

	jQuery(".other_specify_table").each(function(){
		jQuery(this).closest("tr").addClass("other_specify_row");
	});

	SSI_BYOAltColors();

	//Test mode events
	$("#test_options_link, #close_test_options_link").on("click", function(event)
	{
		event.preventDefault();
		event.stopPropagation();
        $("#test_options_box").toggle("slide", { direction: "up" }, 500);
	});

	$("#test_options_box").on("click", function(event)
	{
		event.stopPropagation();
	});

	$("#test_skip_question").on("change", function()
	{
		var skip_to_input = $("#test_skip_to")[0];

		if($(this).val() != "")
		{
			skip_to_input.checked = true;
		}
		else
		{
			skip_to_input.checked = false;
		}

		TogglePageSubmitMsg();
	});

	$("#test_question_names").on("click", function()
	{
		if(this.checked)
		{
			$(".test_question_label").show();
		}
		else
		{
			$(".test_question_label").hide();
		}
	});

	$("#test_var_names").on("click", function()
	{
		if(this.checked)
		{
			$(".test_var_label").show();
		}
		else
		{
			$(".test_var_label").hide();
		}
	});

	$("#test_skip_to, #test_remove_skip_logic, #test_remove_randomization, #test_remove_terminate, #test_use_respnum").on("change", function()
	{
		TogglePageSubmitMsg();
	});

	$("html").on("click", function ()
    {
        $("#test_options_box").hide();
    });
}

function TogglePageSubmitMsg()
{
	if($("#test_skip_to")[0].checked 
		|| $("#test_remove_skip_logic")[0].checked 
		|| $("#test_remove_randomization")[0].checked 
		|| $("#test_remove_terminate")[0].checked)
	{
		$("#page_submit_msg").show();
	}
	else
	{
		$("#page_submit_msg").hide();
	}
}

function SSI_ClickableInitialize(blnHighlight)
{
	SSI_InitializeClickableAreas(blnHighlight);
	
	if (GlobalGraphicalSelect)
	{
		SSI_InitializeGraphicalSelectButtons();
		SetTabIndex();
	}
}

// Code to make cells clickable
function SSI_InitializeClickableAreas(blnHighlight)
{
	// Remove the default behavior of label tags, which is to select the input when the label is selected.  
	// This behavior together with the stuff below confuses the code.
	jQuery(".clickable label").each(function(){
		jQuery(this).bind({
			"click": function(event){event.preventDefault();},
			"keyup": function(event){event.preventDefault();}
		});
	});

	jQuery(".clickable input[type=text], .clickable textarea").each(function(){
		
		var InputObj = this;

		InputObj.hasfocus = false;

		jQuery(InputObj).bind({
			"focus": function(){this.hasfocus = true;},
			"blur": function(){this.hasfocus = false;}
		});
	});

	jQuery(".clickable input").each(function(){

		var InputObj = this;

		if(InputObj.type != "hidden" && InputObj.type != "text")
		{
			InputObj.isCheckedVar = InputObj.checked;

			ClickableObj = jQuery(InputObj).closest(".clickable");

			if (GlobalGraphicalSelect)
			{
				//This prevents the link from being followed and the page shifting to the top on a mouse click.
				ClickableObj.bind({
					"click": function(event){event.preventDefault();}
				});
			}

			ClickableObj.bind({
				"keydown": SSI_ClickableTyping,
				"click": SSI_ToggleSelect,
				"keyup": SSI_ToggleSelect
			});

			ClickableObj.bind("mouseover", {blnHighlightParam: blnHighlight}, function(event){
				if(event.data.blnHighlightParam)
				{
					jQuery(this).addClass("highlight");
				}
			});

			ClickableObj.bind("mouseout", {blnHighlightParam: blnHighlight}, function(event){
				if(event.data.blnHighlightParam)
				{
					jQuery(this).removeClass("highlight");
				}
			});

			jQuery(InputObj).bind("focus", {ClickableObjParam: ClickableObj}, function(event){
				event.data.ClickableObjParam.trigger("mouseover");
			});

			jQuery(InputObj).bind("blur", {ClickableObjParam: ClickableObj}, function(event){
				event.data.ClickableObjParam.trigger("mouseout");
			});
		}
	});
}

function SSI_GraphicalSubmitInitialize()
{
	var NextButtonObj = jQuery("#next_button");

	if (NextButtonObj.length)
	{
		if (NextButtonObj[0].target != "newwindow")
		{
			NextButtonObj.bind({
				"click": SSI_GraphicalNextSubmit,
				"keyup": function(event){if(event.keyCode == 32 || event.keyCode == 13){SSI_GraphicalNextSubmit();}} //Space or Enter pushed
			});
		}
	}

	var PreviousButtonObj = jQuery("#previous_button");

	if (PreviousButtonObj.length)
	{
		PreviousButtonObj.bind({
			"click": SSI_GraphicalPreviousSubmit,
			"keyup": function(event){if(event.keyCode == 32 || event.keyCode == 13){SSI_GraphicalPreviousSubmit();}} //Space or Enter pushed
		});
	}
}

function SSI_InitializeGraphicalSelectButtons()
{
	var inputFields = jQuery(".input_cell");

	jQuery(".input_cell input").each(function(){

		var InputItemObj = jQuery(this);

		var strInputType = InputItemObj.attr("type");

		if((strInputType == "checkbox") || (strInputType == "radio"))
		{
			//Make it so that when the graphic gets focus the clickable area is highlighted.
			var ClickableObj = InputItemObj.closest(".clickable");

			var GraphicalInputObj = jQuery("#" + InputItemObj.attr("id") + "_graphical");

			//This needs to be in here so that it can run when the browser back button is clicked.
			if (GraphicalInputObj.length)
			{
				if (InputItemObj.attr("checked"))
				{
					if(strInputType == "checkbox")
					{
						GraphicalInputObj.removeClass("checkbox"); 
						GraphicalInputObj.addClass("checkboxselected");
					}
					else if(strInputType == "radio")
					{
						GraphicalInputObj.removeClass("radiobox"); 
						GraphicalInputObj.addClass("radioboxselected");
					}
				}
				else
				{
					if(strInputType == "checkbox")
					{
						GraphicalInputObj.removeClass("checkboxselected"); 
						GraphicalInputObj.addClass("checkbox");
					}
					else if(strInputType == "radio")
					{
						GraphicalInputObj.removeClass("radioboxselected"); 
						GraphicalInputObj.addClass("radiobox");
					}
				}

				GraphicalInputObj.bind("focus", {ClickableObjParam: ClickableObj}, function(event){
					event.data.ClickableObjParam.trigger("mouseover");
				});

				GraphicalInputObj.bind("blur", {ClickableObjParam: ClickableObj}, function(event){
					event.data.ClickableObjParam.trigger("mouseout");
				});
			}
		}
	});

	//Preload select "on" images
	jQuery(".radiobox").each(function(){
		PreloadSelectedImage(jQuery(this), "radioboxselected");
		return false;
	});

	jQuery(".checkbox").each(function(){
		PreloadSelectedImage(jQuery(this), "checkboxselected");
		return false;
	});

	jQuery(".cbc_best_row .radiobox").each(function(){
		PreloadSelectedImage(jQuery(this), "radioboxselected");
		return false;
	});

	jQuery(".cbc_worst_row .radiobox").each(function(){
		PreloadSelectedImage(jQuery(this), "radioboxselected");
		return false;
	});
}

function PreloadSelectedImage(SelObj, strSelecteName)
{
	var Clone = SelObj.clone();
	Clone.hide();
	Clone.removeAttr("id");
	Clone.addClass(strSelecteName);
	SelObj.after(Clone);
	Clone.remove();
}

function SSI_GraphicalNextSubmit()
{
	document.mainform.hid_previous.value = 0;
	SSI_SubmitMe(); 
	return false;
}

function SSI_GraphicalPreviousSubmit()
{
	document.mainform.hid_previous.value = 1;
	SSI_SubmitMe(); 
	return false;
}

//Prevents page from shifting down on spacebar press.	
function SSI_ClickableTyping(event)
{
	// If they have focus on the other specify box, then don't toggle select
	var OtherTextBox = jQuery(this).find("input[type=text]");
	
	if(OtherTextBox.length == 0)
	{
		OtherTextBox = jQuery(this).find("textarea");
	}

	if (OtherTextBox.length)
	{
		// Allow spaces to be typed in the other specify.
		if (OtherTextBox[0].hasfocus)
		{
			return true;
		}
	}

	//Space was pushed (Prevents page from shifting down on spacebar press for graphical select buttons)
	if(jQuery(this).find(".graphical_select").length && event.keyCode == 32)
	{
		return false;
	} 	
}


function SSI_ToggleSelect(event)
{
	var intKeyCode = 0;

	if (event.rightClick)
	{
		return false;
	}

	if(event.keyCode)
	{
		intKeyCode = event.keyCode; 
	}
	
	// If they have focus on the other specify box, then don't toggle select
	var OtherTextBox = jQuery(this).find("input[type=text]");

	if(OtherTextBox.length == 0)
	{
		OtherTextBox = jQuery(this).find("textarea");
	}

	if (OtherTextBox.length)
	{
		if (OtherTextBox[0].hasfocus)
		{
			return;
		}
	}

	//No key pressed or space bar pressed
	if(intKeyCode == 0 || intKeyCode == 32)
	{
		var InputObj = jQuery(this).find("input")[0];

		var GraphicalObj = jQuery("#" + InputObj.id + "_graphical");

		if (GraphicalObj.length || intKeyCode == 0)
		{
			if (InputObj.type == "checkbox")
			{
				if (InputObj.isCheckedVar)
				{
					InputObj.isCheckedVar = false;
				}
				else
				{
					InputObj.isCheckedVar = true;
				}

				InputObj.checked = InputObj.isCheckedVar;

				if (GraphicalObj.length)
				{
					SSI_SelectGraphicalCheckbox(GraphicalObj, InputObj, InputObj.checked);
				}
				else
				{
					InputObj.focus();
				}
			}
			else if (InputObj.type == "radio")
			{
				//Set to false all radio buttons
				jQuery("[name='" + InputObj.name + "']").each(function()
				{
					this.isCheckedVar = false;
				});

				InputObj.isCheckedVar = true;
				InputObj.checked = true;

				if (GraphicalObj.length)
				{
					SSI_SelectGraphicalRadiobox(GraphicalObj, InputObj, true);
				}
				else
				{
					InputObj.focus();
				}
			}
		}

		var ClickableObj = jQuery(InputObj).closest(".clickable");

		// These have to be here to control event order.  These need to be fired after the item is selected.
		ClickableObj.trigger("none_event");
		ClickableObj.trigger("byo_click");
	}
	//Clicked "Enter"
	else if (GlobalGraphicalSelect && intKeyCode == 13)
	{
		SSI_SubmitMe();
	}

	if (GlobalGraphicalSelect)
	{
		return false; // This is so that graphical select buttons do not follow link.
	}
}

function SSI_SetSelect(strInputName, blnSelect)
{
	var InputObj = jQuery("#" + strInputName)[0];

	InputObj.isCheckedVar = blnSelect;
	InputObj.checked = blnSelect;

	var strInputType = InputObj.type;

	if (strInputType == "checkbox")
	{
		var GraphicalCheckboxObj = jQuery("#" + InputObj.id + "_graphical");

		if (GraphicalCheckboxObj.length)
		{
			SSI_SelectGraphicalCheckbox(GraphicalCheckboxObj, InputObj, blnSelect);
		}
	}
	else if (strInputType == "radio")
	{
		var GraphicalRadioObj = jQuery("#" + InputObj.id + "_graphical");

		if (GraphicalRadioObj.length)
		{
			SSI_SelectGraphicalRadiobox(GraphicalRadioObj, InputObj, blnSelect);
		}
	}
}

function SSI_SelectGraphicalCheckbox(GraphicalCheckboxObj, InputObj, blnCheck)
{		
	var ActualCheckboxObj = InputObj;

	if(blnCheck)
	{
		ActualCheckboxObj.checked = true;
		GraphicalCheckboxObj.removeClass("checkbox"); 
		GraphicalCheckboxObj.addClass("checkboxselected");
	}
	else
	{
		ActualCheckboxObj.checked = false;
		GraphicalCheckboxObj.removeClass("checkboxselected"); 
		GraphicalCheckboxObj.addClass("checkbox");
	}

	SSI_CustomGraphicalCheckbox(GraphicalCheckboxObj, ActualCheckboxObj, blnCheck);
}

function SSI_CustomGraphicalCheckbox(GraphicalCheckboxObj, ActualCheckboxObj, blnCheck)
{
	//Empty function.  Redefine this function in custom code.
}

function SSI_SelectGraphicalRadiobox(GraphicalRadioboxObj, InputObj, blnSelect)
{
	var strActualRadioboxName = InputObj.name;

	if(blnSelect)
	{
		//Uncheck all radio buttons
		jQuery("input").each(function(){
			if(this.name == strActualRadioboxName)
			{
				this.checked = false;

				var UnCheckedRadioboxObj = jQuery("#" + this.id + "_graphical");

				if (UnCheckedRadioboxObj.length)
				{
					UnCheckedRadioboxObj.removeClass("radioboxselected"); 
					UnCheckedRadioboxObj.addClass("radiobox");
				}
			}
		});

		//Select the one
		InputObj.checked = true;
		GraphicalRadioboxObj.removeClass("radiobox"); 
		GraphicalRadioboxObj.addClass("radioboxselected");

		SSI_CustomGraphicalRadiobox(GraphicalRadioboxObj, InputObj);
	}
	else
	{
		InputObj.checked = false;

		var UnCheckedRadioboxObj = jQuery("#" + InputObj.id + "_graphical");

		if (UnCheckedRadioboxObj.length)
		{
			UnCheckedRadioboxObj.removeClass("radioboxselected"); 
			UnCheckedRadioboxObj.addClass("radiobox");
		}
	}
}

function SSI_CustomGraphicalRadiobox(GraphicalRadioboxObj, InputObj)
{
	//Empty function.  Redefine this function in custom code.
}

function SSI_RadioReset(strRadioName)
{
	//Uncheck all radio buttons
	jQuery("input").each(function(){
		if(this.name == strRadioName)
		{
			this.checked = false;

			var UnCheckedRadioboxObj = jQuery("#" + this.id + "_graphical");

			if (UnCheckedRadioboxObj.length)
			{
				UnCheckedRadioboxObj.removeClass("radioboxselected"); 
				UnCheckedRadioboxObj.addClass("radiobox");
			}
		}
	});
}

//Set up onclick events for all checkboxes
function SSI_List_EventSetup(strQName, ItemIndexArray, NoneItemArray)
{
	var i = 0;
	var strInputName = "";
	var InputObj = "";
				
	for(i = 0; i < ItemIndexArray.length; i++)
	{
		strInputName = strQName;
		strInputName = strInputName.replace(/\*/, ItemIndexArray[i]);

		//Setup Events for each select item ($ for jQuery to build correct object for additional functionality IE)
		InputObj = jQuery(document.mainform[strInputName]);

		var ClickableObj = InputObj.closest(".clickable");

		if (ClickableObj.length)
		{
			ClickableObj.bind("none_event", {strQNameParam: strQName, ItemIndexArrayParam: ItemIndexArray, CurrentItemParam: ItemIndexArray[i], NoneItemArrayParam: NoneItemArray}, function(event){
				SSI_ListItemEvents(event.data.strQNameParam, event.data.ItemIndexArrayParam, event.data.CurrentItemParam, event.data.NoneItemArrayParam);
			});
		}

		var OtherInputBox = jQuery(document.mainform[strInputName + "_other"]);

		if (OtherInputBox.length)
		{
			OtherInputBox.bind("keyup", {strQNameParam: strQName, ItemIndexArrayParam: ItemIndexArray, CurrentItemParam: ItemIndexArray[i], NoneItemArrayParam: NoneItemArray}, function(event){
				SSI_SelectWhenType(event.data.strQNameParam, event.data.ItemIndexArrayParam, event.data.CurrentItemParam, event.data.NoneItemArrayParam);
			});
		}
	}
}

//Main function to check and uncheck
function SSI_ListItemEvents(strQName, ItemIndexArray, intCurrentItem, NoneItemArray)
{
	var strInputName = ""; 
	var i = 0;	
	var intExclusiveSelectedIndex = -1;
	strInputName = strQName;
	strInputName = strInputName.replace(/\*/, intCurrentItem);
	var SelectedItemObj = document.mainform[strInputName];
	var intItemIndex = 0;

	if(SelectedItemObj.checked)
	{
		//If there is an other specify box move the cursor to it (place focus on it)
		var OtherObj = document.mainform[strInputName + "_other"];
		if(OtherObj != null)
		{
			if(OtherObj.type != "hidden")
			{
				OtherObj.focus();
			}
		}

		//Find out if exclusive item has been checked
		for(i = 0; i < NoneItemArray.length; i++)
		{
			if(intCurrentItem == NoneItemArray[i])
			{
				intExclusiveSelectedIndex = NoneItemArray[i];
			}
		}

		if (SelectedItemObj.type == "radio")
		{
			intExclusiveSelectedIndex = SelectedItemObj.value;
		}

		//If the exclusive item has been checked uncheck everything else
		if(intExclusiveSelectedIndex > -1)
		{
			for(i = 0; i < ItemIndexArray.length; i++)
			{
				if(intExclusiveSelectedIndex != ItemIndexArray[i])
				{
					intItemIndex = ItemIndexArray[i];

					strInputName = strQName;
					strInputName = strInputName.replace(/\*/, intItemIndex);

					if (SelectedItemObj.type == "checkbox")
					{
						SSI_SetSelect(strInputName, false);
					}
				
					//Clear out other specify box
					SSI_RemoveOtherText(strInputName);
				}
			}
		}
		//Otherwise uncheck all exclusives
		else
		{
			for(i = 0; i < NoneItemArray.length; i++)
			{
				intItemIndex = NoneItemArray[i];

				strInputName = strQName;
				strInputName = strInputName.replace(/\*/, intItemIndex);

				if (SelectedItemObj.type == "checkbox")
				{
					SSI_SetSelect(strInputName, false);
				}
				
				//Clear out other specify box
				SSI_RemoveOtherText(strInputName);
			}
		}
	}
	else
	{
		//This handles the case where they uncheck the other checkbox and it clears out the text box.
		SSI_RemoveOtherText(strInputName);
	}
}

//If there are others (and are not hidden) clear out other specify box
function SSI_RemoveOtherText(strInputName)
{
	var OtherObj = document.mainform[strInputName + "_other"];
	if(OtherObj != null)
	{
		if(OtherObj.type != "hidden")
		{
			OtherObj.value = "";
		}
	}
}

function SSI_SelectWhenType(strQName, ItemIndexArray, intCurrentItem, NoneItemArray)
{
	var strInputName = strQName;
	strInputName = strInputName.replace(/\*/, intCurrentItem);
	var SelectedItemObj = document.mainform[strInputName];

	var OtherInputBox = document.mainform[strInputName + "_other"];

	if (OtherInputBox.value != "")
	{
		SSI_SetSelect(strInputName, true);

		SSI_ListItemEvents(strQName, ItemIndexArray, intCurrentItem, NoneItemArray);
	}
}

function SetTabIndex()
{
	var AllItemsTabbed = jQuery("body *");

	AllItemsTabbed.each(function(index, ItemObj){
		
		ItemObj = jQuery(ItemObj);

		//Make sure tagName function exists.  There was trouble with IE 8 and the <embed> tag.
		if (ItemObj[0].tagName)
		{
			var strTagName = ItemObj[0].tagName.toLowerCase();

			if (ItemObj.attr("type") != "hidden" && !ItemObj.hasClass("HideElement") && ItemObj.attr("id") != "invisible_submit")
			{
				if(ItemObj.hasClass("graphical_select") || strTagName == "a" || strTagName == "input" || strTagName == "select" || strTagName == "textarea")
				{		
					ItemObj[0].tabIndex = index;
				}
			}
		}
	});
}

function SSIHash()
{
	this.HashArray = {}; //This is needed to make code work in conjunction with prototype js lib.

	this.set = function(strKey, strValue)
	{
		strKey = this.encodeKey(strKey);
		this.HashArray[strKey] = strValue;
	};

	this.get = function(strKey)
	{
		strKey = this.encodeKey(strKey);

		return this.HashArray[strKey];
	};

	this.has = function(strKey)
	{
		strKey = this.encodeKey(strKey);

		if (this.HashArray[strKey])
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	this.getKeys = function()
	{
		var KeyArray = [];
		var HashObj = this;

		jQuery.each(this.HashArray, function(strKey, strValue){

			strKey = HashObj.decodeKey(strKey);

			KeyArray.push(strKey);
		});

		return KeyArray;
	};

	/*This is to allow certain keys like "constructor" to work*/
	this.encodeKey = function(strKey)
	{
		return "k_" + strKey;
	}

	this.decodeKey = function(strKey)
	{
		return strKey.substring(2);
	}
}

function SSI_InitializeErrors()
{
	GlobalQuestHash = new SSIHash();

	SSI_RemoveErrors();
}

function SSI_RemoveErrors()
{
	var QuestNamesArray = GlobalQuestHash.getKeys();
	var i = 0;
	var j = 0;
	var strQuestName = "";
	var VarsArray = [];
	var strErrName = "";
	var blnShowError = false;
	var InfoHash = 0;

	//Check for errors.  If none, do not change screen, just let it submit (makes the screen shift around).
	blnShowError = SSI_ErrorsExist();

	if (blnShowError)
	{
		for(i = 0; i < QuestNamesArray.length; i++)
		{ 
			strQuestName = QuestNamesArray[i];

			//Remove error message at top of question
			strErrName = "#" + strQuestName + "_err";
			
			if (jQuery(strErrName))
			{
				jQuery(strErrName).remove();
			}
		}

		var ErrorClassesArray = ["error_quest_highlight", "error_var_highlight", "error_var_highlight_left", "error_var_highlight_center", "error_var_highlight_right", "error_var_highlight_top", "error_var_highlight_middle", "error_var_highlight_bottom"];

		for(i = 0; i < ErrorClassesArray.length; i++)
		{
			jQuery("." + ErrorClassesArray[i]).each(function(){
				jQuery(this).removeClass(ErrorClassesArray[i]);
				//Remove the inline styles
				jQuery(this).css("border-top-width", "");
				jQuery(this).css("border-right-width", "");
				jQuery(this).css("border-bottom-width", "");
				jQuery(this).css("border-left-width", "");
			});
		}

		//Remove error message at top of page
		jQuery("#error_box").removeClass("ShowElement");
		jQuery("#error_box").addClass("HideElement");
	}
}

function SSI_ShowErrors()
{
	var blnSubmit = true;
	var QuestNamesArray = GlobalQuestHash.getKeys();
	var i = 0;
	var j = 0;
	var k = 0;
	var strQuestName = "";
	var QuestErrorsArray = [];
	var VarsArray = [];
	var VarsHash = 0;
	var blnShowError = false;
	var InfoHash = 0;
	var strQuestErrorMsg = "";

	for(i = 0; i < QuestNamesArray.length; i++)
	{ 
		strQuestName = QuestNamesArray[i];

		InfoHash = GlobalQuestHash.get(strQuestName);

		if(InfoHash.has("messages"))
		{
			blnShowError = true;

			//Highlight question
			jQuery("#" + strQuestName + "_div").addClass("error_quest_highlight");

			MessageHash = InfoHash.get("messages");

			QuestErrorsArray = MessageHash.getKeys();
		
			strQuestErrorMsg = "";

			for (j = 0; j < QuestErrorsArray.length; j++)
			{
				strQuestErrorMsg += "<div class=\"question_errors\">" + QuestErrorsArray[j] + "</div>";
			}

			SSI_ShowQuestErrorMsg(strQuestName, strQuestErrorMsg);
		}

		if(InfoHash.has("vars"))
		{
			VarsHash = InfoHash.get("vars");
			VarsArray = VarsHash.getKeys();

			for (j = 0; j < VarsArray.length; j++)
			{
				if (VarsHash.get(VarsArray[j]) == 1)
				{
					SSI_ChangeErrorClass(strQuestName, VarsArray[j], true);
				}
			}
		}
	}
	
	if(blnShowError)
	{
		jQuery("#error_box").removeClass("HideElement");
		jQuery("#error_box").addClass("ShowElement");
		jQuery("#error_box").html(strGlobalError_page_error);

		window.scrollTo(0,0);

		blnSubmit = false;
	}
	
	return blnSubmit;
}

function SSI_ChangeErrorClass(strQuestName, strVarName, blnError)
{
	//This is for special cases where the var name will not work.  I.E. grid combo box.
	if (jQuery("#" + strVarName + "_error").length)
	{
		strVarName = strVarName + "_error";
	}

	var InputObj = jQuery("#" + strVarName);

	// If there is a single id to highlight
	if(InputObj.length)
	{
		if (blnError)
		{
			InputObj.addClass("error_var_highlight");
		}
		else
		{
			InputObj.removeClass("error_var_highlight");
		}		
	}
	// The part to highlight consists of multiple cells.
	else
	{
		var ClassItemsArray = jQuery("#" + strQuestName + "_div ." + strVarName);
		var intNewBorderWidth = 0;
		var blnRowBased = true;
		var strFirstClassName = "";
		var strAllClassName = "";
		var strLastClassName = "";
		var strRowIDName = strVarName + "_row";

		//If row based change the way that highlighting works.
		if (jQuery("#" + strRowIDName).length && jQuery("#" + strRowIDName).attr("id") == strRowIDName)
		{
			strFirstClassName = "error_var_highlight_left";
			strAllClassName = "error_var_highlight_center";
			strLastClassName = "error_var_highlight_right";
		}
		else
		{
			blnRowBased = false;
			strFirstClassName = "error_var_highlight_top";
			strAllClassName = "error_var_highlight_middle";
			strLastClassName = "error_var_highlight_bottom";
		}
		
		if (ClassItemsArray.length)
		{	
			if (blnRowBased)
			{
				intNewBorderWidth = CastToInt(jQuery(ClassItemsArray[0]).css('border-right-width'));

				if (intNewBorderWidth == 0)
				{
					intNewBorderWidth = CastToInt(jQuery(ClassItemsArray[0]).css('border-left-width'));
				}
			}
			else
			{
				intNewBorderWidth = CastToInt(jQuery(ClassItemsArray[0]).css('border-bottom-width'));
			}
			
			var strClasses = jQuery(ClassItemsArray[0]).attr("class");
				
			if(strClasses.search("error") < 0)
			{
				intNewBorderWidth++;
			}
		}

		var CellObj = 0;
		var i = 0;

		for (i = 0; i < ClassItemsArray.length; i++)
		{
			CellObj = jQuery(ClassItemsArray[i]);

			//First item
			if (i == 0 || CellObj.hasClass("first_column"))
			{
				if (blnError)
				{
					CellObj.addClass(strFirstClassName);

					if (blnRowBased)
					{
						CellObj.css("border-left-width", intNewBorderWidth + "px");
					}
					else
					{
						CellObj.css("border-top-width", intNewBorderWidth + "px");
					}
				}
				else
				{
					CellObj.removeClass(strFirstClassName);

					if (blnRowBased)
					{
						CellObj.css("border-left-width", "");
					}
					else
					{
						CellObj.css("border-top-width", "");
					}
				}
			}

			//Middle section
			if (blnError)
			{
				CellObj.addClass(strAllClassName);

				if (blnRowBased)
				{
					CellObj.css("border-top-width", intNewBorderWidth + "px");
					CellObj.css("border-bottom-width", intNewBorderWidth + "px");
				}
				else
				{
					CellObj.css("border-left-width", intNewBorderWidth + "px");
					CellObj.css("border-right-width", intNewBorderWidth + "px");
				}
			}
			else
			{
				CellObj.removeClass(strAllClassName);

				if (blnRowBased)
				{
					CellObj.css("border-top-width", "");
					CellObj.css("border-bottom-width", "");
				}
				else
				{
					CellObj.css("border-left-width", "");
					CellObj.css("border-right-width", "");
				}
			}

			//Last items
			if (i == ClassItemsArray.length - 1 || CellObj.hasClass("last_column"))
			{
				if (blnError)
				{
					CellObj.addClass(strLastClassName);

					if (blnRowBased)
					{
						CellObj.css("border-right-width", intNewBorderWidth + "px");
					}
					else
					{
						CellObj.css("border-bottom-width", intNewBorderWidth + "px");

						//Quirky issue with bottom border in MaxDiff and Firefox
						if (CellObj.prev().length)
						{
							var intPreviousBorder = CastToInt(CellObj.prev().css("border-bottom-width"));

							if (intPreviousBorder == 0)
							{
								CellObj.prev().css("border-bottom", "0px none transparent");
							}
						}
					}
				}
				else
				{
					CellObj.removeClass(strLastClassName);

					if (blnRowBased)
					{
						CellObj.css("border-right-width", "");
					}
					else
					{
						CellObj.css("border-bottom-width", "");
					}
				}
			}
		}
	}
}

function SSI_ShowQuestErrorMsg(strQuestName, strMessage)
{
	var strErrName = strQuestName + "_err";

	jQuery("<div id=\"" + strErrName + "\" class=\"question_error_box error_messages\">" + strMessage + "</div>").prependTo("#" + strQuestName + "_div");
	jQuery("#" + strQuestName + "_div").addClass("error_quest_highlight"); 
}

function SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage)
{
	var InfoHash = 0;
	var MessageHash = 0;
	var VarHash = 0;

	InfoHash = SSI_GetErrHash(GlobalQuestHash, strQName);

	VarHash = SSI_GetErrHash(InfoHash, "vars");
	
	if (strMessage != "")
	{
		MessageHash = SSI_GetErrHash(InfoHash, "messages");
		
		MessageHash.set(strMessage, 1);

		VarHash.set(strVarName, 1);
	}
	else
	{
		VarHash.set(strVarName, 0);
	}	
}

function SSI_GetErrHash(ParentHash, strKey)
{
	var ChildHash = 0;

	if(ParentHash.has(strKey))
	{
		ChildHash = ParentHash.get(strKey);
	}
	else
	{
		ChildHash = new SSIHash();
		ParentHash.set(strKey, ChildHash);
	}

	return ChildHash;
}

function SSI_ErrorsExist()
{
	var QuestNamesArray = GlobalQuestHash.getKeys();
	var i = 0;
	var strQuestName = "";
	var InfoHash = 0;
	var blnErrors = false;

	for(i = 0; i < QuestNamesArray.length; i++)
	{ 
		strQuestName = QuestNamesArray[i];

		InfoHash = GlobalQuestHash.get(strQuestName);

		if(InfoHash.has("messages"))
		{
			blnErrors = true;
			break;
		}
	}

	return blnErrors;
}

function SSI_InputContainerVisible(InputObj)
{
	var visible = true;

	var jquery_input = jQuery(InputObj);

	var container = jquery_input.closest(".byo_att_row");

	if (container.length)
	{
		if (!container.is(":visible"))
		{
			visible = false;
		}
	}

	return visible;
}

//Clears out input if the BYO row is hidden.  WARNING: Make sure this does not clear out real data.
function SSI_ClearHiddenContainerData()
{
	jQuery(".byo_att_row:hidden input").each(function()
	{
		if(this.type != "hidden")
		{
			if(this.type == "radio")
			{
				SSI_RadioReset(this.name);
			}
			else
			{
				this.value = "";
			}
		}
	});

	//For combo boxes
	jQuery(".byo_att_row:hidden select").each(function()
	{
		this.selectedIndex = 0;
	});
}

function SSI_RadCheck(strVarName, strQName, strErrTxt ,intQNum, blnRequired)
{
	var i = 0;
	var blnChecked = false;
	var blnValid = true;
	var strMessage = "";

	if (blnRequired)
	{
		var intRadioLength = 0;
		var InputObj = document.mainform[strVarName];

		if (InputObj && SSI_InputContainerVisible(InputObj))
		{
			if(InputObj.length)
			{
				intRadioLength = InputObj.length;
			}
			else
			{
				intRadioLength = 1; //Radio buttons of size 1 do not have a .length (they are not an array)
			}
			
			if(intRadioLength == 1)
			{
				if(InputObj.checked == true)
				{
					blnChecked = true;
				}
			}
			else
			{
				for(i = 0; i < intRadioLength; i++)
				{
					if(InputObj[i].checked == true)
					{
						blnChecked = true;
						break;
					}
				}
			}

			if (blnChecked == false)
			{
				strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_missing, intQNum, strQName, strErrTxt, 0, 0);

				blnValid = false;
			}
		}
	}

	SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);

	return blnValid;
}

function SSI_ComboCheck(strVarName, strQName, strErrTxt, intQNum, blnRequired)
{
	var strMessage = "";
	var blnValid = true;

	if(blnRequired)
	{
		InputObj = document.mainform[strVarName];

		if (InputObj && SSI_InputContainerVisible(InputObj))
		{
			if(InputObj.options[InputObj.selectedIndex].value == "")
			{
				strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_missing, intQNum, strQName, strErrTxt, 0, 0);

				blnValid = false;
			}
		}
	}

	SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);
	
	return blnValid;
}

function SSI_CheckBoxCheck(strVarName, strQName, strErrTxt, intQNum, ListArray, intMin, intMax, NoneItemArray)
{
	var blnValid = true;
	var i = 0;
	var intNumSelected = 0;
	var strMessage = "";
	var strCheckBoxName = "";
	var blnGrid = false;
	var strGridReplace = "";
	var intNumChecksDisplayed = 0;
	var CheckObj = 0;

	//If they have not specified a min or a max then any thing will work.
	if(intMin > -1 || intMax > -1)
	{
		//If the size of the list is less then the max then adjust the max
		if (ListArray.length < intMax)
		{
			intMax = ListArray.length;
		}

		//If the size of the list is less then the min then adjust the min
		if (ListArray.length < intMin)
		{
			intMin = ListArray.length;
		}

		//Figure out if it is from a grid or regular.
		if(strVarName.search(/_.\*/) > 0)
		{
			blnGrid = true;
		}

		for(i = 0; i < ListArray.length; i++)
		{
			if(blnGrid)
			{
				strCheckBoxName = strVarName.replace(/\*/, ListArray[i]);
			}
			else
			{
				strCheckBoxName = strVarName + "_" + ListArray[i];
			}

			CheckObj = document.mainform[strCheckBoxName];

			if (CheckObj)
			{
				intNumChecksDisplayed++;

				if (CheckObj.checked == true)
				{
					intNumSelected++;
			
					//Find out if None was checked and if so change intMin to 1
					for(j = 0; j < NoneItemArray.length; j++)
					{
						if(ListArray[i] == NoneItemArray[j])
						{
							if(intMin > 1)
							{
								intMin = 1;
								break;
							}
						}
					}
				}
			}
		}

		if (intMin > intNumChecksDisplayed)
		{
			intMin = intNumChecksDisplayed;
		}

		if((intNumSelected < intMin) || (intNumSelected > intMax))
		{
			if(intNumSelected < intMin)
			{
				strMessage = strGlobalError_min_check;
			}
			else
			{
				strMessage = strGlobalError_max_check;
			}

			strMessage = SSI_ReplaceErrMsgKeyWords(strMessage, intQNum, strQName, strErrTxt, intMin, intMax);

			blnValid = false;
		}
	}

	if(blnGrid)
	{
		strVarName = strVarName.replace(/_r\*/, "");
		strVarName = strVarName.replace(/_c\*/, "");
	}

	SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);

	return blnValid;
}

function SSI_RankCheck(strVarName, strQName, strErrTxt, intQNum, ListArray, blnNumeric, blnRequire, intMin, intMax)
{
	var blnValid = true;
	var blnNumericError = false;
	var i = 0;
	var intNumAnswered = 0;
	var strInputName = "";
	var InputObj = "";
	var strMessage = "";

	if (intMax == 0)
	{
		intMax = ListArray.length;
		intMin = ListArray.length;
	}

	if (intMin == 0)
	{
		blnRequire = false;
	}

	if (intMin > intMax)
	{
		intMin = intMax;
	}

	var RankArray = new Array(intMax + 1); //Make it 1 based, ignore first cell 
	var intRankItem = ""; 

	for (i = 0; i < ListArray.length; i++)
	{
		strInputName = strVarName.replace(/\*/, ListArray[i]);
		InputObj = document.mainform[strInputName];

		//Verification
		if (blnNumeric)
		{
			intRankItem = InputObj.value;
			if (SSI_NumCheck(strInputName, strQName, strErrTxt, intQNum, false, 1, intMax, "", false) == false)
			{
				blnValid = false;
				blnNumericError = true;
			}
		}
		else
		{
			intRankItem = InputObj.options[InputObj.selectedIndex].value;
		}
	
		if (blnValid)
		{
			if (intRankItem != 0 && intRankItem != "")
			{
				//This fixes it for when 03 etc. is entered and it changes it to 3
				intRankItem = parseInt(intRankItem);
				intNumAnswered++;

				if (RankArray[intRankItem] == null)
				{
					RankArray[intRankItem] = 1;
				}
				else
				{
					RankArray[intRankItem] += 1;
				}

				// If we have a rank that is not unique, fail
				if (RankArray[intRankItem] > 1)
				{
					strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_rank_unique, intQNum, strQName, strErrTxt, 0, 0);
									
					blnValid = false;
				}
			}
		}
	}

	if (blnValid)
	{
		if (intNumAnswered > 0 || blnRequire)
		{
			if (intNumAnswered < intMin || intNumAnswered > intMax)
			{
				strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_rank_count, intQNum, strQName, strErrTxt, intMin, intMax);
				strMessage = strMessage.replace(/\[%ERRTOTAL\(\)%\]/ig, intMax);
				blnValid = false;
			}

			if (blnValid)
			{
				var blnAllNull = false;

				//Check for contiguous items.
				//Skipping over first empty cell
				for (i = 1; i < RankArray.length; i++)
				{
					if (RankArray[i] == null)
					{
						blnAllNull = true;
					}
					else
					{
						if (blnAllNull)
						{
							strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_rank_count, intQNum, strQName, strErrTxt, intMin, intMax);
							strMessage = strMessage.replace(/\[%ERRTOTAL\(\)%\]/ig, intMax);
							break;
						}
					}
				}
			}
		}
	}
	
	if (!blnNumericError)
	{
		//If it is a grid.
		strVarName = strVarName.replace(/_r\*/, "");
		strVarName = strVarName.replace(/_c\*/, "");

		SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);
	}
	
	return blnValid;
}

function SSI_ConSumCheck(strVarName, strQName, strErrTxt, intQNum, ListArray, intConsSum, intMin, intMax, blnAllowDecimal, blnReqEach, blnRequire)
{
	var blnValid = true;
	var blnNumericError = false;
	var i = 0;
	var j = 0;
	var intFocusRank = 0;
	var strInputName = "";
	var strMessage = "";
	var blnBlank = true;
	var blnError = false;
	var intSum = 0;
	var InputObj = "";
	var blnNumeric = false;
	var blnForeignDecimal = false;

	intMin = intConsSum - intMin;
	intMax = intConsSum + intMax;

	if(!blnRequire)
	{
		for(i = 0; i < ListArray.length; i++)
		{
			strInputName = strVarName.replace(/\*/, ListArray[i]);

			//Get value depending on type.
			InputObj = document.mainform[strInputName];
	
			intFocusRank = InputObj.value;

			if (intFocusRank != "")
			{
				blnBlank = false;
			}
		}
	}

	if (blnRequire || !blnBlank)
	{
		for(i = 0; i < ListArray.length; i++)
		{
			strInputName = strVarName.replace(/\*/, ListArray[i]);
			InputObj = document.mainform[strInputName];

			if(SSI_NumCheck(strInputName, strQName, strErrTxt, intQNum, blnReqEach, 0, intConsSum, "", blnAllowDecimal) == false)
			{
				blnValid = false;
				blnNumericError = true;
			}

			if(blnValid)
			{
				intFocusRank = InputObj.value;

				if (blnGlobalCommaForDecimal) 
				{
					if(intFocusRank.search(/,/) != -1)
					{
						blnForeignDecimal = true;
						intFocusRank = intFocusRank.replace(/,/, ".");
					}
				}

				intFocusRank = parseFloat(intFocusRank);
				if (isNaN(intFocusRank))
				{
					intFocusRank = 0;
				}

				intSum = intSum + intFocusRank;
			}
		}
			
		if (blnValid)
		{
			intSum = SSI_Totals_Decimal_Chop(intSum, strVarName, ListArray);

			if((intMin > intSum) || (intMax < intSum))
			{
				blnError = true;
			}

			if (blnError)
			{
				if (blnGlobalCommaForDecimal) 
				{
					if(blnForeignDecimal)
					{
						intFocusRank = intFocusRank + "";
						intFocusRank = intFocusRank.replace(/\./, ",");

						intMin = intMin + "";
						intMin = intMin.replace(/\./, ",");

						intMax = intMax + "";
						intMax = intMax.replace(/\./, ",");

						intSum = intSum + "";
						intSum = intSum.replace(/\./, ",");

						intConsSum = intConsSum + "";
						intConsSum = intConsSum.replace(/\./, ",");
					}
				}

				strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_constant_sum, intQNum, strQName, strErrTxt, intMin, intMax);
				strMessage = strMessage.replace(/\[%ERRTOTAL\(\)%\]/ig, intConsSum);
				strMessage = strMessage.replace(/\[%ERRCURSUM\(\)%\]/ig, intSum);

				blnValid = false;
			}
		}
	}

	if (!blnNumericError)
	{
		//If it is a grid.
		strVarName = strVarName.replace(/_r\*/, "");
		strVarName = strVarName.replace(/_c\*/, "");

		SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);
	}
	
	return blnValid;
}

function SSI_SliderCheck(strVarName, strQName, strErrTxt, intQNum, blnRequired)
{
	var blnValid = true;
	var strMessage = "";

	if (jQuery("#" + strVarName).length)
	{
		var InputObj = jQuery("#" + strVarName).find(".slider_control input");

		if (InputObj[0].value == "")
		{
			strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_missing, intQNum, strQName, strErrTxt, 0, 0);

			blnValid = false;
		}
	}

	SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);

	return blnValid;
}

//Make sure that no weird decimal problems occur. (i.e. .0000000000000005)
function SSI_Totals_Decimal_Chop(intSum, strVarName, TotalIndexArray)
{
	var i = 0;
	var strInputName = "";
	var InputObj = 0;
	var strValue = "";

	var intCommaPos = 0;
	var strCommaPortion = "";
	var intMaxDecimalPlaces = 0;
	var intCurrentDecimalPlaces = 0;
	var intSumCommaPos = 0;

	intSum = intSum + "";
	intSumCommaPos = intSum.search(/\./);

	if (intSumCommaPos > -1)
	{
		//Find out the input with the largest number of decimal places
		for(i = 0; i < TotalIndexArray.length; i++)
		{
			strInputName = strVarName.replace(/\*/, TotalIndexArray[i]);
			InputObj = document.mainform[strInputName];
			strValue = InputObj.value;

			if (blnGlobalCommaForDecimal) 
			{
				strValue = strValue.replace(/,/, ".");
			}

			intCommaPos = strValue.search(/\./);
	
			if (intCommaPos > -1)
			{
				strCommaPortion = strValue.substr(intCommaPos, strValue.length);
				intCurrentDecimalPlaces = strCommaPortion.length;
				
				if (intMaxDecimalPlaces < intCurrentDecimalPlaces)
				{
					intMaxDecimalPlaces = intCurrentDecimalPlaces;
				}
			}
		}

		if (intSum.length > intSumCommaPos + intMaxDecimalPlaces)
		{
			intSum = SSI_RoundNumber(intSum, intMaxDecimalPlaces);
		}
	}
		
	return intSum;
}

function SSI_Total(strVarName, TotalIndexArray, strTotalName)
{
	var i = 0;
	var j = 0;
	var strInputName = "";
	var InputObj = "";
	var intFocusRank = 0;
	var intSum = 0;
	var blnForeignDecimal = false;

	for(i = 0; i < TotalIndexArray.length; i++)
	{
		strInputName = strVarName.replace(/\*/, TotalIndexArray[i]);
		InputObj = document.mainform[strInputName];
				
		intFocusRank = InputObj.value;

		//Print if they allow the international comma for decimals
		if (blnGlobalCommaForDecimal) 
		{
			if(intFocusRank.search(/,/) != -1)
			{
				blnForeignDecimal = true;
				intFocusRank = intFocusRank.replace(/,/, ".");
			}
		}

		intFocusRank = parseFloat(intFocusRank);
				
		if (isNaN(intFocusRank))
		{
			intFocusRank = 0;
		}
				
		intSum = intSum + intFocusRank;
	}

	//Make sure that no wierd decimal problems occur. (i.e. .0000000000000005)
	intSum = SSI_Totals_Decimal_Chop(intSum, strVarName, TotalIndexArray);

	strInputName = strVarName.replace(/\*/, strTotalName);
	InputObj = document.mainform[strInputName];

	//Print if they allow the international comma for decimals
	if (blnGlobalCommaForDecimal) 
	{
		if(blnForeignDecimal)
		{
			intSum = intSum + "";
			intSum = intSum.replace(/\./, ",");
		}
	}

	InputObj.value = intSum;

	return intSum;
}

//Setup the events that call the totals function
function SSI_Totals_EventSetup(TotalIndexArray, QArray, strTotalName)
{
	var i = 0;
	var j = 0;
	var strInputName = "";
	var InputObj = "";
	var strBaseName = "";

	var TotalFunctionPointer = 0;

	for(i = 0; i < QArray.length; i++)
	{
		strBaseName = QArray[i];

		TotalFunctionPointer = SSI_MakeTotalsFunction(strBaseName, TotalIndexArray, strTotalName);

		//Setup Events for each input box
		for(j = 0; j < TotalIndexArray.length; j++)
		{
			strInputName = strBaseName.replace(/\*/, TotalIndexArray[j]);
			InputObj = jQuery(document.mainform[strInputName]);
			InputObj.bind("keyup", TotalFunctionPointer);
		}

		strInputName = strBaseName.replace(/\*/, strTotalName);
		InputObj = jQuery(document.mainform[strInputName]);
		InputObj.bind("keyup", TotalFunctionPointer);

		// Run it once.  This fills the totals box when the page loads, for prefill or backing up.
		TotalFunctionPointer();
	}
}

function SSI_MakeTotalsFunction(strBaseName, TotalIndexArray, strTotalName)
{
	return function(){SSI_Total(strBaseName, TotalIndexArray, strTotalName);};
}

function SSI_OtherVerify(strQName, intQNum, ListArray, strType)
{
	var strInputName = "";	
	var strOtherInputName = ""; 
	var blnReturnVal = true;
	var strOtherParams = ""; 
	var intMin = ""; 
	var intMax = ""; 
	var strErrTxt = ""; 
	var blnChecked = false; 
	var intRadioValue = -1;
	var strTextBoxValue = "";

	for(i = 0; i < ListArray.length; i++)
	{
		blnChecked = false;

		if(strType == "radio")
		{
			//Only do the loop once for radio buttons.
			if(i == 1)
			{
				break;
			} 
		
			intRadioValue = SSI_GetRadioValueChecked(strQName);
			
			if(intRadioValue > 0)
			{
				blnChecked = true;
				strInputName = strQName + "_" + intRadioValue;
			}
		}
		else if(strType == "check")
		{
			strInputName = strQName + "_" + ListArray[i];
		
			if (document.mainform[strInputName].checked == true)
			{
				blnChecked = true;
			}
		}
		else if(strType == "numeric")
		{
			strInputName = strQName + "_" + ListArray[i];
			strTextBoxValue = document.mainform[strInputName].value;
			//Trim white space from front and back
			strTextBoxValue = strTextBoxValue.replace(/\s*/, "");
			strTextBoxValue = strTextBoxValue.replace(/\s*$/, "");
			
			if (strTextBoxValue != "" && strTextBoxValue != 0)
			{
				blnChecked = true;
			}
		}
		else if(strType == "combo")
		{
			strInputName = strQName + "_" + ListArray[i];
			strTextBoxValue = document.mainform[strInputName].selectedIndex;
			if (strTextBoxValue != "" && strTextBoxValue != 0)
			{
				blnChecked = true;
			}
		}
		
		strOtherInputName = strInputName + "_other";

		//If it exists
		if(document.mainform[strOtherInputName] != null)
		{
			if (blnChecked)
			{
				//Get other parameters
				if(document.mainform["hid_" + strOtherInputName] != null)
				{
					strOtherParams = document.mainform["hid_" + strOtherInputName].value;

					//Get Min
					var int1stComma = strOtherParams.search(/,/);
					intMin = strOtherParams.substr(0, int1stComma);

					strOtherParams = strOtherParams.substr(int1stComma + 1, strOtherParams.length);

					//Get Max
					var int2ndComma = strOtherParams.search(/,/);
					intMax = strOtherParams.substr(0, int2ndComma);

					//Get Error Text
					strErrTxt = strOtherParams.substr(int2ndComma + 1, strOtherParams.length);

					blnReturnVal = SSI_TxtCheck(strOtherInputName, strQName, strErrTxt, intQNum, intMin, intMax);
					
					if(blnReturnVal == false)
					{
						break;
					}
				}
			}
			else
			{
				//This resets all error messages
				SSI_UpdateQuestionErrHash(strOtherInputName, strQName, "");
			}
		}
	}

	return blnReturnVal;
}

function SSI_GetRadioValueChecked(strQName)
{
	var i = 0; 
	var intValue = 0;
	var intRadioLength = 0;

	RadioObj = document.mainform[strQName];

	if(RadioObj.length)
	{
		intRadioLength = RadioObj.length;
	}
	else
	{
		intRadioLength = 1; //Radio buttons of size 1 do not have a .length (they are not an array)
	}

	//Take care of the case where there is only one radio button
	if(intRadioLength == 1)
	{
		if(RadioObj.checked)
		{
			intValue = RadioObj.value;
		}
	}
	else
	{
		for(i = 1; i <= intRadioLength; i++)
		{
			if(RadioObj[i-1].checked)
			{
				intValue = RadioObj[i-1].value;
				break;
			}
		}
	}
	
	return intValue;
}

function SSI_Grid_Other(strQName, RowIndicesArray, ColIndicesArray, intQNum)
{
	var blnResult = true;
	
	//Check rows
	blnResult = SSI_Grid_Other_Helper(strQName, RowIndicesArray, ColIndicesArray, intQNum, true);
	
	//Check cols
	blnResult = SSI_Grid_Other_Helper(strQName, ColIndicesArray, RowIndicesArray, intQNum, false);
	
	return blnResult;
}

function SSI_Grid_Other_Helper(strQName, IndicesArrayOne, IndicesArrayTwo, intQNum, blnRows)
{
	var i = 0;
	var j = 0;
	var strOtherName = "";
	var strBaseNameOne = "";
	var strBaseNameTwo = "";
	var strCellName = "";
	var strOtherParams = "";
	var intMin = "";
	var intMax = ""; 
	var strErrTxt = ""; 
	var blnReturnValue = true;
	var strCompareValue = "";
	var strActualValue = "";
	var intValueChecked = 0;
	var strRadioName = "";

	//Loop through all possible 'other' positions
	for(i = 0; i < IndicesArrayOne.length; i++)
	{
		if(blnRows)
		{
			strBaseNameOne = strQName + "_r";
		}
		else
		{
			strBaseNameOne = strQName + "_c";
		}
		
		strOtherName =  strBaseNameOne + IndicesArrayOne[i] + "_other";
	
		//If it exists
		if(document.mainform[strOtherName] != null)
		{
			//Get Other Parameters
			if(document.mainform["hid_" + strOtherName] != null)
			{
				strOtherParams = document.mainform["hid_" + strOtherName].value;

				//Get Min
				var int1stComma = strOtherParams.search(/,/);
				intMin = strOtherParams.substr(0, int1stComma);

				strOtherParams = strOtherParams.substr(int1stComma + 1, strOtherParams.length);

				//Get Max
				var int2ndComma = strOtherParams.search(/,/);
				intMax = strOtherParams.substr(0, int2ndComma);

				//Get Error Text
				strErrTxt = strOtherParams.substr(int2ndComma + 1, strOtherParams.length);

				//If row radio exists.  This is for other specifies describing a row of radio buttons (oposite from below)
				strRadioName = strBaseNameOne + IndicesArrayOne[i];

				if(document.mainform[strRadioName] != null)
				{
					intValueChecked = SSI_GetRadioValueChecked(strRadioName);
				
					if(intValueChecked > 0)
					{
						blnReturnValue = SSI_TxtCheck(strOtherName, strQName, strErrTxt, intQNum, intMin, intMax);
				
					//	if(!blnReturnValue)
					//	{
					//		return blnReturnValue;
					//	}
					}
				}
				
				//Loop through rows
				for(j = 0; j < IndicesArrayTwo.length; j++)
				{
					if(blnRows)
					{
						strBaseNameTwo = strQName + "_c";
					}
					else
					{
						strBaseNameTwo = strQName + "_r";
					}
				
					strBaseNameTwo += IndicesArrayTwo[j];
				
					//If row radio exists
					if(document.mainform[strBaseNameTwo] != null)
					{
						intValueChecked = SSI_GetRadioValueChecked(strBaseNameTwo);
					
						if(intValueChecked > 0)
						{
							if(intValueChecked == IndicesArrayOne[i])
							{
								blnReturnValue = SSI_TxtCheck(strOtherName, strQName, strErrTxt, intQNum, intMin, intMax);
							}
						}
						
						continue;
					}

					if(blnRows)
					{
						strCellName = strQName + "_r" + IndicesArrayOne[i] + "_c" + IndicesArrayTwo[j];
					}
					else
					{
						strCellName = strQName + "_r" + IndicesArrayTwo[j] + "_c" + IndicesArrayOne[i];
					}

					if(document.mainform[strCellName] == null)
					{
						continue;
					}
					else
					{
						if(document.mainform[strCellName].type == "checkbox")
						{
							if(document.mainform[strCellName].checked == false)
							{
								continue;
							}
							else
							{
								blnReturnValue = SSI_TxtCheck(strOtherName, strQName, strErrTxt, intQNum, intMin, intMax);
							}
						}
								
						strActualValue = document.mainform[strCellName].value;
						
						//Trim white space from front and back
						strActualValue = strActualValue.replace(/\s*/, "");
						strActualValue = strActualValue.replace(/\s*$/, "");
						
						if(strActualValue != "" && strActualValue != 0)
						{
							blnReturnValue = SSI_TxtCheck(strOtherName, strQName, strErrTxt, intQNum, intMin, intMax);
						}
					}
				}
			}
		}
	}

	return blnReturnValue;
}

function SSI_CheckRadioButton(strName, intValue)
{
	var RadioObj = document.mainform[strName];
	var i = 0;

	if(InputObj.length)
	{
		intRadioLength = InputObj.length;
	}
	else
	{
		intRadioLength = 1; //Radio buttons of size 1 do not have a .length (they are not an array)
	}

	if(intRadioLength == 1)
	{
		if(RadioObj.value == intValue)
		{
			RadioObj.checked = true;
		}
	}
	else
	{
		//Radio with multiple items
		for(i = 0; i < intRadioLength; i++)
		{
			if(RadioObj[i].value == intValue)
			{
				RadioObj[i].checked = true; 
				break;
			}
		}
	}
}

function SSI_CheckMaxDiff(strQName, strErrTxt, intQNum)
{
	var strMessage = "";
	var intBestAnswer = SSI_GetRadioValueChecked(strQName + "_b");
	var intWorstAnswer = SSI_GetRadioValueChecked(strQName + "_w");
	var blnValid = false;

	if (intBestAnswer > 0 && intWorstAnswer > 0)
	{
		if(intBestAnswer == intWorstAnswer)
		{
			strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_maxdiff_unique, intQNum, strQName, strErrTxt, 0, 0);
		}
		else
		{
			blnValid = true;
		}
	}

	SSI_UpdateQuestionErrHash(strQName, strQName, strMessage);

	return blnValid;
}

function SSI_CheckCBCUnique(strVarName, strQName, strBestSuffix, strWorstSuffix, strErrTxt, intQNum)
{
	var strMessage = "";
	var intBestAnswer = SSI_GetRadioValueChecked(strVarName + strBestSuffix);
	var intWorstAnswer = SSI_GetRadioValueChecked(strVarName + strWorstSuffix);
	var blnValid = false;

	if (intBestAnswer > 0 && intWorstAnswer > 0)
	{
		if(intBestAnswer == intWorstAnswer)
		{
			strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_cbc_unique, intQNum, strQName, strErrTxt, 0, 0);
		}
		else
		{
			blnValid = true;
		}
	}

	SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);

	return blnValid;
}

function SSI_ReplaceErrMsgKeyWords(strMessage, intQNum, strQName, strErrTxt, intMin, intMax)
{
	strMessage = strMessage.replace(/\[%ERRFIELD\(\)%\]/ig, intQNum);
	strMessage = strMessage.replace(/\[%ERRQNAME\(\)%\]/ig, strQName);
	strMessage = strMessage.replace(/\[%ERRTEXT\(\)%\]/ig, strErrTxt);
	strMessage = strMessage.replace(/\[%ERRMIN\(\)%\]/ig, intMin);
	strMessage = strMessage.replace(/\[%ERRMAX\(\)%\]/ig, intMax);

	return strMessage;
}

function SSI_TxtCheck(strVarName, strQName, strErrTxt, intQNum, intMinChars, intMaxChars)
{
	var blnValid = true;
	var InputObj = document.mainform[strVarName];

	if (InputObj)
	{
		var strInString = new String(InputObj.value);
		var strMessage = "";
		var intStatus = 0;

		//Trims white space
		strInString = strInString.replace(/\s*/, "");
		strInString = strInString.replace(/\s*$/, "");

		//Checking min characters
		if(strInString.length < intMinChars)
		{
			intStatus = 1;
		}

		//Checking max characters
		if (intMaxChars >= 0)
		{
			if(strInString.length > intMaxChars)
			{
				intStatus = 2;
			}
		}

		if (intStatus > 0) 
		{
			if (intStatus == 1) 
			{
				if (strInString.length == "")
				{
					strMessage = strGlobalError_missing;
				}
				else
				{
					strMessage = strGlobalError_min_char;
				}
			}
			else
			{
				strMessage = strGlobalError_max_char;
			}		

			strMessage = SSI_ReplaceErrMsgKeyWords(strMessage, intQNum, strQName, strErrTxt, intMinChars, intMaxChars);

			blnValid = false;
		}
		
		SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);
	}

	return blnValid;
}


function SSI_RemoveBackButtonShell()
{
	setTimeout("SSI_RemoveBackButton()", 1);
}

function SSI_RemoveBackButton()
{
	try
	{
		history.forward(1);
	}
	catch(e)
	{
	}

	/*Every 500 miliseconds, try again. The only
	guaranteed method for Opera, Firefox,
	and Safari, which don't always call
	onLoad but *do* resume any timers when
	returning to a page
	*/
	setTimeout("SSI_RemoveBackButton()", 500);
}

//Make sure they only enter letters for the Internal Respondent Number
function SSI_RespNumCheck(e)
{
	var keynum; 
	var keychar; 
	var numcheck; 
	var blnSuccess = true;
	
	//For I.E.
	if(window.event)
	{
		keynum = e.keyCode;
	}
	//Netscape/Firefox/Opera
	else if(e.which)
	{
		keynum = e.which;
	}

	if (keynum > 31 && (keynum < 48 || keynum > 57))
	{
		return false;
	}
	else
	{
		document.mainform["hid_test_mode_userespnum"].checked = true;
		return true;
	}
}

function SSI_DeepCopyArray(ItemToCopy)
{
	if(typeof(ItemToCopy) == "object")
	{
		if (ItemToCopy != null)
		{
			if(ItemToCopy.constructor == Array)
			{
				var NewArray = ItemToCopy.slice();
				var intArraySize = NewArray.length;
				var i = 0;
				for(i = 0; i < intArraySize; i++)
				{
					NewArray[i] = SSI_DeepCopyArray(NewArray[i]);
				}
				
				return NewArray;
			}
		}
	}
	//If it is not an array it just returns itself (not deep copied)
	return ItemToCopy;
}

function SSI_NumCheck(strVarName, strQName, strErrTxt, intQNum, blnRequired, intMin, intMax, intNA, blnAllowDecimal)
{
	var blnValid = true;
	var ParsedNum = 0;
	var intResultStr = 0;
	var strMessage = "";
	var InputObj = document.mainform[strVarName];
	
	if (InputObj)
	{
		var strValue = InputObj.value;

		if(blnGlobalCommaForDecimal)
		{
			strValue = strValue.replace(/,/, ".");
		}
				
		intResultStr = SSI_CheckStr(strValue);

		if(intResultStr == 1)
		{
			InputObj.value = ""; 
			strValue = "";
		}

		if (strValue == "")
		{
			if (blnRequired)
			{
				strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_missing, intQNum, strQName, strErrTxt, 0, 0);
		
				blnValid = false;
			}
		}
		else if (isNaN(strValue) || (intResultStr == 3))
		{
			strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_not_numeric, intQNum, strQName, strErrTxt, 0, 0);
			
			blnValid = false;
		}
		else
		{
			ParsedNum = parseFloat(strValue);

			if(blnAllowDecimal == false)
			{
				var intIntegerVal = parseInt(ParsedNum);
				intIntegerVal = parseFloat(intIntegerVal);

				if (intIntegerVal != ParsedNum)
				{
					strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_not_numeric, intQNum, strQName, strErrTxt, 0, 0);

					blnValid = false;
				}
				else
				{
					InputObj.value = intIntegerVal;
				}
			}

			if(blnValid)
			{
				if((ParsedNum < intMin) || (ParsedNum > intMax))
				{
					if (intNA && ParsedNum == intNA)
					{
						//Do nothing
					}
					else
					{
						strMessage = SSI_ReplaceErrMsgKeyWords(strGlobalError_out_of_range, intQNum, strQName, strErrTxt, intMin, intMax);
				
						blnValid = false;
					}
				}
			}
		}

		SSI_UpdateQuestionErrHash(strVarName, strQName, strMessage);
	}
	
	return blnValid;
}

function SSI_CheckStr(strString)
{
	var i = 0;
	var theChar = "";
	var blnHasNum = false;

	for(i = 0; i < strString.length; i++)
	{
		theChar = strString.charAt(i);

		if((theChar != ' ') && (theChar != '\\n') && (theChar != '\\t'))
		{
			if((theChar != '-') && (theChar != '.') && ((theChar > '9') || (theChar < '0')))
			{
				return 3;
			}
			else
			{
				blnHasNum = true;
			}
		}
	}
	
	if(blnHasNum)
	{
		return 2;
	}
	
	return 1;
}

function SSI_PriceFormat(intNumber, strThousand, strDecimal, intNumDecimalPlaces)
{
	if (intNumDecimalPlaces)
	{
		intNumber = SSI_FormatDecimalPoint(intNumber, intNumDecimalPlaces);
	}

	var strNumber = intNumber.toString();
	var intDecimalPosition = strNumber.indexOf(".");
	var strPostFix = "";

	if (intDecimalPosition >= 0)
	{
		var strBaseNumber = strNumber.slice(0, intDecimalPosition);
		strPostFix = strNumber.slice(intDecimalPosition, strNumber.length);

		//Insert specified decimal separator
		if (strDecimal != "")
		{
			strPostFix = strPostFix.replace(/\./, strDecimal);
		}

		strNumber = strBaseNumber;
	}

	//Adding in thousands separator
	var strResult = "";
	
	if (strThousand != "")
	{
		var strPrefix = strNumber.substr(0, 1);

		//If the number is negative remove the "-" temporarily
		if(strPrefix == "-")
		{
			strNumber = strNumber.substr(1, strNumber.length);
		}
		else
		{
			strPrefix = "";
		}

		var intLength = strNumber.length;

		while (intLength > 3)
		{
			strResult = strThousand + strNumber.substr(intLength - 3, 3) + strResult;
			intLength -=3;
		}
	
		strNumber = strPrefix + strNumber.substr(0,intLength);
	}

	return strNumber + strResult + strPostFix;
}

function SSI_RoundNumber(intNumber, intNumDecimalPlaces)
{
	if(!intNumDecimalPlaces)
	{
		intNumDecimalPlaces = 0;
	}

	intNumber = parseFloat(intNumber);

	var intNewNumber = Math.round(intNumber * Math.pow(10,intNumDecimalPlaces)) / Math.pow(10,intNumDecimalPlaces);
	
	if (intNumDecimalPlaces > 0)
	{
		var strNewNumber = SSI_FormatDecimalPoint(intNewNumber, intNumDecimalPlaces);
		intNewNumber = parseFloat(strNewNumber);
	}
	
	return intNewNumber;
}

function SSI_FormatDecimalPoint(intNumber, intNumDecimalPlaces)
{
	var strNewNumber = intNumber.toString();
	var intDecimalPosition = strNewNumber.indexOf(".");
	var intLastPosition = strNewNumber.length - 1;
	var intNumZerosNeeded = 0; 
	var blnAddDecimalPoint = false;

	if (intDecimalPosition > -1)
	{
		var intCurrentNumDecimalPlaces = intLastPosition - intDecimalPosition;
		intNumZerosNeeded = intNumDecimalPlaces - intCurrentNumDecimalPlaces;
	}
	else
	{
		intNumZerosNeeded = intNumDecimalPlaces;
		blnAddDecimalPoint = true;
	}

	var i = 0;
	var strZeros = "";
	for (i = 0; i < intNumZerosNeeded; i++)
	{
		strZeros += "0";
	}

	if (blnAddDecimalPoint)
	{
		strNewNumber += ".";
	}

	strNewNumber += strZeros;

	return strNewNumber;
}

function SSI_GetValue(strQName)
{
	var qvalue = "";

	var InputObj = document.mainform[strQName];

	if (InputObj)
	{
		if (InputObj.type == "checkbox")
		{
			if (InputObj.checked)
			{
				qvalue = parseFloat(InputObj.value);

				if (isNaN(qvalue))
				{
					qvalue = 0;
				}
			}
			else
			{
				qvalue = 0;
			}
		}
		else if (InputObj[0] && InputObj[0].type == "radio")
		{
			qvalue = SSI_GetRadioValueChecked(strQName);

			qvalue = parseFloat(qvalue);

			if (isNaN(qvalue))
			{
				qvalue = 0;
			}
		}
		else if (jQuery(InputObj).is("select") && InputObj.value == "")
		{
			qvalue = 0;  //Return 0 for empty values for combo boxes
		}
		else
		{
			qvalue = jQuery.trim(InputObj.value);

			//If it comes from a numeric input but it is not in numeric form...  (leading 0 etc)
			//If numeric verify gets called before now this is not really necessary
			if(jQuery(InputObj).hasClass("numeric_input") && !isNaN(qvalue))
			{
				qvalue = parseFloat(qvalue);

				if (isNaN(qvalue))
				{
					qvalue = 0;
				}
			}
		}		
	}
	
	return qvalue;
}

function SSI_GetFormObject(strQName)
{
	var FormObject = 0;

	if (document.mainform[strQName])
	{
		FormObject = document.mainform[strQName];
	}

	return FormObject;
}

function SSI_BYOClass(strQName, AttIndexArray, strInputType, blnShowPrice, ProhibitionsArray, blnCondText, blnCondPrice, intBasePrice, intNumDecimalPlaces, strThousandSeparator, strDecimalSeparator, intPriceAtt, intQuestNum, strErrText, strProhibitionErrorMsg, CondRelationshipsArray, CondRelationshipsIndexArray, strScriptExtension, strStudyName, strRespNum, intPageNum, CondPriceArray, strCondPricePossError, strCondPriceNegError, strCondPriceNeutralError, strCurrencySymbol, strCurrencyPosition, strCondPriceErrorMsg, AltSpecificRules)
{
	this.strQName = strQName;
	this.AttIndexArray = AttIndexArray;
	this.strInputType = strInputType;
	this.blnShowPrice = blnShowPrice;
	this.ProhibitionsArray = ProhibitionsArray;
	this.blnCondText = blnCondText;
	this.blnCondPrice = blnCondPrice;
	this.intBasePrice = intBasePrice;
	this.intNumDecimalPlaces = intNumDecimalPlaces;
	this.strThousandSeparator = strThousandSeparator;
	this.strDecimalSeparator = strDecimalSeparator;
	this.intPriceAtt = intPriceAtt;
	this.CurrentProhibitedSet = 0;
	this.strProhibitionErrorMsg = strProhibitionErrorMsg;
	this.intQuestNum = intQuestNum;
	this.strErrText = strErrText;
	this.CondRelationshipsArray = CondRelationshipsArray;
	this.CondRelationshipsIndexArray = CondRelationshipsIndexArray;
	this.strScriptExtension = strScriptExtension;
	this.strStudyName = strStudyName;
	this.strRespNum = strRespNum;
	this.intPageNum = intPageNum;
	this.CondPriceArray = CondPriceArray;
	this.strCondPricePossError = strCondPricePossError;
	this.strCondPriceNegError = strCondPriceNegError;
	this.strCondPriceNeutralError = strCondPriceNeutralError;
	this.strCurrencySymbol = strCurrencySymbol;
	this.strCurrencyPosition = strCurrencyPosition;
	this.strCondPriceErrorMsg = strCondPriceErrorMsg;
	this.PricesArray = [];
	this.OriginalPricesArray = [];
	this.AltSpecificRules = AltSpecificRules;

	//Methods
	this.SetupEvents = SSI_BYOSetEvents;
	this.BYOMakeFunction = SSI_BYOMakeFunction;
	this.CheckBYOProhibitions = SSI_BYOProhibitions;
	this.BYOCheckProhibitedSet = SSI_BYOCheckProhibitedSet;
	this.BYOTotal = SSI_BYOTotal;
	this.BYOAltSpecificDisplay = SSI_BYOAltSpecificDisplay;
	this.BYOProhEvent = SSI_BYOProhEvent;
	this.BYOProhHighlight = SSI_BYOProhHighlight;
	this.BYOCondText = SSI_BYOCondText;
	this.BYOGetLevelValue = SSI_BYOGetLevelValue;
	this.BYOCondPrice = SSI_BYOCondPrice;
	this.BYOChangePriceInLabels = SSI_BYOChangePriceInLabels;
	this.BYOPriceChangeAlert = SSI_BYOPriceChangeAlert;
	this.BYOAddPrices = SSI_BYOAddPrices;
	this.BYOAttVisible = SSI_BYOAttVisible;
}

function SSI_BYOAddPrices(intAtt, LevelPricesArray)
{
	this.PricesArray[intAtt] = LevelPricesArray;
	this.OriginalPricesArray[intAtt] = LevelPricesArray;
}

function SSI_BYOSetEvents ()
{
	var BYOObj = this;
	var i = 0; 
	var j = 0; 
	var InputObj = ""; 
	var strInputName = ""; 
	var NumberObj = "";
	var intIndex = 0;

	// Set up level onChange events.
	for(i = 1; i <= BYOObj.AttIndexArray.length; i++)
	{
		intIndex = BYOObj.AttIndexArray[i - 1];

		strInputName = BYOObj.strQName + "_" + intIndex;
		InputObj = document.mainform[strInputName];
	
		if (BYOObj.strInputType == "radio") 
		{
			//Multi radio buttons
			if(InputObj.length)
			{
				for(j = 0; j < InputObj.length; j++)
				{
					//Need to convert it to a jQuery obj
					var RadioObj = jQuery(InputObj[j]);

					if(RadioObj.length)
					{
						var ClickableObj = RadioObj.closest(".clickable");

						ClickableObj.bind("byo_click", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
							event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
						});

						if (GlobalGraphicalSelect)
						{
							ClickableObj.bind("keyup", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
								event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
							});
						}
					}	
				}
			}
			//Single radio button
			else
			{
				jQuery(InputObj).bind("click", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
					event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
				});		
			}
		}
		else if (BYOObj.strInputType == "combo") 
		{
			jQuery(InputObj).bind("change", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
				event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
			});	
		}

		if (BYOObj.blnShowPrice) 
		{
			//Set up disable events
			strInputName = BYOObj.strQName + "_price" + intIndex;
			InputObj = jQuery("#" + strInputName);

			InputObj.bind("change", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
				event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
			});	

			InputObj.bind("keyup", {BYOObjParam: BYOObj, intIndexParam: intIndex}, function(event){
				event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
			});	
		}
	}

	//Must be before show price
	if (BYOObj.AltSpecificRules.length)
	{
		BYOObj.BYOAltSpecificDisplay();	
	}

	if (BYOObj.blnShowPrice) 
	{
		InputObj = jQuery("#" + BYOObj.strQName + "_" + BYOObj.intPriceAtt);

		InputObj.bind("change", {BYOObjParam: BYOObj, intIndexParam: BYOObj.AttIndexArray.length}, function(event){
			event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
		});	

		InputObj.bind("keyup", {BYOObjParam: BYOObj, intIndexParam: BYOObj.AttIndexArray.length}, function(event){
			event.data.BYOObjParam.BYOMakeFunction(event.data.intIndexParam);
		});	

		//Run the total code now so that if they have a base price it will show up at the bottom
		BYOObj.BYOTotal(0);
	}
}

function SSI_BYOMakeFunction(intAttIndex)
{
	var BYOObj = this;

	//Must be before show price
	if (BYOObj.AltSpecificRules.length)
	{
		BYOObj.BYOAltSpecificDisplay();		
	}

	if (BYOObj.blnShowPrice) 
	{
		BYOObj.BYOTotal(intAttIndex);
	}

	if (BYOObj.ProhibitionsArray.length)
	{
		BYOObj.BYOProhEvent();
	}

	if (BYOObj.blnCondText) 
	{
		BYOObj.BYOCondText(0, intAttIndex);
	}

	if (BYOObj.blnCondPrice && BYOObj.blnShowPrice) 
	{
		BYOObj.BYOCondPrice(true);
	}
}

function SSI_BYOAltSpecificDisplay()
{
	var BYOObj = this;
	var input_name = "";
	var att = 0;
	var cond_att = 0;
	var lev_input = 0;
	var i = 0; 
	var j = 0;
	var rule_layer = [];
	var rule = [];
	var row = 0;
	var rules_hash = SSI_BYOGetAltSpecificRulesStruct(BYOObj.AltSpecificRules);
	var keys = rules_hash.getKeys();
	var scroll_distance = jQuery(document).scrollTop();

	keys = keys.sort();

	jQuery("#" + BYOObj.strQName + "_div .conditional_att").hide();

	//Process logic one layer at a time starting at root
	for(i = 0; i < keys.length; i++)
	{
		var show_hash = new SSIHash();
		rule_layer = rules_hash.get(keys[i]);

		for(j = 0; j < rule_layer.length; j++)
		{
			rule = rule_layer[j];
			att = SSI_GetAltSpecRuleAtt(rule[0]);

			input_name = BYOObj.strQName + "_" + att;
		
			//Get attribue level - combo or radio code here
			lev_input = BYOObj.BYOGetLevelValue(input_name);

			//Only test the rule if attribute is visible
			if(lev_input > 0 && BYOObj.BYOAttVisible(att))
			{
				cond_att = rule[1];
				row = jQuery("#" + BYOObj.strQName + "_row_" + cond_att);

				if (row.hasClass("conditional_att"))
				{
					if(att + "-" + lev_input == rule[0])
					{
						row.show();
					}
				}				
			}
		}
	}

	SSI_BYOAltColors();

	//When hiding and showing HTML and then clicking on radio button weird scrolling was occuring.
	//This is a hack to stop that scrolling.
	jQuery(document).scrollTop(scroll_distance);
}

function SSI_BYOGetAltSpecificRulesStruct(rules)
{
	var i = 0;
    var att = 0;
    var att_lev = "";
    var num_nested = 0;
	var rules_hash = new SSIHash();

    for(i = 0; i < rules.length; i++)
    {
        att_lev = rules[i][0];
        att = SSI_GetAltSpecRuleAtt(att_lev);

        num_nested = SSI_FindAltSpecDepth(att, rules, i);

		var rules_array = [];

        if (rules_hash.has(num_nested))
        {
			rules_array = rules_hash.get(num_nested);
        }

		rules_array.push(rules[i]);

		rules_hash.set(num_nested, rules_array);
    }

	return rules_hash;
}

function SSI_FindAltSpecDepth(att, rules, current_index)
{
    var i = 0;
    var cond_att = 0;
    var att_lev = 0;
    var local_nested_count = 0;
    var highest_nested_count = 0;

    for(i = 0; i < rules.length; i++)
    {
        if(i != current_index)
        {
            att_lev = rules[i][0];
            cond_att = rules[i][1];

            if(att == cond_att)
            {
                var parent_att = SSI_GetAltSpecRuleAtt(att_lev);

                local_nested_count++;
                var new_nested_count = SSI_FindAltSpecDepth(parent_att, rules, i);

                local_nested_count += new_nested_count;

                if(local_nested_count > highest_nested_count)
                {
                    highest_nested_count = local_nested_count;
                }

                local_nested_count = 0;
            }
        }
    }

    return highest_nested_count;
}

function SSI_GetAltSpecRuleAtt(att_lev)
{
    att_lev_array = att_lev.split("-");
    att = att_lev_array[0];

    return att;
}

function SSI_BYOAltColors()
{
	jQuery(".byo_att_row:visible:odd").removeClass("alt_color1").addClass("alt_color2");
	jQuery(".byo_att_row:visible:even").removeClass("alt_color2").addClass("alt_color1");
}

function SSI_BYOAttVisible(att)
{
	var BYOObj = this;
	var visible = false;

	visible = jQuery("#" + BYOObj.strQName + "_row_" + att).is(":visible");

	return visible;
}

function SSI_BYOTotal(intCurrentAttIndex)
{
	var BYOObj = this;
	var InputObj = "";
	var strInputName = "";
	var intChoice = 0;
	var intLev = 0;
	var intAttribute = 0; 
	var i = 0; 
	var j = 0; 
	var intFocusPrice = 0; 
	var strPrice = ""; 
	var strFormattedPrice = "";
	var intSum = BYOObj.intBasePrice;

	for(i = 0; i < BYOObj.AttIndexArray.length; i++)
	{
		intLev = 0;
		intAttribute = BYOObj.AttIndexArray[i];

		if(BYOObj.BYOAttVisible(intAttribute))
		{
			strInputName = BYOObj.strQName + "_" + intAttribute;
			PriceBoxObj = document.mainform[BYOObj.strQName + "_price" + intAttribute];

			if (BYOObj.blnCondPrice)
			{
				//Turn off any colors that might have been set from price change alert
				if (intCurrentAttIndex == 0)
				{
					jQuery("#" + BYOObj.strQName + "_row_" + intAttribute).removeClass("acbc_price_change_warning");
				}
			}

			//Get attribue level - combo or radio code here
			intLev = BYOObj.BYOGetLevelValue(strInputName);

			if(intLev > 0)
			{
				strPrice = BYOObj.PricesArray[intAttribute][intLev - 1];

				if (!strPrice)
				{
					strPrice = 0;
				}

				strFormattedPrice = SSI_RoundNumber(strPrice, BYOObj.intNumDecimalPlaces);
				strFormattedPrice = SSI_PriceFormat(strFormattedPrice, BYOObj.strThousandSeparator, BYOObj.strDecimalSeparator, BYOObj.intNumDecimalPlaces);
				PriceBoxObj.value = strFormattedPrice;

				intFocusPrice = parseFloat(strPrice);

				if (isNaN(intFocusPrice))
				{
					intFocusPrice = 0;
				}

				intSum += intFocusPrice;
			}
			else
			{
				PriceBoxObj.value = 0;
			}
		}
	}

	InputObj = document.mainform[BYOObj.strQName + "_" + BYOObj.intPriceAtt];
	intSum = SSI_RoundNumber(intSum, BYOObj.intNumDecimalPlaces);
	intSum = SSI_PriceFormat(intSum, BYOObj.strThousandSeparator, BYOObj.strDecimalSeparator, BYOObj.intNumDecimalPlaces);
	InputObj.value = intSum;
}

function SSI_BYOProhibitions()
{
	var blnConceptFails = false;
	var ProhibitedSet = 0;
	var AttLevPair = 0;
	var intProhAtt = 0;
	var intProhLev = 0;
	var blnProhibited = true;
	var i = 0;

	//This makes sure that any lingering highlighting is removed before the check is done again.  (We only want to show one prohibition at a time)
	for(i = 0; i < this.ProhibitionsArray.length; i++)
	{
		ProhibitedSet = this.ProhibitionsArray[i];
		this.BYOProhHighlight(ProhibitedSet, false);
	}

	for(i = 0; i < this.ProhibitionsArray.length; i++)
	{
		blnProhibited = true;
		ProhibitedSet = this.ProhibitionsArray[i];
		blnProhibited = this.BYOCheckProhibitedSet(ProhibitedSet);

		if (blnProhibited)
		{
			blnConceptFails = true;
			break;
		}
	}

	if (blnConceptFails)
	{
		this.BYOProhHighlight(ProhibitedSet, true);

		var strMessage = SSI_ReplaceErrMsgKeyWords(this.strProhibitionErrorMsg, this.intQuestNum, this.strQName, this.strErrText, 0, 0);

		SSI_UpdateQuestionErrHash(this.strQName, this.strQName, strMessage);

		this.CurrentProhibitedSet = ProhibitedSet;
	}
	else
	{
		this.CurrentProhibitedSet = 0;
	}
	
	return !blnConceptFails;
}

function SSI_BYOCheckProhibitedSet (ProhibitedSet)
{
	var BYOObj = this;
	var i = 0; 
	var AttLevPair = 0;
	var intProhAtt = 0; 
	var InputObj = 0; 
	var intValue = 0;
	var intProhLev = 0;
	var blnProhibited = true;
	var intNumPairs = ProhibitedSet.length;

	for (i = 0; i < intNumPairs; i++)
	{
		AttLevPair = ProhibitedSet[i];		
		intProhAtt = AttLevPair[0];
		intProhLev = AttLevPair[1];

		//The att might not exist if they are using constructed lists
		if (document.mainform[BYOObj.strQName + "_" + intProhAtt] && this.BYOAttVisible(intProhAtt))
		{
			InputObj = document.mainform[BYOObj.strQName + "_" + intProhAtt];

			if (BYOObj.strInputType == "radio") 
			{
				intValue = SSI_GetRadioValueChecked(BYOObj.strQName + "_" + intProhAtt);
			}
			else if (BYOObj.strInputType == "combo") 
			{
				intValue = InputObj.value;
			}

			if (intValue != intProhLev)
			{
				blnProhibited = false;
				break;
			}
		}
		else
		{
			blnProhibited = false;
			break;
		}
	}
			
	return blnProhibited;
}

function SSI_BYOProhHighlight (ProhibitedSet, blnHighlight)
{
	var RowObj = 0;
	var i = 0;
	var	intNumPairs = ProhibitedSet.length;
	var AttLevPair = 0;
	var intProhAtt = 0;
	var intProhLev = 0;

	for (i = 0; i < intNumPairs; i++)
	{
		AttLevPair = ProhibitedSet[i]; 
		intProhAtt = AttLevPair[0];
		intProhLev = AttLevPair[1];

		RowObj = jQuery("#" + this.strQName + "_" + intProhAtt + "_error");

		if (RowObj)
		{
			if (blnHighlight)
			{
				RowObj.addClass("acbc_proh_error");
			}
			else
			{
				RowObj.removeClass("acbc_proh_error");
			}

			RowObj.removeClass("acbc_price_change_warning");
		}
	}
}

function SSI_BYOProhEvent()
{
	if (this.CurrentProhibitedSet)
	{
		if (this.BYOCheckProhibitedSet(this.CurrentProhibitedSet))
		{
			this.BYOProhHighlight(this.CurrentProhibitedSet, true);
		}
		else
		{
			this.BYOProhHighlight(this.CurrentProhibitedSet, false);
		}
	}
}

function SSI_BYOCondText(blnInitialize, intCurrentAttIndex)
{
	var BYOObj = this;
	var i = 0;
	var j = 0;
	var k = 0;
	var AttArray = 0;
	var CondAttHash = new SSIHash();

	for(i = 0; i < BYOObj.AltSpecificRules.length; i++)
	{
		CondAttHash.set(BYOObj.AltSpecificRules[i][1], 1);
	}

	for (i = 0; i < BYOObj.CondRelationshipsArray.length; i++)
	{
		AttArray = BYOObj.CondRelationshipsArray[i];

		//Search and see if current attribute is in this relationship
		for (j = 0; j < AttArray.length; j++)
		{
			//If current att or conditional att
			if (blnInitialize || AttArray[j] == intCurrentAttIndex || jQuery("#" + BYOObj.strQName + "_row_" + AttArray[j]).hasClass("conditional_att"))
			{
				var strAnswerList = "";
				var intLevel = 0;
				var intAtt = 0;

				//Get answers for each attribute
				for (k = 0; k < AttArray.length; k++)
				{
					intAtt = AttArray[k];

					if(BYOObj.BYOAttVisible(intAtt))
					{
						intLevel = BYOObj.BYOGetLevelValue(BYOObj.strQName + "_" + intAtt);	
					}
					else
					{
						intLevel = 0;
					}
					
					//If att is alt specific conditional and a conditional display, then when it is not visible treat it as a 0.
					if ((intLevel > 0 && BYOObj.BYOAttVisible(intAtt)) || (CondAttHash.has(intAtt) && !BYOObj.BYOAttVisible(intAtt)))
					{
						strAnswerList += "A-" + intAtt + " L-" + intLevel;
						strAnswerList += ",";
					}
					else
					{
						strAnswerList = "";
						break;
					}
				}

				var intRelIndex = BYOObj.CondRelationshipsIndexArray[i];
				var strViewerName = "#" + BYOObj.strQName + "_rel_" + intRelIndex;

				//Make sure that the viewer is available before assigning to it.
				if (jQuery(strViewerName).length)
				{
					//Make copy of strQName because can't use "this" inside of function below.
					var strQName = BYOObj.strQName;

					jQuery.get("ciwweb" + BYOObj.strScriptExtension, { 
							hid_studyname: BYOObj.strStudyName, 
							hid_respnum: BYOObj.strRespNum,
							hid_pagenum: BYOObj.intPageNum,
							sys_acbc_name: BYOObj.strQName,
							sys_acbc_cond_rel: intRelIndex,
							sys_acbc_byo_request: strAnswerList,
							sys_time: new Date().getTime()
						},
						function(strResponse)
						{
							var intCommaIndex = strResponse.indexOf(",");
							var intIndex = strResponse.substr(0, intCommaIndex);
							var strHTML = strResponse.substr(intCommaIndex + 1);
							var strViewerName = strQName + "_rel_" + intIndex;						
							jQuery("#" + strViewerName).html(strHTML);
						}
					);

					break;
				}
			}
		}
	}
}
				
function SSI_BYOCondPrice(blnShowAlert)
{
	var BYOObj = this;
	var ChangedAttLevArray = []; 
	var CondPriceRel = 0; 
	var i = 0; 
	var intReplaceAtt = 0; 
	var intReplaceLev = 0;
	var intPriceChange = 0; 
	var blnCondLevSelected = true; 
	var intSelLev = 0; 
	var intCondLev = 0; 
	var InputObj = 0;
	var intCondAtt = 0; 
	var intOldPrice = 0; 
	var intNewPrice = 0; 
	var PriceBoxObj = 0; 
	var blnPriceChanged = false;

	var LocalPricesArray = SSI_DeepCopyArray(BYOObj.OriginalPricesArray);

	for(i = 0; i < BYOObj.CondPriceArray.length; i++)
	{
		blnCondLevSelected = true;
		CondPriceRel = BYOObj.CondPriceArray[i];

		for(j = 0; j < CondPriceRel.length; j++)
		{
			if (j == 0)
			{
				intReplaceAtt = CondPriceRel[j][0];
				intReplaceLev = CondPriceRel[j][1];
				intPriceChange = CondPriceRel[j][2];

				//This is to check and see if the item to change exists
				if (jQuery("#" + BYOObj.strQName + "_" + intReplaceAtt + "_" + intReplaceLev + "_label").length)
				{
					ChangedAttLevArray.push([intReplaceAtt, intReplaceLev]);
				}
				else
				{
					blnCondLevSelected = false;
					break;
				}
			}
			else
			{
				intCondAtt = CondPriceRel[j][0];
				intCondLev = CondPriceRel[j][1];
				intSelLev = BYOObj.BYOGetLevelValue(BYOObj.strQName + "_" + intCondAtt);

				if (intSelLev != intCondLev || !BYOObj.BYOAttVisible(intCondAtt))
				{
					blnCondLevSelected = false;
					break;
				}
			}
		}

		if (blnCondLevSelected)
		{
			intOldPrice = LocalPricesArray[intReplaceAtt][intReplaceLev - 1];
			intNewPrice = SSI_ConvertToNumber(intOldPrice) + SSI_ConvertToNumber(intPriceChange);
			LocalPricesArray[intReplaceAtt][intReplaceLev - 1] = intNewPrice;
		}
	}

	var OldPricesArray = SSI_DeepCopyArray(BYOObj.PricesArray);
	BYOObj.PricesArray = LocalPricesArray;
	BYOObj.BYOTotal(0);
	BYOObj.BYOChangePriceInLabels(ChangedAttLevArray);

	//Save changed prices to data file
	var ChangedPricesArray = [];
	var strChangedPrices = "";
	
	for(i = 0; i < ChangedAttLevArray.length; i++)
	{
		intReplaceAtt = ChangedAttLevArray[i][0];
		ChangedPricesArray = BYOObj.PricesArray[intReplaceAtt];
		strChangedPrices = ChangedPricesArray.join(",");

		document.mainform[BYOObj.strQName + "_" + intReplaceAtt + "_prices"].value = strChangedPrices;
	}

	if(blnShowAlert)
	{
		BYOObj.BYOPriceChangeAlert(OldPricesArray, LocalPricesArray);
	}
}

function SSI_BYOPriceChangeAlert(OldPricesArray, NewPricesArray)
{
	var OriginalLevArray = [];
	var NewLevArray = [];
	var i = 0; var j = 0;
	var blnPriceChanged = false;
	var intSelLev = 0;

	for (i = 0; i < this.AttIndexArray.length; i++)
	{
		OriginalLevArray = OldPricesArray[this.AttIndexArray[i]];
		NewLevArray = NewPricesArray[this.AttIndexArray[i]];

		for (j = 0; j < OriginalLevArray.length; j++)
		{
			if (OriginalLevArray[j] != NewLevArray[j])
			{
				intSelLev = this.BYOGetLevelValue(this.strQName + "_" + this.AttIndexArray[i]);
				
				if (intSelLev > 0)
				{
					blnPriceChanged = true;
					jQuery("#" + this.strQName + "_row_" + this.AttIndexArray[i]).addClass("acbc_price_change_warning");
					break;
				}
			}
		}
	}

	if (blnPriceChanged)
	{
		strMessage = SSI_ReplaceErrMsgKeyWords(this.strCondPriceErrorMsg, this.intQuestNum, this.strQName, this.strErrText, 0, 0);

		alert(strMessage);
	}
}

function SSI_ConvertToNumber(intNumber)
{
	intNumber = parseFloat(intNumber);
	
	if(isNaN(intNumber))
	{
		intNumber = 0;
	}
	
	return intNumber;
}

function SSI_BYOChangePriceInLabels(ChangedAttLevArray)
{
	var intAtt = 0; 
	var intLev = 0; 
	var intPrice = 0;
	var strPostFixLabel = "";
	var strFormattedPrice = "";
	var LabelObj = 0;

	//Set price labels
	for (i = 0; i < ChangedAttLevArray.length; i++ )
	{
		intAtt = ChangedAttLevArray[i][0];
		intLev = ChangedAttLevArray[i][1];
		LabelObj = jQuery("#" + this.strQName + "_" + intAtt + "_" + intLev + "_label");
		
		if (LabelObj.length)
		{
			intPrice = this.PricesArray[intAtt][intLev - 1];
			strPostFixLabel = "";
			
			if (intPrice > 0)
			{
				strPostFixLabel = this.strCondPricePossError;
			}
			else if(intPrice == 0)
			{
				strPostFixLabel = this.strCondPriceNeutralError;
			}
			else if(intPrice < 0)
			{
				strPostFixLabel = this.strCondPriceNegError;
				//Change it to positive
				intPrice *= -1;
			}
		
			strFormattedPrice = SSI_RoundNumber(intPrice, this.intNumDecimalPlaces);
			strFormattedPrice = SSI_PriceFormat(strFormattedPrice, this.strThousandSeparator, this.strDecimalSeparator, this.intNumDecimalPlaces);

			if(this.strCurrencyPosition == "left")
			{
				strFormattedPrice = this.strCurrencySymbol + strFormattedPrice;
			}
			else
			{
				strFormattedPrice += this.strCurrencySymbol;
			}

			//Note, there was a bug in Safari with str.replace and regular expressions when replace with text was $0.
			var strFuncName = "[%ACBCPRICELEVELTEXT()%]";
			while(strPostFixLabel.indexOf(strFuncName) > -1)
			{
				var intStartIndex = strPostFixLabel.indexOf(strFuncName);
				var intLength = strFuncName.length;
				strPostFixLabel = strPostFixLabel.substr(0, intStartIndex) + strFormattedPrice + strPostFixLabel.substr(intStartIndex + intLength);
			}

			if(this.strInputType == "radio")
			{
				var PriceTextObj = LabelObj.find(".acbc_byo_price_text");
				PriceTextObj.html(" " + strPostFixLabel);
			}
			else if(this.strInputType == "combo")
			{
				var TemplateLabelObj = LabelObj.closest(".level_text_cell").find(".combo_label_" + intLev).clone();
				
				var PriceTextObj = TemplateLabelObj.find(".acbc_byo_price_text");
				PriceTextObj.replaceWith(" " + strPostFixLabel);
		
				LabelObj.html(TemplateLabelObj.html());
			}
			
		}
	}
}

function SSI_BYOGetLevelValue(strVarName)
{
	var InputObj = document.mainform[strVarName];
	var intChoice = 0;

	//If the attribute is missing because it has been removed from the BYO, then there should be a hidden value with the top level in it.
	//This could be hidden, combo box, or a single radio
	if (InputObj)
	{
		if(InputObj.value)
		{
			intChoice = InputObj.value;
		}
		else
		{
			intChoice = SSI_GetRadioValueChecked(strVarName);
		}
	}
	
	return intChoice;
}

function CastToInt(strNumber)
{
	return (parseInt(strNumber) + 0);
}

function SSI_SetupToolTips()
{
	var strLinkName = ""; 
	var strTipTextName = "";

	jQuery(".tool_tip_link").each(function(){
		jQuery(this).mousemove(function(event){
			jQuery(this).addClass("tool_tip_link_mouseover");

			var TipTextObj = jQuery(this).next(".tool_tip_text");

			TipTextObj.show();

			var x = event.pageX; 
			var y = event.pageY;

			var intXpos = x + 18;
			var intYpos = y + 18;
			
			var intPageWidth = jQuery("body").width();

			//If we are going out of bounds on the right edge then move the tip text to the left.
			if (x + parseInt(TipTextObj.width()) > intPageWidth + 5)
			{
				intXpos -= parseInt(TipTextObj.width()) + 18;
			}

			TipTextObj.css({'left': intXpos, 'top': intYpos});
		});

		jQuery(this).mouseout(function(event){
			jQuery(this).removeClass("tool_tip_link_mouseover");

			var TipTextObj = jQuery(this).next(".tool_tip_text");

			TipTextObj.hide();
		});
	});
}

function SSI_SliderSetup(strQName, intScaleMin, intScaleMax, blnListItemsAsValues, blnUseAltValues, ItemValuesArray, blnShowToolTip, PreviousAnswers, strHandlePosition, intCustomValuePos, blnHasItemsFlipped)
{
	var OriginalAnchorPoints = [];
	var FlippedAnchorPoints = [];
	var FlippedItemValuesArray = [];
	var i = 0;
	var j = 0;

	if (blnListItemsAsValues)
	{
		OriginalAnchorPoints = SSI_FindAnchorSliderPoints(strQName, ItemValuesArray);
		intScaleMin = 1;
		intScaleMax = 1000;

		if (blnHasItemsFlipped)
		{
			var FlippedItemArray = ItemValuesArray.slice(0); //Copy array
			FlippedItemArray.reverse();
			FlippedAnchorPoints = SSI_FindAnchorSliderPoints(strQName, FlippedItemArray);
		}
	}
	else if(blnUseAltValues)
	{
		if (blnHasItemsFlipped)
		{
			FlippedItemValuesArray = ItemValuesArray.slice(0); //Copy array
			FlippedItemValuesArray.reverse();
		}
	}

	var CurrentAnswers = [];

	//This is to handle a case where they answer and then click refresh on the browser
	jQuery("#" + strQName + "_div .slider_container").each(function(){

		var SliderControl = jQuery(this).find(".slider_control");
		var SliderInputObj = jQuery(this).find("input");
		var intValue = SliderInputObj[0].value;

		if(intValue !== "")
		{
			var intID = this.id.replace(strQName + "_", "");
			CurrentAnswers.push([intID, intValue]);
		}
	});

	if (CurrentAnswers.length)
	{
		PreviousAnswers = CurrentAnswers;
	}

	jQuery("#" + strQName + "_div .slider_container").each(function(){

		var SliderControl = jQuery(this).find(".slider_control");
		var SliderInput = jQuery(this).find("input");
		var SliderToolTip = 0;
		var blnFlipScale = false;
		var AnchorPoints = [];
		var AltValuesArray = [];

		if (SliderControl.hasClass("flip_scale"))
		{
			blnFlipScale = true;
		}

		if (blnListItemsAsValues)
		{
			if (blnFlipScale)
			{
				AnchorPoints = FlippedAnchorPoints;
			}
			else
			{
				AnchorPoints = OriginalAnchorPoints;
			}
		}
		else if(blnUseAltValues)
		{
			if (blnFlipScale)
			{
				AltValuesArray = FlippedItemValuesArray;
			}
			else
			{
				AltValuesArray = ItemValuesArray;
			}
		}
		
		if(blnShowToolTip)
		{
			jQuery(this).find(".slider_tool_tip");
			SliderToolTip.hide();
		}
		
		SliderControl.slider({
			
			 min: intScaleMin,
			 max: intScaleMax,
			 start: function(e, ui){
				if(blnShowToolTip)
				{
					SliderToolTip.fadeIn('fast');
				}
			 },

			change: function(e, ui){
				if(blnShowToolTip)
				{
					SSI_ShowSliderToolTip(ui, SliderToolTip);
				}
			},

			slide: function(e, ui){

				jQuery(this).addClass("touched");

				if(blnShowToolTip)
				{
					SSI_ShowSliderToolTip(ui, SliderToolTip);
				}
			},

			stop: function(e, ui){

				//This fixes the case when they just click on the slider without sliding it.
				if(jQuery(this).hasClass("touched"))
				{
					var intValue = 0;
					var intPosValue = 0;
					
					if (blnListItemsAsValues)
					{
						var ResultArray = 0;
						
						if (blnFlipScale)
						{
							var ReversedScale = AnchorPoints;

							ReversedScale.reverse();
							ResultArray = SSI_FindSliderListValue(ui.value, ReversedScale, intScaleMax, ui);
						}
						else
						{
							ResultArray = SSI_FindSliderListValue(ui.value, AnchorPoints, intScaleMax, ui);
						}
						
						intValue = ResultArray[0];
						intPosValue = ResultArray[1];
					}
					else if(blnUseAltValues)
					{
						intValue = AltValuesArray[ui.value - 1];
						intPosValue = ui.value;
					}
					else
					{
						if (blnFlipScale)
						{
							intValue = SSI_FlipNumericScale(ui.value, intScaleMin, intScaleMax);
						}
						else
						{
							intValue = ui.value;
						}

						intPosValue = ui.value;
					}

					SSI_SetSliderValue(jQuery(this), SliderInput, intValue, intPosValue, strHandlePosition);

					jQuery(this).addClass("touched");
				}
			}
		});

		// To get left do nothing
		if(strHandlePosition == "center")
		{
			jQuery(this).find(".ui-slider-handle").css("left", "50%");	
		}
		else if(strHandlePosition == "right")
		{
			jQuery(this).find(".ui-slider-handle").css("left", "100%");
		}
		else if(strHandlePosition == "custom")
		{
			//Set the original value positions not the random ones.
			var intActualPos = intCustomValuePos;

			if (blnListItemsAsValues)
			{
				intActualPos = SSI_FindSliderPosition(intCustomValuePos, OriginalAnchorPoints, intScaleMax, this);
			}
			else if (blnUseAltValues)
			{
				for (j = 0; j < ItemValuesArray.length; j++)
				{
					if(intCustomValuePos == ItemValuesArray[j])
					{
						intActualPos = j + 1;

						break;
					}
				}
			}

			SSI_SetSliderPosition(jQuery(this).find(".slider_control"), intActualPos);
		}
		else if(strHandlePosition == "invisible")
		{
			var SliderHandle = jQuery(this).find(".ui-slider-handle");
			SliderHandle.hide();
		}

		//Restore previous answers
		if(PreviousAnswers.length)
		{
			var intID = this.id.replace(strQName + "_", "");
			var intValue = 0;
			var intPosValue = 0;

			for (i = 0; i < PreviousAnswers.length; i++)
			{
				if(PreviousAnswers[i][0] == intID)
				{
					intValue = PreviousAnswers[i][1];
					intPosValue = 0;

					if (blnListItemsAsValues)
					{
						intPosValue = SSI_FindSliderPosition(intValue, AnchorPoints, intScaleMax, this);
					}
					else if (blnUseAltValues)
					{
						for (j = 0; j < AltValuesArray.length; j++)
						{
							if(intValue == AltValuesArray[j])
							{
								intPosValue = j + 1;

								break;
							}
						}
					}
					else
					{
						if (blnFlipScale)
						{
							intPosValue = SSI_FlipNumericScale(intValue, intScaleMin, intScaleMax);
						}
						else
						{
							intPosValue = intValue;
						}
					}

					SSI_SetSliderValue(jQuery(this).find(".slider_control"), SliderInput, intValue, intPosValue, strHandlePosition);

					break;
				}
			}
		}
	});
}

function SSI_FlipNumericScale(intValue, intScaleMin, intScaleMax)
{
	var intNumFromLeft = intValue - intScaleMin;

	return intScaleMax - intNumFromLeft;
}

function SSI_SetSliderValue(SliderControlObj, SliderInputObj, intValue, intPosValue, strHandlePosition)
{
	SliderControlObj.slider('value', intPosValue);

	SliderInputObj[0].value = intValue;

	if (strHandlePosition == "invisible")
	{
		var SliderHandle = SliderControlObj.find(".ui-slider-handle");
		SliderHandle.show();
	}
}

function SSI_SetSliderPosition(SliderControlObj, intPosValue)
{
	SliderControlObj.slider('value', intPosValue);
}

function SSI_ShowSliderToolTip(ui, SliderToolTip)
{
	var intHandlePos = jQuery(ui.handle).css("left"); 

	var intWidthToolTip = SliderToolTip.css("width");
	var intToolTipPos = SSI_RoundNumber(intHandlePos, 0) - SSI_RoundNumber(intWidthToolTip, 0) / 2;

	intToolTipPos += "px";

	SliderToolTip.css("left", intToolTipPos).text(ui.value);
}

function SSI_FindAnchorSliderPoints(strQName, ItemValuesArray)
{
	var ColLabels = jQuery("#" + strQName + "_div").find(".col_label_cell");

	var intTotalWidth = 0;
	var WidthsArray = [];
	var intColWidth = 0;
	var i = 0;

	ColLabels.each(function(){
		intColWidth = SSI_RoundNumber(jQuery(this).css("width"), 1);
		intColWidth += SSI_RoundNumber(jQuery(this).css("padding-left"), 0);
		intColWidth += SSI_RoundNumber(jQuery(this).css("padding-right"), 0);

		WidthsArray.push(intColWidth);
		intTotalWidth += intColWidth;
	});

	var PercentArray = [];
	var intLeftBound = 0;
	var intRightBound = 0;
	var intWidthValue = 0;

	for(i = 0; i < WidthsArray.length; i++)
	{
		intWidthValue = SSI_RoundNumber((WidthsArray[i] / intTotalWidth) * 100, 3);
		intRightBound = SSI_RoundNumber(intRightBound + intWidthValue, 3);

		//If it is the last item make sure it goes to 100%
		if (intRightBound > 100 || (i + 1 == WidthsArray.length))
		{
			intRightBound = 100;
		}

		PercentArray.push([intLeftBound, intRightBound, ItemValuesArray[i]]);

		intLeftBound = intRightBound;
	}

	return PercentArray;
}

function SSI_FindSliderListValue(intPosValue, AnchorPoints, intMax, ui)
{
	var i = 0;
	var intLeftBound = 0;
	var intRightBound = 0;
	var intListValue = 0;

	intPosValue = SSI_RoundNumber((intPosValue / intMax) * 100, 1);

	for(i = 0; i < AnchorPoints.length; i++)
	{
		intLeftBound = AnchorPoints[i][0];
		intRightBound = AnchorPoints[i][1];
		intListValue = 0;

		if (intPosValue >= intLeftBound && intPosValue <= intRightBound)
		{
			intPosValue = SSI_GetHandleCenterPoint(AnchorPoints, intLeftBound, intRightBound, intPosValue, ui.handle);

			intListValue = AnchorPoints[i][2];

			break;
		}
	}


	return [intListValue, intPosValue];
}

function SSI_FindSliderPosition(intValue, AnchorPoints, intMax, SliderObj)
{
	var i = 0;
	var intPosValue = 0;

	for(i = 0; i < AnchorPoints.length; i++)
	{
		intLeftBound = AnchorPoints[i][0];
		intRightBound = AnchorPoints[i][1];
		intListValue = AnchorPoints[i][2];

		if(intValue == intListValue)
		{
			intPosValue = SSI_GetHandleCenterPoint(AnchorPoints, intLeftBound, intRightBound, intValue, jQuery(SliderObj).find(".ui-slider-handle"));
		}
	}
	
	return intPosValue;
}

function SSI_GetHandleCenterPoint(AnchorPoints, intLeftBound, intRightBound, intPosValue, HandleObj)
{
	var intCellCenterPoint = 0;

	//Only snap to middle for relatively small scales.
	if(AnchorPoints.length < 50)
	{
		intCellCenterPoint = parseInt((((intRightBound - intLeftBound) / 2) + intLeftBound));

		var intHandleWidth = parseInt(jQuery(HandleObj).css("width"));
		var intControlWidth = parseInt(jQuery(HandleObj).closest(".slider_control").css("width"));
		var intHandlePercentage = parseInt((intHandleWidth / intControlWidth) * 100);
		
		if(intCellCenterPoint > 50)
		{
			intCellCenterPoint += (intCellCenterPoint / 100) * intHandlePercentage * .3;

			if(intCellCenterPoint > 100)
			{
				intCellCenterPoint = 100;
			}
			
		}
		else if(intCellCenterPoint < 50)
		{
			intCellCenterPoint -= ((100 - intCellCenterPoint) / 100) * intHandlePercentage * .3;

			if(intCellCenterPoint < 0)
			{
				intCellCenterPoint = 0;
			}
		}
	}
	else
	{
		intCellCenterPoint = intPosValue;
	}

	intPosValue = intCellCenterPoint * 10;

	intPosValue = SSI_RoundNumber(intPosValue, 1);

	return intPosValue;
}
