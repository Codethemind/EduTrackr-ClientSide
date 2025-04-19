import React from 'react';

const DeadlinesSection = () => {
  const deadlines = [
    {
      date: { day: 15, month: 'DEC' },
      title: 'Programming Assignment #4',
      course: 'CS101: Introduction to Programming',
      totalStudents: 32,
      submitted: 18,
    },
    {
      date: { day: 17, month: 'DEC' },
      title: 'Final Project',
      course: 'CS201: Data Structures',
      totalStudents: 28,
      submitted: 12,
    },
    {
      date: { day: 18, month: 'DEC' },
      title: 'Algorithm Analysis Report',
      course: 'CS301: Algorithms',
      totalStudents: 24,
      submitted: 8,
    },
    {
      date: { day: 20, month: 'DEC' },
      title: 'Final Exam',
      course: 'CS101: Introduction to Programming',
      totalStudents: 32,
      duration: '2 hours',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Upcoming Deadlines</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm">
          Manage Assignments
        </button>
      </div>

      <div className="space-y-4">
        {deadlines.map((deadline, index) => (
          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center">
              <span className="text-sm font-medium">{deadline.date.month}</span>
              <span className="text-xl font-bold">{deadline.date.day}</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900">{deadline.title}</h3>
              <p className="text-sm text-gray-500">{deadline.course}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>👥 {deadline.totalStudents} students</span>
                {deadline.submitted && (
                  <span>✅ {deadline.submitted} submitted</span>
                )}
                {deadline.duration && (
                  <span>⏱️ {deadline.duration}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeadlinesSection; 