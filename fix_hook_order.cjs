const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// Find useStore block end
const useStoreEnd = code.indexOf('  } = useStore();') + 17;

// Extract to the end of formData
const formDataMatch = code.match(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/);
const invalidCartItemsMatch = code.match(/const invalidCartItems = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[cart, combos, formData\?\.state\]\);/);

if (formDataMatch && invalidCartItemsMatch) {
  // Let's just remove both and insert them in the right order
  code = code.replace(invalidCartItemsMatch[0], '');
  code = code.replace(formDataMatch[0], '');
  
  // Remove empty lines
  code = code.replace(/\n\s*\n\s*\n/g, '\n\n');

  const newHooks = `  // Form State
  ${formDataMatch[0]}

  ${invalidCartItemsMatch[0].replace('formData?.state', 'formData.state')}
`;

  const insertPos = code.indexOf('  } = useStore();') + 17;
  code = code.substring(0, insertPos) + '\n\n' + newHooks + code.substring(insertPos);

  fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
  console.log('Fixed hook order');
} else {
  console.log('Could not find matches');
}
