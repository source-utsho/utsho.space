// Full portfolio content — written in Ibtihal's own voice, grounded in his real
// materials (essay, résumés, DualMind & Newton docs), voice- and fact-checked.

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
  sub: "From writing code by hand, in ink, on paper in rural Bangladesh to simulating two brains in pure Java — I picked computer engineering because I wanted both the hardware and the software, and I keep ending up where cognition, machines, and people meet.",
};

export const about = {
  lead: "My life could be analogized to the journey of a rocket. Too cheesy? Maybe so, but in all fairness, I did begin my education in circumstances as down-to-earth as possible.",
  paragraphs: [
    "I grew up in Chengthi, in Panchagarh, where the roads to my elementary school were at any given time either broken or under knee-deep water. There were no uniforms, no school bags, no electricity, and no up-to-date syllabi. Most of my classmates worked their family's farmland after school. My parents never asked me to do chores, which is a small thing that turns out to be everything: it left me time to be curious. When we moved to Thakurgaon, I still had none of what city kids had — no special schools, no mentors, no computers — but I had a public library, and that was enough of a door.",
    "I found programming in that library, in Tamim Shahariar Subeen's “Computer Programming.” I had no device to compile or run anything, so I wrote code by hand, in ink, and on paper, with no way to test it. Despite uncertainty about my own work plaguing me occasionally, my curiosity could barely be dented. In 8th grade I finally got a laptop and internet — a 25-gigabyte monthly package that cost 1,800 taka, about one-twelfth of my mother's salary — and I wrung dry every resource it gave me: Paul McWhorter's robotics tutorials, GitHub, microcontrollers, whatever I could reach.",
    "What followed was a long string of countdowns. RoboSics, a robotics team I co-founded because my hands were too shaky to solder well and I needed seniors who could. NASA's Human Exploration Rover Challenge, where I led the electrical R&D — until the competition was called off two days before our flight, and COVID took the dream and a lot more besides. I was bedridden for months. To not succumb to the helplessness, the team and I built an affordable ventilator for coronavirus patients. Of course, to keep with history, I kept working.",
    "The real reorientation came at Rose-Hulman, where I was diagnosed with ADHD. Getting treated — and watching large language models arrive at the same time — pointed all my old questions at a new target. I was still a builder, but now I wanted to understand the thing doing the building: attention, motivation, memory, why two people given identical instructions end up in different places. So I started building software and hardware that take how people actually think and decide seriously — grounded in cognitive-science papers, not vibes, and using AI tools to move faster than I could alone.",
    "I cross disciplines on purpose. I don't just want to be an engineer, an astronaut, or a rocket scientist — I want every path that helps me understand the universe and the minds inside it. Essentially, I aspire to take leisurely walks with my dog across Martian landscapes, and I plan to work toward a reality where that sounds mundane rather than impossible.",
  ],
};

export const projects = [
  {
    id: "dualmind",
    title: "DualMind",
    kind: "Cognitive simulation · Game · Pure Java",
    year: "2026",
    oneLiner: "Same WASD inputs. Same world. Two outcomes based on cognitive state.",
    body: "DualMind is a split-screen action roguelite where every keypress runs through two cognitive engines at once — a neurotypical brain and an ADHD brain — and produces two different outcomes from identical input. Above the play field sits a live neural monitor built to look like real-time fMRI software: six brain regions (dlPFC, ACC, Caudate, N.Acc, VTA, Cerebellum) rendered as activation blobs with scrolling signal graphs, all drawn from Graphics2D primitives in pure Java 17 with zero external libraries and zero asset files. The argument is never spoken in dialogue — that differences in outcome aren't about effort, that cognitive processing and environment shape performance. You feel it in your hands instead. Every mechanic is anchored to a real paper; nothing is invented.",
    highlights: [
      "Attention decay drives real input lag (up to ~304ms); on the ADHD engine, inhibitory-control misfires turn a correct input into a wrong output 20% of the time below a 0.60 control threshold — the neurotypical engine misfires under 5%, and only below 0.40",
      "Hyperfocus makes the ADHD character visibly faster for ~87s, then forces a mandatory burnout crash — and a carryover debt makes each room start worse than the last",
      "Six in-game scaffolds map to real accommodations, each with a citation (Barkley, Volkow, Hammer, the ds002424 dataset); the word “ACCOMMODATIONS” only appears post-credits, on a white screen with one piano note",
      "The endgame flips you into the system architect: redesign exam timing, format, and load, watch the engine change, replay",
    ],
    stack: ["Java 17", "Java2D / Graphics2D", "Swing", "javax.sound.sampled", "MVC (~50 files)"],
    metrics: ["6 brain regions modeled live", "~50 .java files, 0 libraries", "10-week semester, 2 boss exams"],
    links: [],
    featured: true,
  },
  {
    id: "newton",
    title: "Newton's Apple Crisis",
    kind: "Educational arcade game · Full stack",
    year: "2025",
    oneLiner: "Prevent Newton from discovering gravity — by helping him dodge calculus.",
    body: "You play Isaac Newton dodging falling apples while Leibniz hurls math questions calibrated to your actual age, the courses you've taken, and a self-rated confidence level. Every apple that lands triggers a quiz; answer right and you survive, answer wrong and the run ends — failure is the lesson. Under the hood is a 360-question hand-authored bank across 8 levels from Arithmetic to Advanced Calculus, an adaptive engine that builds your question pool from your profile, and the real Newton–Leibniz priority war staged as a three-act conflict. It started as a class capstone, then I kept rebuilding it: Pygame compiled to WebAssembly via Pygbag so it runs in-browser with no install, backed by a FastAPI + PostgreSQL global leaderboard on Railway.",
    highlights: [
      "Adaptive difficulty from age, courses taken, and a 4-level confidence rating — not arbitrary curves",
      "Three acts with escalating spawn rates and score multipliers; cutscene dialogue between Newton and Leibniz",
      "Non-blocking leaderboard over a daemon thread so the game loop never stalls in the browser",
      "Treated game-juice as non-negotiable: particle bursts, screen shake, eased growth, mood and combo systems, rotating historical facts on game over",
    ],
    stack: ["Python", "Pygame", "Pygbag / WebAssembly", "FastAPI", "PostgreSQL", "Railway"],
    metrics: ["360 questions, 8 levels", "1065×768 @ 60 FPS", "Global leaderboard"],
    links: [{ label: "GitHub", href: "https://github.com/rhit-utshoh" }],
    featured: true,
  },
  {
    id: "eldercare",
    title: "Autonomous Elder-Care Robot",
    kind: "Assistive robotics · Hardware",
    year: "2023–24",
    oneLiner: "A robot that gets the right pill into the right hand on time.",
    body: "An autonomous elder-care robot built to address medication non-adherence and isolation. I integrated a Raspberry Pi and Arduino for core control, used sensors for localization and navigation, and designed a servo-actuated rotary pill dispenser. By tuning a PID-controlled servo, I cut pill-retrieval time from 20 seconds to 7 — which matters when the person waiting is 80 and isn't sure whether they took the morning dose.",
    highlights: [
      "Raspberry Pi + Arduino split for high-level control and real-time actuation",
      "Sensor-based localization and navigation",
      "PID-optimized rotary dispenser: 20s → 7s pill retrieval",
    ],
    stack: ["Raspberry Pi", "Arduino", "PID control", "Sensors", "Servos"],
    metrics: ["Pill retrieval 20s → 7s"],
    links: [],
    featured: true,
  },
  {
    id: "signlanguage",
    title: "Sign-Language-to-Speech Wearable",
    kind: "Assistive hardware · Embedded",
    year: "2022–24",
    oneLiner: "Gestures in, real-time speech and text out.",
    body: "A wearable that translates sign-language gestures into speech and text in real time, built around flex sensors and an MPU-6050 IMU. The recognition system identified 20+ ASL signs at 80% accuracy through a low-latency pipeline running under 250ms on Arduino and Raspberry Pi. I tested it with 10+ deaf and mute users and reached 65% usability satisfaction — a number that told me as much about what to fix as about what worked.",
    highlights: [
      "Flex sensors + MPU-6050 IMU for gesture capture",
      "20+ ASL signs recognized at 80% accuracy",
      "<250ms latency across Arduino and Raspberry Pi",
      "Validated with 10+ deaf/mute users at 65% usability satisfaction",
    ],
    stack: ["Arduino", "Raspberry Pi", "Flex sensors", "MPU-6050 IMU", "C", "Python"],
    metrics: ["20+ ASL signs", "80% accuracy", "<250ms latency"],
    links: [],
    featured: true,
  },
  {
    id: "robosics",
    title: "RoboSics",
    kind: "Robotics team · Founder & Team Leader",
    year: "2017–23",
    oneLiner: "We built robots from whatever we could scavenge, and drove 260 miles to be seen.",
    body: "I co-founded and led RoboSics for 6+ years because I couldn't solder steadily on my own — so I teamed up with two seniors who could solder but had never touched robotics, in a community where nobody had been introduced to it. With unreliable internet and no real access to parts, we built robots out of whatever we could scavenge and drove nearly 260 miles to compete — and won across Bangladesh. Over 10+ projects we built an E-Assistant for the mute and deaf, a Hill-Track Safety system for dangerous U-turns in the hill tracks of Bandarban, a BeachBot that rewards proper waste disposal with a chocolate, a telepresence robot, a humanoid home-and-study assistant, and — during the pandemic — an affordable ventilator.",
    highlights: [
      "6+ years, 10+ projects, competition wins across Bangladesh",
      "E-Assistant for the mute/deaf; Hill-Track road-safety system; BeachBot; telepresence robot",
      "Built robots from scavenged materials under hard constraints; drove ~260 miles to compete",
      "Built an affordable COVID ventilator that earned selection for the government's “Act Covid-19” call",
    ],
    stack: ["Arduino", "Raspberry Pi", "C", "Python", "Sensors", "3D printing"],
    metrics: ["6+ yrs as Team Leader", "10+ projects", "~260 miles to compete"],
    links: [],
    featured: false,
  },
  {
    id: "nasa-rover",
    title: "NASA Human Exploration Rover Challenge",
    kind: "Electrical Lead · Team Bangladesh",
    year: "2019–20",
    oneLiner: "The rover was in tow. Two days before the flight, it was called off.",
    body: "I was Electrical / Electronics Lead for Team Bangladesh at NASA's 2020 Human Exploration Rover Challenge in Huntsville — the only school team selected among university teams, a slot we earned off RoboSics' track record. I led the electrical R&D for a human-powered rover: the electronic control panel with radio, display, and rover controls, real-time telemetry, failure prevention across components, and advanced manufactured wheels. The year being 2020, fate wasn't on our side — the competition was called off two days before our flight to Alabama. It was heartbreaking, and the response, building ventilators, became the next chapter.",
    highlights: [
      "Only Bangladeshi school team selected, among university teams",
      "Built the Electronic Control Panel: radio, display, rover controls",
      "Optimized real-time telemetry and designed for failure prevention",
      "Manufactured advanced wheels for a human-powered rover",
    ],
    stack: ["Embedded electronics", "Telemetry / radio", "Control systems", "Manufacturing"],
    metrics: ["Electrical Lead", "Sept 2019 – Apr 2020"],
    links: [],
    featured: false,
  },
  {
    id: "soccer-startup",
    title: "Soccer Platform Startup",
    kind: "Sports-tech · Founder",
    year: "2025",
    oneLiner: "Organizing a pickup match shouldn't take a spreadsheet and three phone calls.",
    body: "A sports-tech platform I founded and built out at Penta Global Limited in Dhaka, aimed at the shortage of playing space in dense cities — where getting a game together means juggling scarce turf, scattered players, and split fees. I did the market research myself, across 30+ soccer turfs, to validate demand, define pricing, and shape the product. Then I designed the UI flows, wireframes, and feature specs for player groups, team scheduling, match discovery, turf booking, and fee-splitting.",
    highlights: [
      "Founded and built out at Penta Global Limited, Dhaka",
      "Market research across 30+ turfs to validate demand and pricing",
      "Designed UI flows, wireframes, and feature specs end to end",
      "Features: player groups, scheduling, match discovery, turf booking, fee-splitting",
    ],
    stack: ["Product design", "Market research", "Wireframing", "UX flows"],
    metrics: ["30+ turfs researched", "Summer 2025"],
    links: [],
    featured: false,
  },
  {
    id: "library-club",
    title: "Thakurgaon Library Coding Club",
    kind: "Education · Founder & Instructor",
    year: "2018–21",
    oneLiner: "Bangladesh's first library code club — built on Raspberry Pi because laptops were a fantasy.",
    body: "I convinced educators I met at a national programming contest in Dhaka to start a coding club in my hometown, then became its programming instructor at the British Council's Thakurgaon Government Public Library. Computers were too expensive to assume anyone had, so I led a team of 10 to build Kano computers from Raspberry Pi 3s for the learners. Across 10+ workshops I taught 200+ marginalized mentees — block-based coding for kids 11 and under, Python and C for those 12 and up, plus micro:bit projects like step counters, compasses, and data-collection tools.",
    highlights: [
      "Founded Bangladesh's first library code club; served as its programming instructor",
      "Built Kano computers from Raspberry Pi 3 with a team of 10",
      "10+ workshops, 200+ underprivileged mentees, two classes a week",
      "Block-based coding for younger kids; Python/C and micro:bit for older ones",
    ],
    stack: ["Raspberry Pi 3", "Python", "C", "micro:bit", "Block-based coding"],
    metrics: ["200+ mentees", "10+ workshops", "Team of 10"],
    links: [],
    featured: false,
  },
];

export const recognition = [
  { title: "Gold Honor — first Bangladeshi to win", org: "NASA Space Center University, Houston", year: "2022", note: "International STEM competition in robotics, rocketry, and space habitats; 3× challenge champion, 1st in Mars Habitat & Coding; top 3% for leadership and problem-solving; rocket with a 1000°F-resistant heat shield." },
  { title: "Electrical Lead — Human Exploration Rover Challenge", org: "NASA / Team Bangladesh, Huntsville", year: "2020", note: "Only Bangladeshi school team selected among university teams; competition cancelled two days before the flight due to COVID-19." },
  { title: "Selected for the “Act Covid-19” national call", org: "Government of Bangladesh", year: "2020", note: "For an affordable ventilator built for coronavirus patients after the Rover Challenge was cancelled." },
  { title: "10th Place Globally", org: "International Arduino Week Project Exhibition", year: "2020", note: "Home & Study Assistant Humanoid Robot — Arduino + Raspberry Pi 3 in C & Python, with image processing and a voice assistant." },
  { title: "Silver Award — presented by the President of Bangladesh", org: "National Children's Award Competition", year: "2019", note: "For a project supporting individuals with speech impairments." },
  { title: "Champion — Talent of the Year in Science", org: "National Creative Talent Hunt", year: "2019", note: "Plus 4× District Champion (of 100+ teams) over five years at the National Science & Technology Project Display." },
  { title: "Bronze Award", org: "National High School Programming Contest (NHSPC)", year: "2017", note: "Grade 9." },
  { title: "Regional & divisional honors", org: "Science Olympiad · Innovation Fair · ACC Talent Hunt", year: "2018–21", note: "4× Regional Champion (National Science & Tech Olympiad); Runner-up Divisional Innovation Fair '18; 2nd Runner-up Divisional Science Olympiad '18; Runner-up ACC Talent Hunt '21." },
];

export const skills = [
  { group: "Languages", items: ["Python", "C", "Java", "Verilog", "Arduino"] },
  { group: "Hardware & embedded", items: ["Raspberry Pi", "Arduino", "Sensors (flex, IMU)", "PID control", "Servo actuation", "3D printing"] },
  { group: "Software & tools", items: ["Java Swing / Java2D", "Pygame", "FastAPI", "PostgreSQL", "Git", "Pygbag / WASM", "Quartus Prime", "ModelSim"] },
  { group: "Engineering & design", items: ["Robotics", "Embedded systems", "Digital systems / FPGA", "MVC architecture", "UI flows & wireframing", "Market research"] },
  { group: "Coursework", items: ["Object-Oriented Software Dev", "Intro to Digital Systems", "DC Circuits", "Practical Security I", "The AI Revolution", "Engineering Practice"] },
  { group: "Where my head is", items: ["Cognition & ADHD modeling", "Applied AI / LLMs", "Assistive technology", "Rocketry & space systems", "Psychology & consciousness"] },
];

export const beyond = [
  { title: "A guitar in Times Square", body: "After Space Camp in Houston I toured New York and lost my wallet — cash, cards, everything — with no friends or relatives to call. I met an elderly punk rocker named Devlin performing in Times Square, told him my predicament, and he asked if I could play guitar. A novice with an imperfect voice and no sense of tone, I modestly admitted my ability — then played “Moho,” a Bangladeshi metal song by Aftermath. He liked it, we became fast friends, and he let me stay at his place. I earned $250 busking on Times Square, the subways, and the streets — the unforgettable beginning of my music journey. Since then I've written 15+ song lyrics and helped my mom write hers, which G-Series, a top Bangladeshi label, composed and published." },
  { title: "Animal Care Society of Thakurgaon", body: "I founded and ran the Animal Care Society for 3+ years, starting it in the middle of the pandemic. We nourished 300+ stray animals, rescued 100+ cats and dogs — including a dog stuck between two closely held walls and a cat trapped in iron barbed wire — vaccinated most of the street dogs and cats in Thakurgaon Sadar, put reflective collars on dogs to cut road accidents, and raised $1,000 for veterinary support. I still volunteer with them." },
  { title: "Teaching the next ones", body: "Compassion and STEM have never felt separate to me, so I keep mentoring. Beyond the library club's 200+ mentees, I founded the Thakurgaon Govt. Boys' High School Science Club (1.5K new members, 3 science fests, 15 workshops on C, robotics, and problem-solving), and on my gap year I went back to mentor students for the Bangladesh Robot Olympiad and the National High School Programming Contest." },
  { title: "Scouting, service, and soccer", body: "Five years in Bangladesh Scouts as a Service Badge Holder and Patrol Leader, plus Student Cabinet Senator — 1 international and 4 national jamborees, aid for flood-affected people, 30+ events volunteered, 150+ trees planted on campus. With Ekotar Spondon I led 7+ events and handed out winter clothes to 200+ street dwellers and elderly during Bangladesh's harshest winter. Lately I've taken up soccer and I'm working to make Rose-Hulman's amateur team." },
];

export const education = {
  school: "Rose-Hulman Institute of Technology",
  degree: "B.S. in Computer Engineering",
  grad: "Expected May 2028",
  coursework: ["Object-Oriented Software Development", "Intro to Digital Systems", "DC Circuits", "Practical Security I", "The AI Revolution", "Engineering Practice"],
  activities: ["Battery Workforce Challenge", "Society of Asian Scientists & Engineers (SASE)", "Delta Sigma Phi"],
  jobs: ["Kitchen crew, Bon Appétit", "Fraternity dish crew", "SRC athletic-event staff", "SGA bike maintenance"],
};

export const contact = {
  blurb: "I'm looking for a CS or engineering internship where I can learn fast and build something real. If you're working on assistive tech, applied AI, robotics, or anything at the seam of hardware and how people think, I'd love to talk.",
};
