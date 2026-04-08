import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Zap, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Hero from '../components/Hero';

export const LandingPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-teal">
              TalentFlow
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-foreground/70 hover:text-primary-teal transition">
                Features
              </a>
              <Link
                to="/teams"
                className="text-foreground/70 hover:text-primary-teal transition"
              >
                Teams
              </Link>
              <Link
                to="/courses"
                className="text-foreground/70 hover:text-primary-teal transition"
              >
                Courses
              </Link>
              <Link
                to="/auth/login"
                className="px-4 py-2 text-foreground/70 hover:text-primary-teal transition"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="btn-primary px-6 py-2 rounded-lg"
              >
                Get Started
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-colors border border-border"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-foreground"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-full hover:bg-foreground/10 text-foreground/70 transition-colors border border-border ml-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              <a href="#features" className="block px-4 py-2 text-foreground/70 hover:text-primary-teal transition">
                Features
              </a>
              <Link
                to="/teams"
                className="block px-4 py-2 text-foreground/70 hover:text-primary-teal transition"
              >
                Teams
              </Link>
              <Link
                to="/courses"
                className="block px-4 py-2 text-foreground/70 hover:text-primary-teal transition"
              >
                Courses
              </Link>
              <Link
                to="/auth/login"
                className="block px-4 py-2 text-foreground/70 hover:text-primary-teal transition"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="block px-6 py-2 btn-primary rounded-lg text-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-foreground transition-colors">Why Choose TalentFlow?</h2>
            <p className="text-foreground/60 text-lg">
              Discover the features that make learning and teaching exceptional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Comprehensive Courses',
                description: 'Access a wide range of courses taught by industry experts',
              },
              {
                icon: Users,
                title: 'Community Learning',
                description: 'Connect with learners and instructors from around the world',
              },
              {
                icon: Zap,
                title: 'Fast Progress',
                description: 'Track your learning journey and achieve your goals quickly',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="card p-8 border border-border hover:border-primary-teal/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-teal/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-teal" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-foreground/60">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card-gradient p-12 rounded-2xl shadow-glow-md"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Learning?</h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of students and instructors on TalentFlow today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="px-8 py-3 bg-white text-primary-teal hover:bg-gray-100 rounded-lg font-semibold transition shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                to="/auth/login"
                className="px-8 py-3 border border-white/30 text-white hover:bg-white/10 rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto text-center text-foreground/50">
          <div className="text-2xl font-bold text-primary-teal mb-4">
            TalentFlow
          </div>
          <p>&copy; {new Date().getFullYear()} TalentFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
