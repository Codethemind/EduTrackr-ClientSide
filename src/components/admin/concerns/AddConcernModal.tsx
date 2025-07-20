import React from 'react';

interface AddConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Add other props as needed
}

const AddConcernModal: React.FC<AddConcernModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div>
      <h2>Add Concern Modal</h2>
      <button onClick={onClose}>Close</button>
      {/* Add your form fields here */}
    </div>
  );
};

export default AddConcernModal; 