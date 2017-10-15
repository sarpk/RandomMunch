Ti.include('common.js');
Ti.include('db.js');

// Define Globals

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Ti.App.ingredientList = {
    "Tomato": null,
    "Lemon": null,
    "Lime": null,
    "Capsicum": null,
    "Eggplant": null,
    "Zucchini": null
};

var categoryOptions = {
    cancel: 2,
    options: ['Meat', 'Fish', 'Pasta', 'Vegetarian', 'Noodle', 'Salad', 'Seafood', 'Rice'],
    destructive: 0,
    title: 'Category'
};

// End of Globals

//Helper function

function createSelectIngredientsView() {
    var ingredientView = Ti.UI.createView({
        backgroundColor: '#606060',
        borderRadius: 10,
        top: 570,
        height: 300,
        width: 250
    });

    ingredientView.add(constructLabel(10, 'Select Ingredients:', 'center'));

    // create table view
    var ingredientTable = constructTableView(50);

    // Callback function for another view to refresh Ingredients
    var refreshIngredients = function () {
        var tableRow = prepTableRow(Ti.App.ingredientList);
        ingredientTable.data = tableRow;
        console.info("Init'd " + ingredientTable.data);
        ingredientTable.addEventListener('click', function (e) {
            tableRow[e.index].hasCheck = !tableRow[e.index].hasCheck;
            console.info("Index is " + e.index + " title is " + tableRow[e.index].title);
        });
    };
    refreshIngredients();
    ingredientView.add(ingredientTable);

    console.log("tableview length is " + ingredientTable.data.length);
    for (var i = 0; i < ingredientTable.data.length; i++) {
        console.log("tableview variable is " + ingredientTable.data[i].title);
    }

    var ingredientsButton = constructButton(260, 'Edit Ingredients');

    //Add callback for creating ingredient edit view
    ingredientsButton.addEventListener('click', function (e) {
        var window = Ti.UI.createWindow({
            fullscreen: true,
            url: 'edit_ingredients.js'
        });
        window.title = 'Random Munchies';
        window.refreshIngredients = refreshIngredients;
        window.open();
    });

    ingredientView.add(ingredientsButton);

    return ingredientView;
}

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

            console.log("Found latitude: " + latitude + " and longitude: " + longitude);

        });
    } else {
        console.log("Internet connection is required for geolocation");
        console.log("Defaulting latitude: " + latitude + " and longitude: " + longitude);
    }

    console.log("Returning latitude: " + latitude + " and longitude: " + longitude);
    return {latitude: latitude, longitude: longitude};

}

var eateries = [];


function handleEatery(win) {
    if (eateries.length == 0) {
        console.log("No eatery found");
        win.removeAllChildren();
        win.add(constructLabel(10, 'Could not find any eatery :(', 'center'));
        return;
    }
    var eatery = eateries[0].restaurant;

    displayEatery(win, 30,
        eatery.name,
        eatery.location.address,
        eatery.location.latitude,
        eatery.cuisines,
        eatery.user_rating.aggregate_rating + '/5',
        eatery.currency + eatery.average_cost_for_two / 2 + ' per person'
    );

}

function removeEateryIfDisliked() {
    var newEatery = [];
    dislikedEatery = getDislikedRestaurants();
    eateries.forEach(function (foundEatery) {
        console.log("Comparing foundEatery " + foundEatery);
        var foundEateryId = foundEatery.restaurant.id;
        console.log("Which has id of " + foundEateryId);

        isDisliked = false;
        dislikedEatery.forEach(function (dislikedEatery) {
            console.log("Comparing dislikedEatery " + dislikedEatery);
            console.log("Comparing dislikedEatery with id " + dislikedEatery.id);
            if (dislikedEatery.id == foundEateryId) {
                isDisliked = true;
            }
        });
        if (!isDisliked) {
            console.log("It's not disliked so adding");
            newEatery.push(foundEatery);
        }
        console.log("It's disliked ignoring");
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
                Ti.API.info("Restaurants are: " + response.nearby_restaurants);
                eateries.forEach(function (entry) {
                    console.log(entry);
                });
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

function addNotification() {
    var intent = Ti.Android.createServiceIntent({
        url: 'ExampleService.js'
    });
    intent.putExtra('title', 'Eatery Feedback');
    intent.putExtra('message', 'Did you enjoy your food?');
    intent.putExtra('timestamp', new Date(new Date().getTime() + 20 * 1000));
    intent.putExtra('interval', 10000);
    Ti.Android.startService(intent);

}

function displayEatery(mainWin, baseTop, name, address, distance, cuisine, rating, avgPrice) {

    var win = constructScrollView(0); //Use this for easy replacement

    win.add(constructLabel(baseTop, 'Found a place to eat:', 'center'));

    win.add(constructLabel(baseTop + 30, 'Name:', 'left'));
    win.add(constructLabel(baseTop + 30, name, 'right'));

    win.add(constructLabel(baseTop + 55, 'Distance:', 'left'));
    win.add(constructLabel(baseTop + 55, distance, 'right'));

    win.add(constructLabel(baseTop + 80, 'Cuisine:', 'left'));
    win.add(constructLabel(baseTop + 80, cuisine, 'right'));

    win.add(constructLabel(baseTop + 105, 'Rating:', 'left'));
    win.add(constructLabel(baseTop + 105, rating, 'right'));

    win.add(constructLabel(baseTop + 130, 'Avg Price:', 'left'));
    win.add(constructLabel(baseTop + 130, avgPrice, 'right'));

    win.add(constructLabel(baseTop + 155, 'Address:', 'left'));
    win.add(constructLabelToRight(baseTop + 155, address, '80%'));

    setLikeButtons(win, baseTop + 240);
    mainWin.removeAllChildren(); //Unfortunately works really slow due to https://jira.appcelerator.org/browse/TIMOB-23447

    mainWin.add(win);
}

function setLikeButtons(win, topVal) {
    likeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        right: '20%',
        backgroundImage: "like_btn.png",
        top: topVal
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

function setContentFromGpsAndZomato(mainWin) {
    mainWin.add(constructLabel(40, 'Please wait while finding new eateries', 'center'));
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
                url: 'edit_ingredients.js'
            });
            window.title = 'Random Munchies';
            window.resetParentContent = setContentFromGpsAndZomato;
            window.parentWin = mainWin;
            window.open();
        });
    };

    var scrollView = constructScrollView(200);

    mainWin.add(scrollView);

    scrollView.add(constructTextField(470, 'Recipe Name'));

    scrollView.add(addOpenCategoryDialog(constructButton(510, 'Select a Category')));

    scrollView.add(createSelectIngredientsView());

    setContentFromGpsAndZomato(mainWin);
    addNotification();

    return mainWin;
};

initDb();
constructMainView({title: 'Random Munchies'}).open();
