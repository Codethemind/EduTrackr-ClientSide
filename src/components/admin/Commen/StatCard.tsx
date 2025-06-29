// src/components/admin/StatCard.jsx
import React from "react";

const StatCard = ({ icon, iconColor, value, label, trend, trendValue, gradient }) => {
  const iconColors = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    teal: "text-teal-600",
    amber: "text-amber-600",
    // Fallback
    default: "text-gray-600"
  };
  
  const trendIcons = {
    up: "ti-arrow-up",
    down: "ti-arrow-down",
    // Fallback
    neutral: "ti-minus"
  };
  
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    // Fallback
    neutral: "text-gray-600"
  };

  // Ensure we have valid values with fallbacks
  const safeValue = value || '0';
  const safeLabel = label || 'Stat';
  const safeTrend = trend || 'neutral';
  const safeTrendValue = trendValue || '0% change';
  const safeGradient = gradient || 'from-gray-50 to-gray-100';
  const safeIcon = icon || 'chart-bar';
  const safeIconColor = iconColors[iconColor] || iconColors.default;
  
  return (
    <div className={`bg-gradient-to-br ${safeGradient} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-opacity-20 ${safeIconColor} bg-current`}>
          <i className={`ti ti-${safeIcon} text-2xl`} />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{safeValue}</div>
          <div className="text-sm text-gray-600">{safeLabel}</div>
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-4 ${trendColors[safeTrend]}`}>
        <i className={`ti ${trendIcons[safeTrend]} text-lg`} />
        <span className="text-sm font-medium">{safeTrendValue}</span>
      </div>
    </div>
  );
};

export default StatCard;