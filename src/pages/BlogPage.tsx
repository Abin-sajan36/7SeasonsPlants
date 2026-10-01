import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  User,
  Instagram,
  Play,
  Heart,
  Eye,
  ExternalLink,
  X,
  Film,
  Compass,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BlogPost, InstagramReel } from '../types';
import { getInstagramEmbedUrl } from '../lib/instagram';
import { ReelPlayerModal } from '../components/common/ReelPlayerModal';

interface BlogPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { blogs, instagramReels } = useStore();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'articles' | 'reels'>('all');
  const [activeReelModal, setActiveReelModal] = useState<InstagramReel | null>(null);

  const publishedPosts = blogs.filter((b) => b.isPublished);
  const activeReels = instagramReels.filter((r) => r.isActive);

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
        <title>Gardening Blog & Instagram Reels | 7Seasonsplants</title>
        <meta
          name="description"
          content="Insights on tropical gardening, monsoon plant protection, and short video reels from @7seasonsplants by Mannaratharayil Gardens LLP horticulturists."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nursery Knowledge Base & Video Media</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
            7Seasons Gardening Blog & Reels
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Insights on tropical gardening, monsoon care, and daily video reels directly from our mother nursery beds at{' '}
            <strong className="text-emerald-950">Mannaratharayil Gardens LLP</strong>.
          </p>
        </div>

        {/* Content Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMediaTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'all'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            All Content ({publishedPosts.length + activeReels.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('reels')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMediaTab === 'reels'
                ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-700 border border-gray-200'
            }`}
          >
            <Instagram className="w-4 h-4 text-rose-500" />
            <span>Instagram Reels ({activeReels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMediaTab('articles')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === 'articles'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            In-Depth Guides ({publishedPosts.length})
          </button>
        </div>

        {/* FEATURED INSTAGRAM REELS SHELF (Visible on 'all' and 'reels') */}
        {(activeMediaTab === 'all' || activeMediaTab === 'reels') && activeReels.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                  <Film className="w-4 h-4 text-rose-500" />
                  <span>Watch & Learn On Reels</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-2.5">
                  <span>Short Video Guides @7seasonsplants</span>
                  <span className="text-xs font-extrabold uppercase bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Live
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Watch plant packing walkthroughs, exotic flower blooms, and quick potting tutorials.
                </p>
              </div>

              <a
                href="https://instagram.com/7seasonsplants"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Instagram className="w-4 h-4 text-rose-300" />
                <span>Follow @7seasonsplants</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>

            {/* Reels Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setActiveReelModal(reel)}
                  className="bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* 9:14 Reel Portrait Thumbnail */}
                    <div className="relative aspect-9/14 w-full bg-emerald-950 overflow-hidden">
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 flex flex-col justify-between p-4 text-white">
                        {/* Top tag */}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                            <Instagram className="w-3 h-3 text-rose-400" />
                            <span>@7seasonsplants</span>
                          </span>

                          <span className="text-[10px] text-white/80 font-medium">
                            {reel.date || 'Recent'}
                          </span>
                        </div>

                        {/* Center Glowing Play Button */}
                        <div className="self-center w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-xl group-hover:scale-115 group-hover:bg-rose-500 group-hover:border-rose-400 transition-all duration-300">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>

                        {/* Bottom Stats */}
                        <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-white/20">
                          <span className="flex items-center gap-1.5 text-white/95">
                            <Eye className="w-4 h-4 text-emerald-300" />
                            <span>{reel.viewsCount || '1K'} views</span>
                          </span>
                          <span className="flex items-center gap-1 text-rose-300">
                            <Heart className="w-4 h-4 fill-current text-rose-400" />
                            <span>{reel.likesCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-black text-sm text-emerald-950 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {reel.title}
                      </h3>
                      {reel.caption && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {reel.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-emerald-900/5 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Reel</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IN-DEPTH ARTICLES GRID (Visible on 'all' and 'articles') */}
        {(activeMediaTab === 'all' || activeMediaTab === 'articles') && (
          <div className="space-y-6">
            <div className="border-b border-emerald-900/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>In-Depth Horticulturist Articles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                Featured Botanical Articles & Care Reads
              </h2>
            </div>

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
        )}
      </div>

      {/* POPUP MODAL: WATCH INSTAGRAM REEL */}
      <ReelPlayerModal
        reel={activeReelModal}
        onClose={() => setActiveReelModal(null)}
      />
    </div>
  );
};

