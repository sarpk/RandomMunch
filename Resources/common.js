//View constructor functions

function constructScrollView(topVal) {
    return Ti.UI.createScrollView({
        showVerticalScrollIndicator: true,
        showHorizontalScrollIndicator: true,
        top: topVal,
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL
    });
}

function constructTextField(topVal, hintTextVal) {
    return Titanium.UI.createTextField({
        color: '#999',
        top: topVal,
        height: 'auto',
        width: 'auto',
        hintText: hintTextVal,
        right: 0,
        keyboardType: Ti.UI.KEYBOARD_NUMBER_PAD,
        returnKeyType: Titanium.UI.RETURNKEY_DONE,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
    });
}

function constructButton(topVal, titleVal) {
    return Titanium.UI.createButton({
        title: titleVal,
        height: 'auto',
        width: 'auto',
        top: topVal
    });
}

function addOpenCategoryDialog(button) {
    button.addEventListener('click', function () {
        var categoryDialog = Ti.UI.createOptionDialog(categoryOptions);
        categoryDialog.show();
        //Callback for renaming button and indexVal
        categoryDialog.addEventListener('click', function (e) {
            button.title = categoryDialog.options[e.index];
            categoryOptions.selectedIndex = e.index;
        });
    });
    return button;
}

function constructLabel(topVal, textVal, align) {
    return Titanium.UI.createLabel({
        color: '#999',
        top: topVal,
        text: textVal,
        font: {fontSize: 20, fontFamily: 'Helvetica Neue'},
        textAlign: align,
        height: 'auto',
        width: Ti.Platform.displayCaps.platformWidth
    });
}

function constructLabelToRight(topVal, textVal, textWidth) {
    return Titanium.UI.createLabel({
        color: '#999',
        top: topVal,
        text: textVal,
        font: {fontSize: 20, fontFamily: 'Helvetica Neue'},
        textAlign: 'right',
        right: 0,
        height: 'auto',
        width: textWidth
    });
}

function constructTableView(topVal) {
    return Titanium.UI.createTableView({
        top: topVal,
        height: 300,
        width: 250,
        scrollable: true,
        borderColor: "black"
    });
}

//End of View constructor functions


//Helper functions

//Taken from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


function prepTableRowWithMap(mapData) {
    var retVal = [];
    for (var data in mapData) {
        mapData[data]['hasCheck'] = false;
        mapData[data]['title'] = mapData[data]['name'];
        console.log("added hascheck " + JSON.stringify(mapData[data]));
        var row = Ti.UI.createTableViewRow(mapData[data]);
        retVal.push(row);
        console.log("pushed " + row.title);
    }
    console.log("total size is  " + retVal.length);
    return retVal;
}

function deleteFromList(list) {
    var i = list.length;
    while (i--) {
        if (list[i].hasCheck) {
            console.info("Index " + i + " deleting " + list[i].name + " with id " + list[i].id);
            deleteDislikedRestaurant(list[i].id);
            list.splice(i, 1);
        }
    }
    console.info("Size after is " + list.length);
}


//End of Helper Functions

