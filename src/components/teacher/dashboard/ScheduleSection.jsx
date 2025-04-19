import React from 'react';

const ScheduleSection = () => {
  const scheduleItems = [
    {
      time: '8:00 AM',
      duration: '1h 30m',
      title: 'CS101: Introduction to Programming',
      location: 'Room 302, Science Building',
      students: 32,
    },
    {
      time: '10:30 AM',
      duration: '1h 30m',
      title: 'CS201: Data Structures',
      location: 'Room 405, Computer Lab',
      students: 28,
    },
    {
      time: '1:00 PM',
      duration: '1h',
      title: 'Department Meeting',
      location: 'Conference Room A',
      attendees: 'Faculty Only',
    },
    {
      time: '3:00 PM',
      duration: '1h 30m',
      title: 'CS301: Algorithms',
      location: 'Room 302, Science Building',
      students: 24,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm">
          Full Schedule
        </button>
      </div>
      
      <div className="space-y-6">
        {scheduleItems.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-24 flex-shrink-0">
              <p className="font-medium text-gray-900">{item.time}</p>
              <p className="text-sm text-gray-500">{item.duration}</p>
            </div>
            <div className="flex-grow">
              <p className="font-medium text-gray-900">{item.title}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📍 {item.location}</span>
                {item.students ? (
                  <span>👥 {item.students} students</span>
                ) : (
                  <span>👥 {item.attendees}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleSection; 