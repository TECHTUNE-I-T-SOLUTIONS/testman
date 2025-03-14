import { useState, useEffect } from "react";

type Department = {
  _id: string;
  name: string;
  levels: Level[];
};

type Level = {
  _id: string;
  name: string;
  courses: Course[];
};

type Course = {
  _id: string;
  name: string;
  code: string;
  facultyId: string;
  departmentId: { _id: string; name: string };
  levelId: { _id: string; name: string };
};

type Props = {
  departments: Department[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
};

export default function CourseList({ onEdit, onDelete }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments");
        if (!response.ok) throw new Error("Failed to fetch departments");

        const data = await response.json();
        console.log("Fetched Departments Data:", JSON.stringify(data, null, 2));

        if (!Array.isArray(data)) throw new Error("Invalid API response");

        setDepartments(
          data.map((dept, deptIndex) => ({
            _id: dept._id || `dept-${deptIndex}`,
            name: dept.name || "Unnamed Department",
            levels: Array.isArray(dept.levels)
              ? dept.levels.map(
                  (
                    level: { _id: string; name: string; courses: Course[] },
                    levelIndex: number
                  ) => ({
                    _id: level._id || `level-${levelIndex}`,
                    name: level.name || "Unnamed Level",
                    courses: Array.isArray(level.courses)
                      ? level.courses.map((course, courseIndex) => ({
                          _id: course._id || `course-${courseIndex}`,
                          name: course.name || "Unnamed Course",
                          code: course.code || "N/A",
                        }))
                      : [],
                  })
                )
              : [],
          }))
        );
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  const handleDepartmentClick = (departmentId: string) => {
    console.log("Clicked Department ID:", departmentId);
    setSelectedDepartment(
      departmentId === selectedDepartment ? null : departmentId
    );
    setSelectedLevel(null);
  };

  const handleLevelClick = (levelId: string, levelCourses?: Course[]) => {
    console.log("Clicked Level ID:", levelId, "Courses:", levelCourses);
    setSelectedLevel(levelId === selectedLevel ? null : levelId);
    setCourses(levelCourses ?? []);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="mt-4 space-y-4">
      {departments.length === 0 ? (
        <p className="text-gray-500 text-center">No departments available.</p>
      ) : (
        <div>
          {departments.map((department, deptIndex) => (
            <div
              key={department._id || `dept-${deptIndex}`}
              className="bg-white shadow-md rounded-md p-4 mb-4"
            >
              <div
                className="cursor-pointer text-lg font-semibold text-gray-800 hover:text-blue-600 transition flex justify-between items-center"
                onClick={() => handleDepartmentClick(department._id)}
              >
                <span>{department.name}</span>
                <span className="text-sm text-gray-500">
                  ({department.levels?.length ?? 0} Levels)
                </span>
              </div>

              {selectedDepartment === department._id &&
                department.levels?.length > 0 && (
                  <ul className="mt-2 space-y-2 pl-4 border-l border-gray-300">
                    {department.levels.map((level, levelIndex) => (
                      <li
                        key={level._id || `level-${levelIndex}`}
                        className="cursor-pointer text-gray-700 hover:text-blue-500 transition"
                        onClick={() =>
                          handleLevelClick(level._id, level.courses)
                        }
                      >
                        {level.name} ({level.courses?.length ?? 0} Courses)
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for showing courses */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-md shadow-md min-w-max"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Available Courses
            </h2>
            {courses.length === 0 ? (
              <p className="text-gray-500">
                No courses available for this level.
              </p>
            ) : (
              <ul className="space-y-2">
                {courses.map((course) => (
                  <li
                    key={course._id}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                  >
                    <div>
                      <p className="text-gray-800">{course.name}</p>
                      <p className="text-gray-600">Code: {course.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(course)}
                        className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(course._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
