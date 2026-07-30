import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, Image } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, UnderlineIcon, List, ListOrdered, Heading2, AlignLeft, Undo, Redo } from 'lucide-react';
import api from '../../lib/api';
import { Category } from '../../types';
import { cn } from '../../lib/utils';

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;
  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Qalin' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Kursiv' },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Tagiziq' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Sarlavha' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Ro\'yxat' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Tartibli ro\'yxat' },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, title: 'Orqaga' },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, title: 'Oldinga' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] rounded-t-xl">
      {buttons.map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={btn.action}
          title={btn.title}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            btn.active ? 'bg-primary-500 text-white' : 'text-secondary hover:bg-[rgb(var(--bg-card))] hover:text-primary'
          )}
        >
          <btn.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage,
      Placeholder.configure({ placeholder: 'Post matnini yozing...' }),
    ],
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 outline-none text-[rgb(var(--text))] prose prose-sm max-w-none',
      },
    },
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload?folder=posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImage(data.url);
    } catch { toast.error('Rasm yuklashda xatolik'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Sarlavha talab qilinadi'); return; }
    const content = editor?.getHTML() || '';
    if (content.length < 20) { toast.error('Post matni juda qisqa'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/posts', {
        title,
        content,
        coverImage,
        categoryId: categoryId || null,
      });
      toast.success('Post muvaffaqiyatli nashr qilindi! +10 ball');
      navigate(`/posts/${data.post._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-8">Post yozish</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Sarlavha *</label>
            <input
              id="post-title"
              type="text"
              className="input text-lg font-semibold"
              placeholder="Post sarlavhasini kiriting..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Muqova rasmi</label>
              <label className={cn(
                'flex items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all h-32',
                coverImage ? 'border-primary-400' : 'border-[rgb(var(--border))] hover:border-primary-400 hover:bg-primary-500/5'
              )}>
                {coverImage ? (
                  <img src={coverImage} alt="Muqova" className="w-full h-full object-cover rounded-lg" />
                ) : uploading ? (
                  <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-muted mx-auto mb-1" />
                    <p className="text-xs text-muted">Rasm yuklash</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>

            <div>
              <label className="label">Kategoriya</label>
              <select
                className="input h-32"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Kategoriya tanlang</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Post matni *</label>
            <div className="border border-[rgb(var(--border))] rounded-xl overflow-hidden">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full" id="submit-post-btn">
            {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Post nashr qilish (+10 ball)
          </button>
        </form>
      </div>
    </div>
  );
}
