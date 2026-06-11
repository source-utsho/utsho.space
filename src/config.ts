/**
 * ============================================================
 *  CONTENT — written from your real materials, in your voice.
 *  Edit anything here; the site reads from this one file.
 * ============================================================
 */

export const site = {
  name: "Ibtihal Utsho",
  fullName: "H.M. Ibtihal Utsho",
  role: "Computer Engineering student — cognition, neuroscience, and the engineering between them",
  // quiet metadata caption (sans), kept factual
  education: "B.S. Computer Engineering · Rose-Hulman Institute of Technology · Expected May 2028",
  location: "Terre Haute, IN",
  url: "https://utsho.space",
  email: "ibtihal.utsho.ai@gmail.com",
  github: "https://github.com/rhit-utshoh",
  linkedin: "https://linkedin.com/in/robosics",
  available: true,
  description:
    "H.M. Ibtihal Utsho is a Computer Engineering student at Rose-Hulman who builds games, robots, and systems where the craft serves an idea — from a dual-brain ADHD simulation grounded in fMRI data to assistive hardware for the people technology forgets.",
};

export const hero = {
  // *word* renders in the ember accent
  headline: "I build things that *argue* with me.",
  subhead:
    "I'm a Computer Engineering student at Rose-Hulman, and the work that holds me lives where psychology, cognition, and engineering overlap. The projects here began as course assignments, robotics builds, and questions I couldn't put down, and quietly became inquiries into how minds learn, why two students under identical rules end up in different places, and who gets overlooked when we decide what is worth building.",
};

export const about = {
  title: "How I think",
  paragraphs: [
    "I began my education in circumstances as down-to-earth as possible: roads between home and school in Chengthi, Panchagarh that were, at any given time, either broken or under knee-deep water, and a stretch of years with no electricity, no up-to-date syllabi, and no device on which to run the code I was learning to write. So I wrote it by hand, in ink, and on paper. That constraint turned out to be the most honest teacher I ever had, because it forced me to understand a program before a machine could forgive me for not understanding it.",
    "I am most at home in the seam between two fields rather than the safe middle of either one, drawn to questions that sit where psychology, cognition, and engineering overlap: what does it actually take to teach a mind something it is resisting, and why do outcomes diverge between people who are, on paper, doing the same thing? I have ADHD, and rather than treat that as a footnote I have learned to treat the way I think as the instrument itself — something to study, model, and occasionally argue with in code.",
    "What I care about most is meaning, which is an inconvenient thing to care about, because it means I go deepest on the problems that carry a real question. I would rather build one thing that makes a claim than ten that decorate a résumé. So the projects on this page tend to grow past where they began — somewhere in the middle of each one, a smaller question I couldn't answer turned into a larger one I couldn't ignore. My purpose is not just to be an engineer. I want to explore every path that helps me understand how minds, machines, and the universe work, and to leave behind tools that meet people exactly where they stand.",
  ],
};

export const projects = [
  {
    title: "DualMind",
    kind: "Serious game · applied neuroscience",
    year: "2025",
    oneLiner:
      "A research-grounded Java game where one stream of input runs through two simulated brains at once — neurotypical and ADHD — so you feel, in your own hands, what the difference actually is.",
    readouts: [
      { v: "2", l: "parallel minds" },
      { v: "6", l: "brain regions" },
      { v: "5", l: "cognitive variables" },
      { v: "50", l: "source files" },
    ],
    body:
      "DualMind is the most personal piece of engineering I have done, and I tried to make it the most rigorous for exactly that reason. It is a split-screen game, written in pure Java 17 with Java2D, in which every keypress is broadcast simultaneously to two students who share the same world, the same classes, and the same rules. Marcus, on the left, is neurotypical; Rayan, on the right, has diagnosed ADHD. Identical inputs produce divergent outcomes because each character is driven by its own cognitive execution engine — a small dynamical model of attention, reward, inhibition, working memory, and timing that the game updates every tick. As one example of what that means: Rayan's attention decays a little every frame, and his input lag is computed from it, so the lower his attention falls, the later his commands arrive, while a low inhibition value turns roughly one in five correct inputs into the wrong output. Above the play sits a permanently visible Neural Monitor, an fMRI-styled dashboard I hand-rendered from scratch in Graphics2D, with two live coronal brain scans, hot-colormap activation across six regions, scrolling BOLD-signal graphs, and a divergence meter. As a ten-week semester accumulates cognitive debt, you watch Rayan's regions dim and feel his inputs lag, misfire, and freeze. The game never states its thesis in words during play; it stages it. When Rayan is dismissed, it hands you the role of institutional architect, and the parameters you change there — exam timing, feedback cadence, course load, deadline policy — actually re-parameterize his brain on replay. It withholds its conclusion until the player has earned it, ending on a single line and, for the only time in the whole experience, one word.",
    highlights: [
      "Two parallel cognitive engines (NeurotypicalEngine and ADHDBrain) driven by one shared input stream — the ADHD engine is a real dynamical model, not a difficulty slider.",
      "Five modeled cognitive variables — attention, reward, inhibition, working memory, timing — rendered across six brain regions (`dlPFC`, `ACC`, `Caudate`, `N.Acc`, `VTA`, `Cerebellum`).",
      "A concrete mechanism: attention decays ~`0.008`/tick and sets input lag of up to `19` ticks; inhibition below `0.60` produces a ~`20%` misfire rate; working memory holds ~`2` effective items against the neurotypical `4`.",
      "Cross-room carryover models cumulative cognitive debt — each room sets the next room's attention floor — so the ADHD student enters finals measurably worse than week one. The widening gap is mechanical, not scripted.",
      "Hyperfocus is an emergent reward state (×`1.4` to every value) that inevitably collapses into burnout — modeling ADHD as a different cost structure, neither deficit nor superpower.",
      "A hand-rendered live fMRI dashboard: two coronal scans, scrolling BOLD-signal graphs, a divergence meter, and a `VTA→N.Acc` dopamine pathway that lights during hyperfocus — redrawn at the game's 62 fps tick.",
      "Six research-cited scaffolds and six institutional-redesign parameters that demonstrably re-parameterize the engine on replay.",
      "50 source files across 8 packages, pure Java 17 with procedurally synthesized audio — no external libraries, no asset files.",
      "Grounded in OpenNeuro dataset ds002424 (Lytle, Hammer & Booth 2020), Barkley 1997, Volkow et al. 2009, and Hammer et al. 2015.",
    ],
    stack: ["Java 17", "Java2D / Graphics2D", "Swing", "Procedural audio", "MVC", "No external libraries"],
    tags: ["Computational Neuroscience", "Cognitive Modeling", "ADHD", "fMRI Visualization", "Serious Games", "Procedural Rhetoric"],
    links: { github: "https://github.com/rhit-utshoh" },
    featured: true,
  },
  {
    title: "Newton's Apple Crisis",
    kind: "Educational arcade game · full-stack",
    year: "2025",
    oneLiner:
      "A browser-playable arcade game where you keep Isaac Newton from inventing calculus — and getting hit forces you to answer a math question pitched to your own grade level.",
    readouts: [
      { v: "360", l: "adaptive questions" },
      { v: "8", l: "difficulty levels" },
      { v: "3", l: "narrative acts" },
      { v: "WASM", l: "runs in-browser" },
    ],
    body:
      "Newton's Apple Crisis began as a course assignment about dodging falling fruit and quietly became a question I could not put down: what does it actually take to teach a mind something it is resisting? You play as Newton dodging apples, and whenever one lands the action freezes and a math question slides onto the screen. The conceit is historically pointed — getting hit is the instant the apple would have inspired calculus, so every correct answer is you helping Newton dodge the discovery rather than make it; preventing the invention of calculus and learning calculus become the same act. Beneath the arcade surface, the design insists on two things I believe: that knowledge is human and contestable — staged here as the Newton–Leibniz rivalry, with Leibniz as a live opponent hurling taunts and dropping power-ups — and that education should meet each learner exactly where they stand. So before you play, a profiling step reads your age, coursework, and self-rated confidence, and the game draws from a bank of 360 hand-authored questions calibrated to you: a twelve-year-old gets pre-algebra they can actually do while a college student gets the harder material. I rebuilt it into a full-stack, browser-deployable piece with a live global leaderboard, because a learning tool deserves the same care as any work I would defend.",
    highlights: [
      "`360` hand-authored questions, verified programmatically as `8` topics × `3` difficulty tiers × `15` each, spanning arithmetic through calculus and an advanced tier of upper-division content.",
      "An adaptive difficulty engine resolves a player profile to a topic and tier, then applies an age-based floor — so a 12-year-old claiming “Calculus” is still capped at pre-algebra.",
      "Success is designed as a penalty: every correct answer makes Newton physically larger and harder to control, so competence raises the stakes instead of removing them.",
      "Failure is repurposed as the teaching moment — getting hit triggers the question and a worked explanation, rewarding engagement after a mistake rather than only punishing it.",
      "Clean MVC: `Game.py` is a pure state model that never touches the screen, while view, controller, and injected systems (particles, combo, acts, quiz, leaderboard) wire together in an async loop.",
      "A FastAPI + PostgreSQL global leaderboard on Railway, with a hard `3`-second network timeout on a daemon thread and a silent offline fallback so the game loop can never freeze.",
      "Compiles to WebAssembly via Pygbag to run in-browser with zero install — designed async-first with delta-time motion and eased interpolation throughout.",
      "A genuine game-juice layer: particle systems, decaying screen shake, a combo multiplier, and a 200-plus-line procedurally drawn game-over screen.",
    ],
    stack: ["Python", "Pygame", "Pygbag (WebAssembly)", "FastAPI", "PostgreSQL", "Railway"],
    tags: ["Educational Technology", "Adaptive Learning", "Full-Stack", "Game Development", "MVC"],
    links: { github: "https://github.com/rhit-utshoh/Newton-s-Apple-Crisis" },
    featured: true,
  },
  {
    title: "Sign Language-to-Speech Wearable",
    kind: "Assistive hardware · sensor fusion",
    year: "2021–2024",
    oneLiner:
      "A wearable that translates sign-language gestures into real-time speech and text, built so that people who sign can be understood by people who don't.",
    body:
      "This one began with a frustration I kept noticing: a person who signs fluently can still go unheard in a room where no one else does. The wearable fuses flex sensors with an MPU-6050 inertial measurement unit and a signal-processing pipeline that turns the shape and motion of a hand into recognizable gestures, then into spoken and written words in near real time. It was the project that taught me sensor fusion is less about any single sensor than about reconciling several imperfect ones into a claim you can trust. I built it to be small and fast, and then — the part that mattered most — I put it in front of real people to find out whether it actually helped.",
    highlights: [
      "Recognizes `20+` ASL signs at roughly `80%` accuracy.",
      "End-to-end pipeline under `250 ms` — fast enough to feel like speech rather than translation.",
      "Flex sensors fused with an MPU-6050 IMU through signal-processing algorithms for robust gesture recognition.",
      "Validated with `10+` Deaf and hard-of-hearing users; an early prototype that 65% rated usable — enough to confirm the direction and show where it still fell short.",
    ],
    stack: ["Flex sensors", "MPU-6050 IMU", "Arduino (C/C++)", "Signal processing"],
    tags: ["Assistive Technology", "Embedded Systems", "Sensor Fusion", "Signal Processing"],
    links: {},
    featured: false,
  },
  {
    title: "Autonomous Elder Care Assistant Robot",
    kind: "Robotics · embedded control",
    year: "2022–2024",
    oneLiner:
      "A voice-interactive robot built to address two quiet problems at once: missed medication and the isolation of growing old alone.",
    body:
      "I am drawn, almost by reflex, to build for people the rest of technology tends to overlook, and few are overlooked as routinely as the isolated elderly. This robot pairs a Raspberry Pi and an Arduino for control, sensing, localization, and navigation with a servo-actuated rotary dispenser that releases pills on a prescription schedule. It will follow a person, retrieve and pass objects, and answer questions by voice — less a gadget than a small, patient presence. The engineering lesson that stayed with me was unglamorous and exact: tuning a PID controller until a mechanism stops fighting itself is what turns a clever idea into something a person can actually rely on.",
    highlights: [
      "Integrated Raspberry Pi and Arduino for control, sensing, localization, and navigation.",
      "Servo-actuated rotary pill dispenser that releases medication on a prescription schedule.",
      "PID-controlled servo optimization cut pill-retrieval time from `20 s` to `7 s`.",
      "Doubles as a study-assistant module that follows users, retrieves objects, and answers questions by voice.",
    ],
    stack: ["Raspberry Pi", "Arduino", "Servo actuation", "PID control", "Voice interaction"],
    tags: ["Robotics", "Embedded Systems", "PID Control", "Healthcare"],
    links: {},
    featured: false,
  },
  {
    title: "RoboSics — Robotics From Repurposed Materials",
    kind: "Self-taught robotics team · real-world impact",
    year: "2018–present",
    oneLiner:
      "Six years and ten-plus robots built from repurposed everyday materials, in a community that had never been introduced to robotics.",
    body:
      "RoboSics is where I learned that constraint and ambition are not opposites. We started in Thakurgaon with shaky hands — mine literally made soldering hard — so I teamed up with two school seniors who could solder but knew nothing about robotics, and we taught each other from the ground up. With unreliable internet and almost no access to parts, we built our machines out of whatever the household could spare and traveled nearly 260 miles just to reach the events where we could show them. The projects were never abstract: an affordable COVID-19 ventilator we built rather than succumb to helplessness when the pandemic cancelled our NASA flight; a BeachBot that collects shoreline waste and rewards proper disposal; a road-safety system for the dangerous U-turns of Bandarban; a telepresence robot; an assistant for people who are nonverbal or hard of hearing.",
    highlights: [
      "`6+` years and `10+` real-world robotics projects in a community with no prior robotics exposure.",
      "Built from repurposed everyday materials under unreliable internet and severe parts scarcity.",
      "An affordable COVID-19 ventilator that earned selection for the Bangladesh government's “Act Covid-19” national call.",
      "Projects spanning shoreline cleanup, road safety, telepresence, and assistive robots; the team traveled nearly `260` miles to reach showcase events.",
    ],
    stack: ["Arduino", "Raspberry Pi", "C / Python", "Circuit design", "3D printing"],
    tags: ["Robotics", "Hardware", "Social Impact", "Team Leadership"],
    links: {},
    featured: false,
  },
  {
    title: "Public-Library Coding Club",
    kind: "Education access · teaching",
    year: "2018–2020",
    oneLiner:
      "One of the first public-library coding clubs in Bangladesh, where a team of ten built computers so that 200+ students who had none could learn to code.",
    body:
      "After a national programming contest, I persuaded the educators I met there to bring resources back to my hometown, and the result was a coding club run out of a public library. The hard constraint was simple and brutal: my mentees had no computers. So rather than wait for hardware that was never coming, I led a team of ten to build Kano computers on Raspberry Pi 3, and we taught from there. I ran two classes a week — block-based workshops for the youngest learners and text-based Python and C for the older ones — and guided more than two hundred students to build real micro:bit projects: step counters, compasses, thermometers, data-collection tools. It was, in the most literal sense, an attempt to give others the access I had lacked.",
    highlights: [
      "Founded one of the first public-library coding clubs in Bangladesh.",
      "Mentored `200+` underprivileged students with no prior access to computers.",
      "Led a team of `10` to physically build Kano computers on Raspberry Pi 3 to overcome the absence of hardware.",
      "Ran weekly block-based and text-based (Python / C) workshops, guiding mentees to build working micro:bit projects.",
    ],
    stack: ["Raspberry Pi 3", "Kano", "micro:bit", "Python", "C"],
    tags: ["Education", "Social Impact", "Teaching"],
    links: {},
    featured: false,
  },
];

export const journey = {
  title: "The long countdown",
  paragraphs: [
    "My ascent has been a series of countdowns, and most of them did not go to plan. In the eighth grade I finally got a laptop and the internet, but progress came piecemeal: I bought a monthly 25-gigabyte mobile package that cost 1,800 taka — about 17 dollars, and one-twelfth of my mother's salary — and I wrung dry every resource it bought me, learning robotics from Paul McWhorter's YouTube tutorials and teaching myself to read GitHub. Constraint was the curriculum. It taught me to want understanding more than I wanted convenience.",
    "Then 2020 arrived and, as it did for so many, took more than it gave. Two days before our NASA rover team was to fly to Alabama, the competition was cancelled; it was heartbreaking to watch our own dream disintegrate while the world's least fortunate endured the worst of the pandemic. So as not to succumb to helplessness, the team built an affordable ventilator for coronavirus patients instead. I later caught the virus myself and spent months bedridden as my family strained under the cost of a rented oxygen cylinder, and from that bed I sharpened, rather than abandoned, my ambition, and began caring for the street animals I could see suffering around me. When my parents separated and my ill mother needed me, I left a selective college in Dhaka and returned to Panchagarh to support her, and kept working anyway.",
    "I tell this part plainly because it is not a plea and it is not a defense of any number on a transcript; it is simply where the engineering came from. The instinct that runs through all of it is the same one that runs through the work on this page — to build for the people technology forgets, and to treat my own way of thinking not as something to apologize for but as something to study and put to use. That is still the work, and I plan to keep at it until the tools I leave behind meet people exactly where they stand.",
  ],
};

export const achievements = [
  { title: "Gold Honor — NASA Space Camp, Space Center University", org: "Space Center Houston, Texas", year: "2022", detail: "Gold Honor at this international STEM competition in robotics, rocketry, and space habitats; ranked top 3% for leadership, teamwork, and problem-solving across simulated missions, with championship titles in the VEX Robotics Competition, the Mars Habitat Challenge, and the Cryogenics Challenge." },
  { title: "Electrical Lead — NASA Human Exploration Rover Challenge", org: "Team Bangladesh · Huntsville, Alabama", year: "2019–2020", detail: "Led electrical R&D for a Bangladeshi high-school team selected to compete among university teams: telemetry, the electronic control panel and its interfaces, and failure-resistant wiring. The competition was cancelled two days before the flight, so the team pivoted and built a low-cost ventilator instead." },
  { title: "Silver Award — National Children's Award Competition", org: "Government of Bangladesh", year: "2019", detail: "Awarded the Silver by the President of Bangladesh for an assistive-technology project for individuals with speech impairments, as a Grade 10 student." },
  { title: "10th Globally — International Arduino Week Project Exhibition", org: "International", year: "2020", detail: "Placed tenth worldwide for a Home & Study Assistant humanoid robot programmed on Arduino and Raspberry Pi 3 in C and Python, featuring image processing and a voice assistant." },
  { title: "Champion — National Creative Talent Hunt (Talent of the Year in Science)", org: "Bangladesh", year: "2019", detail: "Recognized nationally as the Talent of the Year in Science as a Grade 10 student." },
  { title: "4× District Champion — National Science & Technology Project Display", org: "Bangladesh (NSTPD)", year: "2016–2020", detail: "Competed five consecutive years and won District Champion four times against 100+ teams, with multiple Regional Championships at the National Science & Technology Olympiad." },
  { title: "Bronze Award — National High School Programming Contest", org: "Bangladesh (NHSPC)", year: "2018", detail: "Earned Bronze at the national programming contest as a Grade 9 competitor." },
  { title: "Founder & President — School Science Club", org: "Thakurgaon Govt. Boys' High School", year: "", detail: "Founded the club and grew it to roughly 1,500 members, organized three science fests, and led 15 workshops on C programming, robotics, and technical problem-solving." },
  { title: "Music — busking in New York, lyrics published by G-Series", org: "New York City · G-Series", year: "2022–present", detail: "Stranded in New York after Space Camp with a lost wallet, I was lent a guitar by an elderly Times Square punk rocker named Devlin and sang a Bangladeshi metal song. That kindness became a friendship, a place to stay, roughly $250 earned busking, and a real music life — 15+ written lyrics, including songs co-written with my mother and published by G-Series, a leading Bangladeshi label. I keep it here because it is the same resourcefulness that runs through everything else I make." },
  { title: "Founder & Admin — Animal Care Society of Thakurgaon", org: "Thakurgaon, Bangladesh", year: "2020–present", detail: "Founded during the pandemic. Nourished 300+ stray animals, rescued 100+ cats and dogs, vaccinated most of the area's street animals, fitted reflective collars to reduce road accidents, and raised roughly $1,000 for veterinary support." },
  { title: "Founder — Soccer-Tech Platform Startup", org: "Incubated at Penta Global Limited, Dhaka", year: "2025", detail: "Founded a sports-tech platform tackling the shortage of accessible playing space in dense urban Dhaka. Conducted market research across 30+ turfs to validate demand and pricing, then designed UI flows, wireframes, and feature specs for player groups, scheduling, match discovery, booking, and transparent fee-splitting." },
];

export const skills = [
  { group: "Programming Languages", items: ["Python", "Java 17", "C", "Verilog", "MATLAB / Simulink", "Arduino (C/C++)"] },
  { group: "Cognitive & Computational Modeling", items: ["Dynamical models of behavior", "Neuro-inspired simulation", "fMRI data interpretation", "Procedural rhetoric", "Adaptive learning systems"] },
  { group: "Embedded Systems & Robotics", items: ["Raspberry Pi", "Arduino", "Jetson Nano", "Sensors & sensor fusion", "Autonomous systems", "3D printing"] },
  { group: "Electronics & Circuit Design", items: ["Circuit design", "Soldering", "Electronic control panels", "Telemetry & wiring", "PID control"] },
  { group: "Software & Tools", items: ["Git", "Java Swing / Java2D", "FastAPI", "PostgreSQL", "Pygame / Pygbag", "Quartus Prime", "ModelSim"] },
  { group: "AI & Machine Learning", items: ["AI API integration", "Image processing", "Applied machine learning", "Computer vision fundamentals"] },
];

export const contact = {
  heading: "Where to find me",
  blurb:
    "I'm most interested in work that lives where cognition, AI, and engineering meet, and in the kind of problems that overshoot their brief because there's a real question underneath. If that's the sort of thing you're building — research, a role, or a collaboration — write to me and tell me about the question; that's the part I'll want to talk about first.",
  email: "ibtihal.utsho.ai@gmail.com",
};
