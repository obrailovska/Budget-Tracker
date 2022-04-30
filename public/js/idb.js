let db;

const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("budgetTransaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadNewBudget();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// this function will be executed what we try to add something with no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["budgetTransaction"], "readwrite");

  // access the object store for `budgetTransaction`
  const budgetObjectStore = transaction.objectStore("budgetTransaction");

  // add record to the store with add method
  budgetObjectStore.add(record);
}

function uploadNewBudget() {
  // open a transaction on the db
  const transaction = db.transaction(["budgetTransaction"], "readwrite");

  // accessing object store
  const budgetObjectStore = transaction.objectStore("budgetTransaction");

  // get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(
            ["budgetTransaction"],
            "readwrite"
          );
          // access the budgetTransaction object store
          const budgetObjectStore =
            transaction.objectStore("budgetTransaction");
          // clear all items in the store
          budgetObjectStore.clear();

          alert("All saved changes to the budget have been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadNewBudget());
