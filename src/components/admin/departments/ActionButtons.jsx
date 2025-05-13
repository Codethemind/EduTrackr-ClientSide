import React from 'react';

const ActionButtons = ({ item, onEdit, onDelete, onView }) => {
  return (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => onView(item)}
        className="text-blue-600 hover:text-blue-800"
        title="View Details"
      >
        <i className="ti ti-eye text-lg"></i>
      </button>
      <button
        onClick={() => onEdit(item)}
        className="text-green-600 hover:text-green-800"
        title="Edit"
      >
        <i className="ti ti-pencil text-lg"></i>
      </button>
      <button
        onClick={() => onDelete(item)}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <i className="ti ti-trash text-lg"></i>
      </button>
    </div>
  );
};

export default ActionButtons; 