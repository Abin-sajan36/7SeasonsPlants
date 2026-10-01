const fs = require('fs');
let content = fs.readFileSync('src/components/common/Header.tsx', 'utf-8');

// Fix 1: Announcement Bar missing closing div
content = content.replace(
  /Explore Combos →\s*<\/button>\s*<\/div>\s*\)}/,
  'Explore Combos →\n          </button>\n        </div>\n        </div>\n      )}'
);

// Fix 2: Account dropdown missing closing divs
content = content.replace(
  /Create New Account 🌿\s*<\/button>\s*<\/div>\s*\)}\s*<div className="py-1">/,
  'Create New Account 🌿\n                        </button>\n                      </div>\n                    </div>\n                  )}\n                  <div className="py-1">'
);

// Fix 3: Let's check line 555 area
content = content.replace(
  /<span>Sign Out<\/span>\s*<\/button>\s*<\/div>\s*\)}\s*<\/div>\s*\)}\s*<\/div>\s*{\/\* Cart Button \*\//,
  '<span>Sign Out</span>\n                      </button>\n                    </div>\n                  )}\n                </div>\n              )}\n            </div>\n            {/* Cart Button */}'
);

fs.writeFileSync('src/components/common/Header.tsx', content);
