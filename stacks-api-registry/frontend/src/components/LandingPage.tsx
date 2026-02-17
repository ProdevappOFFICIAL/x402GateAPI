import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Terminal, ShieldCheck, Zap } from 'lucide-react';
import ConnectWallet from './connectWallet';

// 1. PixelPlanet - Refined for a more subtle background effect
const PixelPlanet = ({ color = "#f97316" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    const pixelSize = 2; // Smaller pixels for a sharper look
    const globeRadius = 600;

    const resize = () => {
      canvas.width = window.innerWidth * 1.5;
      canvas.height = window.innerWidth * 1.5;
    };
    window.addEventListener('resize', resize);
    resize();

    const createPoints = () => {
      const points = [];
      const count = 3000;
      const goldenRatio = (1 + 5 ** 0.5) / 2;
      for (let i = 0; i < count; i++) {
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        points.push({
          y: globeRadius * Math.sin(phi) * Math.sin(theta),
          baseX: globeRadius * Math.sin(phi) * Math.cos(theta),
          baseZ: globeRadius * Math.cos(phi),
        });
      }
      return points;
    };

    const points = createPoints();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      time += 0.0015;

      points.forEach((point) => {
        const x = point.baseX * Math.cos(time) - point.baseZ * Math.sin(time);
        const z = point.baseX * Math.sin(time) + point.baseZ * Math.cos(time);
        if (z < -200) return;

        const alpha = (z + globeRadius) / (globeRadius * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.4, alpha));
        ctx.fillRect(cx + x, cy + point.y, pixelSize, pixelSize);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen opacity-40"
    />
  );
};

// 2. Navbar - True Shadcn style (Floating, bordered, minimalist)
const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl">
      <div className="rounded-full border border-zinc-800 bg-zinc-950/70 backdrop-blur-md px-6 h-14 flex items-center justify-between shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
             <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline-block">x402-Guard</span>
        </div>

        <div className="hidden  items-center gap-6">
          {['How It Works', 'Architecture', 'Setup'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="scale-90 origin-right flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all border border-white/20 hover:border-white/30">
             <ConnectWallet />
          </div>
          <Menu className="w-5 h-5 text-zinc-400 md:hidden" />
        </div>
      </div>
    </nav>
  );
};

// 3. Hero - Clean, Type-driven, Structured
const Hero = () => {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center overflow-hidden selection:bg-orange-500/30 ">
      <Navbar />
      
      {/* Background Layer */}
      <PixelPlanet color="#f97316" />
      <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 container max-w-5xl px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2  mt-4 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <Zap className="w-3 h-3 fill-current" />
            <span>Powered by x402-stacks Protocol</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-balance">
          Onchain validation layer <br />
            <span className="text-zinc-500">& Api Proxy Wrapper</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto max-w-[700px] text-zinc-400 text-base md:text-lg leading-relaxed">
            Wrap any API with blockchain-backed validation. Agents pay per request using STX. 
            No API keys, no subscriptions—just deterministic, 
            <span className="text-zinc-200"> on-chain access control</span>.
          </p>

          {/* Call to Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <button className="h-11 px-8 rounded-md bg-zinc-50 text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               Get Started
             </button>
          
          </div>

          {/* Powered By */}
          <div className="flex gap-2 w-full items-center justify-center pt-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
              Powered By
            </p>
            <div className="flex items-center justify-center gap-80 transition-all duration-500">
               <div className="flex items-center gap-2">
                 <img 
                   src='https://pbs.twimg.com/profile_images/2009801605227614208/jQJ1-86e_400x400.jpg' 
                   className='h-7 w-7 rounded-full' 
                   alt="Stacks" 
                 />
                 <span className="text-sm font-bold tracking-[0.3em] text-zinc-300">STACKS</span>
               </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Decorative Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none" />
    </div>
  );
};

export default Hero;