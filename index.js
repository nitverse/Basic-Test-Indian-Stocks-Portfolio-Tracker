import express from "express";
import { JSDOM } from "jsdom";

const app = express();
const port = 6969;

const tickers = {
  t1: "IREDA",
  t2: "POLYCAB",
  t3: "SUTLEJTEX",
  t4: "CDSL",
  t5: "RECLTD",
};

let stockPrices = {};

async function fetchStockPrice(ticker) {
  const url = `https://www.google.com/finance/quote/${ticker}:NSE`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for ${ticker}: ${response.statusText}`
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const stockPriceElement = document.querySelector(".YMlKec.fxKbKc");
    if (!stockPriceElement) {
      throw new Error(`Stock price element not found for ${ticker}`);
    }
    const stockPriceText = stockPriceElement.textContent.trim();

    const stockPrice = parseFloat(stockPriceText.replace(/[^\d.-]/g, ""));

    return stockPrice;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}: ${error.message}`);
    return null;
  }
}

async function updateStockPrices() {
  try {
    const promises = Object.values(tickers).map((ticker) =>
      fetchStockPrice(ticker)
    );

    const prices = await Promise.all(promises);

    Object.keys(tickers).forEach((key, index) => {
      stockPrices[key] = prices[index];
    });

    console.log("Stock prices updated:", stockPrices);
  } catch (error) {
    console.error("Error updating stock prices:", error.message);
  }
}

updateStockPrices();
setInterval(updateStockPrices, 10 * 1000);

app.get("/", (req, res) => {
  res.json({ stockPrices });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
