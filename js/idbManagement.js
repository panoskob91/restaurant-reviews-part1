var idbSupported = false;
var db;
// document.addEventListener("DOMContentLoaded", function(){
    if("indexedDB" in window) {
        idbSupported = true;
    }
    if (idbSupported)
    {
        //Create the new database
        var openRequest = indexedDB.open('restaurant-reviews-responses', 1);
        openRequest.onupgradeneeded = function(e){
            console.log('Updating...');
            var thisDB = e.target.result;
            if (!(thisDB.objectStoreNames.contains('FirstOS'))){
                //Create object store(s)
                thisDB.createObjectStore('FirstOS', { keyPath: "id", autoIncrement: true });
            }
            if(!(thisDB.objectStoreNames.contains('SecondOS')))
            {
                thisDB.createObjectStore('SecondOS');
            }
        }
        openRequest.onsuccess = function(e){
            console.log('Success');
            db = e.target.result;
            //On success open transaction
            var transaction = db.transaction(['FirstOS'], 'readwrite');
            var store = transaction.objectStore("FirstOS");

            var whatever = {
                "name" : "Gousgounis",
                "age" : 100
            };

            //var request = store.add(whatever, "numb");
            var request = store.put(whatever);
            var secondTransaction = db.transaction('SecondOS', 'readwrite');
            var secondStore = secondTransaction.objectStore('SecondOS');
            secondStore.put('world', 'hello');
            secondStore.put('dog', 'fav_animal');
            request.onerror = function(e) {
                console.log("Error",e.target.error.name);

            }

            request.onsuccess = function(e) {
                console.log("Woot! Did it");
            }

        }
        //On error log error
        openRequest.onerror = function(e) {
            console.log("Error");
            console.dir(e);
        }
    }
// },false);