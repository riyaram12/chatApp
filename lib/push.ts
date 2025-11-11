// import axios from "axios";
// import api from "@/lib/api";
// import { useEffect, useState } from "react";


// export async function subscribeToPush() {
//     // useEffect(() => {
//         // const subscribe = async () => {
//   const registration = await navigator.serviceWorker.register("/service-worker.js");
//     console.log("registration", registration)
//   const permission = await Notification.requestPermission();
//   console.log("permission", permission)
//   if (permission !== "granted") {
//     alert("Please allow notifications!");
//     return;
//   }

// //   const res = await api.get("/api/vapidPublicKey");
// //     console.log(res.data.data, "data");
// //   const res = await fetch("http://localhost:3007/api/vapidPublicKey");
// //   console.log(res, "res++++++++++++")
// //   const vapidPublicKey = await res;//.text();

// //   const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

//   const subscription = await registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: "BKe5V4na2qjlBMfbOoV_TCAgaVQcfm8lAdYzEPH4BdRdJnT9s-Z6KZLSMXKvh7GETQRJcIIJqEFCzKAoS1XH7M8",
//   });

//   console.log("subscription+++", subscription)

//   await fetch("http://localhost:3007/api/saveSubscription", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(subscription),
//   });

//   console.log(" Push subscription saved!");
// }; 
// // subscribe()
// // })
// // }

// export function urlBase64ToUint8Array(base64String: string) {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding)
//     .replace(/-/g, "+")
//     .replace(/_/g, "/");

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }
