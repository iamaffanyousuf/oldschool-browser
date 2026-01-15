// export default async function handler(req, res) {
//     const { query } = req.body;

//     const apiKey = process.env.BRAVE_KEY;

//     try {
//         const response = await fetch(
//             "https://api.search.brave.com/res/v1/web/search?query=" + encodeURIComponent(query),
//             {
//                 method: "GET",
//                 headers: {
//                     "X-Subscription-Token": apiKey,
//                     "Accept": "application/json"
//                 }
//             }
//         );

//         const data = await response.json();
//         res.status(200).json(data);

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }
