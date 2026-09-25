import React, { useState } from 'react';
import { Instagram, ExternalLink, Heart, Play, Eye, Film, Music, Sparkles } from 'lucide-react';

export const InstagramSection: React.FC = () => {
  const [hoveredReel, setHoveredReel] = useState<number | null>(null);

  // Most viewed reels from Instagram page @7seasonsplants
  const reels = [
    {
      id: 'reel-1',
      title: 'Zero-Damage 5-Ply Packaging In Action',
      caption: 'Watch how we securely pack 3 live potted plants for zero leaf damage across Kerala & South India 📦🌿',
      views: '348K',
      viewCount: 348000,
      likes: '18.4K',
      comments: '342',
      duration: '0:42',
      audio: 'Original Audio • 7seasonsplants',
      thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&h=1067&q=80',
      url: 'https://www.instagram.com/7seasonsplants/reels/',
      badge: '#1 Most Viewed',
    },
    {
      id: 'reel-2',
      title: 'Monstera Deliciosa Rooting Secret',
      caption: 'Nursery secret to rooting Monstera Deliciosa cuttings in water & perlite in just 14 days 🌱✨',
      views: '285K',
      viewCount: 285000,
      likes: '14.2K',
      comments: '289',
      duration: '0:58',
      audio: 'Botanical Ambience • Trending Beats',
      thumbnail: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&h=1067&q=80',
      url: 'https://www.instagram.com/7seasonsplants/reels/',
      badge: 'Viral Tip',
    },
    {
      id: 'reel-3',
      title: 'Assembling Our 5-in-1 Air Purifier Combo',
      caption: 'Curating Snake Plant, ZZ Plant, Golden Pothos & Areca Palm into our best-selling starter pack 🪴🏡',
      views: '218K',
      viewCount: 218000,
      likes: '11.6K',
      comments: '194',
      duration: '0:35',
      audio: 'Lofi Garden Chill • 7seasonsplants',
      thumbnail: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&h=1067&q=80',
      url: 'https://www.instagram.com/7seasonsplants/reels/',
      badge: 'Trending Combo',
    },
    {
      id: 'reel-4',
      title: 'Greenhouse Golden Hour Tour',
      caption: 'Walking through our Mannaratharayil Gardens greenhouse with 500+ acclimated plants ready to ship 🌸☀️',
      views: '194K',
      viewCount: 194000,
      likes: '9.8K',
      comments: '167',
      duration: '0:48',
      audio: 'Morning Birds • Nursery Ambience',
      thumbnail: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&h=1067&q=80',
      url: 'https://www.instagram.com/7seasonsplants/reels/',
      badge: 'Nursery Tour',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
              <Film className="w-4 h-4 text-rose-500" />
              <span>Most Viewed Instagram Reels</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
              <span>Viral Reels from @7seasonsplants</span>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/30" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Watch our top viral packing demonstrations, greenhouse walkthroughs, and plant care secrets.
            </p>
          </div>

          <a
            href="https://www.instagram.com/7seasonsplants/reels/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:via-pink-700 hover:to-rose-600 text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <Instagram className="w-4 h-4" />
            <span>Watch All Reels @7seasonsplants</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>

        {/* 4 Vertical Reels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {reels.map((reel, idx) => (
            <a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredReel(idx)}
              onMouseLeave={() => setHoveredReel(null)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-emerald-950 block shadow-md hover:shadow-xl transition-all duration-300 border border-emerald-900/15"
            >
              {/* Reel Poster Image */}
              <img
                src={reel.thumbnail}
                alt={reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Constant Ambient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

              {/* Top Header Tags */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs">
                  <Film className="w-3 h-3 text-pink-400" />
                  <span>Reel</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold shadow-xs">
                  <Eye className="w-3 h-3" />
                  <span>{reel.views}</span>
                </span>
              </div>

              {/* Center Play Button with Pulse Animation */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div
                  className={`w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all duration-300 ${
                    hoveredReel === idx
                      ? 'scale-120 bg-rose-600/80 border-rose-400 shadow-lg'
                      : 'scale-100 group-hover:scale-110 shadow-md'
                  }`}
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Reel Details */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-10 flex flex-col justify-end text-white">
                {/* Ranking / Category Badge */}
                <div className="mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs text-amber-300 px-2 py-0.5 rounded-md">
                    {reel.badge}
                  </span>
                </div>

                {/* Caption */}
                <p className="text-[11px] font-semibold text-white/95 line-clamp-2 leading-snug drop-shadow-xs">
                  {reel.caption}
                </p>

                {/* Audio Track Tag */}
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/75 truncate">
                  <Music className="w-3 h-3 text-pink-300 shrink-0 animate-pulse" />
                  <span className="truncate">{reel.audio}</span>
                </div>

                {/* Social Stats & Direct Watch Indicator */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] font-bold">
                  <div className="flex items-center gap-1 text-rose-300">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{reel.likes}</span>
                  </div>

                  <span className="text-[10px] text-white/90 group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                    <span>Watch Reel</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

