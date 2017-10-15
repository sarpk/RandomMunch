Ti.include('common.js');
Ti.include('db.js');


function settings() {
    var currentWin = Titanium.UI.currentWindow;

    currentWin.add(constructLabel(10, 'Remove Disliked Eateries:', 'center'));

    var eateriesTableView = constructTableView(50);
    var tableRow = prepTableRowWithMap(getDislikedRestaurants());
    eateriesTableView.data = tableRow;
    //Add callback for choosing the items
    eateriesTableView.addEventListener('click', function (e) {
        tableRow[e.index].hasCheck = !tableRow[e.index].hasCheck;
        console.info("Index is " + e.index + " id is " + tableRow[e.index].id + " name is " + tableRow[e.index].name);
    });
    currentWin.add(eateriesTableView);

    var deleteItemBut = constructButton(270, 'Delete Selected Eateries');
    //Add callback for deleting from list
    deleteItemBut.addEventListener('click', function (e) {
        console.info("Size before is " + tableRow.length);
        deleteFromList(tableRow);
        console.info("Size after is " + tableRow.length);
        eateriesTableView.data = tableRow;
    });
    currentWin.add(deleteItemBut);

    currentWin.add(constructLabel(320, 'Notification Seconds (ie 3600 is 1 hour):', 'left'));
    var notifSecsTxtField = constructTextField(320, getNotificationSecond());
    currentWin.add(notifSecsTxtField);
    //Add callback for setting db value
    notifSecsTxtField.addEventListener('return', function (e) {
        console.info("Setting second value in database " + e.value);
        updateNotificationSecond(e.value);
    });

    finishedBut = Titanium.UI.createButton({
        title: 'Finished',
        height: 'auto',
        width: 'auto',
        textAlign: 'center',
        bottom: 10
    });
    currentWin.add(finishedBut);
    //Callback for swapping the current view with global and refreshing main view
    finishedBut.addEventListener('click', function (e) {
        currentWin.resetParentContent(currentWin.parentWin);
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

settings();

