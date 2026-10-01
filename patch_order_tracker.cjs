const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const helperCode = `
  const getOrderProgress = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('shipped') || s.includes('out for delivery')) return 3;
    if (s.includes('packed')) return 2;
    if (s.includes('cancelled') || s.includes('failed')) return 0;
    return 1;
  };
`;

code = code.replace(/const getStatusBadgeColor = /m, helperCode + '\n  const getStatusBadgeColor = ');

// fallback if getStatusBadgeColor doesn't exist
if (!code.includes('getOrderProgress')) {
  code = code.replace(/const customerOrders = orders.filter/m, helperCode + '\n  const customerOrders = orders.filter');
}

const replacement = `
                  </div>

                  {/* Progress Tracker */}
                  {getOrderProgress(order.orderStatus) > 0 && (
                    <div className="py-4">
                      <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500 hidden sm:block"
                          style={{ width: \`\${(getOrderProgress(order.orderStatus) - 1) * 33.33}%\` }}
                        ></div>
                        
                        <div className="relative z-10 flex justify-between items-center text-center sm:text-left">
                          {[
                            { step: 1, label: 'Processing', icon: Clock },
                            { step: 2, label: 'Packed', icon: Box },
                            { step: 3, label: 'Shipped', icon: Truck },
                            { step: 4, label: 'Delivered', icon: CheckCircle2 }
                          ].map((stage) => {
                            const progress = getOrderProgress(order.orderStatus);
                            const isCompleted = stage.step < progress;
                            const isCurrent = stage.step === progress;
                            const isPending = stage.step > progress;
                            
                            const Icon = stage.icon;
                            
                            return (
                              <div key={stage.step} className="flex flex-col items-center gap-2 flex-1">
                                <div 
                                  className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 \${
                                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                    isCurrent ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm ring-4 ring-emerald-50' : 
                                    'bg-white border-gray-200 text-gray-300'
                                  }\`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className={\`text-[10px] font-bold uppercase tracking-wider hidden sm:block \${
                                  isCompleted || isCurrent ? 'text-emerald-950' : 'text-gray-400'
                                }\`}>
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
`;

code = code.replace(/<\/div>\s*\{\/\* Items list \*\/\}/, replacement);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
