// Portfolio copy — Ibtihal's voice, drastically compressed.
// Grounded in his essay, résumés, and the DualMind / Newton design docs.
// Budgets: hero ≤20w · about ≤90w · featured ≤55w · supporting ≤25w ·
// recognition ≤12w · beyond ≤20w. Counted by hand. No marketing words allowed in.

export const meta = {
  name: "Ibtihal Utsho",
  fullName: "H.M. Ibtihal Utsho",
  role: "Computer Engineering · Cognition, AI & Hardware",
  location: "Terre Haute, IN",
  email: "utshoh@rose-hulman.edu",
  github: "https://github.com/rhit-utshoh",
  linkedin: "https://www.linkedin.com/in/robosics",
};

export const hero = {
  eyebrow: "H.M. Ibtihal Utsho — Computer Engineering · Rose-Hulman ’28",
  headline: "I build for how people actually think.",
  sub: "My first code was written in ink. It got weirder from there.",
};

export const about = {
  lead: "Short version: village library to NASA Gold to games about my own brain.",
  paragraphs: [
    "Rural Bangladesh, no computer. I learned programming from a library book and wrote code in ink, with no way to run it. When the laptop finally came, its internet cost one-twelfth of my mom's salary.",
    "Then a robotics team, then a NASA rover cancelled two days before our flight. We built a ventilator instead.",
    "At Rose-Hulman, an ADHD diagnosis turned the curiosity inward. Now I build software that takes brains seriously. Long-term: walk my dog on Mars.",
  ],
};

export type Project = {
  id: string;
  title: string;
  kind: string;
  year: string;
  oneLiner: string;
  body: string;
  highlights: string[];
  stack: string[];
  metrics: string[];
  links: { label: string; href: string }[];
  featured: boolean;
  /** Arcade-exhibit extras (games only) */
  play?: string;
  controls?: string;
  badges?: string[];
};

export const projects: Project[] = [
  {
    id: "dualmind",
    title: "DualMind",
    kind: "Arcade exhibit · Cognitive sim",
    year: "2026",
    oneLiner: "One keyboard controls two students. Only one of them obeys.",
    body: "Split-screen roguelite. Every keypress runs through a neurotypical brain and an ADHD brain under a live fMRI-style monitor, and every mechanic cites a real paper. Hyperfocus makes you faster, then bills you.",
    highlights: [
      "Six brain regions rendered live, Graphics2D only",
      "Post-credits: one word, one piano note",
    ],
    stack: ["Java 17", "Java2D", "Swing", "synthesized audio"],
    metrics: ["6 brain regions live", "~50 files, 0 libraries"],
    links: [],
    featured: true,
    play: "/play/dualmind/",
    controls: "WASD drives both",
    badges: ["pure Java, no engine", "0 libraries, 0 assets"],
  },
  {
    id: "newton",
    title: "Newton's Apple Crisis",
    kind: "Arcade exhibit · Educational",
    year: "2025",
    oneLiner: "Help Newton dodge apples while Leibniz weaponizes calculus.",
    body: "Arcade dodge game with a 360-question math bank that adapts to your age, courses, and confidence. Get hit, get quizzed; answer wrong and the run ends. Three acts escalate into open calculus war.",
    highlights: [
      "Global FastAPI leaderboard on a daemon thread",
      "Compiled to WebAssembly, plays in-browser",
    ],
    stack: ["Python", "Pygame", "Pygbag / WASM", "FastAPI", "PostgreSQL"],
    metrics: ["360 questions, 8 levels", "60 FPS in-browser"],
    links: [{ label: "GitHub", href: "https://github.com/rhit-utshoh" }],
    featured: true,
    play: "/play/newton/",
    controls: "Arrows. Dodge. Answer.",
    badges: ["pygame", "plays in browser"],
  },
  {
    id: "eldercare",
    title: "Autonomous Elder-Care Robot",
    kind: "Assistive robotics · Hardware",
    year: "2023–24",
    oneLiner: "A robot that gets the right pill into the right hand on time.",
    body: "Elder-care robot built around a Raspberry Pi for thinking and an Arduino for doing. Tuning one PID-controlled servo cut pill retrieval from 20 seconds to 7, which matters when the person waiting is 80.",
    highlights: ["Sensor-based navigation, servo-actuated rotary dispenser"],
    stack: ["Raspberry Pi", "Arduino", "PID control", "Servos"],
    metrics: ["Pill retrieval 20s → 7s"],
    links: [],
    featured: true,
  },
  {
    id: "signlanguage",
    title: "Sign-Language-to-Speech Wearable",
    kind: "Assistive hardware · Embedded",
    year: "2022–24",
    oneLiner: "Gestures in, speech out, under 250 milliseconds.",
    body: "A glove with flex sensors and an IMU that recognizes 20+ ASL signs at 80% accuracy. Tested with 10+ deaf and nonspeaking users; the 65% satisfaction score taught me more than the demos did.",
    highlights: ["Whole pipeline runs on Arduino and a Pi"],
    stack: ["Arduino", "Raspberry Pi", "Flex sensors", "MPU-6050 IMU"],
    metrics: ["20+ ASL signs", "80% accuracy", "<250ms latency"],
    links: [],
    featured: true,
  },
  {
    id: "robosics",
    title: "RoboSics",
    kind: "Robotics team · Founder",
    year: "2017–23",
    oneLiner: "Six years of robots from scavenged parts, and 260-mile drives to win across Bangladesh.",
    body: "Co-founded because my hands shook too much to solder.",
    highlights: [],
    stack: ["Arduino", "Raspberry Pi", "C", "Python"],
    metrics: ["10+ projects", "1 pandemic ventilator"],
    links: [],
    featured: false,
  },
  {
    id: "nasa-rover",
    title: "NASA Rover Challenge",
    kind: "Electrical Lead · Team Bangladesh",
    year: "2019–20",
    oneLiner: "The rover was ready. The flight was two days away. Then March 2020.",
    body: "Electrical lead for the only school team among universities.",
    highlights: [],
    stack: ["Telemetry", "Control panels", "Embedded electronics"],
    metrics: ["Only school team selected"],
    links: [],
    featured: false,
  },
  {
    id: "soccer-startup",
    title: "Soccer Platform Startup",
    kind: "Sports-tech · Founder",
    year: "2025",
    oneLiner: "Pickup soccer in Dhaka shouldn't need three phone calls and a spreadsheet.",
    body: "I surveyed 30+ turfs, then designed the whole product.",
    highlights: [],
    stack: ["Product design", "Market research", "UX flows"],
    metrics: ["30+ turfs researched"],
    links: [],
    featured: false,
  },
  {
    id: "library-club",
    title: "Library Coding Club",
    kind: "Education · Founder & Instructor",
    year: "2018–21",
    oneLiner: "Bangladesh's first library coding club, on computers we built ourselves from Raspberry Pis.",
    body: "200+ mentees, ages eleven and up.",
    highlights: [],
    stack: ["Raspberry Pi 3", "Python", "C", "micro:bit"],
    metrics: ["200+ mentees", "10+ workshops"],
    links: [],
    featured: false,
  },
];

export const recognition = [
  { title: "NASA Gold Honor, first Bangladeshi to win", org: "Space Center University, Houston", year: "2022", note: "Rocket heat shield survived 1000°F." },
  { title: "Electrical Lead, NASA Rover Challenge", org: "Team Bangladesh · Huntsville", year: "2020", note: "Built the rover's telemetry and control panels." },
  { title: "Selected for the national “Act Covid-19” call", org: "Government of Bangladesh", year: "2020", note: "The ventilator." },
  { title: "10th globally, Arduino Week Exhibition", org: "International Arduino Week", year: "2020", note: "Humanoid home-and-study assistant robot." },
  { title: "Silver Award from the President of Bangladesh", org: "National Children's Award", year: "2019", note: "For a speech-impairment assistive project." },
  { title: "Talent of the Year in Science", org: "National Creative Talent Hunt", year: "2019", note: "Plus 4× district science champion." },
  { title: "Bronze, National High School Programming Contest", org: "NHSPC", year: "2017", note: "Grade 9." },
];

export const skills = [
  { group: "Languages", items: ["Python", "C", "Java", "Verilog", "Arduino"] },
  { group: "Hardware", items: ["Raspberry Pi", "Arduino", "Flex / IMU sensors", "PID control", "3D printing"] },
  { group: "Software", items: ["Java2D / Swing", "Pygame", "FastAPI", "PostgreSQL", "Git", "Pygbag / WASM", "Quartus Prime", "ModelSim"] },
  { group: "Where my head is", items: ["Cognition & ADHD modeling", "Applied AI / LLMs", "Assistive tech", "Rocketry", "Consciousness"] },
];

export const beyond = [
  { title: "A guitar in Times Square", body: "Lost my wallet in New York. Busked $250 back with a punk rocker named Devlin." },
  { title: "Animal Care Society", body: "Founded mid-pandemic. 300+ strays fed, 100+ rescued, most of Thakurgaon's street dogs vaccinated." },
  { title: "Clubs I can't quit", body: "200+ library-club mentees, a 1.5K-member science club. I keep going back." },
  { title: "Songwriting", body: "15+ lyrics. The ones I helped my mom write got published by G-Series, a top Bangladeshi label." },
];

export const education = {
  school: "Rose-Hulman Institute of Technology",
  degree: "B.S. in Computer Engineering",
  grad: "Expected May 2028",
  coursework: ["Object-Oriented Software Development", "Intro to Digital Systems", "DC Circuits", "Practical Security I", "The AI Revolution"],
  activities: ["Battery Workforce Challenge", "SASE", "Delta Sigma Phi"],
  jobs: ["Kitchen crew, Bon Appétit", "Fraternity dish crew", "SRC athletic-event staff", "SGA bike maintenance"],
};

export const contact = {
  blurb: "Looking for a CS or engineering internship. If you work on assistive tech, applied AI, robotics, or the seam between hardware and human brains, my inbox is open.",
};