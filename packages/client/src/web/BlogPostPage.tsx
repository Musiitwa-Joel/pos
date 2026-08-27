import React from 'react';
import { observer } from '@legendapp/state/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GET_BLOG_POST_BY_SLUG } from '../gql/website';
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Share2,
  ChevronLeft
} from 'lucide-react';
import LogoLoader from '../components/LogoLoader';

export default observer(function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_BLOG_POST_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });

  const post = data?.getBlogPostBySlug;

  if (loading) return <LogoLoader status="SYNCHRONIZING_INSIGHT_DEEP_DIVE" />;

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream flex-col gap-8">
        <h2 className="text-4xl font-black uppercase italic opacity-20 underline decoration-8 underline-offset-8">Insight_Not_Found</h2>
        <button
          onClick={() => navigate('/blog')}
          className="neo-button bg-black text-white py-4 px-10 font-black uppercase italic"
        >
          Return to Identity Hub
        </button>
      </div>
    );
  }

  return (
    <div className="pt-0 bg-white min-h-screen">
      {/* Navigation Header */}
      <div className="sticky top-[84px] z-30 bg-white border-b-4 border-black py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 font-black uppercase text-xs tracking-widest hover:text-neo-orange transition-colors"
          >
            <ChevronLeft size={20} /> Identity_Hub
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 neo-border hover:bg-neo-blue/10 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Post Header */}
        <header className="mb-20">
          <div className="inline-block px-4 py-1 bg-neo-orange neo-border mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-white italic">{post.category || 'Institutional'}</span>
          </div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black font-display uppercase leading-[0.9] tracking-tighter italic mb-12"
          >
            {post.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pb-12 border-b-4 border-black border-dashed">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream neo-border flex items-center justify-center">
                <User size={24} className="opacity-40" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">author</span>
                <span className="font-black text-sm uppercase">{post.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream neo-border flex items-center justify-center">
                <Clock size={24} className="opacity-40" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">Deployment_Date</span>
                <span className="font-black text-sm uppercase">
                  {(() => {
                    const date = new Date(isNaN(Number(post.created_at || post.published_at)) ? (post.created_at || post.published_at) : Number(post.created_at || post.published_at));
                    return isNaN(date.getTime()) ? "STANDBY_FOR_DATE" : date.toLocaleDateString();
                  })()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream neo-border flex items-center justify-center">
                <Tag size={24} className="opacity-40" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">Tactical_Tag</span>
                <span className="font-black text-sm uppercase">#{post.slug.split('-')[0].toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-20 neo-border overflow-hidden rotate-[1deg] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-2xl prose-black max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:font-display prose-headings:tracking-tighter prose-strong:font-black prose-a:text-neo-orange prose-a:no-underline hover:prose-a:underline prose-img:neo-border prose-img:shadow-xl">
          <ReactMarkdown>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Post Footer */}
        <footer className="mt-32 pt-12 border-t-4 border-black">
          <div className="bg-cream neo-border border-4 p-8 sm:p-12 text-center">
            <h3 className="text-3xl font-black uppercase italic italic mb-4">Analyzing_This_Data?</h3>
            <p className="text-xl font-bold opacity-70 mb-8 max-w-2xl mx-auto">Our institutional analysts release high-velocity strategies weekly. Join the vanguard to stay ahead of the demand curve.</p>
            <button className="neo-button bg-black text-white text-xl py-6 px-12 italic hover:bg-neo-orange transition-colors">
              Subscribe to Signal Receiver
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
});
