import { useState, useEffect } from "react";

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface CourseDropdownProps {
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
}

export default function CourseDropdown({
  selectedCourse,
  setSelectedCourse,
}: CourseDropdownProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async (): Promise<void> => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Failed to fetch courses");

        const data: Course[] = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    setFilteredCourses(
      courses.filter(
        (course) =>
          course.name.toLowerCase().includes(search.toLowerCase()) ||
          course.code.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, courses]);

  return (
    <div className="w-full">
      <label
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
        htmlFor="course-search"
      >
        📚 Select a Course
      </label>

      <input
        id="course-search"
        type="text"
        placeholder="🔍 Search course by name or code"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          mt-1 w-full p-2 rounded-lg shadow-sm border
          bg-white text-gray-900 border-gray-300
          focus:border-purple-500 focus:ring-2 focus:ring-purple-200
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
          dark:focus:border-purple-400 dark:focus:ring-purple-700
          transition-colors duration-300
        "
        autoComplete="off"
      />

      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="
          mt-2 w-full p-2 rounded-lg shadow-sm border
          bg-white text-gray-900 border-gray-300
          focus:border-purple-500 focus:ring-2 focus:ring-purple-200
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
          dark:focus:border-purple-400 dark:focus:ring-purple-700
          transition-colors duration-300
        "
      >
        <option value="">-- Select Course --</option>
        {loading ? (
          <option disabled>Loading courses...</option>
        ) : filteredCourses.length === 0 ? (
          <option disabled>No courses found</option>
        ) : (
          filteredCourses.map((course) => (
            <option
              key={course._id}
              value={course._id}
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
            >
              {course.name} ({course.code})
            </option>
          ))
        )}
      </select>
    </div>
  );
}
