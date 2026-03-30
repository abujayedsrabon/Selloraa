import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Check, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { FEATURES, PRICING_PLANS, TESTIMONIALS, FAQS } from './constants.tsx';
import { auth, loginWithGoogle, logout } from './firebase';
import VendorDashboard from './components/VendorDashboard';
import Storefront from './components/Storefront';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      scrolled ? "bg-white/80 backdrop-blur-md border-gray-200 py-3" : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Selloraa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  location.pathname === link.path ? "text-indigo-600" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Start Your Store
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-indigo-600 text-white px-3 py-4 rounded-md text-base font-semibold"
              >
                Start Your Store
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white text-xl font-bold">Selloraa</span>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            The ultimate multi-vendor eCommerce SaaS platform. Empowering entrepreneurs to build their dreams, one store at a time.
          </p>
          <div className="flex space-x-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
            <Linkedin className="w-5 h-5 cursor-pointer hover:text-indigo-400" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/features" className="hover:text-white">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/auth" className="hover:text-white">Store Builder</Link></li>
            <li><Link to="#" className="hover:text-white">Integrations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="#" className="hover:text-white">Careers</Link></li>
            <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>support@selloraa.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>123 SaaS Street, Tech City</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Selloraa. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = () => (
  <div className="pt-20">
    {/* Hero Section */}
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-6">
                New: AI-Powered Store Builder
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Launch Your Online</span>
                <span className="block text-indigo-600">Empire in Minutes</span>
              </h1>
              <p className="mt-6 text-lg text-gray-500 sm:text-xl">
                Selloraa is the all-in-one multi-vendor platform that gives you everything you need to build, manage, and scale your online store. No coding required.
              </p>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/auth"
                  className="flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg shadow-xl shadow-indigo-200 transition-all"
                >
                  Start Your Store <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/features"
                  className="flex items-center justify-center px-8 py-4 border border-gray-300 text-base font-bold rounded-full text-gray-700 bg-white hover:bg-gray-50 md:text-lg transition-all"
                >
                  View Features
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden"
            >
              <img
                className="w-full"
                src="https://picsum.photos/seed/dashboard/800/600"
                alt="Selloraa Dashboard"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-600/10 mix-blend-multiply"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Everything you need to succeed</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">How it works</h2>
          <p className="mt-4 text-lg text-gray-500">Three simple steps to launch your business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: '01', title: 'Sign Up', desc: 'Create your vendor account in seconds.' },
            { step: '02', title: 'Build Store', desc: 'Use our drag-and-drop builder to design your store.' },
            { step: '03', title: 'Start Selling', desc: 'Add products and start receiving orders globally.' },
          ].map((item, idx) => (
            <div key={item.step} className="text-center relative">
              <div className="text-6xl font-black text-gray-100 absolute -top-8 left-1/2 -translate-x-1/2 -z-10">{item.step}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Section */}
    <section className="py-24 bg-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-indigo-200">Choose the plan that fits your business needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "p-8 rounded-3xl flex flex-col h-full",
                plan.isPopular ? "bg-white text-gray-900 scale-105 shadow-2xl relative" : "bg-indigo-800/50 border border-indigo-700"
              )}
            >
              {plan.isPopular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className={cn("text-sm", plan.isPopular ? "text-gray-500" : "text-indigo-300")}>/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start space-x-3 text-sm">
                    <Check className={cn("w-5 h-5 shrink-0", plan.isPopular ? "text-indigo-600" : "text-indigo-400")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-center transition-all",
                  plan.isPopular ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900">Loved by vendors worldwide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-gray-50 p-8 rounded-2xl">
              <p className="text-gray-600 italic mb-6">"{t.content}"</p>
              <div className="flex items-center space-x-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ Section */}
    <section className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.question} className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">Ready to start your journey?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Join thousands of successful vendors who have built their online stores with Selloraa.</p>
            <Link
              to="/auth"
              className="inline-flex items-center px-10 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-all text-lg"
            >
              Create Your Store Now
            </Link>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  </div>
);

const FeaturesPage = () => (
  <div className="pt-32 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Powerful features for modern commerce</h1>
        <p className="text-xl text-gray-500">Selloraa provides a comprehensive suite of tools to help you manage every aspect of your online business.</p>
      </div>

      <div className="space-y-24">
        {[
          {
            title: "Advanced Store Builder",
            desc: "Our drag-and-drop builder allows you to customize every pixel of your store. Choose from hundreds of professionally designed templates or start from scratch.",
            img: "https://picsum.photos/seed/builder/800/500",
            features: ["Drag-and-drop interface", "Mobile responsive design", "Custom CSS support", "Theme marketplace"]
          },
          {
            title: "Seamless Courier Integration",
            desc: "Automate your shipping process with direct integrations to major courier services. Generate labels, track shipments, and notify customers automatically.",
            img: "https://picsum.photos/seed/shipping/800/500",
            features: ["Automated label generation", "Real-time tracking", "Multiple courier support", "Shipping rate calculator"],
            reverse: true
          },
          {
            title: "Secure OTP Verification",
            desc: "Protect your business and your customers with built-in OTP verification. Reduce fraudulent orders and ensure account security with ease.",
            img: "https://picsum.photos/seed/security/800/500",
            features: ["SMS OTP verification", "Email verification", "Two-factor authentication", "Fraud detection system"]
          }
        ].map((item, idx) => (
          <div key={item.title} className={cn("lg:grid lg:grid-cols-2 lg:gap-16 items-center", item.reverse && "lg:flex-row-reverse")}>
            <div className={cn(item.reverse && "lg:order-2")}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{item.title}</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{item.desc}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.features.map(f => (
                  <li key={f} className="flex items-center space-x-2 text-gray-700">
                    <Check className="w-5 h-5 text-indigo-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={cn("mt-12 lg:mt-0", item.reverse && "lg:order-1")}>
              <img src={item.img} alt={item.title} className="rounded-2xl shadow-xl w-full" referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PricingPage = () => (
  <div className="pt-32 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Simple pricing for every stage</h1>
        <p className="text-xl text-gray-500">Scale your business with confidence. No hidden fees, no transaction costs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "p-10 rounded-3xl flex flex-col h-full border",
              plan.isPopular ? "border-indigo-600 shadow-2xl scale-105 relative bg-white" : "border-gray-200 bg-gray-50"
            )}
          >
            {plan.isPopular && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-8">
              <span className="text-5xl font-bold">${plan.price}</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <ul className="space-y-5 mb-10 flex-grow">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                  <span className="text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={cn(
                "w-full py-4 rounded-xl font-bold text-center transition-all text-lg",
                plan.isPopular ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200" : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
              )}
            >
              Start Free Trial
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-3xl p-12 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">For large enterprises with specific requirements, we offer custom plans tailored to your needs.</p>
        <Link to="/contact" className="inline-block px-8 py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition-all">
          Contact Sales
        </Link>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="pt-32 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center mb-24">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Our mission is to democratize eCommerce</h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Founded in 2023, Selloraa was built with a single goal: to make it possible for anyone, anywhere, to start and grow a successful online business.
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            We believe that entrepreneurs are the backbone of the global economy. By providing powerful, easy-to-use tools, we're helping millions of people turn their passions into sustainable livelihoods.
          </p>
        </div>
        <div className="mt-12 lg:mt-0">
          <img src="https://picsum.photos/seed/team/800/600" alt="Our Team" className="rounded-3xl shadow-2xl" referrerPolicy="no-referrer" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {[
          { label: 'Active Vendors', value: '10,000+' },
          { label: 'Countries Served', value: '50+' },
          { label: 'Total Sales Processed', value: '$100M+' },
        ].map(stat => (
          <div key={stat.label}>
            <div className="text-4xl font-black text-indigo-600 mb-2">{stat.value}</div>
            <div className="text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="pt-32 pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Get in touch</h1>
        <p className="text-xl text-gray-500">Have questions about Selloraa? Our team is here to help you every step of the way.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Email Us</h4>
                  <p className="text-gray-500">support@selloraa.com</p>
                  <p className="text-gray-500">sales@selloraa.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Call Us</h4>
                  <p className="text-gray-500">+1 (555) 123-4567</p>
                  <p className="text-gray-500">Mon-Fri, 9am-6pm EST</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Visit Us</h4>
                  <p className="text-gray-500">123 SaaS Street, Tech City</p>
                  <p className="text-gray-500">Silicon Valley, CA 94043</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col justify-center bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to Selloraa
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of vendors and start your online journey today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-xl rounded-3xl sm:px-10 border border-gray-100 text-center">
          <p className="text-gray-600 mb-8">Sign in with your Google account to access your vendor dashboard.</p>
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-gray-300 rounded-xl shadow-sm text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <p className="mt-8 text-xs text-gray-400">
            By continuing, you agree to Selloraa's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/*" element={<VendorDashboard />} />
            <Route path="/s/:slug" element={<Storefront />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
