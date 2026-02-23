/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Github,
  Globe,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "./lib/utils";
import { SOCIAL_LINKS, PAYMENT_OPTIONS } from "./constants";

type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url?: string;
  live_url?: string;
  repo_url?: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  published_at: string;
  comments?: Comment[];
};

type Comment = {
  id: number;
  post_id: number;
  author: string;
  content: string;
  created_at: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'blog'>('home');
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'canceled' | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ category: 'Development' });
  const [newPost, setNewPost] = useState<Partial<Post>>({});
  const [newComment, setNewComment] = useState({ author: '', content: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) setStatus('success');
    if (params.get('canceled')) setStatus('canceled');
    
    fetchProjects();
    fetchPosts();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const fetchPostDetails = async (id: number) => {
    const res = await fetch(`/api/posts/${id}`);
    const data = await res.json();
    setSelectedPost(data);
  };

  const handlePayment = async (option: typeof PAYMENT_OPTIONS[0]) => {
    setLoading(option.id);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: option.price,
          name: option.name,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok && data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error || "Failed to create payment session");
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        alert(`Server Error (${response.status}): ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please check if the server is running and your network connection.");
    } finally {
      setLoading(null);
    }
  };

  const addProject = async () => {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    setNewProject({ category: 'Development' });
    fetchProjects();
  };

  const deleteProject = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const addPost = async () => {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });
    setNewPost({});
    fetchPosts();
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const addComment = async (postId: number) => {
    if (!newComment.author || !newComment.content) return;
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });
    setNewComment({ author: '', content: '' });
    fetchPostDetails(postId);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold tracking-tighter text-xl cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">P</div>
            PORTFOLIO
          </div>
          <div className="flex items-center gap-8">
            {(['home', 'projects', 'blog'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedPost(null);
                }}
                className={cn(
                  "text-sm font-medium uppercase tracking-widest transition-colors",
                  activeTab === tab ? "text-emerald-400" : "text-zinc-500 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
            <button 
              onClick={() => setShowAdmin(!showAdmin)}
              className={cn(
                "p-2 rounded-lg border transition-all",
                showAdmin ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "border-white/10 text-zinc-500 hover:text-white"
              )}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Status Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={cn(
              "p-4 rounded-2xl border flex items-center gap-3 backdrop-blur-xl",
              status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">
                {status === 'success' ? "Payment successful! Thank you for your support." : "Payment was canceled."}
              </p>
              <button 
                onClick={() => setStatus(null)}
                className="ml-auto text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Section */}
              <section className="mb-32">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
                  <Sparkles className="w-3 h-3" />
                  Available for new projects
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
                  CRAFTING <br />
                  <span className="text-zinc-500 italic">DIGITAL</span> <br />
                  EXPERIENCES.
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
                  I'm a full-stack engineer and product designer specializing in building
                  high-performance web applications and scalable business solutions.
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-4">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 transition-all duration-300 group",
                        link.color
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.name}</span>
                    </a>
                  ))}
                </div>
              </section>

              {/* Payment Section */}
              <section className="relative py-24 px-8 md:px-16 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">Services</h2>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                      Ready to take your <br />
                      business to the <span className="text-zinc-500 italic">next level?</span>
                    </h3>
                    <p className="text-lg text-zinc-400 mb-12 max-w-md">
                      Secure your spot for a consultation or kickstart your next big project with a secure deposit.
                    </p>
                    
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Secure Payments</p>
                        <p className="text-xs text-zinc-500">Powered by Stripe. All major cards accepted.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {PAYMENT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        disabled={loading !== null}
                        onClick={() => handlePayment(option)}
                        className="w-full group relative flex items-center justify-between p-6 rounded-2xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-lg">{option.name}</span>
                            <span className="text-emerald-400 font-mono font-bold">{option.displayPrice}</span>
                          </div>
                          <p className="text-xs text-zinc-500">{option.description}</p>
                        </div>
                        <div className="ml-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          {loading === option.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">Portfolio</h2>
                  <h3 className="text-4xl font-bold tracking-tight">Featured Projects</h3>
                </div>
                <div className="hidden md:block h-px flex-1 bg-zinc-800 mx-12 mb-4" />
              </div>

              {showAdmin && (
                <div className="mb-12 p-8 rounded-3xl bg-zinc-900/50 border border-emerald-500/20">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" /> Add New Project
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input 
                      placeholder="Project Title" 
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
                      value={newProject.title || ''}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                    />
                    <input 
                      placeholder="Category" 
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
                      value={newProject.category || ''}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                    />
                    <input 
                      placeholder="Image URL" 
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
                      value={newProject.image_url || ''}
                      onChange={e => setNewProject({...newProject, image_url: e.target.value})}
                    />
                    <input 
                      placeholder="Live URL" 
                      className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
                      value={newProject.live_url || ''}
                      onChange={e => setNewProject({...newProject, live_url: e.target.value})}
                    />
                  </div>
                  <textarea 
                    placeholder="Description" 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none mb-4 h-24"
                    value={newProject.description || ''}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                  <button 
                    onClick={addProject}
                    className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                  >
                    Publish Project
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 bg-zinc-900 relative">
                      <img 
                        src={project.image_url || `https://picsum.photos/seed/${project.id}/800/600`} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      {showAdmin && (
                        <button 
                          onClick={() => deleteProject(project.id)}
                          className="absolute top-4 right-4 p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 mb-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-2 py-1 rounded bg-zinc-900 border border-white/5">
                        {project.category}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {project.title}
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-6">
                      {project.live_url && (
                        <a href={project.live_url} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">
                          <Globe className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                      {project.repo_url && (
                        <a href={project.repo_url} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">
                          <Github className="w-3 h-3" /> Source
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {!selectedPost ? (
                <>
                  <div className="flex items-end justify-between mb-12">
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">Journal</h2>
                      <h3 className="text-4xl font-bold tracking-tight">Latest Thoughts</h3>
                    </div>
                    <div className="hidden md:block h-px flex-1 bg-zinc-800 mx-12 mb-4" />
                  </div>

                  {showAdmin && (
                    <div className="mb-12 p-8 rounded-3xl bg-zinc-900/50 border border-emerald-500/20">
                      <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-400" /> Write New Post
                      </h4>
                      <input 
                        placeholder="Post Title" 
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none mb-4"
                        value={newPost.title || ''}
                        onChange={e => setNewPost({...newPost, title: e.target.value})}
                      />
                      <textarea 
                        placeholder="Content (Markdown supported)" 
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none mb-4 h-48"
                        value={newPost.content || ''}
                        onChange={e => setNewPost({...newPost, content: e.target.value})}
                      />
                      <button 
                        onClick={addPost}
                        className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                      >
                        Publish Post
                      </button>
                    </div>
                  )}

                  <div className="space-y-8">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        layoutId={`post-${post.id}`}
                        onClick={() => fetchPostDetails(post.id)}
                        className="group p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-mono text-zinc-500">
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                          {showAdmin && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost(post.id);
                              }}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <h4 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-zinc-400 leading-relaxed line-clamp-2 mb-6">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                          Read More <ChevronRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-3xl mx-auto"
                >
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-12 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Blog
                  </button>
                  
                  <span className="text-sm font-mono text-emerald-500 mb-4 block">
                    {new Date(selectedPost.published_at).toLocaleDateString()}
                  </span>
                  <h1 className="text-5xl font-bold tracking-tight mb-12 leading-tight">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="prose prose-invert max-w-none mb-20">
                    <p className="text-xl text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t border-white/10 pt-20">
                    <h3 className="text-2xl font-bold mb-12 flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-emerald-400" />
                      Comments ({selectedPost.comments?.length || 0})
                    </h3>

                    <div className="mb-12 p-8 rounded-3xl bg-zinc-900/50 border border-white/5">
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Leave a comment</h4>
                      <input 
                        placeholder="Your Name" 
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none mb-4"
                        value={newComment.author}
                        onChange={e => setNewComment({...newComment, author: e.target.value})}
                      />
                      <textarea 
                        placeholder="Your thoughts..." 
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none mb-4 h-24"
                        value={newComment.content}
                        onChange={e => setNewComment({...newComment, content: e.target.value})}
                      />
                      <button 
                        onClick={() => addComment(selectedPost.id)}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>

                    <div className="space-y-6">
                      {selectedPost.comments?.map((comment) => (
                        <div key={comment.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{comment.author}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-zinc-400 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold tracking-tighter text-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">P</div>
            PORTFOLIO
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Elite Portfolio. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
