import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';

const TodaySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authState = useSelector((state) => state.auth);
  const studentId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!studentId || !accessToken) {
        setLoading(false);
        setError('Authentication required');
        return;
      }

      try {
        setLoading(true);
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;

          if (student.departmentId) {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const schedulesResponse = await axios.get(
              `/api/schedules/department/${student.departmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (schedulesResponse.data.success) {
              const formattedSchedule = schedulesResponse.data.data
                .filter((item) => item.day === today)
                .map((item) => ({
                  _id: item._id,
                  course: item.courseId?.name || 'Course Not Available',
                  courseCode: item.courseId?.code,
                  startTime: item.startTime,
                  endTime: item.endTime,
                  location: item.room || 'TBA',
                  instructor: item.teacherId?.username || 'To Be Announced',
                  credits: item.courseId?.credits,
                  status: 'Upcoming',
                }))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              setSchedule(formattedSchedule);
            } else {
              throw new Error('Failed to load schedule');
            }
          } else {
            throw new Error('Student department not found');
          }
        } else {
          throw new Error('Failed to load student information');
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load schedule';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [studentId, accessToken]);

  const formatTime = (time) => {
    try {
      if (!time) return 'N/A';
      return new Date(`1970-01-01T${time}Z`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        <a href="/student/classpage" className="text-sm text-blue-600 hover:text-blue-700">
          View Full Schedule
        </a>
      </div>

      <div className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for today
          </div>
        ) : (
          schedule.map((item) => (
            <div
              key={item._id}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-medium text-gray-900">{formatTime(item.startTime)}</div>
                <div className="text-xs text-gray-500">{formatTime(item.endTime)}</div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{item.course}</h3>
                {item.courseCode && (
                  <p className="text-xs font-medium text-blue-700 mt-1">Course ID: {item.courseCode}</p>
                )}
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <MdLocationOn className="mr-1" />
                  {item.location}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">👤 {item.instructor}</span>
                  {item.credits && (
                    <span className="text-xs text-gray-500">📚 {item.credits} Credits</span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;