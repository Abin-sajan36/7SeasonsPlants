global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
global.window = { matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }), innerWidth: 1024, innerHeight: 768, scrollTo: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
global.document = { addEventListener: () => {}, removeEventListener: () => {}, createElement: () => ({}) };

import { renderToString } from 'react-dom/server';
import React, { useEffect } from 'react';
import App from './src/App.tsx';
import { HelmetProvider } from 'react-helmet-async';
import { useStore, StoreProvider } from './src/context/StoreContext.tsx';
import * as cheerio from 'cheerio';

const TriggerAll = () => {
  const { setIsCartOpen, setQuickViewItem, products, combos } = useStore();
  
  // Try to render everything
  try { setIsCartOpen(true); } catch(e) {}
  try { setQuickViewItem({ item: products[0], type: 'product' }); } catch(e) {}
  
  return null;
}

const html = renderToString(
  <HelmetProvider>
    <StoreProvider>
      <TriggerAll />
      <App />
    </StoreProvider>
  </HelmetProvider>
);

const $ = cheerio.load(`<div id="root">${html}</div>`);

function traverse(el, currentPath) {
  el.children().each((i, child) => {
    const $child = $(child);
    const tag = $child.prop('tagName');
    if (!tag) return;
    const tagName = tag.toLowerCase();
    
    let nth = 1;
    let prev = child.previousSibling;
    while(prev) {
      if (prev.type === 'tag' && prev.name.toLowerCase() === tagName) {
        nth++;
      }
      prev = prev.previousSibling;
    }
    
    const newPath = currentPath + (currentPath ? ' > ' : '') + `${tagName}:nth-of-type(${nth})`;
    
    if (newPath.includes('div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)')) {
      console.log("MATCH:", newPath);
      console.log("CLASS:", $child.attr('class'));
    }
    
    traverse($child, newPath);
  });
}

traverse($('div#root').parent(), '');
