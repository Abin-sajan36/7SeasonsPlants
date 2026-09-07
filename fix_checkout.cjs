const fs = require('fs');

let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// The modal was inserted. 
// We want to remove the misplaced modal inside the PaymentModal,
// and add the modal correctly at the end.

// Let's just remove the first `<PaymentModal ... />` block from where it is and put it at the end.
code = code.replace(
  /\s*<PaymentModal\s+isOpen=\{showPaymentModal\}\s+onClose=\{\(\) => setShowPaymentModal\(false\)\}\s+total=\{Math\.round\(cartTotal\)\}\s+onConfirm=\{processOrder\}\s+\/>/,
  ''
);

// Now the end of the file looks like:
//         </div>
//       </div>
//     </div>
//   );
// };
// 
// So we want to replace the LAST `    </div>\n  );\n};\n` with the modal correctly placed.

let match = code.match(/<\/div>\n  \);\n};\n$/);
if (match) {
  code = code.replace(/<\/div>\n  \);\n};\n$/, 
`      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={Math.round(cartTotal)} 
        onConfirm={processOrder} 
      />
    </div>
  );
};
`);
} else {
  // If we can't find it precisely at the end, find the last `</div>` before `);`
  const lastReturn = code.lastIndexOf('  );\n};');
  if (lastReturn !== -1) {
    code = code.substring(0, lastReturn - 11) + 
`      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        total={Math.round(cartTotal)} 
        onConfirm={processOrder} 
      />
    </div>
  );\n};\n`;
  }
}

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
