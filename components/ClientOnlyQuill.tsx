// components/ClientOnlyQuill.tsx
'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { FC } from 'react';

// Dynamically load ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface QuillProps {
  value: string;
  onChange: (value: string) => void;
}

const ClientOnlyQuill: FC<QuillProps> = ({ value, onChange }) => {
  return (
    <div className="quill-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        preserveWhitespace={true}
      />
    </div>
  );
};

export default ClientOnlyQuill;
