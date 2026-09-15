import { renderToString } from 'react-dom/server';
import React from 'react';
import App from './src/App.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './src/context/StoreContext.tsx';

// We need a dummy DOM renderer. Let's just use regex on the HTML string!
const html = renderToString(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// We will simulate a simple DOM parser
import * as cheerio from 'cheerio';
const $ = cheerio.load(`<div id="root">${html}</div>`);

function traverse(el, currentPath) {
  el.children().each((i, child) => {
    const $child = $(child);
    const tag = $child.prop('tagName');
    if (!tag) return;
    const tagName = tag.toLowerCase();
    
    // Calculate nth-of-type
    let nth = 1;
    let prev = child.previousSibling;
    while(prev) {
      if (prev.type === 'tag' && prev.name.toLowerCase() === tagName) {
        nth++;
      }
      prev = prev.previousSibling;
    }
    
    const newPath = currentPath + ` > ${tagName}:nth-of-type(${nth})`;
    
    if (newPath.includes('div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)')) {
      console.log("FOUND EXACT MATCH:", newPath);
      console.log($child.html());
    } else if (newPath.endsWith('div:nth-of-type(3)')) {
      console.log("FOUND A div:nth-of-type(3):", newPath);
      console.log("CLASS:", $child.attr('class'));
    }
    
    traverse($child, newPath);
  });
}

traverse($('div#root').parent(), '');
