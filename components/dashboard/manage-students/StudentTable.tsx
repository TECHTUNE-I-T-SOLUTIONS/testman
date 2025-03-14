import React from "react";

type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string };
  isActive: boolean;
};

type StudentTableProps = {
  students: Student[];
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
};

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onActivate,
  onDelete,
}) => (
  <div className="overflow-x-auto p-4">
    <table className="w-full border border-gray-300 rounded-lg shadow-lg">
      <thead className="bg-purple-700 text-white text-left">
        <tr className="uppercase text-sm tracking-wider">
          {[
            "S/N",
            "Name",
            "Email",
            "Reg. Number",
            "Faculty",
            "Department",
            "Level",
            "Status",
            "Actions",
          ].map((header) => (
            <th key={header} className="px-4 py-3 border-b border-purple-500">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {students.map((student, index) => (
          <tr
            key={student._id}
            className="hover:bg-purple-100 transition duration-300"
          >
            <td className="px-4 py-3 font-semibold text-purple-700">
              {index + 1}
            </td>
            <td className="px-4 text-purple-600 py-3">{student.name}</td>
            <td className="px-4 text-purple-600 py-3">{student.email}</td>
            <td className="px-4 text-purple-600 py-3">
              {student.matricNumber}
            </td>
            <td className="px-4 text-purple-600 py-3">
              {student.faculty?.name || "N/A"}
            </td>
            <td className="px-4 text-purple-600 py-3">
              {student.department?.name || "N/A"}
            </td>
            <td className="px-4 text-purple-600 py-3">
              {student.level?.name || "N/A"}
            </td>
            <td className="px-4 text-purple-600 py-3 font-semibold">
              {student.isActive ? (
                <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
                  Active
                </span>
              ) : (
                <span className="text-red-600 bg-red-100 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </td>
            <td className="px-4 py-3 flex gap-2">
              {!student.isActive && (
                <button
                  onClick={() => onActivate(student._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  title="Activate Student"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => onDelete(student._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                title="Delete Student"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StudentTable;
