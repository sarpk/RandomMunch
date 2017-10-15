function initDb() {

    Ti.Database.install('/dbname.sqlite', 'randomMunchDb');
    var db = Ti.Database.open('randomMunchDb');
    db.execute('CREATE TABLE IF NOT EXISTS DISLIKED_RESTAURANTS(id INTEGER PRIMARY KEY, name TEXT);');
    db.execute('CREATE TABLE IF NOT EXISTS SETTINGS(id INTEGER PRIMARY KEY, notificationSeconds INTEGER);');
    try {
        db.execute('INSERT INTO SETTINGS (id,notificationSeconds) VALUES (?,?)', 1, 3600);
    }
    catch (e) {
        //Primary key error, suppress it
    }

    db.close();
}

function updateNotificationSecond(seconds) {
    var db = Ti.Database.open('randomMunchDb');
    db.execute('UPDATE SETTINGS SET notificationSeconds = ? WHERE id = 1', seconds);
    db.close();
}

function getNotificationSecond() {
    var db = Ti.Database.open('randomMunchDb');

    var sql = "SELECT notificationSeconds FROM SETTINGS WHERE id = 1";
    var RS = db.execute(sql);

    var retVal = 3600; //Default
    while (RS.isValidRow()) {
        retVal = RS.fieldByName('notificationSeconds');
        console.info("Found notif secs is " + retVal);
        RS.next();
    }
    RS.close();
    console.info("Returning notif secs is " + retVal);

    return retVal;
}

function getDislikedRestaurants() {

    var db = Ti.Database.open('randomMunchDb');

    var sql = "SELECT * FROM DISLIKED_RESTAURANTS";
    var RS = db.execute(sql);


    var retVal = [];
    while (RS.isValidRow()) {
        retVal.push({id: RS.fieldByName('id'), name: RS.fieldByName('name')});
        RS.next();
    }
    RS.close();

    return retVal;
}

function deleteDislikedRestaurant(id) {
    var db = Ti.Database.open('randomMunchDb');
    db.execute('DELETE FROM DISLIKED_RESTAURANTS WHERE id=?', id);
    db.close();
}


function addDislikedRestaurant(id, name) {
    var db = Ti.Database.open('randomMunchDb');
    db.execute('INSERT INTO DISLIKED_RESTAURANTS (id,name) VALUES (?,?)', id, name);
    db.close();
}
