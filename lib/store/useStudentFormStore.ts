import { create } from 'zustand';

interface FormData {
  name: string;
  email: string;
  matricNumber: string;
  faculty: string;
  department: string;
  level: string;
  password: string;
  confirmPassword: string;
}

interface FormStore {
  formData: FormData;
  step: number;
  setStep: (step: number) => void;
  setFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

const useFormStore = create<FormStore>((set) => ({
  formData: {
    name: '',
    email: '',
    matricNumber: '',
    faculty: '',
    department: '',
    level: '',
    password: '',
    confirmPassword: '',
  },
  step: 1, // Default step value
  setStep: (step) => set(() => ({ step })), // Corrected setter function
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
  })),
  resetForm: () => set({
    formData: {
      name: '',
      email: '',
      matricNumber: '',
      faculty: '',
      department: '',
      level: '',
      password: '',
      confirmPassword: '',
    },
    step: 1, // Reset step as well
  }),
}));

export default useFormStore;
