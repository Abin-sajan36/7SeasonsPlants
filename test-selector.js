import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import App from './src/App.tsx';
import { StoreProvider } from './src/context/StoreContext.tsx';
import { HelmetProvider } from 'react-helmet-async';

const html = renderToString(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

const dom = new JSDOM(`<div id="root">${html}</div>`);
const document = dom.window.document;

const selector = "div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)";
const el = document.querySelector(selector);

if (el) {
  console.log("MATCHED ELEMENT:");
  console.log(el.outerHTML);
  console.log("\nPARENT:");
  console.log(el.parentElement.outerHTML);
} else {
  console.log("No element matched.");
  
  // Let's print out the structure of div#root > div
  console.log("Children of root > div:");
  const rootDiv = document.querySelector("div#root > div");
  if (rootDiv) {
    for (let i = 0; i < rootDiv.children.length; i++) {
       const child = rootDiv.children[i];
       console.log(`[${i}] ${child.tagName} className=${child.className}`);
       if (child.tagName === 'DIV') {
         console.log("  DIV children:");
         for (let j = 0; j < child.children.length; j++) {
           const c2 = child.children[j];
           console.log(`  [${j}] ${c2.tagName} className=${c2.className}`);
         }
       }
    }
  }
}
