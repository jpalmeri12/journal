var year = 0;
var month = 0;
var day = 0;

var months = {
    1: {
        "name": "January",
        "days": 31
    },
    2: {
        "name": "February",
        "days": 28
    },
    3: {
        "name": "March",
        "days": 31
    },
    4: {
        "name": "April",
        "days": 30
    },
    5: {
        "name": "May",
        "days": 31
    },
    6: {
        "name": "June",
        "days": 30
    },
    7: {
        "name": "July",
        "days": 31
    },
    8: {
        "name": "August",
        "days": 31
    },
    9: {
        "name": "September",
        "days": 30
    },
    10: {
        "name": "October",
        "days": 31
    },
    11: {
        "name": "November",
        "days": 30
    },
    12: {
        "name": "December",
        "days": 31
    }
};

var records = {};

// Runs on start
$(function () {
    setDate();
    initTextboxHandlers();
    initSaveButton();
    initPageButtons();
    login();
});

// Get the date and set variables to it
function setDate() {
    var now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
}

// Load user data and show appropriate screen
function login() {
    // Load data first
    var rec = localStorage.getItem("gprjournal");
    if (rec == null) {
        // New user
        checkLocalStorage();
        showScreen("aboutScreen");
    } else {
        // Existing data
        records = JSON.parse(rec);
        showScreen("welcomeScreen");
    }
}

// Alerts the user if local storage is not available
function checkLocalStorage() {
    if (!storageAvailable('localStorage')) {
        $("#aboutContinue").css("visibility", "hidden");
        $(".aboutError").css("opacity", 1);
    }
}

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

// Show a particular screen
function showScreen(scr) {
    $(".screenBox.anim_fadeIn").removeClass("anim_fadeIn").addClass("anim_fadeOut");
    setTimeout(function () {
        $("#" + scr).removeClass("anim_fadeOut").addClass("anim_fadeIn");
    }, 250);
    if (scr == "entryScreen") {
        updateEntryScreen();
    } else if (scr == "recordScreen") {
        updateRecordScreen();
    }
}

// Updates the entry screen
function updateEntryScreen() {
    var monthName = months[month].name;
    var monthDays = months[month].days;
    $("#monthText").text(monthName);
    $("#dayText").text("On this day, " + monthName + " " + day + ", " + year + ":");
    $("#dayCircles").empty();
    for (var i = 1; i <= monthDays; i++) {
        $("#dayCircles").append('<span id="dayCircle' + i + '">•</span>');
        var color = "#d0d0d0";
        if (records[year] != undefined && records[year][month] != undefined && records[year][month][i] != undefined) {
            color = "#2ab673";
        } else if (i == day) {
            color = "#efe74b";
        }
        $("#dayCircle" + i).css("color", color);
    }
    if (records[year] != undefined && records[year][month] != undefined && records[year][month][day] != undefined) {
        var r = records[year][month][day];
        $("#inputBox0>.inputInput").val(r.thanks);
        $("#inputBox1>.inputInput").val(r.prayer);
        $("#inputBox2>.inputInput").val(r.reflect);
    } else {
        for (var i = 0; i < 3; i++) {
            $("#inputBox" + i + ">.inputInput").val("");
        }
    }
    checkValidInput();
}

function initTextboxHandlers() {
    $(".inputBox").change(function () {
        checkValidInput();
    });
}

function checkValidInput() {
    $("#okButtonText").text("Save");
    $("#okButtonBox").removeClass("anim_exitSaveButton").addClass("anim_enterSaveButton");
    if (isValidInput()) {
        $("#okButton").removeClass("anim_buttonFadeGray").addClass("anim_buttonFadeGreen");
    } else {
        $("#okButton.anim_buttonFadeGreen").removeClass("anim_buttonFadeGreen").addClass("anim_buttonFadeGray");
    }
}

function isValidInput() {
    var isValid = true;
    for (var i = 0; i < 3; i++) {
        var v = $("#inputBox" + i + ">.inputInput").val();
        if (v == "") {
            isValid = false;
        }
    }
    return isValid;
}

function initSaveButton() {
    $("#okButton").click(function () {
        if (isValidInput()) {
            saveResponse();
        }
    });
}

function saveResponse() {
    if (records[year] == undefined) {
        records[year] = {};
    }
    if (records[year][month] == undefined) {
        records[year][month] = {};
    }
    records[year][month][day] = {
        thanks: $("#inputBox0>.inputInput").val(),
        prayer: $("#inputBox1>.inputInput").val(),
        reflect: $("#inputBox2>.inputInput").val()
    };
    updateEntryScreen();
    $("#okButtonText").text("Saved");
    $("#okButtonBox").removeClass("anim_enterSaveButton").addClass("anim_exitSaveButton");
    var toSave = JSON.stringify(records);
    localStorage.setItem("gprjournal", toSave);
}

function initPageButtons() {
    $(".continueButton").click(function () {
        showScreen("entryScreen");
    });
    $("#infoButton").click(function () {
        showScreen("aboutScreen");
    });
    $("#recordButton").click(function () {
        showScreen("recordScreen");
    });
}

function updateRecordScreen() {
    $("#recordBox").empty();
    var str = "";
    var y = Object.keys(records);
    y.sort(function (a, b) {
        return parseInt(b) - parseInt(a);
    });
    for (var i = 0; i < y.length; i++) {
        var m = Object.keys(records[y[i]]);
        m.sort(function (a, b) {
            return parseInt(b) - parseInt(a);
        });
        for (var j = 0; j < m.length; j++) {
            // Month header
            str += '<span class="recordHeader">• ' + months[m[j]].name + ' ' + y[i] + ' •</span><br>';
            if (y[i] < year || m[j] < month) {
                var d = Object.keys(records[y[i]][m[j]]);
                d.sort(function (a, b) {
                    return parseInt(a) - parseInt(b);
                });
                // Three lists
                for (var k = 0; k < 3; k++) {
                    // List header
                    var prompts = ["This month, I have been thankful for:", "This month, I have prayed:", "This month, I noticed God in my life when:"];
                    var props = ["thanks", "prayer", "reflect"];
                    str += '<span class="recordPrompt">' + prompts[k] + '</span><br>';
                    for (var l = 0; l < d.length; l++) {
                        var item = records[y[i]][m[j]][d[l]][props[k]];
                        str += '<span class="recordItem">• ' + item + '</span><br>';
                    }
                }
                str += '<br>';
            } else {
                str += '<span class="recordPrompt">Still in progress. Check back at the end of the month!</span><br><br>';
            }
        }
    }
    if (y.length == 0) {
        str += '<span class="recordPrompt">Nothing here yet. After you log some journal entries, they\'ll appear here at the end of the month!</span><br><br>';
    }
    $("#recordBox").html(str);
}