import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  User,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Upload,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BlogPost } from '../../types';
import { compressImageFileWithStats } from '../../lib/imageUploader';

interface BlogsManagementTabProps {
  onNavigateToBlog?: () => void;
}

const PRESET_BLOG_COVERS = [
  {
    label: 'Monsoon Foliage',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Curated Combos',
    url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Indoor Air Purifiers',
    url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Balcony Gardening',
    url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Mother Nursery Beds',
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Plant Packing & Transit',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
  },
];

const SUGGESTED_CATEGORIES = [
  'Seasonal Gardening',
  'Gardening Tips',
  'Plant Care',
  'Combos & Styling',
  'Nursery News',
  'Botanical Guides',
];

export const BlogsManagementTab: React.FC<BlogsManagementTabProps> = ({ onNavigateToBlog }) => {
  const { blogs, addBlogPost, updateBlogPost, deleteBlogPost, addToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Gardening Tips');
  const [formCoverImage, setFormCoverImage] = useState(PRESET_BLOG_COVERS[0].url);
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('Vipin Mannaratharayil');
  const [formAuthorRole, setFormAuthorRole] = useState('Head Nurseryman & Botanist');
  const [formAuthorAvatar, setFormAuthorAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');
  const [formReadTimeMinutes, setFormReadTimeMinutes] = useState<number>(4);
  const [formTagsString, setFormTagsString] = useState('plants, gardening');
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive unique categories from existing blogs
  const categoriesList = Array.from(
    new Set([...SUGGESTED_CATEGORIES, ...blogs.map((b) => b.category).filter(Boolean)])
  );

  // Filtered blogs
  const filteredBlogs = blogs.filter((post) => {
    if (!post) return false;
    const q = searchQuery.toLowerCase().trim();
    const title = (post.title || '').toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    const category = (post.category || '').toLowerCase();
    const authorName = (post.author?.name || '').toLowerCase();
    const tags = Array.isArray(post.tags) ? post.tags : [];

    const matchesSearch =
      !q ||
      title.includes(q) ||
      excerpt.includes(q) ||
      category.includes(q) ||
      authorName.includes(q) ||
      tags.some((t) => (t || '').toLowerCase().includes(q));

    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && post.isPublished !== false) ||
      (filterStatus === 'draft' && post.isPublished === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.length - publishedCount;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('Gardening Tips');
    setFormCoverImage(PRESET_BLOG_COVERS[0].url);
    setFormExcerpt('');
    setFormContent('');
    setFormAuthorName('Vipin Mannaratharayil');
    setFormAuthorRole('Head Nurseryman & Botanist');
    setFormAuthorAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');
    setFormReadTimeMinutes(4);
    setFormTagsString('plants, gardening, kerala');
    setFormIsPublished(true);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormCategory(post.category);
    setFormCoverImage(post.coverImage);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormAuthorName(post.author?.name || 'Vipin Mannaratharayil');
    setFormAuthorRole(post.author?.role || 'Head Nurseryman & Botanist');
    setFormAuthorAvatar(post.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');
    setFormReadTimeMinutes(post.readTimeMinutes || 4);
    setFormTagsString(post.tags ? post.tags.join(', ') : '');
    setFormIsPublished(post.isPublished);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Auto-slug generator
  const handleTitleChange = (newTitle: string) => {
    setFormTitle(newTitle);
    if (!editingPost || !formSlug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generatedSlug);
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const stats = await compressImageFileWithStats(file, 1200, 800, 0.82);
      setFormCoverImage(stats.dataUrl);
      addToast({
        title: 'Cover Image Uploaded 📸',
        message: `Saved custom cover (${Math.round(stats.compressedSize / 1024)} KB).`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      addToast({
        title: 'Upload Failed',
        message: 'Could not process the selected image.',
        type: 'error',
      });
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Save (Create / Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = formTitle.trim();
    if (!title) {
      setFormError('Article title is required.');
      return;
    }

    const excerpt = formExcerpt.trim();
    if (!excerpt) {
      setFormError('Article excerpt / short summary is required.');
      return;
    }

    const content = formContent.trim();
    if (!content) {
      setFormError('Article content / body is required.');
      return;
    }

    const slug = (formSlug.trim() || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tags = formTagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      category: formCategory.trim() || 'Gardening Tips',
      coverImage: formCoverImage.trim() || PRESET_BLOG_COVERS[0].url,
      excerpt,
      content,
      author: {
        name: formAuthorName.trim() || '7Seasons Nursery Team',
        role: formAuthorRole.trim() || 'Horticulturist',
        avatar: formAuthorAvatar.trim() || undefined,
      },
      readTimeMinutes: Math.max(1, Number(formReadTimeMinutes) || 4),
      tags,
      isPublished: formIsPublished,
    };

    try {
      if (editingPost) {
        await updateBlogPost({
          ...editingPost,
          ...payload,
        });
        addToast({
          title: 'Article Updated ✨',
          message: `"${title}" was saved successfully.`,
          type: 'success',
        });
      } else {
        await addBlogPost(payload);
        addToast({
          title: 'Article Published 🌿',
          message: `"${title}" has been created.`,
          type: 'success',
        });
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setFormError(err.message || 'Failed to save blog post.');
    }
  };

  // Toggle Published
  const handleTogglePublish = async (post: BlogPost) => {
    const updated = { ...post, isPublished: !post.isPublished };
    await updateBlogPost(updated);
    addToast({
      title: updated.isPublished ? 'Article Published' : 'Article Moved to Drafts',
      message: `"${post.title}" is now ${updated.isPublished ? 'visible to customers' : 'hidden'}.`,
      type: 'info',
    });
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteBlogPost(postToDelete.id);
      addToast({
        title: 'Article Deleted',
        message: `"${postToDelete.title}" has been deleted.`,
        type: 'info',
      });
      setPostToDelete(null);
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete article.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                <span>Botanical Blog Articles</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {blogs.length} Total
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Seasonal gardening guides, plant care tutorials, and nursery walkthrough articles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToBlog && (
            <button
              type="button"
              onClick={onNavigateToBlog}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Blog</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-emerald-900/10 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">All Articles</p>
          <p className="text-xl font-black text-emerald-950 mt-1">{blogs.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-900/10 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Published</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-900/10 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Drafts</p>
          <p className="text-xl font-black text-amber-700 mt-1">{draftCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-900/10 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
          <p className="text-xl font-black text-gray-800 mt-1">{categoriesList.length}</p>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, excerpt, category, author, or tag..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by category"
            className="px-3 py-2 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 text-xs font-semibold focus:bg-white focus:border-emerald-600 outline-hidden"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            aria-label="Filter by publication status"
            className="px-3 py-2 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 text-xs font-semibold focus:bg-white focus:border-emerald-600 outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* 4. Blog Articles List */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {blogs.length === 0 ? 'No Blog Articles Found' : 'No articles match your search criteria'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {blogs.length === 0
                ? 'Your botanical blog currently has no articles. Click "Write First Article" to create your first post.'
                : 'Try adjusting your search query or reset the filters to see all articles.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer"
            >
              Write First Article
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-emerald-900/10 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Cover Image & Category */}
              <div className="relative aspect-video w-full bg-emerald-50 overflow-hidden">
                <img
                  src={post.coverImage || PRESET_BLOG_COVERS[0].url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PRESET_BLOG_COVERS[0].url;
                  }}
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold text-emerald-900 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs border border-emerald-900/10">
                    {post.category}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(post)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs border transition-colors cursor-pointer flex items-center gap-1 ${
                      post.isPublished
                        ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                        : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                    }`}
                    title={post.isPublished ? 'Click to unpublish' : 'Click to publish'}
                  >
                    {post.isPublished ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTimeMinutes} min</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-emerald-950 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author and Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {post.author?.name ? post.author.name.charAt(0) : 'V'}
                      </div>
                    )}
                    <span className="text-[11px] font-semibold text-gray-700 truncate">
                      {post.author?.name || 'Nursery Team'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewPost(post)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Preview Article"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(post)}
                      className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Create / Edit Article Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsFormModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-emerald-900/10 my-8 space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingPost ? 'Edit Blog Article' : 'Write New Botanical Article'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Published on the 7Seasons storefront blog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Essential Monsoon Plant Care Guide for Kerala Homes"
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs font-semibold"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="essential-monsoon-plant-care"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Seasonal Gardening"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                  />
                  <datalist id="category-suggestions">
                    {categoriesList.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">
                    Cover Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3 h-3 text-emerald-700" />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    <span className="text-[10px] text-gray-500 font-normal">or pick preset</span>
                  </div>
                </div>

                <input
                  type="url"
                  value={formCoverImage}
                  onChange={(e) => setFormCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or uploaded URL"
                  className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs mb-2"
                />

                {/* Preset covers */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_BLOG_COVERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setFormCoverImage(preset.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                        formCoverImage === preset.url
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">
                    Excerpt / Summary *
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {formExcerpt.length} characters
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Brief summary displayed on the blog card and social shares..."
                  className="w-full px-3.5 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
                />
              </div>

              {/* Content / Article Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">
                    Article Content / Body *
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Supports line breaks & Markdown headers (### Header)
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the full article content here. Use ### for subheadings, bullet points with -, and bold with **text**."
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs font-mono leading-relaxed"
                />
              </div>

              {/* Author Details & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="Vipin Mannaratharayil"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="Head Nurseryman & Botanist"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Read Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formReadTimeMinutes}
                    onChange={(e) => setFormReadTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              {/* Tags & Published Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex-1">
                  <label className="font-bold text-gray-800 block mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formTagsString}
                    onChange={(e) => setFormTagsString(e.target.value)}
                    placeholder="monsoon, plant care, kerala, drainage"
                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div className="pt-4 sm:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 text-xs">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Publish Immediately</span>
                  </label>
                  <p className="text-[10px] text-gray-400 pl-6">
                    {formIsPublished ? 'Visible on public blog' : 'Saved as draft'}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {editingPost ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Preview Article Modal */}
      {previewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPreviewPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-900/10 my-8 space-y-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {previewPost.category}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPost(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl sm:text-3xl font-black text-emerald-950 leading-tight">
                {previewPost.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{previewPost.author?.name} ({previewPost.author?.role})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{previewPost.readTimeMinutes} min read</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{previewPost.publishedAt ? new Date(previewPost.publishedAt).toLocaleDateString() : 'Recent'}</span>
                </span>
              </div>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-emerald-50">
              <img
                src={previewPost.coverImage}
                alt={previewPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-emerald-950 text-sm sm:text-base border-l-4 border-emerald-600 pl-3 italic">
                {previewPost.excerpt}
              </p>
              <div className="whitespace-pre-line leading-loose text-gray-800">
                {previewPost.content}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {previewPost.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewPost(null);
                  handleOpenEditModal(previewPost);
                }}
                className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                Edit this Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {postToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPostToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Blog Article</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">"{postToDelete.title}"</strong>?
              It will be removed from your public blog and database immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
