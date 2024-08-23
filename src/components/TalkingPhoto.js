import { response } from "express";

const myHeaders = new Headers();
myHeaders.append("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWVjODRhMzNjMzZhNjliMTBhNzBjOCIsInVpZCI6MjUyNjQwNCwiZW1haWwiOiJjb3B1YmxpY2FraGlsQGdtYWlsLmNvbSIsImNyZWRlbnRpYWxJZCI6IjY2NWVkYWI0MzNjMzZhNjliMTBhYjYxYyIsImZpcnN0TmFtZSI6IkFLIiwiZnJvbSI6InRvTyIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzE3NDk5MDAxLCJleHAiOjIwMjg1MzkwMDF9.7pCRboxeXo_blQp-er394zyaeWsy8aeDOAP5-6GQ1FM");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "talking_photo_url": "https://drz0f01yeq1cx.cloudfront.net/1688098804494-e7ca71c3-4266-4ee4-bcbb-ddd1ea490e75-9907.jpg",
  "audio_url": "https://drz0f01yeq1cx.cloudfront.net/1710752141387-e7867802-0a92-41d4-b899-9bfb23144929-4946.mp3",
  "webhookUrl": "http://localhost:3007/api/open/v3/test/webhook"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://openapi.akool.com/api/open/v3/content/video/createbytalkingphoto", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
  var avtarid=response.data._id;
  console.log(avtarid);


