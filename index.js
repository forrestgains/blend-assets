import { RangoClient } from "rango-sdk";
import fs from "fs";
import * as dotenv from "dotenv";
import { overrides } from "./utils/overrides.js";
import axios from "axios";

dotenv.config();

async function getAllTokens() {
  let allTokens = [];

  const RANGO_API_KEY = process.env.RANGO_API_KEY;
  const rangoClient = new RangoClient(RANGO_API_KEY);
  let allMeta = await rangoClient.getAllMetadata().then((token) => token);

  const geckoId = await axios
    .get("https://api.coingecko.com/api/v3/coins/list?include_platform=true")
    .then((x) => x.data);

  const output = allMeta.tokens.map((token) => ({
    id: token.blockchain + "_" + token.symbol + "." + token.address,
    blockchain: token.blockchain,
    symbol: token.symbol,
    image: token.image,
    address: token.address,
    decimals: token.decimals,
    name: token.name,
  }));

  allTokens = [...output, ...overrides];

  allTokens.forEach((token) => {
    const gecko = geckoId.find((item) => {
      if (item.platforms) {
        for (const [key, value] of Object.entries(item.platforms)) {
          if (
            token.address !== null && value !== null
              ? value.toLowerCase() === token.address.toLowerCase()
              : false
          ) {
            return {
              ...item,
            };
          }
        }
        // If not found by address, check by symbol
        if (
          token.symbol !== null && item.symbol !== null
            ? item.symbol.toLowerCase() === token.symbol.toLowerCase()
            : false
        ) {
          return {
            ...item,
          };
        }
      }
    });
    if (gecko) {
      token.gecko_id = gecko.id;
    }
    return token;
  });

  const tokensConsole = new console.Console(
    fs.createWriteStream(`./assets/compact_tokens.json`)
  );
  const blockchainsConsole = new console.Console(
    fs.createWriteStream(`./assets/blockchains.json`)
  );

  blockchainsConsole.log(JSON.stringify(allMeta.blockchains));
  tokensConsole.log(JSON.stringify(allTokens));
}

getAllTokens();
