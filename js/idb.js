import idb from 'idb';

if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
}

console.log('called');

var dbPromise = idb.open('couches-n-things', 2, function(upgradeDb) {

});
