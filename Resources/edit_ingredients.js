Ti.include('common.js');

function edit_ingredients() {
    var currentWin = Titanium.UI.currentWindow;

    currentWin.add(constructLabel(10, 'Edit List of Ingredients:'));

    var ingredientTableView = constructTableView(50);
    var tableRow = prepTableRow(Ti.App.ingredientList);
    ingredientTableView.data = tableRow;
    //Add callback for choosing the items
    ingredientTableView.addEventListener('click', function (e) {
        tableRow[e.index].hasCheck = !tableRow[e.index].hasCheck;
        console.info("Index is " + e.index + " title is " + tableRow[e.index].title);
    });
    currentWin.add(ingredientTableView);

    var deleteItemBut = constructButton(270, 'Delete Selected Items');
    //Add callback for deleting from list
    deleteItemBut.addEventListener('click', function (e) {
        console.info("Size before is " + tableRow.length);
        deleteFromList(tableRow);
        console.info("Size after is " + tableRow.length);
        ingredientTableView.data = tableRow;
    });
    currentWin.add(deleteItemBut);

    var newIngredientTxt = constructTextField(320, 'Add New Ingredient');
    currentWin.add(newIngredientTxt);
    //Add callback for adding a new ingredient to list
    newIngredientTxt.addEventListener('return', function (e) {
        console.info("Size before is " + tableRow.length);
        addStringToTableRow(tableRow, e.value);
        console.info("Size after is " + tableRow.length);
        ingredientTableView.data = tableRow;
        newIngredientTxt.blur();
    });

    finishedBut = Titanium.UI.createButton({
        title: 'Finished',
        height: 'auto',
        width: 'auto',
        left: 10,
        bottom: 10
    });
    currentWin.add(finishedBut);
    //Callback for swapping the current view with global and refreshing main view
    finishedBut.addEventListener('click', function (e) {
        Ti.App.ingredientList = tableRowToMap(tableRow);
        currentWin.refreshIngredients();
        currentWin.close();
    });

    cancelBut = Titanium.UI.createButton({
        title: 'Cancel',
        height: 'auto',
        width: 'auto',
        right: 10,
        bottom: 10
    });
    currentWin.add(cancelBut);
    //Just close current window (same as back press)
    cancelBut.addEventListener('click', function (e) {
        currentWin.close();
    });

    return currentWin;
}

edit_ingredients();

