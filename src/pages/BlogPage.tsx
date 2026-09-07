import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BlogPost } from '../types';

interface BlogPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { blogs } = useStore();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const publishedPosts = blogs.filter((b) => b.isPublished);

  if (selectedPost) {
    return (
      <div className="bg-[#F4FAF5] min-h-screen py-10">
        <Helmet>
          <title>{selectedPost.title} | 7Seasonsplants Blog</title>
          <meta name="description" content={selectedPost.excerpt} />
          <meta property="og:title" content={`${selectedPost.title} | 7Seasonsplants Blog`} />
          <meta property="og:description" content={selectedPost.excerpt} />
          <meta property="og:image" content={selectedPost.coverImage} />
        </Helmet>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to All Articles
          </button>

          <article className="bg-white rounded-3xl p-6 sm:p-12 border border-emerald-900/10 shadow-xs space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {selectedPost.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 leading-tight">
                {selectedPost.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-b border-emerald-900/10 pb-4">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  {selectedPost.author.name} ({selectedPost.author.role})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {selectedPost.publishedAt}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {selectedPost.readTimeMinutes} min read
                </span>
              </div>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-emerald-50">
              <img
                src={selectedPost.coverImage}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose text-xs sm:text-sm text-gray-600 leading-relaxed space-y-4 pt-4">
              <p className="font-medium text-emerald-950 text-base leading-relaxed">
                {selectedPost.excerpt}
              </p>
              <div className="whitespace-pre-line leading-loose text-emerald-950">{selectedPost.content}</div>
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-emerald-900/10 flex flex-wrap gap-2">
              {selectedPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-emerald-50 text-emerald-900 px-3 py-1 rounded-full border border-emerald-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4FAF5] min-h-screen py-10">
      <Helmet>
        <title>Gardening Blog & Guides | 7Seasonsplants</title>
        <meta name="description" content="Insights on tropical gardening, monsoon plant protection, and balcony sanctuary design by Mannarathayil Nursery horticulturists." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
            7Seasons Gardening Blog & Guides
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Insights on tropical gardening, monsoon plant protection, and balcony sanctuary design by Mannarathayil Nursery horticulturists.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {publishedPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="aspect-16/10 w-full overflow-hidden bg-emerald-50">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-bold text-emerald-700 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {post.readTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="font-black text-base text-emerald-950 leading-snug group-hover:text-emerald-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-emerald-900/10 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
