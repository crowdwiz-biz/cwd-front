if ("serviceWorker" in navigator && "PushManager" in window) {
    // console.log('Service Worker and Push is supported');

    navigator.serviceWorker
        .register("sw.js")
        .then(function(swReg) {
            swRegistration = swReg;

            Notification.requestPermission(function(result) {
                if (result === "granted") {
                    console.log("notifications allowed");
                }
            });
        })
        .catch(function(error) {
            console.error("Service Worker Error", error);
        });
} else {
    console.warn("Push messaging is not supported");
}
