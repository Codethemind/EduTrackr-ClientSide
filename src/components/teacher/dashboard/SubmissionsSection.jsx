import React from 'react';

const SubmissionsSection = () => {
  const submissions = [
    {
      student: 'John Smith',
      assignment: 'Programming Assignment #3',
      course: 'CS101: Introduction to Programming',
      time: 'Today, 9:45 AM',
    },
    {
      student: 'Sarah Davis',
      assignment: 'Data Structures Project',
      course: 'CS201: Data Structures',
      time: 'Yesterday, 4:30 PM',
    },
    {
      student: 'Michael Brown',
      assignment: 'Algorithm Analysis',
      course: 'CS301: Algorithms',
      time: 'Yesterday, 2:15 PM',
    },
    {
      student: 'Emma Wilson',
      assignment: 'Programming Assignment #3',
      course: 'CS101: Introduction to Programming',
      time: 'Dec 10, 11:30 AM',
    },
    {
      student: 'Robert Johnson',
      assignment: 'Binary Tree Implementation',
      course: 'CS201: Data Structures',
      time: 'Dec 9, 3:45 PM',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Submissions</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {submissions.map((submission, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium text-gray-900">
                {submission.student} submitted {submission.assignment}
              </p>
              <p className="text-sm text-gray-500">{submission.course}</p>
              <p className="text-sm text-gray-400">{submission.time}</p>
            </div>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded-lg">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionsSection; 