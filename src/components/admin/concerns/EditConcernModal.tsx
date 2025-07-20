import React, { useState } from 'react';

interface User {
  _id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
}

interface Concern {
  _id: string;
  title: string;
  description: string;
  type: 'Academic' | 'Administrative';
  raisedBy: User;
  role: 'student' | 'teacher';
  status: 'Pending' | 'In Progress' | 'Solved' | 'Rejected';
  feedback?: string;
  createdAt: string;
}

interface EditConcernModalProps {
  concern: Concern;
  onClose: () => void;
  onSave: (concernData: Partial<Concern>) => void;
}

const EditConcernModal: React.FC<EditConcernModalProps> = ({ concern, onClose, onSave }) => {
  const [status, setStatus] = useState<Concern['status']>(concern.status);
  const [feedback, setFeedback] = useState<string>(concern.feedback || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    console.log('Savingsdef concern:', { _id: concern.id, status, feedback });
    await onSave({ _id: concern.id, status, feedback });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Concern Status & Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={status}
              onChange={e => setStatus(e.target.value as Concern['status'])}
              required
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Solved">Solved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Enter feedback (optional)"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConcernModal; 