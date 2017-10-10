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
        window.title = 'Assignment 1';
        window.refreshIngredients = refreshIngredients;
        window.open();
    });

    ingredientView.add(ingredientsButton);

    return ingredientView;
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

    return mainWin;
};

constructMainView({title: 'Assignment 1'}).open();

