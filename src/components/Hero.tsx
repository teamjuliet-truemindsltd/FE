import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 flex items-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 -left-40 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl animate-float" style={{animationDelay: "2s"}}></div>

      {/* Main content */}
      <div className="container-max relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="badge badge-primary w-fit">
            <Sparkles size={14} />
            <span>Welcome to the Future of Learning</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Unlock Your <span className="text-gradient">Potential</span> With
              <br />
              <span className="text-gradient">TalentFlow</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
              Experience next-generation online education. A premier platform designed for creators, mentors, and lifelong learners who want to grow.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn btn-primary btn-lg group">
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn btn-secondary btn-lg">
              <Play size={20} />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="pt-8 grid grid-cols-3 gap-8 border-t border-dark-700/50">
            {[
              { number: "10K+", text: "Students" },
              { number: "200+", text: "Mentors" },
              { number: "98%", text: "Satisfaction" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.text}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column - Course card preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Card */}
          <div className="card-hover p-6 space-y-6 overflow-hidden group">
            {/* Image placeholder */}
            <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-dark-700/50 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-blue-500/20 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 rounded-full bg-dark-800/80 flex items-center justify-center cursor-pointer hover:bg-primary-500/20 transition-colors">
                <Play size={32} className="text-primary-400 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Course content */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Advanced UI Design</h3>
                  <div className="badge badge-success">
                    <span>⭐ Trending</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                Master modern UI design principles with hands-on projects and real-world examples.
              </p>

              {/* Stats row */}
              <div className="flex gap-6 text-sm text-gray-400 py-4 border-y border-dark-700/50">
                <span>👥 1.2K Students</span>
                <span>📚 24 Lessons</span>
                <span>⏱️ 12 Hours</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">Progress</span>
                  <span className="text-xs text-gray-500">75%</span>
                </div>
                <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-blue-500"></div>
                </div>
              </div>

              {/* Button */}
              <button className="w-full btn btn-primary py-2.5">
                Continue Learning
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Floating elements for depth */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary-500/30 blur-3xl animate-pulse" style={{animationDelay: "1s"}}></div>
        </motion.div>
      </div>
    </section>
  );
}

