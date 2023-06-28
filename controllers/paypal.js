// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import { Paymob } from "paymob";
// console.log(Paymob);

// dotenv.config();
// const { CLIENT_ID, APP_SECRET } = process.env;
// const baseURL = {
//   sandbox: "https://api-m.sandbox.paypal.com",
//   production: "https://api-m.paypal.com",
// };

// // generate an access token using client id and app secret
// async function generateAccessToken() {
//   const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
//   const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
//     method: "POST",
//     body: "grant_type=client_credentials",
//     headers: {
//       Authorization: `Basic ${auth}`,
//     },
//   });
//   const data = await response.json();
//   return data.access_token;
// }

// // use the orders api to create an order
// async function createOrder() {
//   const accessToken = await generateAccessToken();
//   const url = `${baseURL.sandbox}/v2/checkout/orders`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${accessToken}`,
//     },
//     body: JSON.stringify({
//       intent: "CAPTURE",
//       purchase_units: [
//         {
//           amount: {
//             currency_code: "USD",
//             value: "100.00",
//           },
//         },
//       ],
//     }),
//   });
//   const data = await response.json();
//   return data;
// }

// // use the orders api to capture payment for an order
// async function capturePayment(orderId) {
//   const accessToken = await generateAccessToken();
//   const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });
//   const data = await response.json();
//   return data;
// }

// // #####################################################################

// // create a new order
// export const makeOrder = async (req, res) => {
//   const order = await createOrder();
//   res.json(order);
// };

// // capture payment & store order information or fullfill order
// export const captureOrder = async (req, res) => {
//   const { orderID } = req.body;
//   const captureData = await capturePayment(orderID);
//   // TODO: store payment information such as the transaction ID
//   res.json(captureData);
// };

// export const test = async (req, res) => {
//   const data = await generateAccessToken();
//   res.json({ accessToken: data });
// };
