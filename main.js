var submittedImage = "";
var image;
var name;
var id;

var dateLoop;

preload();

function preload() {
    forceHTTPS();
}

function load() {
    setupFastClick();
    setupFileUpload();
    loadLastID();
    setupFullscreenListener();
    checkIdURL();
}

function loadLastID() {
    if (localStorage.getItem("lastID")) {
        var lastID = JSON.parse(localStorage.getItem("lastID"));
        document.getElementById("name-input").value = lastID.name;
        document.getElementById("id-input").value = lastID.id;
        document.getElementById("file-input").required = false;
        submittedImage = lastID.image;
        var imageElement = document.getElementById("picture");
        imageElement.src = submittedImage;
        imageElement.style.display = "block";
    }
}

function forceHTTPS() {
    if (location.protocol !== "https:" &&
        !location.href.match(
            /\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/ig
        ))
        location.protocol = "https:";
}

function setupFastClick() {
    FastClick.attach(document.body);
}

function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => fileChange(e.target.files[0]));
}

function checkIdURL() {
    if (this.location.hash !== "") {
        document.getElementById("id-input").value = this.location.hash.slice(1);
    }
}

function getDateString() {
    var days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday", "Friday",
        "Saturday"
    ];

    var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    var date = new Date();
    var day = days[date.getDay()];
    var month = months[date.getMonth()];
    var monthDay = date.getDate();
    var year = date.getFullYear();
    var hours = date.getHours();
    var timeSide = "AM"
    var minutes = forceDoubleDigit(date.getMinutes());
    var seconds = forceDoubleDigit(date.getSeconds());

    if (hours >= 12) {
        timeSide = "PM";
        if (hours > 12) {
            hours -= 12;
        }
    }
    return day + ", " + month + " " + monthDay + ", " + year + " " + hours + ":" + minutes + ":" + seconds + " " + timeSide;
}

function forceDoubleDigit(number) {
    if ((number + "").length == 1) {
        return "0" + number;
    }
    return number;
}

function onShowProfile(id) {
    document.getElementById("date").innerHTML = getDateString();
    dateLoop = setInterval(() => {
        document.getElementById("date").innerHTML = getDateString()
    }, 1000);

    generateBarcodeFromStudentID(id);
}

function generateBarcodeFromStudentID(studentID) {
    return JsBarcode("#student-id-barcode", studentID, {
        format: "CODE39",
        width: 4,
        height: 40,
        displayValue: false
    });
}

function isIos() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

function formSubmit() {
    submit();
}

function submit() {
    var idVal = document.getElementById("id-input").value;
    id = idVal;
    name = document.getElementById("name-input").value;
    image = document.getElementById("file-input").value;
    document.getElementById("wrapper").innerHTML =
        `
        <div id="nav-bar">
            <img id="nav-left" src="images/navleft.png" />
            <img id="nav-right" src="images/navright.png" />
        </div>
        <div id="side-bar">
            
        </div>

        <img id="gcu-banner" src="images/gcubanner.png" />
        <div id="picture-wrapper">
            <div class="fill"><img id="picture" src="${submittedImage}"></div>
        </div>
        <div id="name">
            ${name}
        </div>
        <div id="date"></div>
        <div id="barcode">
            <img id="student-id-barcode" />
        </div>
        `;

    onShowProfile(idVal);

    localStorage.setItem("lastID", JSON.stringify({
        name: name,
        id: id,
        image: submittedImage
    }));

    var imageElements = document.getElementsByTagName("img");
    for (var i = 0; i < imageElements.length; i++) {
        preventLongPressMenu(imageElements[i]);
    }

    if (!window.matchMedia('(display-mode: standalone)').matches) {
        document.documentElement.requestFullscreen();
    } else {
        window.history.pushState({}, '');
    }
}

function fileChange(file) {
    let imageElement = document.getElementById("picture");

    function callback(url) {
        imageElement.src = url;
        submittedImage = url;
        imageElement.style.display = "block";
        document.getElementById("file-input").required = false;
    }
    readURL(file, callback);
}

function readURL(input, callback) {
    var reader = new FileReader();

    reader.onload = function (e) {
        callback(e.target.result);
    };

    reader.readAsDataURL(input);
}

function setupFullscreenListener() {
    if (document.addEventListener) {
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
    }
}

function formPage() {
    clearInterval(dateLoop);

    document.getElementById("wrapper").innerHTML =
        `
        <div id="nav-bar">
            <div id="nav-text">Mock Student ID</div>
        </div>
        <form action="javascript:formSubmit();">
            <input id="name-input" type="text" placeholder="Name" value=${name} required>
            <input id="id-input" type="number" placeholder="Student ID" value=${id} maxlength=8 required>
            <label class="fileContainer">
                Upload Image
                <input id="file-input" type="file" accept="image/*" required>
            </label>
            <div id="image-placeholder">
                <div class="fill"><img id="picture" src=${submittedImage}></div>
            </div>
            <button id="create-btn" type="submit">Create Fake ID</button>
        </form>
        `;
    setupFileUpload();
    document.getElementById("file-input").required = false;
}

function exitHandler() {
    if (!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement !==
            null)) {
        formPage();
    }
}

window.addEventListener('popstate', function () {
    formPage();
})

function nullEvent(event) {
    var e = event || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

function preventLongPressMenu(node) {
    node.ontouchstart = nullEvent;
    node.ontouchmove = nullEvent;
    node.ontouchend = nullEvent;
    node.ontouchcancel = nullEvent;
}