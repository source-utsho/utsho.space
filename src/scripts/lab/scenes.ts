export interface Scene {
  n: number;
  shape: string;
  colorT: number;
  side: "l" | "r";
  turb?: number;
  eyebrow: string;
  heading: string;
  prose: string;
  details?: string[];
  links?: { label: string; href: string }[];
}

export const scenes: Scene[] = [
  {
    n: 1, shape: "house", colorT: 0.1, side: "l", eyebrow: "// 0 – 17 · THAKURGAON",
    heading: "The house I started in",
    prose: "This is the house in Hazi Para, in Thakurgaon, in the far north of Bangladesh, where I spent the first seventeen years of my life — and where most of what I am was decided before I had any say in it. It is drawn here in light because that is how I carry it: not as an address, but as the small, specific world a mind first learns to want more than. Everything after this is the story of leaving it without ever quite leaving it behind.",
    details: ["Hazi Para, Thakurgaon — northern Bangladesh", "Where the engineering, and the wanting, began"],
  },
  {
    n: 2, shape: "profile", colorT: 0.18, side: "r", turb: 0.07, eyebrow: "// THE YEARS BEFORE I KNEW",
    heading: "A mind at war with itself",
    prose: "The truth of those years is that I was fighting myself and losing, without the faintest idea why. There was little opportunity and less margin — family that came apart, money that ran out, a country and a season that flooded the very roads I needed to cross — and underneath all of it a brain that would not do what I told it to, that raced and stalled and burned and went dark on its own schedule. I did not have a name for it yet. I only knew that wanting something was never the hard part; the hard part was the distance between wanting it and being able to begin.",
    details: ["Ups and downs, scarce opportunity, family and financial strain", "An undiagnosed mind I could not yet explain — or forgive"],
  },
  {
    n: 3, shape: "robot", colorT: 0.4, side: "l", eyebrow: "// SO I BUILT",
    heading: "I built things anyway",
    prose: "Whatever else was failing, I could build. So I did — compulsively, out of whatever the house could spare, with two school seniors who could solder and a community that had never seen a robot. We called it RoboSics, and over six years we made more than ten of them from repurposed parts and bad internet, traveling hundreds of miles to show them to anyone who would look. I could not yet fix what was wrong with my own attention, but I could give a machine a task and watch it do exactly what it was told — and for a long time that was the closest thing I had to relief.",
    details: ["RoboSics — 6+ years, 10+ robots from repurposed materials", "A community with no prior robotics; traveled ~260 miles to compete", "Built while still not understanding what was wrong"],
  },
  {
    n: 4, shape: "ventilator", colorT: 0.46, side: "r", eyebrow: "// SO I BUILT · IMPACT",
    heading: "The machine that mattered most",
    prose: "When the 2020 NASA rover challenge was cancelled two days before our flight and the pandemic swept everything else off the table, we refused to sit still and built an affordable ventilator for coronavirus patients — and it was selected for the Bangladesh government's national 'Act Covid-19' call. There were others: a road-safety system for the lethal hill-track U-turns of Bandarban, a waste-collecting BeachBot, a telepresence robot. None of them were elegant. A few were held together with hope and repurposed parts. Every one of them did the thing it was built to do.",
    details: ["COVID-19 ventilator — selected for Bangladesh's national 'Act Covid-19' call", "Hill-track road safety (Bandarban) · BeachBot · telepresence robot", "Born from a cancelled NASA flight and a refusal to be helpless"],
  },
  {
    n: 5, shape: "hand", colorT: 0.55, side: "l", eyebrow: "// SO I BUILT · ASSISTIVE",
    heading: "Giving a voice a shorter path",
    prose: "I keep being pulled toward the people technology forgets, and few are forgotten as routinely as someone who signs fluently in a room where no one else does. My Sign Language-to-Speech wearable reads more than twenty ASL signs from flex sensors and an IMU at about eighty percent accuracy and under a quarter-second of latency — and, more to the point, I put it in front of more than ten Deaf and hard-of-hearing users, because a number on a bench means nothing until a real person trusts it. An assistive device is only finished when it disappears into the conversation.",
    details: ["Flex sensors + MPU-6050 IMU · Arduino & Raspberry Pi", "20+ ASL signs at ~80% accuracy · <250 ms latency", "Validated with 10+ Deaf / hard-of-hearing users"],
  },
  {
    n: 6, shape: "sbc", colorT: 0.42, side: "r", eyebrow: "// SO I BUILT · ACCESS",
    heading: "We built the computers first",
    prose: "When I helped start one of Bangladesh's first public-library coding clubs, we hit the obvious wall at once: the students had no computers. So I led a team of ten to build Kano machines on Raspberry Pi 3s, and then taught more than two hundred underprivileged mentees on the hardware we had just assembled with our own hands. I had spent my own childhood without the access I was now handing out, and I understood, in a way that is hard to unlearn, that it was never going to arrive on its own. So we built it.",
    details: ["One of Bangladesh's first public-library coding clubs", "Led a team of 10 to build Kano computers on Raspberry Pi 3s", "Taught 200+ underprivileged mentees — block-based, then Python & C"],
  },
  {
    n: 7, shape: "plane", colorT: 0.5, side: "l", eyebrow: "// THE LEAP",
    heading: "Dhaka to the other side of the world",
    prose: "I had chosen Computer Engineering on purpose, years in advance, because it was the one major that would teach me both halves of the machine — the silicon and the software — so that I could build all the way down. To actually study it I had to leave: from Dhaka, across the world, to Rose-Hulman in a small town in Indiana, further from home than anyone in my family had ever been. I arrived still carrying the same unnamed thing I had fought my whole life — and I did not yet know that the most important discovery of the trip would not be in any of the courses.",
    details: ["Bangladesh → Rose-Hulman Institute of Technology, Indiana", "Chose Computer Engineering to master hardware and software both"],
  },
  {
    n: 8, shape: "brain", colorT: 0.82, side: "r", eyebrow: "// THE DIAGNOSIS",
    heading: "When the mind finally named itself",
    prose: "At Rose-Hulman I was finally diagnosed with severe ADHD and began treatment immediately — and the effect was not a small adjustment but a revolution. For the first time the thing I had been losing to for two decades had a name, a mechanism, a literature. Almost in the same moment the large-language-model revolution arrived, and the two together rearranged my entire view of the universe. I became, and remain, obsessed: with human cognition, with artificial intelligence, with psychology and consciousness — with how minds, the made and the born kind, actually work. Everything I build now is aimed, one way or another, at understanding that.",
    details: ["Diagnosed with severe ADHD at Rose-Hulman; treatment began immediately", "ADHD treatment + the LLM revolution reoriented his entire worldview", "Now obsessed with cognition, AI, psychology, and consciousness"],
  },
  {
    n: 9, shape: "twobrain", colorT: 0.95, side: "l", eyebrow: "// THE OBSESSION · DUALMIND",
    heading: "The system was the variable. Not the student.",
    prose: "DualMind is the first thing the diagnosis made me build. It runs a single input through two simulated brains at once — Marcus, who is neurotypical, and Rayan, who has ADHD — each a dynamical model of attention, reward, inhibition, working memory and timing, mapped onto real brain regions and rendered live on an fMRI-styled Neural Monitor. The model is specific: attention decays at 0.008 per tick until input lags by up to nineteen ticks, inhibition below 0.60 misfires about a fifth of the time, working memory holds two items where the other engine holds four, and one room's debt carries into the next. I did not want to describe what my own mind feels like — I wanted to let you fail at a task for reasons you can watch unfold, then hand you the controls, because the system was the variable, not the student, and the only verb left to press is ACCOMMODATIONS.",
    details: ["One input → two engines: neurotypical 'Marcus' vs ADHD 'Rayan'", "AC / RS / IC / WM / TS across dlPFC · ACC · Caudate · N.Acc · VTA · Cerebellum", "Attention ~0.008/tick → up to 19-tick lag; ~20% misfire under 0.60 IC; WM 2 vs 4", "Hyperfocus ×1.40 → burnout; cross-room carryover = cumulative debt", "Grounded in ds002424 (Lytle/Hammer/Booth 2020), Barkley 1997, Volkow 2009, Hammer 2015", "50 source files · pure Java 17 · Java2D · no external libraries"],
    links: [{ label: "Source — github.com/rhit-utshoh", href: "https://github.com/rhit-utshoh" }],
  },
  {
    n: 10, shape: "apple", colorT: 0.8, side: "r", eyebrow: "// AND I KEPT BUILDING · NEWTON'S APPLE CRISIS",
    heading: "Stop Newton from inventing calculus",
    prose: "Newton's Apple Crisis is an arcade game with an absurd premise and a serious engine: your job is to stop Newton, and every time he lands a hit you are served a calculus question calibrated to exactly who you are. Behind it sit 360 questions I wrote by hand across eight math levels and three difficulty tiers, fed through an adaptive engine with an age-floor so a younger player is never handed a problem built to overwhelm them — and because success makes Newton bigger and harder while failure quietly becomes the lesson, getting good raises the stakes instead of ending the game. It is the same instinct as DualMind in a lighter key: whatever I am ostensibly making, I am really building a small theory of how a mind learns.",
    details: ["Python arcade game → WebAssembly via Pygbag, playable in-browser", "360 hand-authored questions · 8 levels × 3 tiers · age-floored adaptive engine", "Success makes Newton harder; failure becomes the teaching moment", "Global leaderboard on FastAPI + PostgreSQL (Railway) · clean MVC"],
    links: [{ label: "Source — Newton-s-Apple-Crisis", href: "https://github.com/rhit-utshoh/Newton-s-Apple-Crisis" }],
  },
  {
    n: 11, shape: "chip", colorT: 0.56, side: "l", eyebrow: "// THE TOOLKIT",
    heading: "Both halves of the machine",
    prose: "All of it rests on the same toolkit, and on the deliberate choice to learn both halves of the machine. I think in Python and Java when the problem is a system, in C and Verilog when it is closer to the silicon, and in solder and PID control when it has to move in the real world — and lately in product, too, having founded a soccer-tech platform incubated at Penta Global in Dhaka after market-researching thirty-plus turfs. The rest is just the grammar that lets an idea survive contact with a machine. What I want next is simple to say and hard to earn: to keep building, with cognition and AI as my materials.",
    details: ["Languages — Python · Java 17 · C · Verilog · Arduino", "Hardware — Raspberry Pi · sensors & sensor fusion · 3D printing · PID · circuit design", "Stack — Git · FastAPI · PostgreSQL · Pygame/Pygbag · Java2D/Swing · Quartus · ModelSim", "Domain — cognitive modeling · fMRI interpretation · procedural rhetoric · adaptive learning", "Founder, soccer-tech platform — incubated at Penta Global, Dhaka (2025)"],
  },
  {
    n: 12, shape: "rocket", colorT: 0.68, side: "r", eyebrow: "// HONORS · THE LAUNCH",
    heading: "First Bangladeshi Gold",
    prose: "I have always thought of my life as a launch, and the closest it has come to a literal one was at NASA's Space Center University in Houston, where I earned an Honored Gold distinction — the first Bangladeshi to do so — finishing in the top three percent and taking champion across VEX robotics, the Mars Habitat build, and Cryogenics. I served as Electrical Lead on Team Bangladesh for NASA's Human Exploration Rover Challenge, placed tenth globally at International Arduino Week, and won District Champion four times out of a hundred-plus teams. I list them plainly because each was a door that was not supposed to open for someone from that house in Thakurgaon — and every one of them was thrust.",
    details: ["Gold Honor · NASA Space Center University, Houston 2022 — first Bangladeshi, top 3%", "3× champion: VEX robotics · Mars Habitat · Cryogenics", "Electrical Lead, Team Bangladesh — NASA Human Exploration Rover Challenge", "10th globally, International Arduino Week · 4× District Champion (100+ teams)"],
  },
  {
    n: 13, shape: "medalstar", colorT: 0.52, side: "l", eyebrow: "// HONORS",
    heading: "Silver, from the President",
    prose: "I keep one honor last on purpose. The Silver Award of the National Children's Award, presented by the President of Bangladesh, was for assistive technology built for people with speech impairments — and of everything on the list it is the one most directly about giving someone their words back. That, more than any medal, is the work I keep circling toward no matter what I am officially building.",
    details: ["Silver Award · National Children's Award 2019", "Presented by the President of Bangladesh", "For assistive technology for people with speech impairments"],
  },
  {
    n: 14, shape: "guitar", colorT: 0.36, side: "r", eyebrow: "// THE PART THAT DOESN'T COMPILE",
    heading: "A borrowed guitar in Times Square",
    prose: "After Space Camp I toured New York, lost my wallet, and was stranded in a foreign country with no one to call — until an elderly Times Square punk rocker named Devlin asked if I could play, lent me his guitar, and listened while I performed a Bangladeshi metal song called 'Moho.' We became fast friends; I busked the subways and streets for about two hundred and fifty dollars, and that was the unlikely start of my music. I have written more than fifteen sets of lyrics since, helped my mother write hers — some composed and published by G-Series, a leading Bangladeshi label — and found a second language for the part of the signal that does not compile.",
    details: ["Stranded in NYC after Space Camp; Devlin lent a guitar", "Busked subways & streets for ~$250 — the start of his music", "15+ sets of lyrics · co-wrote with his mother · published by G-Series"],
  },
  {
    n: 15, shape: "dog", colorT: 0.3, side: "l", eyebrow: "// THE PART THAT DOESN'T COMPILE",
    heading: "And I want a dog on Mars",
    prose: "Through the worst of those early years — the cancelled launches, the months bedridden with COVID while my family stretched to cover a rented oxygen cylinder, the home I kept leaving and returning to — I started caring for the street animals nobody else was counting, and with a few others founded the Animal Care Society of Thakurgaon, which has fed more than three hundred and rescued more than a hundred on about a thousand dollars raised. Through every countdown the same small wish has persisted: I want to take leisurely walks with my dog across Martian landscapes, and I intend to work toward a reality where that sounds mundane rather than impossible.",
    details: ["Founder & admin, Animal Care Society of Thakurgaon", "Fed 300+ stray animals · rescued 100+ · raised ~$1,000", "Built through cancelled launches, illness, and coming home for family"],
  },
  {
    n: 16, shape: "openhand", colorT: 0.22, side: "r", eyebrow: "// CONTACT",
    heading: "The hallway between us",
    prose: "If any of this resonated — a project to build, a question to chase, a place where this particular way of thinking would be useful — I would like to hear what you are building too. I am most myself in the hallway between two fields that were not supposed to meet, and I am looking for the people and problems worth walking it for. The launch never really ends; that was the whole conceit — and I would rather not walk the next stretch alone.",
    links: [
      { label: "Email — ibtihal.utsho.ai@gmail.com", href: "mailto:ibtihal.utsho.ai@gmail.com" },
      { label: "GitHub — github.com/rhit-utshoh", href: "https://github.com/rhit-utshoh" },
      { label: "LinkedIn — linkedin.com/in/robosics", href: "https://linkedin.com/in/robosics" },
    ],
  },
];
