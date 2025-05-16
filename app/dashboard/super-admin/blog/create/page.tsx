'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Editor from '@/components/Editor';

interface FormData {
  title: string;
  content: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];

export default function CreateBlogPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | ''>('');
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Unsupported file type.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File too large. Max size is 20MB.');
      return;
    }

    const isImage = file.type.startsWith('image');
    const isVideo = file.type.startsWith('video');

    setSelectedFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(isImage ? 'image' : isVideo ? 'video' : '');
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', content);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    const response = await fetch('/api/blog', {
      method: 'POST',
      body: formData,
    });

    setUploading(false);

    if (response.ok) {
      router.push('/dashboard/super-admin/blog/view');
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || 'Failed to create blog post'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Title</label>
          <input
            type="text"
            {...register('title', { required: true })}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Content</label>
          <Editor content={content} setContent={setContent} />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Upload Image/Video</label>
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleMediaChange}
          />
          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}

          {mediaPreview && mediaType === 'image' && (
            <div className="mt-4">
              <Image
                src={mediaPreview}
                alt="Image Preview"
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
          )}

          {mediaPreview && mediaType === 'video' && (
            <div className="mt-4">
              <video
                src={mediaPreview}
                controls
                width={300}
                className="rounded-md"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`px-6 py-2 rounded text-white ${
            uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {uploading ? 'Submitting...' : 'Submit Blog Post'}
        </button>
      </form>
    </div>
  );
}
