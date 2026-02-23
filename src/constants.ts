import { 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  Instagram, 
  Youtube,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  XCircle
} from "lucide-react";

export const SOCIAL_LINKS = [
  {
    name: "GitHub",
    url: "https://github.com",
    icon: Github,
    color: "hover:text-white hover:bg-zinc-900",
  },
  {
    name: "Twitter",
    url: "https://twitter.com",
    icon: Twitter,
    color: "hover:text-white hover:bg-sky-500",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    icon: Linkedin,
    color: "hover:text-white hover:bg-blue-600",
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    icon: Instagram,
    color: "hover:text-white hover:bg-pink-600",
  },
];

export const BUSINESS_WEBSITES = [
  {
    title: "TechFlow Solutions",
    description: "Enterprise-grade cloud infrastructure and automation services.",
    url: "https://example.com",
    tags: ["Cloud", "DevOps", "B2B"],
    image: "https://picsum.photos/seed/tech/800/600",
  },
  {
    title: "Creative Canvas",
    description: "A digital agency focused on high-end UI/UX design and branding.",
    url: "https://example.com",
    tags: ["Design", "Branding", "Creative"],
    image: "https://picsum.photos/seed/design/800/600",
  },
  {
    title: "EcoSphere",
    description: "Sustainable e-commerce platform for eco-friendly products.",
    url: "https://example.com",
    tags: ["E-commerce", "Sustainability"],
    image: "https://picsum.photos/seed/eco/800/600",
  },
];

export const PAYMENT_OPTIONS = [
  {
    id: "consultation",
    name: "1-Hour Consultation",
    price: 15000, // $150.00
    displayPrice: "$150",
    description: "Deep dive into your project architecture and strategy.",
  },
  {
    id: "support",
    name: "Buy Me a Coffee",
    price: 500, // $5.00
    displayPrice: "$5",
    description: "Support my open-source work and content creation.",
  },
  {
    id: "custom",
    name: "Custom Project Deposit",
    price: 50000, // $500.00
    displayPrice: "$500",
    description: "Initial deposit to kickstart your custom development project.",
  },
];
