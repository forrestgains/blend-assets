import { RangoClient } from "rango-sdk";
import fs from "fs";
import * as dotenv from "dotenv";
import { overrides } from "./utils/overrides.js";

dotenv.config();

async function getAllTokens() {
  let allTokens = [];

  const RANGO_API_KEY = process.env.RANGO_API_KEY;
  const rangoClient = new RangoClient(RANGO_API_KEY);
  let allMeta = await rangoClient.getAllMetadata().then((token) => token);

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

  const tokensConsole = new console.Console(
    fs.createWriteStream(`./assets/compact_tokens.json`)
  );
  tokensConsole.log(JSON.stringify(allTokens));
}

getAllTokens();
