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

function printChildren(el, prefix = '') {
  el.children().each((i, child) => {
    const $c = $(child);
    if ($c.prop('tagName')) {
      console.log(`${prefix}${$c.prop('tagName')} class="${$c.attr('class') || ''}"`);
      if ($c.prop('tagName').toLowerCase() === 'div' && prefix.length < 15) {
        printChildren($c, prefix + '  ');
      }
    }
  });
}

console.log("DOM TREE (DIVs only):");
printChildren($('div#root'));
