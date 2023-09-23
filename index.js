const http = require("http");
const https = require("https")

const url = "https://time.com";

function getFromWebsite() {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
        // get html content
        let html = "";
        response.on("data", (chunk) => {
          html += chunk;
        });

        response.on("end", () => {
          if (response.statusCode === 200) {
            const regex = /<a\s+href="([^"]+)">\s*<h3[^>]*>([^<]+)<\/h3>/g;
            const articles = [];

            let item;
            while ((item = regex.exec(html)) !== null) {
              const link = url + item[1];
              const title = item[2];
              articles.push({ title, link });
            }
            resolve(articles);
          }
        });
      })
      .on("error", (error) => {
        console.error("Error:", error);
        reject(error);
      });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/getTimeStories" && req.method === "GET") {
    let articlesData = await getFromWebsite();
    articlesData = articlesData.slice(-6);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(articlesData));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
