import React from 'react';
import PropTypes from 'prop-types';

const CourseProgress = ({ courses }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
        <a href="/student/courses" className="text-sm text-blue-600 hover:text-blue-700">View All</a>
      </div>

      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{course.name}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>{course.instructor}</span>
                  <span className="mx-2">•</span>
                  <span>{course.schedule}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">{course.grade}</span>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {course.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                <div
                  style={{ width: `${course.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

CourseProgress.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      instructor: PropTypes.string.isRequired,
      schedule: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
      progress: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default CourseProgress; 