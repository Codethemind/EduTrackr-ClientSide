import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
        <p className="text-gray-600">{title}</p>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
};

export default StatsCard; 