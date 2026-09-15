import { renderToString } from 'react-dom/server';
import React from 'react';
import App from './src/App.tsx';
import { HelmetProvider } from 'react-helmet-async';
import * as cheerio from 'cheerio';

const html = renderToString(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

const $ = cheerio.load(`<div id="root">${html}</div>`);
const el = $("div#root > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)");

console.log("MATCHED ELEMENT:");
console.log(el.html());
console.log("\nCLASS:");
console.log(el.attr('class'));
console.log("\nPARENT CLASS:");
console.log(el.parent().attr('class'));
