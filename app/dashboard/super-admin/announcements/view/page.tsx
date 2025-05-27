'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface Announcement {
  _id: string;
  content: string;
  duration: number;
  createdAt: string;
  show: boolean;
}

export default function ViewAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDuration, setEditDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.log(err);
      toast.error('Failed to load announcements');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement._id);
    setEditContent(announcement.content);
    setEditDuration(announcement.duration);
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/announcements/${editingId}`, {
        content: editContent,
        duration: editDuration,
      });
      toast.success('Announcement updated');
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.log(err);
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      await axios.patch(`/api/announcements/${id}`, {
        show: !current,
      });
      toast.success(`Announcement ${current ? 'hidden' : 'visible'}`);
      fetchAnnouncements();
    } catch (err) {
      console.log(err);
      toast.error('Toggle failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Announcements</h1>

      {announcements.length === 0 ? (
        <p className="text-gray-600">No announcements found.</p>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="border border-gray-300 p-4 rounded-md shadow-sm"
            >
              {editingId === announcement._id ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit content"
                  />
                  <Input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    placeholder="Edit duration (in days)"
                  />
                  <div className="flex gap-3">
                    <Button onClick={saveEdit} disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium">{announcement.content}</p>
                  <p className="text-sm text-gray-600">Duration: {announcement.duration} day(s)</p>
                  <p className="text-sm">
                    Visibility:{" "}
                    <span className={announcement.show ? "text-green-600" : "text-red-600"}>
                      {announcement.show ? "Visible to students" : "Hidden"}
                    </span>
                  </p>
                  <div className="mt-2 flex gap-3">
                    <Button onClick={() => handleEdit(announcement)}>Edit</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(announcement._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleVisibility(announcement._id, announcement.show)}
                    >
                      {announcement.show ? "Hide from students" : "Show to students"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
