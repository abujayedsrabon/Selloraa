import { CheckCircle2, Store, Zap, ShieldCheck, Truck, Smartphone } from 'lucide-react';
import { Feature, PricingPlan, Testimonial, FAQItem } from './types';

export const FEATURES: Feature[] = [
  {
    title: "Store Builder",
    description: "Drag-and-drop interface to design your store without any coding knowledge.",
    icon: <Store className="w-6 h-6" />,
  },
  {
    title: "OTP Verification",
    description: "Secure your customer accounts and orders with built-in OTP verification systems.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    title: "Courier Integration",
    description: "Seamlessly connect with top courier services for automated shipping and tracking.",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    title: "Mobile Optimized",
    description: "Your store looks great and works perfectly on all mobile devices and tablets.",
    icon: <Smartphone className="w-6 h-6" />,
  },
  {
    title: "Fast Loading",
    description: "Optimized performance ensures your customers have a smooth shopping experience.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Secure Payments",
    description: "Integrated with multiple payment gateways to accept payments securely.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "29",
    period: "monthly",
    features: [
      "Up to 50 Products",
      "Basic Store Themes",
      "Standard Support",
      "Basic Analytics",
      "Selloraa Subdomain",
    ],
  },
  {
    name: "Professional",
    price: "79",
    period: "monthly",
    isPopular: true,
    features: [
      "Unlimited Products",
      "Premium Store Themes",
      "Priority Support",
      "Advanced Analytics",
      "Custom Domain Support",
      "Courier Integration",
    ],
  },
  {
    name: "Enterprise",
    price: "199",
    period: "monthly",
    features: [
      "Everything in Professional",
      "Dedicated Account Manager",
      "Custom Feature Development",
      "White-label Solution",
      "API Access",
      "Multi-vendor Support",
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Jenkins",
    role: "Founder of BloomStyle",
    content: "Selloraa transformed my small boutique into a global brand. The store builder is incredibly intuitive.",
    avatar: "https://picsum.photos/seed/sarah/100/100",
  },
  {
    name: "Michael Chen",
    role: "CEO of TechGear",
    content: "The courier integration saved us hours of manual work every day. Highly recommended for scaling businesses.",
    avatar: "https://picsum.photos/seed/michael/100/100",
  },
  {
    name: "Elena Rodriguez",
    role: "Artist & Shop Owner",
    content: "I love how fast my store loads. My customers often comment on how easy it is to shop on my site.",
    avatar: "https://picsum.photos/seed/elena/100/100",
  },
];

export const FAQS: FAQItem[] = [
  {
    question: "How long does it take to set up a store?",
    answer: "You can have your basic store up and running in less than 30 minutes using our intuitive store builder.",
  },
  {
    question: "Do I need coding skills to use Selloraa?",
    answer: "Not at all! Selloraa is designed for everyone. Our drag-and-drop builder handles all the technical aspects for you.",
  },
  {
    question: "Can I use my own domain name?",
    answer: "Yes, our Professional and Enterprise plans allow you to connect your own custom domain seamlessly.",
  },
  {
    question: "Is there a transaction fee?",
    answer: "We don't charge any transaction fees on your sales. You only pay your monthly or yearly subscription fee.",
  },
];
