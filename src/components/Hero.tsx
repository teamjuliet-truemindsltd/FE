import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import HeroImage from "../assets/hero-natural.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 flex items-center overflow-hidden bg-background transition-colors duration-500">
      {/* Subtle organic background blobs */}
      <div className="absolute top-[10%] -right-20 w-[600px] h-[600px] rounded-full bg-primary-teal/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] -left-20 w-[500px] h-[500px] rounded-full bg-light-green/5 blur-[100px] pointer-events-none"></div>

      {/* Main content */}
      <div className="container-max relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-teal/10 border border-primary-teal/20 text-primary-teal text-sm font-medium">
            <Sparkles size={14} className="animate-pulse" />
            <span>Redefining Contemporary Education</span>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] text-foreground transition-colors max-w-2xl">
              Learn What <br />
              <span className="text-primary-teal">Matters</span> to You
            </h1>
            <p className="text-xl text-foreground/60 leading-relaxed max-w-lg">
              A  platform built for growth. Connect with experts and master the skills that shape your future.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Link to="/auth/register" className="btn-primary px-8 py-4 rounded-xl text-lg group">
              Get Started for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/courses" className="flex items-center gap-2 text-foreground font-semibold hover:text-primary-teal transition group">
              <span className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-primary-teal/50 transition-colors">
                <Play size={18} fill="currentColor" className="ml-1" />
              </span>
              Browse Courses
            </Link>
          </div>

          {/* Stats - Grounded Style */}
          <div className="pt-10 flex gap-12 border-t border-border">
            {[
              { number: "12,000+", label: "Inquisitive Minds" },
              { number: "150+", label: "Verified Mentors" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-foreground/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column - Real Image Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative lg:block"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-surface transition-transform hover:scale-[1.01] duration-700">
            <img
              src={HeroImage}
              alt="People collaborating naturally"
              className="w-full h-auto object-cover"
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>

          {/* Subtle Accent decoration */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-teal/10 rounded-full blur-2xl z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-light-green/10 rounded-full blur-3xl z-0"></div>

          {/* Floating 'Trust' badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -bottom-6 right-10 bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl z-20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary-teal/20 flex items-center justify-center text-primary-teal">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Verified Content</div>
              <div className="text-xs text-foreground/50">Curated by World Experts</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


