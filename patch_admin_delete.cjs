const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const target = `                            <option value="Cancelled">Cancelled</option>
                          </select>
                      </div>`;
const replacement = `                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this order?')) {
                                deleteOrder(ord.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                      </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
