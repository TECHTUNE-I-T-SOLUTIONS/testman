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

export type Course = {
  _id?: string;
  name: string;
  code: string;
  facultyId?: string
  departmentId?: { _id: string; name: string } | string
  levelId?: { _id: string; name: string } | string
};

export interface Option {
  text: string;
  isCorrect: boolean;
}