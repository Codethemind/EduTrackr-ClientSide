import React from 'react';

const PerformanceChart = () => {
  const performanceData = [
    { course: 'CS101', grade: 78 },
    { course: 'CS201', grade: 85 },
    { course: 'CS301', grade: 72 },
    { course: 'CS401', grade: 80 },
    { course: 'CS501', grade: 88 },
  ];

  const maxGrade = Math.max(...performanceData.map(d => d.grade));
  const minGrade = Math.min(...performanceData.map(d => d.grade));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Class Performance</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">Week</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Month</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Semester</button>
        </div>
      </div>

      <div className="h-64 flex items-end gap-8 mb-6">
        {performanceData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-600 rounded-t-lg transition-all duration-300"
              style={{ height: `${(data.grade / 100) * 100}%` }}
            />
            <p className="mt-2 text-sm font-medium text-gray-600">{data.course}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div>
          <p className="font-medium">Highest Performing Class</p>
          <p>CS201: Data Structures (85%)</p>
        </div>
        <div className="text-right">
          <p className="font-medium">Lowest Performing Class</p>
          <p>CS301: Algorithms (60%)</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Overall Average</p>
        <p className="text-2xl font-bold text-gray-900">76%</p>
      </div>
    </div>
  );
};

export default PerformanceChart; 