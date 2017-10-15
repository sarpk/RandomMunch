var service = Ti.Android.currentService;
var serviceIntent = service.getIntent();
var timestamp = new Date(serviceIntent.getStringExtra('timestamp'));

if (new Date() > timestamp) {
    // Grab extra data sent with the intent
    var title = serviceIntent.getStringExtra('title');
    var message = serviceIntent.getStringExtra('message');

    // Create an intent that launches the application
    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_MAIN,
        className: 'au.edu.usq.csc8420.sarp.a5.random.munchies.RandomMunchiesActivity',
        packageName: 'au.edu.usq.csc8420.sarp.a5.random.munchies'
    });
    intent.flags |= Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP;
    intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);

    // Create notification
    var notification = Ti.Android.createNotification({
        contentIntent : Ti.Android.createPendingIntent({intent : intent}),
        contentTitle : title,
        contentText : message,
    });

    // Send the notification
    Ti.Android.NotificationManager.notify(1, notification);
    
    // Stop the service once the notification is sent
    Ti.Android.stopService(serviceIntent);

var intent = Ti.Android.createBroadcastIntent({
action: 'au.edu.usq.csc8420.sarp.a5.random.munchies.FEEDBACK'
});
intent.putExtra(Ti.Android.EXTRA_TEXT, 'Download update');
Ti.Android.currentActivity.sendBroadcast(intent, 'au.edu.usq.csc8420.sarp.a5.random.munchies.FEEDBACK');


	console.log("Notif stuff ended");
    var fooVal = serviceIntent.getStringExtra('foo');
	console.log("Val of foo " + fooVal);
} 
