import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, X, Upload, User, Menu, ChevronRight, Loader2
} from 'lucide-react';
import { teamService, type TeamMember } from '../services/teamService';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const TRACKS = [
  'Frontend Development',
  'Backend Development',
  'UI/UX Design',
  'Product Management',
  'Social Media Management',
  'Customer Representative',
  'Virtual Assistant',
  'Graphic Design'
];

const TRACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Frontend Development': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500 dark:text-blue-300',
    border: 'border-blue-500/20',
  },
  'Backend Development': {
    bg: 'bg-primary-teal/10',
    text: 'text-primary-teal dark:text-mint-green',
    border: 'border-primary-teal/20',
  },
  'UI/UX Design': {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-300',
    border: 'border-pink-500/20',
  },
  'Product Management': {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-500/20',
  },
  'Social Media Management': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-300',
    border: 'border-purple-500/20',
  },
  'Customer Representative': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-300',
    border: 'border-orange-500/20',
  },
  'Virtual Assistant': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-300',
    border: 'border-cyan-500/20',
  },
  'Graphic Design': {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-300',
    border: 'border-red-500/20',
  },
};

function getTrackStyle(track: string) {
  return TRACK_COLORS[track] ?? { bg: 'bg-foreground/5', text: 'text-foreground/70', border: 'border-foreground/10' };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function optimizeCloudinaryUrl(url: string | null) {
  if (!url || !url.includes('cloudinary.com')) return url;
  // Inject transformation parameters for better performance
  // q_auto: automatic quality, f_auto: automatic format, w_200,h_200,c_fill: thumbnail
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_200,h_200,c_fill/');
  }
  return url;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface AddMemberModalProps {
  onClose: () => void;
  onSuccess: (member: TeamMember) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [track, setTrack] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !track) return;

    setIsSubmitting(true);
    try {
      const member = await teamService.create({
        fullName: fullName.trim(),
        track,
        profilePicture: file ?? undefined,
      });
      toast.success(`Welcome to the team, ${member.fullName}! 🎉`);
      onSuccess(member);
      onClose();
    } catch {
      toast.error('Failed to add team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card */}
          <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-teal/20 to-deep-teal/20 border-b border-border px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Join the Team</h2>
                <p className="text-sm text-foreground/50 mt-0.5">Add your profile to the team showcase</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary-teal transition cursor-pointer overflow-hidden group"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-foreground/5 group-hover:bg-foreground/10 transition">
                      <Upload className="w-6 h-6 text-foreground/30 group-hover:text-primary-teal transition mb-1" />
                      <span className="text-[10px] text-foreground/30 group-hover:text-primary-teal transition">Photo</span>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground/40">Click to upload profile picture (optional)</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal/30 transition text-sm"
                />
              </div>

              {/* Track */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                  Track <span className="text-red-500">*</span>
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal/30 transition text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-background text-foreground">Select your track...</option>
                  {TRACKS.map((t) => (
                    <option key={t} value={t} className="bg-background text-foreground">{t}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !track}
                className="w-full py-3 btn-primary rounded-lg font-semibold text-white transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Team
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Member Card ──────────────────────────────────────────────────────────────
const MemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  const style = getTrackStyle(member.track);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative bg-surface border border-border hover:border-primary-teal/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary-teal/5 hover:-translate-y-1"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Avatar */}
      <div className="relative mb-4">
        {member.profilePicture ? (
          <img
            src={optimizeCloudinaryUrl(member.profilePicture)!}
            alt={member.fullName}
            loading="lazy"
            className="w-20 h-20 rounded-full object-cover border-2 border-border group-hover:border-primary-teal/60 transition"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-teal to-deep-teal flex items-center justify-center border-2 border-border group-hover:border-primary-teal/60 transition">
            <span className="text-white font-bold text-xl">{getInitials(member.fullName)}</span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-surface" />
      </div>

      {/* Name */}
      <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary-teal transition">
        {member.fullName}
      </h3>

      {/* Track badge */}
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
        {member.track}
      </span>

      {/* Joined date */}
      <p className="mt-3 text-xs text-foreground/40">
        Member since {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TeamsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await teamService.getAll();
        setMembers(data);
      } catch {
        toast.error('Failed to load team members.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleNewMember = (member: TeamMember) => {
    setMembers((prev) => [member, ...prev]);
  };

  const uniqueTracks = ['All', ...Array.from(new Set((Array.isArray(members) ? members : []).map((m) => m.track)))];

  const filtered = (Array.isArray(members) ? members : []).filter((m) => {
    const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesTrack = selectedTrack === 'All' || m.track === selectedTrack;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* ── Navbar ── */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-display font-bold text-primary-teal tracking-tight">
              TalentFlow
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <Link to="/#features" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">Features</Link>
              <Link to="/teams" className="text-sm font-bold text-primary-teal border-b-2 border-primary-teal pb-0.5">Teams</Link>
              <Link to="/courses" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">Courses</Link>
              <div className="h-4 w-px bg-border mx-2"></div>
              <Link to="/auth/login" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">Sign In</Link>
              <Link to="/auth/register" className="btn-primary px-5 py-2 rounded-xl text-sm">
                Get Started
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-primary-teal transition-all border border-transparent hover:border-border"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggleTheme} className="p-2 text-foreground/60">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-foreground">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pt-6 pb-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <Link to="/#features" className="block text-lg font-medium text-foreground/70">Features</Link>
              <Link to="/teams" className="block text-lg font-bold text-primary-teal">Teams</Link>
              <Link to="/courses" className="block text-lg font-medium text-foreground/70">Courses</Link>
              <div className="pt-4 flex flex-col gap-4">
                <Link to="/auth/login" className="text-center py-3 border border-border rounded-xl font-medium">Sign In</Link>
                <Link to="/auth/register" className="text-center py-3 btn-primary rounded-xl font-medium">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero / Header ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 lg:px-8 bg-surface/20">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-teal/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-light-green/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-teal/10 border border-primary-teal/20 text-primary-teal text-sm font-medium mb-8">
              <Users className="w-4 h-4" />
              Collaborative Growth
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground tracking-tight">
              Our Amazing Team
            </h1>
            <p className="text-foreground/50 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              TalentFlow is shaped by a community of passionate interns at Trueminds Ltd. Together, we build the future of learning.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-12 justify-center mb-16">
              {[
                { label: 'Active Members', value: members.length },
                { label: 'Specialized Tracks', value: Math.max(0, uniqueTracks.length - 1) },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-foreground/40 text-sm font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Add Member Button 
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="btn-primary px-10 py-4 rounded-2xl font-bold text-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your Profile
            </motion.button>
            */}
          </motion.div>
        </div>
      </section>

      {/* ── Filter / Search ── */}
      <section className="px-6 lg:px-8 mb-16 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-5 py-3 rounded-xl bg-surface border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:border-primary-teal transition-all shadow-sm"
            />
          </div>
          {/* Track filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {uniqueTracks.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrack(t)}
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${selectedTrack === t
                  ? 'bg-primary-teal border-primary-teal text-white shadow-lg shadow-primary-teal/20'
                  : 'bg-surface border-border text-foreground/40 hover:border-primary-teal/30 hover:text-foreground'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Members Grid ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-primary-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400">Loading team members...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg font-medium">
                {search || selectedTrack !== 'All' ? 'No members match your filter' : 'No team members yet'}
              </p>
              {!search && selectedTrack === 'All' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-primary-teal hover:text-primary-teal/70 flex items-center gap-1 text-sm transition"
                >
                  Be the first to join <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((member, i) => (
                <MemberCard key={member.id} member={member} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Modal ── */}
      {showModal && (
        <AddMemberModal
          onClose={() => setShowModal(false)}
          onSuccess={handleNewMember}
        />
      )}
    </div>
  );
};

export default TeamsPage;
