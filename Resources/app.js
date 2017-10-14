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


var client = Ti.Network.createHTTPClient({
    // function called when the response data is available
    onload: function (e) {
        Ti.API.info("Received text: " + this.responseText);
    },
    // function called when an error occurs, including a timeout
    onerror: function (e) {
        Ti.API.debug(e.error);
        alert('error');
    },
    timeout: 10000 // in milliseconds
});

function getRestaurants(lat, lon) {
    var url = "https://developers.zomato.com/api/v2.1/search?lat=" + lat + "&lon=" + lon + "&radius=1000";

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


function displayEatery(win, baseTop, name, address, distance, cuisine, rating, avgPrice) {

    win.add(constructLabel(baseTop, 'Name:', 'left'));
    win.add(constructLabel(baseTop, name, 'right'));

    win.add(constructLabel(baseTop + 20, 'Address:', 'left'));
    win.add(constructLabel(baseTop + 20, address, 'right'));

    win.add(constructLabel(baseTop + 40, 'Distance:', 'left'));
    win.add(constructLabel(baseTop + 40, distance, 'right'));

    win.add(constructLabel(baseTop + 60, 'Cuisine:', 'left'));
    win.add(constructLabel(baseTop + 60, cuisine, 'right'));

    win.add(constructLabel(baseTop + 80, 'Rating:', 'left'));
    win.add(constructLabel(baseTop + 80, rating, 'right'));

    win.add(constructLabel(baseTop + 100, 'Avg Price:', 'left'));
    win.add(constructLabel(baseTop + 100, avgPrice, 'right'));

}

function setLikeButtons(win, topVal) {
    likeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        left: '20%',
        backgroundImage: "like_btn.png",
        top: topVal
    });

    win.add(likeBut);

    dislikeBut = Titanium.UI.createButton({
        height: 75,
        width: 75,
        right: '20%',
        backgroundImage: "dislike_btn.png",
        top: topVal
    });

    win.add(dislikeBut);

}

//End of Helper Function


function constructMainView(_args) {
    var mainWin = Titanium.UI.createWindow({
        title: _args.title
    });

    mainWin.add(constructLabel(10, 'Found a place to eat:', 'center'));

    displayEatery(mainWin, 30, 'Korilla', 'Valley', '1km', 'Korean', '3', '$30');

    setLikeButtons(mainWin, 180);

    var scrollView = constructScrollView(200);

    mainWin.add(scrollView);

    scrollView.add(constructTextField(470, 'Recipe Name'));

    scrollView.add(addOpenCategoryDialog(constructButton(510, 'Select a Category')));

    scrollView.add(createSelectIngredientsView());
    var coords = getCurrentCoordinates();
    console.log("Coords latitude: " + coords.latitude + " and longitude: " + coords.longitude);
    getRestaurants(coords.latitude, coords.longitude);

    addNotification();

    return mainWin;
};

initDb();
constructMainView({title: 'Random Munchies'}).open();
