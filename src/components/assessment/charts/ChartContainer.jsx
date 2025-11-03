import React from 'react';


// ✅ 1. CHART CONTAINER (Reusable Wrapper)
const ChartContainer = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-almet-sapphire" />}
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
    </div>
    {children}
  </div>
);

export default ChartContainer





