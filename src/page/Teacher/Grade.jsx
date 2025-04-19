import React, { useState } from "react";
import TeacherSideBar from "../../components/sideBar/teacherSideBar";
import { FaSearch, FaPlus } from "react-icons/fa";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

// Dummy student data
const dummyStudents = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  roll: `R-${100 + i}`,
  class: "9B",
  marks: {
    English: Math.floor(Math.random() * 100),
    Hindi: Math.floor(Math.random() * 100),
    Malayalam: Math.floor(Math.random() * 100),
  },
  phone: `98765432${i < 10 ? "0" + i : i}`,
  address: `Address ${i + 1}`,
  guardian: `Guardian ${i + 1}`,
  profile: 'https://randomuser.me/api/portraits/men/75.jpg',
}));

const studentsPerPage = 5;

const Grade = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);

  const filteredStudents = dummyStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const studentsToShow = filteredStudents.slice(
    (page - 1) * studentsPerPage,
    page * studentsPerPage
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-[rgba(53,130,140,0.4)]">
      <TeacherSideBar page="Grade" />

      <div className="flex-1 p-6 md:ml-10 mt-5 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Student Grades</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgba(53,130,140,0.9)] text-white rounded-lg shadow-md hover:bg-[rgba(53,130,140,1)]"
          >
            <FaPlus /> Add Student
          </button>
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none"
          />
          <FaSearch className="absolute top-3 right-3 text-gray-500" />
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          {studentsToShow.length ? (
            <div className="space-y-4">
              {studentsToShow.map((student) => (
                <div
                  key={student.id}
                  className="flex justify-between items-center bg-[rgba(53,130,140,0.05)] p-4 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-lg">{student.name}</p>
                    <p className="text-gray-600 text-sm">
                      Roll: {student.roll} | Class: {student.class}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetailModal(student)}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setShowMarkModal(student)}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Mark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No students found.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${
                  page === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[rgba(53,130,140,0.8)] text-white hover:bg-[rgba(53,130,140,1)]"
                }`}
              >
                <IoIosArrowDropleft size={30} />
              </button>
              <span className="text-gray-800 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[rgba(53,130,140,0.8)] text-white hover:bg-[rgba(53,130,140,1)]"
                }`}
              >
                <IoIosArrowDropright size={30} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <Modal title="Add New Student" onClose={() => setShowAddModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowAddModal(false);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Roll Number"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Address"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Guardian Name"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setProfilePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {profilePreview && (
              <img
                src={profilePreview}
                alt="Profile Preview"
                className="w-24 h-24 object-cover rounded-full mx-auto"
              />
            )}
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[rgba(53,130,140,0.9)] text-white rounded-md hover:bg-[rgba(53,130,140,1)]"
              >
                Add
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDetailModal && (
        <Modal title="Student Details" onClose={() => setShowDetailModal(null)}>
          <div className="space-y-3 text-center">
            {showDetailModal.profile && (
              <img
                src={showDetailModal.profile}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto"
              />
            )}
            <p><strong>Name:</strong> {showDetailModal.name}</p>
            <p><strong>Class:</strong> {showDetailModal.class}</p>
            <p><strong>Phone:</strong> {showDetailModal.phone}</p>
            <p><strong>Address:</strong> {showDetailModal.address}</p>
            <p><strong>Guardian:</strong> {showDetailModal.guardian}</p>
          </div>
        </Modal>
      )}

      {showMarkModal && (
        <Modal title="Student Marks" onClose={() => setShowMarkModal(null)}>
          {showMarkModal.marks ? (
            <div className="space-y-3">
              {Object.entries(showMarkModal.marks).map(([subject, mark]) => (
                <div key={subject} className="flex justify-between items-center">
                  <p>
                    <strong>{subject}</strong>: {mark} marks
                  </p>
                  <button
                    onClick={() => {
                      const newMark = prompt(`Edit mark for ${subject}`, mark);
                      if (newMark !== null) {
                        showMarkModal.marks[subject] = Number(newMark);
                        setShowMarkModal({ ...showMarkModal });
                      }
                    }}
                    className="text-sm text-blue-500 underline"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={() => {
                const newMarks = {};
                ["English", "Hindi", "Malayalam"].forEach((subject) => {
                  const mark = prompt(`Enter mark for ${subject}`);
                  if (mark !== null) newMarks[subject] = Number(mark);
                });
                showMarkModal.marks = newMarks;
                setShowMarkModal({ ...showMarkModal });
              }}
              className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Marks
            </button>
          )}
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Grade;