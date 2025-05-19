import { create } from 'zustand';

interface FormData {
  name: string;
  email: string;
  matricNumber: string;
  faculty: string;
  department: string;
  level: string;
  phoneNumber: string; // ✅ added
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
    phoneNumber: '', // ✅ initialized
    password: '',
    confirmPassword: '',
  },
  step: 1,
  setStep: (step) => set(() => ({ step })),
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () =>
    set({
      formData: {
        name: '',
        email: '',
        matricNumber: '',
        faculty: '',
        department: '',
        level: '',
        phoneNumber: '', // ✅ reset
        password: '',
        confirmPassword: '',
      },
      step: 1,
    }),
}));

export default useFormStore;
