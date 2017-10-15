Ti.include('common.js');
Ti.include('db.js');

// Define Globals

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var currLat = 0;
var currLong = 0;

var eateries = [];

// End of Globals

//Helper functions

function getCurrentCoordinates() {
    //Set Brisbane lat and long
    var latitude = -27.4633052;
    var longitude = 153.0257628;

    if (Ti.Network.online) {
        Ti.Geolocation.purpose = "Receive User Location";
        Titanium.Geolocation.getCurrentPosition(function (e) {
            if (!e.success || e.error) {
                console.log('Could not find the device location');
                console.log("Defaulting latitude: " + latitude + " and longitude: " + longitude);
                return;
            }
            longitude = e.coords.longitude;
            latitude = e.coords.latitude;

        });
    } else {
        console.log("Internet connection is required for geolocation");
        console.log("Defaulting latitude: " + latitude + " and longitude: " + longitude);
    }
    currLat = latitude;
    currLong = longitude;
    return {latitude: latitude, longitude: longitude};

}

function eateryInfoParse(eatery) {
    var ratingStr = eatery.user_rating.aggregate_rating + '/5';
    var avgCostStr = eatery.currency + eatery.average_cost_for_two / 2 + ' per person';
    var distanceStr = distance(currLat, currLong, eatery.location.latitude, eatery.location.longitude) + ' km';

    var retVal = {
        id: eatery.id,
        name: eatery.name,
        address: eatery.location.address,
        distance: distanceStr,
        cuisines: eatery.cuisines,
        rating: ratingStr,
        cost: avgCostStr
    };
    return retVal;
}

function handleEatery(win) {
    if (eateries.length == 0) {
        console.log("No eatery found");
        win.removeAllChildren();
        win.add(constructLabel(10, 'Could not find any eatery :(', 'center'));
        setTryAgainButton(win);
        return;
    }
    var eatery = eateryInfoParse(eateries[0].restaurant);

    displayEatery(win, 30, 'mainDisplay', eatery);

}

function handleAcceptEatery(win) {
    if (eateries.length == 0) {
        console.log("No eatery found");
        win.removeAllChildren();
        win.add(constructLabel(10, 'Could not find any eatery :(', 'center'));
        return;
    }
    var eatery = eateryInfoParse(eateries[0].restaurant);

    displayEatery(win, 30, 'approval', eatery);

    addNotification(eatery); //Use notification to let user know
}

function registerForNotificationCallbacks(win) {

    var broadcastReceiver = Ti.Android.createBroadcastReceiver({
        onReceived: function (e) {
            var intent = e.intent;
            eateryInfo = intent.getStringExtra('eateryInfo');
            console.log("Will process this eatery " + eateryInfo);
            displayEatery(win, 30, 'feedback', JSON.parse(eateryInfo));
        }
    });
    Ti.Android.registerBroadcastReceiver(broadcastReceiver, ['au.edu.usq.csc8420.sarp.a5.random.munchies.FEEDBACK']);

}


function displayEatery(mainWin, baseTop, purpose, eatery) {

    var win = constructScrollView(0); //Use this for easy replacement
    if (purpose == 'mainDisplay') {
        win.add(constructLabel(baseTop, 'Found a place to eat:', 'center'));
    }
    if (purpose == 'approval') {
        win.add(constructLabel(baseTop, 'Going to the eatery!', 'center'));
        var secondMsg = 'You will be asked ' + getNotificationSecond() + ' seconds later';
        win.add(constructLabel(baseTop + 30, secondMsg, 'center'));
        win.add(constructLabel(baseTop + 60, 'whether you liked the eatery', 'center'));
        baseTop += 60;
    }
    if (purpose == 'feedback') {
        win.add(constructLabel(baseTop, 'Did you like this place?', 'center'));
    }
    if (purpose == 'feedbackLike') {
        win.add(constructLabel(baseTop, 'Liked the place!', 'center'));
        win.add(constructLabel(baseTop + 30, 'Thank you for your feedback!', 'center'));
        win.add(constructLabel(baseTop + 60, 'This eatery will be shown again', 'center'));
        baseTop += 60;
    }
    if (purpose == 'feedbackDislike') {
        win.add(constructLabel(baseTop, 'Disliked the place!', 'center'));
        win.add(constructLabel(baseTop + 30, 'Thank you for your feedback!', 'center'));
        win.add(constructLabel(baseTop + 60, 'Sorry to hear that!', 'center'));
        win.add(constructLabel(baseTop + 90, "You won't see this place again", 'center'));
        baseTop += 90;
    }

    win.add(constructLabel(baseTop + 30, 'Name:', 'left'));
    win.add(constructLabel(baseTop + 30, eatery.name, 'right'));

    win.add(constructLabel(baseTop + 55, 'Distance:', 'left'));
    win.add(constructLabel(baseTop + 55, eatery.distance, 'right'));

    win.add(constructLabel(baseTop + 80, 'Cuisine:', 'left'));
    win.add(constructLabel(baseTop + 80, eatery.cuisines, 'right'));

    win.add(constructLabel(baseTop + 105, 'Rating:', 'left'));
    win.add(constructLabel(baseTop + 105, eatery.rating, 'right'));

    win.add(constructLabel(baseTop + 130, 'Avg Price:', 'left'));
    win.add(constructLabel(baseTop + 130, eatery.cost, 'right'));

    win.add(constructLabel(baseTop + 155, 'Address:', 'left'));
    win.add(constructLabelToRight(baseTop + 155, eatery.address, '80%'));

    if (purpose == 'mainDisplay') {
        setLikeButtons(win, baseTop + 240);
    }
    if (purpose == 'feedback') {
        setFeedbackButtons(eatery, win, baseTop + 240);
    }

    mainWin.removeAllChildren(); //Unfortunately works really slow due to https://jira.appcelerator.org/browse/TIMOB-23447

    mainWin.add(win);

    if (purpose == 'feedbackLike' || purpose == 'feedbackDislike') {
        setTryAgainButton(mainWin);
    }
}


function setFeedbackButtons(eatery, win, topVal) {
    likeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        right: '20%',
        backgroundImage: "like_btn.png",
        top: topVal
    });
    likeBut.addEventListener('click', function (e) {
        displayEatery(win, 30, 'feedbackLike', JSON.parse(eateryInfo));
    });
    win.add(likeBut);

    dislikeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        left: '20%',
        backgroundImage: "dislike_btn.png",
        top: topVal
    });
    dislikeBut.addEventListener('click', function (e) {
        addDislikedRestaurant(eatery.id, eatery.name);
        displayEatery(win, 30, 'feedbackDislike', JSON.parse(eateryInfo));
    });
    win.add(dislikeBut);
}

function setLikeButtons(win, topVal) {
    likeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        right: '20%',
        backgroundImage: "like_btn.png",
        top: topVal
    });
    likeBut.addEventListener('click', function (e) {
        handleAcceptEatery(win);
    });
    win.add(likeBut);

    dislikeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        left: '20%',
        backgroundImage: "dislike_btn.png",
        top: topVal
    });
    dislikeBut.addEventListener('click', function (e) {
        addDislikedRestaurant(eateries[0].restaurant.id, eateries[0].restaurant.name);
        eateries.splice(0, 1);
        handleEatery(win);
    });
    win.add(dislikeBut);
}


function removeEateryIfDisliked() {
    var newEatery = [];
    dislikedEatery = getDislikedRestaurants();
    eateries.forEach(function (foundEatery) {
        // console.log("Comparing foundEatery " + foundEatery.restaurant.id);
        var foundEateryId = foundEatery.restaurant.id;
        // console.log("Which has id of " + foundEateryId);

        isDisliked = false;
        dislikedEatery.forEach(function (dislikedEatery) {
            // console.log("Comparing dislikedEatery " + dislikedEatery);
            // console.log("Comparing dislikedEatery with id " + dislikedEatery.id);
            if (dislikedEatery.id == foundEateryId) {
                isDisliked = true;
            }
        });
        if (!isDisliked) {
            // console.log("It's not disliked so adding");
            newEatery.push(foundEatery);
        } else {
            // console.log("It's disliked ignoring");
        }

    });
    eateries = newEatery;
}

function getRestaurants(lat, lon, currWin) {
    var url = "https://developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + lon;

    var eateryHandler = function (e) {
        try {
            response = JSON.parse(this.responseText);
            if (response.nearby_restaurants instanceof Array) {
                eateries = response.nearby_restaurants;
                removeEateryIfDisliked();
                handleEatery(currWin);
            }

        }
        catch (err) { //An error occurred regarding to response
            Ti.API.debug(err);
            alert('Could not gather eateries around, please try again later');
        }

    };


    var client = Ti.Network.createHTTPClient({
        onload: eateryHandler, //Handling eateries
        onerror: function (e) { //Handling Error
            Ti.API.debug(e.error);
            alert('Could not gather eateries around, please try again later');
        },
        timeout: 10000 // in milliseconds
    });


    client.open("GET", url);

    client.setRequestHeader('user-key', '0309287a5838e5' + '15f2c0a39b8143f17c');
    client.send();
}

function addNotification(eateryInfo) {
    var intent = Ti.Android.createServiceIntent({
        url: 'ExampleService.js'
    });
    intent.putExtra('title', 'Eatery Feedback');
    intent.putExtra('message', 'Did you enjoy your food?');
    intent.putExtra('eateryInfo', JSON.stringify(eateryInfo));
    intent.putExtra('timestamp', new Date(new Date().getTime() + getNotificationSecond() * 1000));
    intent.putExtra('interval', 5000);
    Ti.Android.startService(intent);
}

function setTryAgainButton(win) {
    finishedBut = Titanium.UI.createButton({
        title: 'Try Again',
        height: 'auto',
        width: 'auto',
        textAlign: 'center',
        top: '80%'
    });
    win.add(finishedBut);
    //Just refresh the content
    finishedBut.addEventListener('click', function (e) {
        setContentFromGpsAndZomato(win);
    });
}


function setContentFromGpsAndZomato(mainWin) {
    mainWin.removeAllChildren();
    mainWin.add(constructLabel(40, 'Please wait while finding new eateries', 'center'));
    setTryAgainButton(mainWin);
    var coords = getCurrentCoordinates();
    console.log("Coords latitude: " + coords.latitude + " and longitude: " + coords.longitude);
    getRestaurants(coords.latitude, coords.longitude, mainWin);
}

//End of Helper Function


function constructMainView(_args) {
    var mainWin = Titanium.UI.createWindow({
        title: _args.title
    });

    mainWin.activity.onCreateOptionsMenu = function (e) {
        var menu = e.menu;
        var menuItem = menu.add({
            title: "Settings",
            icon: Ti.Android.R.drawable.ic_menu_preferences,
            showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS
        });
        menuItem.addEventListener("click", function (e) {
            console.log("Clicked button " + e.source.title);
            var window = Ti.UI.createWindow({
                fullscreen: true,
                url: 'settings.js'
            });
            window.title = 'Random Munchies';
            window.resetParentContent = setContentFromGpsAndZomato;
            window.parentWin = mainWin;
            window.open();
        });
    };

    setContentFromGpsAndZomato(mainWin);

    registerForNotificationCallbacks(mainWin);

    return mainWin;
}

initDb();
constructMainView({title: 'Random Munchies'}).open();
