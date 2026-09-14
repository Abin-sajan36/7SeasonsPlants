const fs = require('fs');
let code = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const targetMethodType = `addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;`;
const replacementMethodType = `addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'> & { status?: Review['status'] }) => void;`;
code = code.replace(targetMethodType, replacementMethodType);

const targetMethod = `  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    const newReview: Review = {
      ...reviewData,
      id: \`rev_\${Date.now()}\`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };`;
    
const replacementMethod = `  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'> & { status?: Review['status'] }) => {
    const newReview: Review = {
      ...reviewData,
      id: \`rev_\${Date.now()}\`,
      createdAt: new Date().toISOString(),
      status: reviewData.status || 'pending',
    };`;

code = code.replace(targetMethod, replacementMethod);

fs.writeFileSync('src/context/StoreContext.tsx', code);
