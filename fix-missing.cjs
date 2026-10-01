const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// I accidentally stripped tags, attributes, careInstructions, createdAt when I replaced the product data
// Let's add them back to each product in initialProducts

const additions = `
    tags: ['indoor'],
    attributes: {
      light: 'Bright indirect',
      water: 'Moderate',
      petFriendly: false,
      difficulty: 'Easy',
      size: 'Medium'
    },
    careInstructions: {
      light: 'Keep in bright indirect light.',
      water: 'Water when top soil is dry.',
      soil: 'Well draining potting mix.',
      temperature: '15-30°C',
      humidity: 'Medium to High'
    },
    createdAt: new Date().toISOString(),`;

content = content.replace(/    status: 'published',/g, "    status: 'published'," + additions);


const comboAdditions = `
    tags: ['combo'],
    careSummary: 'Water when dry, give bright light.',
    benefits: ['Looks great', 'Cleans air'],
    createdAt: new Date().toISOString(),`;

content = content.replace(/    petFriendly: (true|false),/g, "    petFriendly: $1," + comboAdditions);

// Fix blog posts lacking tags
content = content.replace(/    isPublished: true,/g, "    isPublished: true,\n    tags: ['plants'],");

// Fix reviews lacking createdAt
content = content.replace(/    status: 'approved',/g, "    status: 'approved',\n    createdAt: new Date().toISOString(),");

// Fix orders lacking createdAt - wait, orders HAVE createdAt but the compiler says missing.
// Ah, the compiler says Order is missing createdAt. Let's see what Order has.
