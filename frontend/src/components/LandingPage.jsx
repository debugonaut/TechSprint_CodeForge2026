import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import SpotlightCard from './SpotlightCard';

// Import decorative images
import notebookImg from '../assets/decorative/notebook.png';
import alarmClockImg from '../assets/decorative/alarm-clock.png';
import calendarImg from '../assets/decorative/calendar.png';
import checklistImg from '../assets/decorative/checklist.png';
import searchImg from '../assets/decorative/search.png';
import thoughtBubbleImg from '../assets/decorative/thought-bubble.png';



export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scrollytelling parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const decorScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const float = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recall",
      description: "Never lose what you've learned. Our AI understands context and connections."
    },
    {
      icon: Sparkles,
      title: "Smart Summaries & Tags",
      description: "Automatic organization. Zero manual work. Just save and forget."
    },
    {
      icon: MessageSquare,
      title: "Chat With Your Knowledge",
      description: "Ask questions naturally. Get instant answers from everything you've saved."
    },
    {
      icon: Zap,
      title: "Zero Manual Organization",
      description: "AI handles the filing. You focus on learning and creating."
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-app relative overflow-hidden">
      {/* Soft gradient backgrounds */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[600px] h-[600px] bg-primary-light/10 dark:bg-primary-light/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-app/80 backdrop-blur-md border-b border-default">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Brain className="text-primary w-6 h-6" />
            <span className="text-xl font-semibold text-primary">Recallr</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-sm text-secondary hover:text-primary transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-primary hover:opacity-90 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Floating PNG Elements and Scrollytelling */}
      <section className="pt-40 pb-32 px-8 relative min-h-screen flex items-center">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-6xl mx-auto text-center relative w-full"
        >
          
          
          {/* Hero Content */}
          <motion.h1 
            {...fadeIn}
            className="text-7xl md:text-8xl font-bold mb-6 tracking-tight leading-[1.1]"
          >
            <span className="text-primary block">Your saved content.</span>
            <span className="text-muted">Instantly recallable.</span>
          </motion.h1>
          
          <motion.p 
            {...fadeIn}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Recallr uses AI to understand, organize, and retrieve everything you save.
            Turn bookmarks into an intelligent second brain.
          </motion.p>

          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-primary hover:scale-105 text-white rounded-full text-lg font-semibold transition-all flex items-center gap-3 group shadow-2xl shadow-primary/30"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-surface hover:bg-elevated text-primary rounded-full text-lg font-semibold transition-all border-2 border-default hover:border-primary/30 shadow-lg"
            >
              Sign In
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Comparison Graph - Recallr vs Bookmarks */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-primary">Why Recallr Wins</span>
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              See how AI-powered recall outperforms traditional bookmarks over time
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden border border-default bg-surface p-8 pb-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/5" />
            
            {/* Graph */}
            <div className="relative">
              {/* Title */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary mb-2">Information Recall Over Time</h3>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-secondary font-medium">Recallr (AI-Powered)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted opacity-40"></div>
                    <span className="text-muted font-medium">Traditional Bookmarks</span>
                  </div>
                </div>
              </div>

              {/* Graph Area */}
              <div className="relative h-80 px-4 flex flex-col justify-end">
                {/* Visual Graph Container */}
                <div className="absolute inset-0 top-0 bottom-8 left-4 right-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted z-10">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  {/* Grid lines */}
                  <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-t border-default opacity-30"></div>
                    ))}
                  </div>

                  {/* Bars Container */}
                  <div className="absolute left-10 right-0 top-0 bottom-0 flex items-end justify-between px-2 sm:px-8">
                    {[
                      { r: 100, b: 90 }, // Week 1
                      { r: 90, b: 62 },  // Week 2
                      { r: 90, b: 45 },  // Week 3
                      { r: 80, b: 30 },  // Week 4
                      { r: 80, b: 18 },  // Week 5
                      { r: 80, b: 10 },  // Week 6
                    ].map((data, index) => (
                      <div key={index} className="relative flex items-end justify-center h-full w-8 sm:w-16 group">
                         {/* Bookmarks Half (Left - Responsive) */}
                         <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${data.b}%` }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                          className="w-1/2 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 border-r-0 rounded-tl-lg group-hover:bg-black/20 dark:group-hover:bg-white/20 transition-colors relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent" />
                          {/* Label on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-center text-[10px] sm:text-xs font-bold text-muted transition-opacity whitespace-nowrap bg-white/90 dark:bg-black/80 px-2 py-1 rounded backdrop-blur-sm border border-black/10 dark:border-white/10 z-20 shadow-xl">
                            {data.b}%
                          </div>
                        </motion.div>

                        {/* Recallr Half (Right - Vivid Gradient) */}
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${data.r}%` }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 + 0.1 }}
                          className="w-1/2 bg-gradient-to-t from-[#6d28d9] via-[#8b5cf6] to-[#c4b5fd] rounded-tr-lg relative shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] group-hover:brightness-110 transition-all duration-300"
                        >
                           {/* Shine effect overlay */}
                           <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                           
                           {/* Label on hover */}
                           <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-center text-[10px] sm:text-xs font-bold text-[#c4b5fd] transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded backdrop-blur-sm border border-primary/30 z-20">
                            {data.r}%
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-muted pl-16 pr-0 h-4 mt-auto z-10 w-full relative">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Week 5</span>
                  <span>Week 6</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 text-[10px] text-muted/40 italic">
              * Based on the Ebbinghaus Forgetting Curve
            </div>
          </motion.div>

          {/* Stats Below Graph */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center bg-surface rounded-2xl p-6 border border-default shadow-lg"
            >
              <div className="text-4xl font-bold text-primary mb-2">92%</div>
              <div className="text-sm text-muted">Recall Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center bg-primary text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="text-4xl font-bold mb-2">5x</div>
              <div className="text-sm text-white/80">Faster Retrieval</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center bg-surface rounded-2xl p-6 border border-default shadow-lg"
            >
              <div className="text-4xl font-bold text-primary mb-2">Zero</div>
              <div className="text-sm text-muted">Manual Tagging</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works - Moved before Why Recallr */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-20"
          >
            <span className="text-primary block text-center">How It Works</span>
          </motion.h2>
          
          <div className="space-y-16">
            {[
              { step: "01", title: "Save content", description: "Bookmark articles, notes, or anything you want to remember." },
              { step: "02", title: "AI understands it", description: "Our AI reads, summarizes, and connects ideas automatically." },
              { step: "03", title: "Recall using natural language", description: "Ask questions and get instant, intelligent answers." }
            ].map((item, index) => (
              <SpotlightCard
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex gap-8 items-start bg-surface rounded-3xl p-10 border border-default"
              >
                <div className="text-7xl font-bold text-primary min-w-[100px]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-secondary text-xl leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - ChronoTask card style with stagger */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-6"
          >
            <span className="text-primary block">Why Recallr</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted text-center mb-20 max-w-2xl mx-auto"
          >
            Everything you need to build your second brain
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <SpotlightCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-surface rounded-3xl p-10 border border-default hover:border-primary/30 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed text-lg">
                  {feature.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-40 px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl font-bold mb-10"
          >
            <span className="text-primary block mb-2">Stop losing what you</span>
            <span className="text-muted">already learned.</span>
          </motion.h2>
          
          <motion.button
            onClick={() => navigate('/login')}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="px-12 py-6 bg-primary text-white rounded-full text-xl font-bold transition-all inline-flex items-center gap-4 group shadow-2xl shadow-primary/40"
          >
            Start Using Recallr
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-default py-10 px-8 relative bg-surface">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="text-primary w-5 h-5" />
            <span className="text-sm font-semibold text-primary">Recallr</span>
          </div>
          <div className="text-muted text-sm">
            © 2026 Recallr. Your intelligent second brain.
          </div>
        </div>
      </footer>
    </div>
  );
}
