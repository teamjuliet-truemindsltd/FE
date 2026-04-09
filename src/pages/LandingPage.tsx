import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Zap, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Hero from '../components/Hero';
import { Logo } from '../components/ui/Logo';

export const LandingPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary-teal/20 selection:text-primary-teal">
      {/* Dynamic Navigation */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">
                Features
              </a>
              <Link to="/teams" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">
                Teams
              </Link>
              <Link to="/courses" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">
                Courses
              </Link>
              <div className="h-4 w-px bg-border mx-2"></div>
              <Link to="/auth/login" className="text-sm font-medium text-foreground/60 hover:text-primary-teal transition-colors">
                Sign In
              </Link>
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
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pt-6 pb-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <a href="#features" className="block text-lg font-medium text-foreground/70">Features</a>
              <Link to="/teams" className="block text-lg font-medium text-foreground/70">Teams</Link>
              <Link to="/courses" className="block text-lg font-medium text-foreground/70">Courses</Link>
              <div className="pt-4 flex flex-col gap-4">
                <Link to="/auth/login" className="text-center py-3 border border-border rounded-xl font-medium">Sign In</Link>
                <Link to="/auth/register" className="text-center py-3 btn-primary rounded-xl font-medium">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section - Simple & Grounded 
      <section id="features" className="section-py px-6 lg:px-8 bg-surface/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground tracking-tight">Built for Real Progress</h2>
            <p className="text-xl text-foreground/60 leading-relaxed">
              We focus on what truly matters: an authentic interface, verified experts, and a community that actually supports your growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: BookOpen,
                title: 'Authentic Content',
                description: 'No filler. Just high-quality, practical knowledge curated by industry veterans.',
              },
              {
                icon: Users,
                title: 'Human Connection',
                description: 'Learn alongside others in a space that feels personal, not institutional.',
              },
              {
                icon: Zap,
                title: 'Natural Flow',
                description: 'An interface that disappears so you can focus entirely on your learning journey.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-6 group"
                >
                  <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center transition-all group-hover:border-primary-teal/50 group-hover:shadow-lg group-hover:shadow-primary-teal/5">
                    <Icon className="w-7 h-7 text-primary-teal" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-foreground/50 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
*/}
      {/* CTA Section - Minimalist & Confident 
      <section className="section-py px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary-teal p-12 md:p-20 rounded-[32px] text-center space-y-10 relative overflow-hidden shadow-2xl shadow-primary-teal/20"
          >
            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">Begin Your Journey</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto">
                Join a global community of 12,000+ students and start learning what matters today.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="px-10 py-4 bg-white text-primary-teal hover:bg-white/90 rounded-2xl font-bold text-lg transition-transform hover:scale-105"
              >
                Create Account
              </Link>
              <Link
                to="/auth/login"
                className="px-10 py-4 bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-2xl font-bold text-lg transition-all"
              >
                Sign In
              </Link>
            </div>
*/}
      {/* Subtle background decoration 
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border/40 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-foreground/40 text-sm">
          <Logo size="md" />
          <div className="flex gap-10">
            <a href="#" className="hover:text-primary-teal transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary-teal transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary-teal transition-colors">Privacy</a>
          </div>
          <p>&copy; {new Date().getFullYear()} TalentFlow.</p>
        </div>
      </footer>
    </div>

  );
};

export default LandingPage;
