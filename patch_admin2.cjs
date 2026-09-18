const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// add UserManagementTab import
if (!content.includes('UserManagementTab')) {
  content = content.replace(
    /import \{ useStore \} from '\.\.\/context\/StoreContext';/,
    "import { useStore } from '../context/StoreContext';\nimport { UserManagementTab } from '../components/admin/UserManagementTab';"
  );
}

// update useState
content = content.replace(
  /useState\<'analytics' \| 'products' \| 'combos' \| 'orders' \| 'offline-orders' \| 'accounts' \| 'settings' \| 'ai-tools'\>/,
  "useState<'analytics' | 'products' | 'combos' | 'orders' | 'offline-orders' | 'accounts' | 'users' | 'settings' | 'ai-tools'>"
);

// update nav tab array
const tabsArrayMatch = /\{ id: 'accounts', label: \`Admin Accounts \& Security \(\$\{adminAccounts\.length\}\)\`, icon: Users \},/;
if (content.includes("{ id: 'accounts'")) {
  content = content.replace(
    tabsArrayMatch,
    `{ id: 'accounts', label: \`Admin Accounts & Security (\${adminAccounts.length})\`, icon: ShieldCheck },
            { id: 'users', label: 'User Management', icon: Users },`
  );
}

// import ShieldCheck if not present
if (!content.includes('ShieldCheck,')) {
    content = content.replace(/Users,/, "Users, ShieldCheck,");
}

// add the users tab rendering block
const renderAccountsTab = /\{\/\* TAB 4: ADMIN ACCOUNTS \& SECURITY \*\/\}/;
content = content.replace(
  renderAccountsTab,
  `{/* TAB: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <UserManagementTab />
        )}

        {/* TAB 4: ADMIN ACCOUNTS & SECURITY */}`
);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
