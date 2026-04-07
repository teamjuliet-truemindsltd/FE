import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, X, Upload, User, Menu, ChevronRight, Loader2
} from 'lucide-react';
import { teamService, type TeamMember } from '../services/teamService';
import toast from 'react-hot-toast';

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
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/40',
  },
  'Backend Development': {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-500/40',
  },
  'UI/UX Design': {
    bg: 'bg-pink-500/20',
    text: 'text-pink-300',
    border: 'border-pink-500/40',
  },
  'Product Management': {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-300',
    border: 'border-yellow-500/40',
  },
  'Social Media Management': {
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
  },
  'Customer Representative': {
    bg: 'bg-orange-500/20',
    text: 'text-orange-300',
    border: 'border-orange-500/40',
  },
  'Virtual Assistant': {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
  },
  'Graphic Design': {
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/40',
  },
};

function getTrackStyle(track: string) {
  return TRACK_COLORS[track] ?? { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/40' };
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-b border-slate-700 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Join the Team</h2>
                <p className="text-sm text-slate-400 mt-0.5">Add your profile to the team showcase</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
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
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-600 hover:border-blue-500 transition cursor-pointer overflow-hidden group"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 group-hover:bg-slate-700 transition">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition mb-1" />
                      <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition">Photo</span>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500">Click to upload profile picture (optional)</span>
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                />
              </div>

              {/* Track */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Track <span className="text-red-400">*</span>
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your track...</option>
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !track}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition flex items-center justify-center gap-2"
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
      className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Avatar */}
      <div className="relative mb-4">
        {member.profilePicture ? (
          <img
            src={optimizeCloudinaryUrl(member.profilePicture)!}
            alt={member.fullName}
            loading="lazy"
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-600 group-hover:border-blue-500/60 transition"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border-2 border-slate-600 group-hover:border-blue-500/60 transition">
            <span className="text-white font-bold text-xl">{getInitials(member.fullName)}</span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-slate-800" />
      </div>

      {/* Name */}
      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-300 transition">
        {member.fullName}
      </h3>

      {/* Track badge */}
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {member.track}
      </span>

      {/* Joined date */}
      <p className="mt-3 text-xs text-slate-500">
        Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </p>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TeamsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* ── Navbar ── */}
      <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TalentFlow
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/#features" className="text-slate-300 hover:text-white transition">Features</Link>
              <Link to="/teams" className="text-white font-semibold border-b-2 border-blue-400 pb-0.5">Teams</Link>
              <Link to="/auth/login" className="px-4 py-2 text-slate-300 hover:text-white transition">Sign In</Link>
              <Link to="/auth/register" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition">
                Get Started
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <Link to="/#features" className="block px-4 py-2 text-slate-300 hover:text-white">Features</Link>
              <Link to="/teams" className="block px-4 py-2 text-blue-400 font-semibold">Teams</Link>
              <Link to="/auth/login" className="block px-4 py-2 text-slate-300 hover:text-white">Sign In</Link>
              <Link to="/auth/register" className="block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero / Header ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Meet the Team
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Our Amazing Team
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              TalentFlow is built by passionate learners and creators. Meet the people shaping the future of education.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center mb-10">
              {[
                { label: 'Members', value: members.length },
                { label: 'Tracks', value: uniqueTracks.length - 1 },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Add Member Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 transition"
            >
              <Plus className="w-5 h-5" />
              Add Yourself to the Team
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Filter / Search ── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
            />
            {/* Track filter */}
            <div className="flex flex-wrap gap-2">
              {uniqueTracks.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTrack(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedTrack === t
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Members Grid ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm transition"
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
