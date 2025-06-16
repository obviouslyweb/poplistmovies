// async function getSteamNews(appId) {
//     const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&maxlength=300&format=json`;

//     try {
//         const response = await fetch(url)
//         const data = await response.json();

//         return data.appnews.newsitems;
//     } catch (e) {
//         console.error("Failed to fetch Steam news: ", e);
//         return [];
//     }
// }

// console.log(getSteamNews(553850));