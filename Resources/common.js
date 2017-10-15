//View constructor functions

function datePickerInit(topVal) {
    var minDate = new Date();
    minDate.setFullYear(2009);
    minDate.setMonth(0);
    minDate.setDate(1);

    var maxDate = new Date();
    maxDate.setFullYear(2029);
    maxDate.setMonth(11);
    maxDate.setDate(31);

    var value = new Date();
    value.setFullYear(2017);
    value.setMonth(6);
    value.setDate(13);

    var picker = Ti.UI.createPicker({
        type: Ti.UI.PICKER_TYPE_DATE,
        minDate: minDate,
        top: topVal,
        maxDate: maxDate,
        value: value
    });

    picker.selectionIndicator = true;
    return picker;
}

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
        color: '#336699',
        top: topVal,
        height: 'auto',
        width: 'auto',
        hintText: hintTextVal,
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
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
    return constructLabelWithWidth(topVal, textVal, align, Ti.Platform.displayCaps.platformWidth);
}

function constructLabelWithWidth(topVal, textVal, align, textWidth) {
    return Titanium.UI.createLabel({
        color: '#999',
        top: topVal,
        text: textVal,
        font: {fontSize: 20, fontFamily: 'Helvetica Neue'},
        textAlign: align,
        height: 'auto',
        width: textWidth
    });
}

function constructTableView(topVal) {
    return Titanium.UI.createTableView({
        top: topVal,
        height: 200,
        width: 200,
        scrollable: true,
        borderColor: "black"
    });
}

//End of View constructor functions


//Helper functions

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

function prepTableRow(data) {
    var retVal = [];
    for (var key in data) {
        var row = Ti.UI.createTableViewRow({title: key, hasCheck: false});
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


function tableRowToMap(tableRow) {
    var retMap = {};
    for (var i = 0; i < tableRow.length; i++) {
        retMap[tableRow[i].title] = null;
        console.log("tableRow variable is " + tableRow[i].title);
    }
    return retMap;
}


function addStringToTableRow(tableRow, str) {
    rowList = tableRowToMap(tableRow);
    if (str in rowList) {
        console.info("Not adding " + str + " because already exists");
        return;
    }
    map = {};
    map[str] = null;
    tableRow.push.apply(tableRow, prepTableRow(map));
}


//End of Helper Functions

