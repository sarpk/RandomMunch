Ti.include('common.js');

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

    ingredientView.add(constructLabel(10, 'Select Ingredients:'));

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
//End of Helper Function


function constructMainView(_args) {
    var mainWin = Titanium.UI.createWindow({
        title: _args.title
    });

    var scrollView = constructScrollView(0);

    mainWin.add(scrollView);

    scrollView.add(datePickerInit(10));

    scrollView.add(constructTextField(470, 'Recipe Name'));

    scrollView.add(addOpenCategoryDialog(constructButton(510, 'Select a Category')));

    scrollView.add(createSelectIngredientsView());
    var coords = getCurrentCoordinates();
    console.log("Coords latitude: " + coords.latitude + " and longitude: " + coords.longitude);
    getRestaurants(coords.latitude, coords.longitude);
    return mainWin;
};

constructMainView({title: 'Random Munchies'}).open();
