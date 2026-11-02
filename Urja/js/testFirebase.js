import { liveRef, onValue } from "./firebase.js";

onValue(liveRef, (snapshot) => {
    console.clear();

    console.log("🔥 Firebase Connected");
    console.log(snapshot.val());
});