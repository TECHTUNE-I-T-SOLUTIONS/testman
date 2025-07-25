export type Department = {
  _id: string;
  name: string;
  facultyId: string;
  levels?: Level[]; 
};


export type DepartmentInput = {
  name: string;
  facultyId: string;
};

export type Faculty = {
  _id: string;
  name: string;
  departments: { _id: string; name: string }[];
  session: string;
  sessionName?: string
};

export type FacultyInput = {
  name: string;
  session: string;
};

export interface Level {
  courses: any;
  _id: string;
  name: string;
  departmentId: string | Department; 
}


export type LevelInput = {
  name: string;
  departmentId: string;
};

type Ref = { _id: string; name: string };

export type Course = {
  _id?: string;
  name: string;
  code: string;
  departmentId: string | Ref;
  levelId: string | Ref;
  facultyId?: string | Ref;
};

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  courseId: string;
  questionText: string;
  options: Option[];
}

export interface Student {
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string };
  isActive: boolean; // converted from "True"/"False" to boolean
}

