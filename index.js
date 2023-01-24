import { RangoClient } from "rango-sdk";
import fs from "fs";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

async function getAllTokens() {
  const RANGO_API_KEY = process.env.RANGO_API_KEY;
  const rangoClient = new RangoClient(RANGO_API_KEY);
  let allMeta = await rangoClient
    .getAllMetadata()
    .then((token) => token.tokens);

  const output = allMeta.map((token) => ({
    id: token.blockchain + "_" + token.symbol + "." + token.address,
    blockchain: token.blockchain,
    symbol: token.symbol,
    image: token.image,
    address: token.address,
    decimals: token.decimals,
    name: token.name,
  }));
  const tokensConsole = new console.Console(
    fs.createWriteStream(`./assets/tokens.json`)
  );

  tokensConsole.log(JSON.stringify(output));
}

getAllTokens();
