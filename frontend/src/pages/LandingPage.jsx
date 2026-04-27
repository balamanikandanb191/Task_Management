import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --blue-50: #EFF6FF;
    --blue-100: #DBEAFE;
    --blue-200: #BFDBFE;
    --blue-300: #93C5FD;
    --blue-400: #60A5FA;
    --blue-500: #3B82F6;
    --blue-600: #2563EB;
    --blue-700: #1D4ED8;
    --blue-800: #1E40AF;
    --blue-900: #1E3A8A;
    --white: #FFFFFF;
    --gray-50: #F8FAFF;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-400: #94A3B8;
    --gray-600: #475569;
    --gray-800: #1E293B;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--white); overflow-x: hidden; }

  .app-landing { min-height: 100vh; }

  /* NAVBAR */
  .navbar {
    position: fixed; top: 0; width: 100%; z-index: 100;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--blue-100);
    padding: 0 5%;
    display: flex; align-items: center; justify-content: space-between;
    height: 72px;
    animation: slideDown 0.6s ease;
  }
  @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 22px;
    color: var(--blue-700);
    text-decoration: none;
  }
  .logo-icon {
    width: 38px; height: 38px; background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); } 50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); } }

  .nav-links { display: flex; gap: 36px; list-style: none; }
  .nav-links a { text-decoration: none; color: var(--gray-600); font-size: 15px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--blue-600); }

  .nav-btn {
    background: var(--blue-600); color: white; border: none; padding: 10px 24px;
    border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .nav-btn:hover { background: var(--blue-700); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(37,99,235,0.35); }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: linear-gradient(160deg, var(--gray-50) 0%, var(--blue-50) 50%, #EEF4FF 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 100px 5% 60px;
    position: relative; overflow: hidden;
  }

  .hero-blob1 {
    position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%);
    top: -100px; right: -100px;
    animation: float1 8s ease-in-out infinite;
  }
  .hero-blob2 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
    bottom: 50px; left: -80px;
    animation: float2 10s ease-in-out infinite;
  }
  @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px, 40px) scale(1.05); } }
  @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px, -30px); } }

  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--blue-50); border: 1px solid var(--blue-200);
    padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; color: var(--blue-700);
    margin-bottom: 24px;
    animation: fadeUp 0.8s ease 0.2s both;
  }
  .badge-dot { width: 7px; height: 7px; background: var(--blue-500); border-radius: 50%; animation: blink 1.5s ease-in-out infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .hero-title {
    font-family: 'Sora', sans-serif; font-size: clamp(2.4rem, 4vw, 3.6rem);
    font-weight: 800; line-height: 1.15; color: var(--gray-800);
    margin-bottom: 20px;
    animation: fadeUp 0.8s ease 0.4s both;
  }
  .hero-title span { color: var(--blue-600); }

  .hero-desc {
    font-size: 17px; color: var(--gray-600); line-height: 1.75;
    margin-bottom: 36px; max-width: 480px;
    animation: fadeUp 0.8s ease 0.6s both;
  }

  .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; animation: fadeUp 0.8s ease 0.8s both; }

  .btn-primary {
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: white; border: none; padding: 14px 32px; border-radius: 12px;
    font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.25s;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 20px rgba(37,99,235,0.3);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.45); }

  .btn-secondary {
    background: white; color: var(--blue-700); border: 2px solid var(--blue-200);
    padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .btn-secondary:hover { border-color: var(--blue-400); background: var(--blue-50); transform: translateY(-2px); }

  .hero-stats { display: flex; gap: 32px; margin-top: 40px; animation: fadeUp 0.8s ease 1s both; }
  .stat { text-align: center; }
  .stat-num { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; color: var(--blue-700); }
  .stat-label { font-size: 13px; color: var(--gray-400); margin-top: 2px; }

  /* DASHBOARD MOCKUP */
  .hero-visual { animation: fadeLeft 1s ease 0.4s both; }
  @keyframes fadeLeft { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

  .dashboard-mock {
    background: white; border-radius: 20px;
    box-shadow: 0 30px 80px rgba(37,99,235,0.18), 0 8px 24px rgba(0,0,0,0.06);
    overflow: hidden; border: 1px solid var(--blue-100);
    animation: float3 6s ease-in-out infinite;
  }
  @keyframes float3 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  .mock-header {
    background: linear-gradient(135deg, var(--blue-600), var(--blue-800));
    padding: 16px 20px; display: flex; align-items: center; gap: 12px;
  }
  .mock-dots { display: flex; gap: 6px; }
  .mock-dots span { width: 12px; height: 12px; border-radius: 50%; display: block; }

  .mock-body { padding: 20px; }
  .mock-title { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: white; }

  .task-card {
    background: var(--gray-50); border: 1px solid var(--blue-100);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 12px;
    transition: all 0.2s; cursor: default;
  }
  .task-card:hover { background: var(--blue-50); border-color: var(--blue-200); transform: translateX(4px); }

  .task-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .task-text { flex: 1; }
  .task-name { font-size: 13px; font-weight: 600; color: var(--gray-800); }
  .task-sub { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
  .task-badge {
    font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
  }

  .prog-bar-wrap { margin-top: 14px; }
  .prog-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--gray-400); margin-bottom: 6px; }
  .prog-track { height: 6px; background: var(--blue-100); border-radius: 10px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, var(--blue-400), var(--blue-600)); border-radius: 10px; transition: width 1s ease; }

  /* ROLES SECTION */
  .section { padding: 100px 5%; max-width: 1300px; margin: 0 auto; }
  .section-tag {
    font-size: 13px; font-weight: 700; color: var(--blue-600); text-transform: uppercase;
    letter-spacing: 2px; margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Sora', sans-serif; font-size: clamp(1.9rem, 3vw, 2.8rem);
    font-weight: 800; color: var(--gray-800); margin-bottom: 16px;
  }
  .section-title span { color: var(--blue-600); }
  .section-desc { font-size: 16px; color: var(--gray-600); max-width: 560px; line-height: 1.7; margin-bottom: 60px; }

  .roles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

  .role-card {
    background: white; border: 1.5px solid var(--blue-100); border-radius: 20px;
    padding: 32px 24px; text-align: center; cursor: pointer;
    transition: all 0.35s; position: relative; overflow: hidden;
  }
  .role-card::before {
    content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, var(--blue-50), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .role-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(37,99,235,0.15); border-color: var(--blue-300); }
  .role-card:hover::before { opacity: 1; }
  .role-card.active { border-color: var(--blue-500); box-shadow: 0 20px 50px rgba(37,99,235,0.2); transform: translateY(-8px); }
  .role-card.active::before { opacity: 1; }

  .role-icon {
    width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    position: relative; z-index: 1;
  }
  .role-name { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; position: relative; z-index: 1; }
  .role-desc { font-size: 13px; color: var(--gray-600); line-height: 1.6; position: relative; z-index: 1; }

  .role-perms {
    margin-top: 16px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
    position: relative; z-index: 1;
  }
  .perm-pill {
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    background: var(--blue-50); color: var(--blue-700); border: 1px solid var(--blue-200);
  }

  /* FEATURES */
  .features-section {
    background: linear-gradient(160deg, #F0F7FF 0%, white 100%);
    padding: 100px 5%;
  }
  .features-inner { max-width: 1300px; margin: 0 auto; }

  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .feature-card {
    background: white; border: 1px solid var(--blue-100); border-radius: 20px;
    padding: 32px; transition: all 0.3s;
  }
  .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(37,99,235,0.12); border-color: var(--blue-200); }

  .feat-icon {
    width: 52px; height: 52px; background: linear-gradient(135deg, var(--blue-100), var(--blue-50));
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 20px; transition: all 0.3s;
  }
  .feature-card:hover .feat-icon { background: linear-gradient(135deg, var(--blue-500), var(--blue-700)); }

  .feat-title { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: var(--gray-800); margin-bottom: 10px; }
  .feat-desc { font-size: 14px; color: var(--gray-600); line-height: 1.7; }

  /* HOW IT WORKS */
  .how-section { padding: 100px 5%; max-width: 1200px; margin: 0 auto; }
  .steps-row { display: flex; gap: 0; align-items: stretch; margin-top: 60px; }
  .step-item {
    flex: 1; text-align: center; padding: 0 20px;
    position: relative;
  }
  .step-item:not(:last-child)::after {
    content: ''; position: absolute; top: 28px; right: -1px;
    width: 40%; height: 2px; background: linear-gradient(90deg, var(--blue-300), var(--blue-100));
  }

  .step-num {
    width: 56px; height: 56px; background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: white;
    margin: 0 auto 20px; box-shadow: 0 6px 20px rgba(37,99,235,0.35);
    transition: all 0.3s;
  }
  .step-item:hover .step-num { transform: scale(1.1) rotate(5deg); }

  .step-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
  .step-desc { font-size: 13px; color: var(--gray-600); line-height: 1.6; }

  /* TESTIMONIALS */
  .testimonials-section { background: var(--blue-900); padding: 100px 5%; }
  .testimonials-inner { max-width: 1200px; margin: 0 auto; }
  .test-title { font-family: 'Sora', sans-serif; font-size: clamp(1.8rem, 2.5vw, 2.4rem); font-weight: 800; color: white; margin-bottom: 12px; }
  .test-sub { color: rgba(255,255,255,0.6); font-size: 16px; margin-bottom: 60px; }
  .test-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }

  .test-card {
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px; padding: 28px; transition: all 0.3s;
  }
  .test-card:hover { background: rgba(255,255,255,0.12); transform: translateY(-4px); }
  .test-quote { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.75; margin-bottom: 24px; }
  .test-author { display: flex; align-items: center; gap: 12px; }
  .test-avatar {
    width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: white;
  }
  .test-name { font-size: 14px; font-weight: 600; color: white; }
  .test-role-label { font-size: 12px; color: rgba(255,255,255,0.5); }
  .stars { color: #FBBF24; font-size: 13px; margin-bottom: 12px; }

  /* PRICING */
  .pricing-section { padding: 100px 5%; max-width: 1200px; margin: 0 auto; text-align: center; }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 60px; }
  .price-card {
    background: white; border: 1.5px solid var(--blue-100); border-radius: 24px;
    padding: 40px 32px; transition: all 0.3s; position: relative; overflow: hidden;
  }
  .price-card.popular {
    border-color: var(--blue-500); box-shadow: 0 20px 60px rgba(37,99,235,0.2);
    transform: scale(1.03);
  }
  .price-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(37,99,235,0.15); }
  .price-card.popular:hover { transform: scale(1.03) translateY(-6px); }

  .popular-badge {
    position: absolute; top: 20px; right: 20px;
    background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
    color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;
  }
  .price-plan { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
  .price-amount { font-family: 'Sora', sans-serif; font-size: 42px; font-weight: 800; color: var(--blue-700); }
  .price-amount span { font-size: 18px; color: var(--gray-400); }
  .price-desc { font-size: 14px; color: var(--gray-400); margin: 8px 0 28px; }
  .price-divider { height: 1px; background: var(--blue-100); margin-bottom: 24px; }
  .price-features { list-style: none; text-align: left; }
  .price-features li { font-size: 14px; color: var(--gray-600); padding: 7px 0; display: flex; align-items: center; gap: 10px; }
  .check { color: var(--blue-500); font-weight: 700; font-size: 16px; }
  .price-btn {
    width: 100%; margin-top: 28px; padding: 13px; border-radius: 12px;
    font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.25s;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    display: inline-flex;
    justify-content: center;
  }
  .price-btn-outline { background: white; color: var(--blue-700); border: 2px solid var(--blue-200); }
  .price-btn-outline:hover { background: var(--blue-50); border-color: var(--blue-400); }
  .price-btn-solid { background: linear-gradient(135deg, var(--blue-500), var(--blue-700)); color: white; border: none; box-shadow: 0 4px 20px rgba(37,99,235,0.3); }
  .price-btn-solid:hover { box-shadow: 0 8px 30px rgba(37,99,235,0.45); }

  /* CTA */
  .cta-section {
    background: linear-gradient(135deg, var(--blue-600), var(--blue-900));
    padding: 100px 5%; text-align: center; position: relative; overflow: hidden;
  }
  .cta-blob { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: rgba(255,255,255,0.05); }
  .cta-blob1 { top: -200px; left: -100px; }
  .cta-blob2 { bottom: -200px; right: -100px; }
  .cta-content { position: relative; z-index: 1; }
  .cta-title { font-family: 'Sora', sans-serif; font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; color: white; margin-bottom: 16px; }
  .cta-desc { font-size: 17px; color: rgba(255,255,255,0.75); margin-bottom: 40px; max-width: 520px; margin-left: auto; margin-right: auto; }
  .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .btn-white { background: white; color: var(--blue-700); border: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.2); text-decoration: none; display: inline-flex; align-items: center; }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  .btn-outline-white { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.5); padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.25s; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-flex; align-items: center; }
  .btn-outline-white:hover { border-color: white; background: rgba(255,255,255,0.1); }

  /* FOOTER */
  .footer { background: var(--gray-800); padding: 60px 5% 32px; }
  .footer-inner { max-width: 1200px; margin: 0 auto; }
  .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-logo { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 22px; color: white; margin-bottom: 12px; }
  .footer-tagline { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }
  .footer-col-title { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .footer-links { list-style: none; }
  .footer-links li { margin-bottom: 10px; }
  .footer-links a { font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: white; }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; }
  .footer-copy { font-size: 13px; color: rgba(255,255,255,0.4); }
  .footer-socials { display: flex; gap: 12px; }
  .social-btn { width: 36px; height: 36px; background: rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); font-size: 15px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
  .social-btn:hover { background: var(--blue-600); color: white; }

  /* SCROLL ANIMATIONS */
  .reveal { opacity: 0; transform: translateY(40px); transition: all 0.7s cubic-bezier(0.22,1,0.36,1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }

  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .roles-grid { grid-template-columns: repeat(2, 1fr); }
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
    .price-card.popular { transform: none; }
    .footer-top { grid-template-columns: 1fr 1fr; }
    .steps-row { flex-wrap: wrap; gap: 32px; }
    .step-item { min-width: 45%; }
    .step-item::after { display: none; }
    .test-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
  }
  @media (max-width: 640px) {
    .nav-links { display: none; }
    .roles-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .hero-stats { flex-wrap: wrap; gap: 20px; }
    .footer-top { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
  }
`;

const ROLES = [
  {
    icon: "👤", name: "Team Member",
    desc: "Execute tasks and update progress in real-time",
    color: "#3B82F6", bg: "#DBEAFE",
    perms: ["View Tasks", "Update Status", "Add Comments"]
  },
  {
    icon: "🎯", name: "Team Lead",
    desc: "Assign tasks, monitor team progress and sprints",
    color: "#2563EB", bg: "#BFDBFE",
    perms: ["Assign Tasks", "Sprint Planning", "Team Reports"]
  },
  {
    icon: "📊", name: "Project Manager",
    desc: "Full project control, timelines and stakeholder reports",
    color: "#1D4ED8", bg: "#93C5FD",
    perms: ["Full Control", "Milestones", "Client Reports"]
  },
  {
    icon: "⚙️", name: "Admin",
    desc: "Manage users, roles, billing and system settings",
    color: "#1E3A8A", bg: "#60A5FA",
    perms: ["User Mgmt", "Roles", "Billing", "Settings"]
  }
];

const FEATURES = [
  { icon: "📋", title: "Smart Task Boards", desc: "Drag-and-drop kanban boards with swimlanes, dependencies, and custom workflows for every team." },
  { icon: "⏱️", title: "Time Tracking", desc: "Built-in timers and automatic time logs so your team never loses a billable minute again." },
  { icon: "📅", title: "Sprint Planning", desc: "Velocity tracking, capacity planning and burndown charts to keep every sprint on track." },
  { icon: "🔔", title: "Smart Notifications", desc: "AI-powered alerts that surface only what matters — no more notification overload for your team." },
  { icon: "📈", title: "Analytics Dashboard", desc: "Real-time performance metrics, bottleneck detection and customisable reports for stakeholders." },
  { icon: "🔗", title: "Integrations Hub", desc: "Connect Slack, GitHub, Jira, Figma and 150+ tools in one click with zero-code integrations." }
];

const STEPS = [
  { num: "1", title: "Create Project", desc: "Set up your project in seconds with templates built for your industry." },
  { num: "2", title: "Invite Team", desc: "Add members and assign roles — Team Member, Lead, PM or Admin." },
  { num: "3", title: "Assign Tasks", desc: "Break work into tasks, set priorities, deadlines and dependencies." },
  { num: "4", title: "Track & Deliver", desc: "Monitor progress live and ship on time, every time." }
];

const SECURITY_FEATURES = [
  { icon: "🔐", title: "Enterprise SSO", desc: "Seamlessly integrate with Okta, Azure AD, and Google Workspace for secure access." },
  { icon: "🛡️", title: "Data Sovereignty", desc: "Control where your data lives to comply with regional residency requirements." },
  { icon: "📄", title: "Audit Logs", desc: "Full traceability of every action across your organization with detailed logs." },
  { icon: "🔍", title: "Compliance Ready", desc: "Built-in frameworks for SOC2, GDPR, and HIPAA to simplify your governance." }
];

const GLOBAL_STATS = [
  { num: "50+", label: "Countries" },
  { num: "99.99%", label: "Uptime" },
  { num: "24/7", label: "Support" },
  { num: "100ms", label: "Latency" }
];

const TASKS = [
  { name: "Design System Update", sub: "Due today · Sarah", dot: "#3B82F6", badge: "In Progress", badgeBg: "#DBEAFE", badgeColor: "#1D4ED8" },
  { name: "API Integration", sub: "Due tomorrow · Raj", dot: "#10B981", badge: "Review", badgeBg: "#D1FAE5", badgeColor: "#065F46" },
  { name: "Sprint Planning", sub: "Overdue · Team", dot: "#EF4444", badge: "Urgent", badgeBg: "#FEE2E2", badgeColor: "#991B1B" }
];

const LandingPage = () => {
  const [activeRole, setActiveRole] = useState(1);
  const [progWidth, setProgWidth] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setProgWidth(72), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="app-landing">
      <style>{styles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <div className="logo-icon">✦</div>
          TaskMaster
        </Link>
        <ul className="nav-links">
          {["Features", "Roles", "Security", "How It Works"].map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} onClick={e => e.preventDefault()}>{l}</a></li>
          ))}
        </ul>
        <Link to="/login" className="nav-btn">Start Free Trial</Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-blob1" /><div className="hero-blob2" />
        <div className="hero-grid">
          <div>
            <div className="hero-badge"><span className="badge-dot" />New: AI Task Prioritization is live</div>
            <h1 className="hero-title">Manage Tasks,<br /><span>Empower Every</span><br />Team Role</h1>
            <p className="hero-desc">One platform for Team Members, Leads, Project Managers and Admins. Real-time collaboration, smart automation and deep analytics — all in one place.</p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary">Get Started Free →</Link>
              <button className="btn-secondary" onClick={e => e.preventDefault()}>Watch Demo ▶</button>
            </div>
            <div className="hero-stats">
              {[["50K+", "Teams"], ["99.9%", "Uptime"], ["4.9★", "Rating"]].map(([n, l]) => (
                <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-mock">
              <div className="mock-header">
                <div className="mock-dots">
                  <span style={{ background: "#FF5F57" }} />
                  <span style={{ background: "#FFBD2E" }} />
                  <span style={{ background: "#28CA41" }} />
                </div>
                <span className="mock-title">🚀 Sprint 24 — Active Board</span>
              </div>
              <div className="mock-body">
                {TASKS.map((t, i) => (
                  <div className="task-card" key={i}>
                    <div className="task-dot" style={{ background: t.dot }} />
                    <div className="task-text">
                      <div className="task-name">{t.name}</div>
                      <div className="task-sub">{t.sub}</div>
                    </div>
                    <div className="task-badge" style={{ background: t.badgeBg, color: t.badgeColor }}>{t.badge}</div>
                  </div>
                ))}
                <div className="prog-bar-wrap">
                  <div className="prog-label"><span>Sprint Progress</span><span>{progWidth}%</span></div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${progWidth}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <div style={{ padding: "100px 5%" }} id="roles">
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div className="section-tag reveal">Built For Every Role</div>
          <h2 className="section-title reveal reveal-delay-1">One Platform,<br /><span>Four Powerful Roles</span></h2>
          <p className="section-desc reveal reveal-delay-2">TaskMaster adapts to every member of your organization. From the newest team member to the system admin — each role gets exactly the tools they need.</p>
          <div className="roles-grid">
            {ROLES.map((r, i) => (
              <div key={i} className={`role-card reveal reveal-delay-${i + 1} ${activeRole === i ? "active" : ""}`} onClick={() => setActiveRole(i)}>
                <div className="role-icon" style={{ background: r.bg }}>{r.icon}</div>
                <div className="role-name">{r.name}</div>
                <div className="role-desc">{r.desc}</div>
                <div className="role-perms">
                  {r.perms.map(p => <span key={p} className="perm-pill">{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-tag reveal">Everything You Need</div>
            <h2 className="section-title reveal reveal-delay-1" style={{ textAlign: "center" }}>Features That <span>Move Fast</span></h2>
            <p className="section-desc reveal reveal-delay-2" style={{ margin: "0 auto 0" }}>Built for speed without sacrificing depth. Every feature is designed to reduce friction and multiply output.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div style={{ textAlign: "center" }}>
          <div className="section-tag reveal">Simple Setup</div>
          <h2 className="section-title reveal reveal-delay-1" style={{ textAlign: "center" }}>Up & Running in <span>4 Steps</span></h2>
          <p className="section-desc reveal reveal-delay-2" style={{ margin: "0 auto" }}>No lengthy onboarding. No complex setup. Just create, invite, assign and ship.</p>
        </div>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <div key={i} className={`step-item reveal reveal-delay-${i + 1}`}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY & GOVERNANCE */}
      <section className="testimonials-section" id="security" style={{ background: '#0f172a' }}>
        <div className="testimonials-inner">
          <div className="section-tag reveal" style={{ color: 'rgba(255,255,255,0.5)' }}>Enterprise Security</div>
          <h2 className="test-title reveal reveal-delay-1">Security That <span>Protects Your Firm</span></h2>
          <p className="test-sub reveal reveal-delay-2" style={{ marginBottom: '60px' }}>TaskMaster is built on the most secure infrastructure to ensure your sensitive data never leaves your control.</p>
          <div className="roles-grid">
            {SECURITY_FEATURES.map((s, i) => (
              <div key={i} className={`role-card reveal reveal-delay-${i + 1}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="role-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', fontSize: '32px' }}>{s.icon}</div>
                <div className="role-name" style={{ color: '#fff' }}>{s.title}</div>
                <div className="role-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL REACH */}
      <section className="pricing-section" id="global" style={{ background: '#fff' }}>
        <div className="section-tag reveal">Global Infrastructure</div>
        <h2 className="section-title reveal reveal-delay-1">Scale Without <span>Geographic Limits</span></h2>
        <p className="section-desc reveal reveal-delay-2" style={{ margin: "0 auto 60px" }}>Deploy TaskMaster across your international offices with local performance and 100% data sync.</p>
        <div className="hero-stats" style={{ justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {GLOBAL_STATS.map((s, i) => (
            <div key={i} className={`stat reveal reveal-delay-${i + 1}`} style={{ width: '200px' }}>
              <div className="stat-num" style={{ fontSize: '48px' }}>{s.num}</div>
              <div className="stat-label" style={{ fontSize: '16px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '80px' }} className="reveal-delay-4 reveal">
          <div style={{ padding: '40px', background: 'var(--blue-50)', borderRadius: '24px', display: 'inline-block', border: '1px solid var(--blue-100)' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue-700)' }}>"The ultimate platform for globally distributed high-velocity teams."</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-blob cta-blob1" /><div className="cta-blob cta-blob2" />
        <div className="cta-content">
          <h2 className="cta-title reveal">Ready to Supercharge<br />Your Team's Productivity?</h2>
          <p className="cta-desc reveal reveal-delay-1">Start your 14-day free trial. No credit card required. Cancel anytime. Full access to all features from day one.</p>
          <div className="cta-actions reveal reveal-delay-2">
            <Link to="/login" className="btn-white">Start Free Trial →</Link>
            <button className="btn-outline-white" onClick={e => e.preventDefault()}>Schedule a Demo</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">✦ TaskMaster</div>
              <div className="footer-tagline">The task management platform built for every role in your organization — from individual contributors to system admins.</div>
            </div>
            {[
              { title: "Product", links: ["Features", "Security", "Changelog", "Roadmap"] },
              { title: "Roles", links: ["Team Member", "Team Lead", "Project Manager", "Admin"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] }
            ].map(col => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                <ul className="footer-links">
                  {col.links.map(l => <li key={l}><a href="#" onClick={e => e.preventDefault()}>{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 TaskMaster. All rights reserved.</div>
            <div className="footer-socials">
              {["𝕏", "in", "gh", "yt"].map(s => (
                <a key={s} className="social-btn" href="#" onClick={e => e.preventDefault()}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
