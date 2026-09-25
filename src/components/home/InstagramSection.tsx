import React from 'react';
import { Instagram, ExternalLink, Heart } from 'lucide-react';

export const InstagramSection: React.FC = () => {
  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
      caption: 'Morning blooms in our nursery beds! Exotic Hibiscus & Melastoma saplings ready for dispatch 🌺🌿 #7seasonsplants',
      likes: 342,
      date: '2d ago',
    },
    {
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      caption: 'Giant tropical Calathea Lutea & variegated foliage potted for indoor garden styling 🍃✨ #Mannaratharayil',
      likes: 489,
      date: '4d ago',
    },
    {
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
      caption: 'Safe packaging in action! 5-ply cartons keeping root balls moist and delicate leaves intact 📦🚛 #SafeDelivery',
      likes: 275,
      date: '5d ago',
    },
    {
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
      caption: 'Our signature 3-in-1 Air Purifier Combo headed to Kochi! Up to 35% bundled savings with pots 🪴💚',
      likes: 512,
      date: '1w ago',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
              <Instagram className="w-4 h-4 text-rose-500" />
              <span>Join Our Plant Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
              Follow Us @7seasonsplants
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Real daily updates, nursery behind-the-scenes, packing clips, and garden inspiration.
            </p>
          </div>

          <a
            href="https://instagram.com/7seasonsplants"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow @7seasonsplants</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href="https://instagram.com/7seasonsplants"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-emerald-50 block shadow-xs hover:shadow-lg transition-all border border-emerald-900/10"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 flex flex-col justify-between p-3.5 sm:p-4 text-white transition-all duration-300 group-hover:from-emerald-950/95 group-hover:via-emerald-950/60">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-2xs">
                    <Instagram className="w-3 h-3 text-rose-400" />
                    <span>@7seasonsplants</span>
                  </div>
                  <span className="text-[10px] text-white/70 font-medium">
                    {post.date}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium line-clamp-2 leading-snug text-white/95 group-hover:text-white drop-shadow-xs">
                    {post.caption}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/15">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                      <span>{post.likes}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Post</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
