
import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  MapPin, 
  Radio, 
  Clock,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Issue, IssueStatus, User } from '../types';

interface SocialFeedProps {
  issues: Issue[];
  user: User;
  onAddIssue: () => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ issues, user, onAddIssue }) => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosts(newLiked);
  };

  return (
    <div className="max-w-xl mx-auto pb-12">
      {/* Feed Posts */}
      <div className="space-y-8 mt-4">
        {issues.map((issue, index) => (
          <div 
            key={issue.id} 
            className="glass rounded-none sm:rounded-3xl border-x-0 sm:border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl animate-slide-up opacity-0 fill-mode-forwards hover:shadow-2xl transition-shadow duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-transparent">
              <div className="flex items-center gap-3">
                <div className="story-border rounded-full p-[1px]">
                  <div className="p-[1px] bg-white dark:bg-slate-950 rounded-full">
                    <img src={issue.reporterAvatar || 'https://i.pravatar.cc/150?u='+issue.reporterId} className="w-8 h-8 rounded-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{issue.reporterName || 'Solapur Citizen'}</p>
                    <CheckCircle2 size={12} className="text-sky-500" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <MapPin size={10} />
                    <span>{issue.location.address}</span>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 p-2 hover:text-slate-800 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Post Media - Reduced Height (h-64) for Regular Shape */}
            <div className="relative h-64 w-full bg-slate-950 group overflow-hidden cursor-pointer" onDoubleClick={() => toggleLike(issue.id)}>
              <img 
                src={issue.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
                alt={issue.title}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                 <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase backdrop-blur-md border border-white/20 shadow-lg ${
                   issue.status === IssueStatus.OPEN ? 'bg-red-500/80 text-white' :
                   issue.status === IssueStatus.RESOLVED ? 'bg-emerald-500/80 text-white' : 'bg-sky-500/80 text-white'
                 }`}>
                   {issue.status}
                 </span>
                 <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase backdrop-blur-md border border-white/20 shadow-lg bg-slate-900/80 text-slate-300 delay-75">
                    {issue.category}
                 </span>
              </div>
              
              {/* Tagged Department Badge */}
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-sky-500/30">
                  <Building2 size={14} className="text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">@{issue.department || 'SOLAPUR_HUB'}</span>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="p-4 bg-white/50 dark:bg-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => toggleLike(issue.id)}
                    className={`transition-all transform active:scale-75 hover:scale-110 ${likedPosts.has(issue.id) ? 'text-red-500' : 'text-slate-400 dark:text-slate-300 hover:text-red-500'}`}
                  >
                    <Heart size={26} fill={likedPosts.has(issue.id) ? "currentColor" : "none"} strokeWidth={likedPosts.has(issue.id) ? 0 : 2} />
                  </button>
                  <button className="text-slate-400 dark:text-slate-300 hover:text-sky-500 transition-all hover:scale-110 active:scale-95">
                    <MessageCircle size={26} />
                  </button>
                  <button className="text-slate-400 dark:text-slate-300 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95">
                    <Share2 size={26} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                   <Radio size={12} className="text-red-500 animate-pulse" />
                   <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">UPVOTES: {issue.upvotes + (likedPosts.has(issue.id) ? 1 : 0)}</span>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">
                  <span className="font-bold mr-2">{issue.reporterName || 'Citizen'}</span>
                  {issue.title} - {issue.description}
                </p>
                <button className="text-xs text-slate-500 font-medium pt-1 hover:text-slate-800 dark:hover:text-slate-300">View all {issue.comments} comments</button>
                <p className="text-[9px] text-slate-500 dark:text-slate-600 uppercase tracking-widest pt-2">
                  {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(issue.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
