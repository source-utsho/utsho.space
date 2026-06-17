// BENCH-028 — Ibtihal Utsho, reframed as a precision measuring instrument
// that reads its visitor. Eight channels (CH01..CH08), each backed by a
// typed export below. Voice: sharp, funny, self-aware engineer. Jokes
// point at the instrument or his own ADHD, never at the visitor.
//
// All numbers are real and load-bearing: 200+ mentees, 20s->7s pill
// retrieval, <250ms glove latency, 1000F heat shield, 65% glove
// satisfaction. DualMind citations are cross-checked against the game
// source (PORTFOLIO/DualMindGame/src). All but one are real, authored
// papers; the Frontiers 2022 line is marked [in-game cite] because the
// game names it with no author/DOI and it can't be externally verified.
// Nothing invented.
//
// Word discipline: certs <=12 words, hero lines tight, mono lines deadpan.
// criticVerdict is intentionally '' — the next stage fills it.

// ─────────────────────────────────────────────────────────────────────────
// META — stable identity, reused across channels
// ─────────────────────────────────────────────────────────────────────────
export const meta = {
  name: "Ibtihal Utsho",
  fullName: "H.M. Ibtihal Utsho",
  role: "Computer Engineering · Rose-Hulman ’28",
  serial: "BENCH-028",
  location: "Terre Haute, IN",
  email: "ibtihal.utsho.ai@gmail.com",
  github: "https://github.com/rhit-utshoh",
  linkedin: "https://www.linkedin.com/in/robosics",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH01 — SPECIMEN
// Headline + italic subline + the live attention-classification label set.
// Labels read off the visitor's pointer/scroll activity. Jokes aim at the
// instrument and his own ADHD, never the visitor.
// ─────────────────────────────────────────────────────────────────────────
export type AttentionState = "IDLE" | "AWAITING" | "SCANNING" | "READING" | "HYPERFOCUS";

export type AttentionLabel = {
  state: AttentionState;
  label: string;
};

export const hero = {
  channel: "CH01",
  channelName: "SPECIMEN",
  headline: "I build instruments that read people.",
  subline: "This one is reading you.",
  /** Live attention-classification readout. Drives the on-screen needle. */
  labels: [
    { state: "IDLE", label: "IDLE" },
    { state: "AWAITING", label: "AWAITING SUBJECT… move something." },
    { state: "SCANNING", label: "SCANNING" },
    { state: "READING", label: "READING" },
    { state: "HYPERFOCUS", label: "HYPERFOCUS?" },
  ] satisfies AttentionLabel[],
  /** Default label before any input is detected. */
  defaultState: "AWAITING" as AttentionState,
  /** Tiny calibration line under the needle. */
  footnote: "Instrument self-calibrates. The ADHD is mine, not yours.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH02 — READOUT
// The 30-second recruiter datasheet. Exactly four needle-gauge stats, two
// PLAY buttons, resume, email.
// ─────────────────────────────────────────────────────────────────────────
export type GaugeStat = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  /** Display string when the raw number needs framing (e.g. "20→7"). */
  display?: string;
  caption: string;
};

export type DatasheetButton = {
  label: string;
  href: string;
};

export const datasheet = {
  channel: "CH02",
  channelName: "READOUT",
  name: meta.fullName,
  program: "Computer Engineering · Rose-Hulman ’28",
  tagline: "Thirty seconds. Four needles. Read me before I read you.",
  gauges: [
    {
      label: "MENTEES TAUGHT",
      value: 200,
      min: 0,
      max: 200,
      unit: "+",
      display: "200+",
      caption: "On Raspberry Pis we assembled by hand. First library coding club in Bangladesh.",
    },
    {
      label: "PILL RETRIEVAL",
      value: 7,
      min: 0,
      max: 20,
      unit: "s",
      display: "20→7",
      caption: "Tuned one PID servo. Twenty seconds to seven. The person waiting is 80.",
    },
    {
      label: "GLOVE LATENCY",
      value: 250,
      min: 0,
      max: 250,
      unit: "ms",
      display: "<250",
      caption: "Gesture in, speech out. End to end, on an Arduino and a Pi.",
    },
    {
      label: "HEAT SHIELD HELD",
      value: 1000,
      min: 0,
      max: 1000,
      unit: "°F",
      display: "1000",
      caption: "First Bangladeshi to win NASA Gold. The shield did not flinch.",
    },
  ] satisfies GaugeStat[],
  playButtons: [
    { label: "PLAY — DUALMIND", href: "/play/dualmind/" },
    { label: "PLAY — NEWTON", href: "/play/newton/" },
  ] satisfies DatasheetButton[],
  resume: { label: "RESUME", href: "/Ibtihal-Utsho-Resume.pdf" },
  email: meta.email,
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH03 — EXPERIMENTS
// The two games as EXPERIMENT 01/02 with PROTOCOL cards, plus DualMind's
// REAL reference list (verified against the game source).
// ─────────────────────────────────────────────────────────────────────────
export type ExperimentProtocol = {
  id: string;
  index: string;
  title: string;
  kind: string;
  year: string;
  /** Deadpan Plex-Mono protocol lines. */
  protocol: string;
  hypothesis: string;
  apparatus: string;
  citations: string;
  controls: string;
  play: string;
  badges: string[];
};

export const experiments = {
  channel: "CH03",
  channelName: "EXPERIMENTS",
  intro: "Two builds, run as experiments. Press PLAY to reproduce my results.",
  entries: [
    {
      id: "dualmind",
      index: "EXPERIMENT 01",
      title: "DualMind",
      kind: "Cognitive sim · split-screen roguelite",
      year: "2026",
      protocol: "One keyboard drives two students. Identical inputs. One brain obeys, one doesn’t.",
      hypothesis: "The outcome gap isn’t effort. It’s the brain and the room it’s in.",
      apparatus: "Pure Java 17, Java2D, Swing. ~50 files, 0 libraries, 0 asset files. Live fMRI-style monitor, six brain regions, all synthesized audio.",
      citations: "Every mechanic cites a real paper. References listed right.",
      controls: "WASD drives both.",
      play: "/play/dualmind/",
      badges: ["pure Java, no engine", "0 libraries, 0 assets"],
    },
    {
      id: "newton",
      index: "EXPERIMENT 02",
      title: "Newton’s Apple Crisis",
      kind: "Educational arcade · adaptive quiz",
      year: "2025",
      protocol: "Dodge falling apples. Get hit, get quizzed. Answer wrong, the run ends.",
      hypothesis: "A 360-question bank that reads your age and confidence beats a static worksheet.",
      apparatus: "Python, Pygame, compiled to WebAssembly via Pygbag. Global FastAPI leaderboard on a daemon thread, PostgreSQL behind it.",
      citations: "Three acts escalate Newton vs. Leibniz into open calculus war.",
      controls: "Arrows. Dodge. Answer.",
      play: "/play/newton/",
      badges: ["pygame", "plays in browser"],
    },
  ] satisfies ExperimentProtocol[],
  /** DualMind's REAL citations — verified against the game source. Do not invent. */
  references: [
    "ds002424 — Lytle, Hammer & Booth (2020). OpenNeuro. CC-BY. — fMRI dataset behind the live brain monitor.",
    "Barkley (1997). — Working memory and inhibitory control model of ADHD.",
    "Volkow et al., JAMA (2009). — Dopamine transporter density and the reward pathway.",
    "Hammer et al., Developmental Cognitive Neuroscience (2015). — Feedback and reward normalize ADHD working memory.",
    "Sonuga-Barke, Developmental Review (2005). — Delayed rewards lose motivational value faster in ADHD.",
    "Huang-Pollock et al., Journal of Abnormal Child Psychology (2012). — Sustained attention declines within the first minutes of a task.",
    "Lijffijt et al., Psychological Bulletin (2005). — Inhibitory-control failures rise under time pressure.",
    "Frontiers in Neuroscience (2022) [in-game cite]. — External timing cues reduce cerebellar timing jitter. Listed as the game names it; no author on the source.",
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH04 — INSTRUMENTS
// Glove, elder-care robot, and the ventilator/rover pivot as bench-test
// panels. Each: headline metric, two mono lines, runnable-test data.
// The 65% glove satisfaction is foregrounded as its own honest line.
// ─────────────────────────────────────────────────────────────────────────
export type BenchTest = {
  param: string;
  value: string;
};

export type InstrumentPanel = {
  id: string;
  index: string;
  name: string;
  kind: string;
  year: string;
  /** Big headline metric. */
  headline: string;
  /** Two deadpan mono lines describing the build. */
  monoLines: [string, string];
  /** A single honest line foregrounded above the test table. */
  honestLine?: string;
  tests: BenchTest[];
};

export const instruments = {
  channel: "CH04",
  channelName: "INSTRUMENTS",
  intro: "Hardware I built and bench-tested. Numbers measured, not estimated.",
  panels: [
    {
      id: "glove",
      index: "PANEL A",
      name: "Sign-Language-to-Speech Glove",
      kind: "Assistive wearable · embedded",
      year: "2022–24",
      headline: "20+ ASL signs · 80% accuracy",
      monoLines: [
        "FLEX sensors + MPU-6050 IMU. Whole pipeline runs on Arduino and a Pi.",
        "Gesture in, speech and text out, under 250ms end to end.",
      ],
      honestLine: "65% usability satisfaction across 10+ deaf and nonspeaking testers. The honest number. It taught me more than the demo did.",
      tests: [
        { param: "vocabulary", value: "20+ ASL signs" },
        { param: "accuracy", value: "80%" },
        { param: "latency", value: "<250 ms" },
        { param: "testers", value: "10+ deaf / nonspeaking" },
        { param: "satisfaction", value: "65%" },
      ],
    },
    {
      id: "eldercare",
      index: "PANEL B",
      name: "Autonomous Elder-Care Robot",
      kind: "Assistive robotics · hardware",
      year: "2023–24",
      headline: "PB: 20.0s → 7.0s pill retrieval",
      monoLines: [
        "Raspberry Pi for thinking, Arduino for doing. Servo-actuated rotary dispenser.",
        "Tuned one PID-controlled servo until the right pill hit the right hand on time.",
      ],
      honestLine: "Thirteen seconds doesn’t sound like much until the person waiting is eighty.",
      tests: [
        { param: "retrieval (baseline)", value: "20.0 s" },
        { param: "retrieval (PB)", value: "7.0 s" },
        { param: "control loop", value: "PID, single servo" },
        { param: "navigation", value: "sensor-based, autonomous" },
        { param: "voice", value: "interactive scheduling" },
      ],
    },
    {
      id: "ventilator-rover",
      index: "PANEL C",
      name: "Pandemic Ventilator (ex-Rover)",
      kind: "Crisis hardware · the pivot",
      year: "2020",
      headline: "Flight cancelled T-2 days → ventilator deployed",
      monoLines: [
        "Electrical lead, only school team among universities. NASA Rover, ready to fly.",
        "March 2020 killed the flight. We turned the team into a ventilator team.",
      ],
      honestLine: "Selected for the Bangladesh government’s national ‘Act Covid-19’ call. The rover never flew. The ventilator shipped.",
      tests: [
        { param: "rover status", value: "built, never flown" },
        { param: "pivot window", value: "T-2 days" },
        { param: "output", value: "low-cost C-19 ventilator" },
        { param: "recognition", value: "national ‘Act Covid-19’ call" },
        { param: "team", value: "RoboSics + Team Bangladesh" },
      ],
    },
    {
      id: "robosics",
      index: "PANEL D",
      name: "RoboSics — Motor Cortex",
      kind: "Robotics team · founder",
      year: "2017–23",
      headline: "Co-founded because my hands shook too much to solder.",
      monoLines: [
        "So I stopped soldering and started organizing. Built the team I needed.",
        "Six years of robots from scavenged parts, 260-mile drives to win across Bangladesh.",
      ],
      honestLine: "The org chart was the workaround. The tremor became the team.",
      tests: [
        { param: "why I started", value: "couldn’t hold a soldering iron steady" },
        { param: "what I did instead", value: "organized the people who could" },
        { param: "lifespan", value: "2017–23 (6 years)" },
        { param: "output", value: "10+ projects, 1 ventilator" },
      ],
    },
  ] satisfies InstrumentPanel[],
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH05 — CALIBRATION LOG
// Origin story as an instrument cal-table. Terse rows, plus a tremor row
// that becomes the RoboSics org chart.
// ─────────────────────────────────────────────────────────────────────────
export type CalRow = {
  date: string;
  event: string;
  /** Optional instrument-style key/value readings. */
  readings?: string[];
  /** Status stamp. "OK" rows are marked, dignified. */
  status?: "OK" | "FAIL" | "PIVOT" | "PASS";
};

export const calibration = {
  channel: "CH05",
  channelName: "CALIBRATION LOG",
  intro: "Origin, logged like a calibration history. Every reading traceable.",
  rows: [
    {
      date: "2014",
      event: "FIRST CODE",
      readings: ["medium: ink", "compiler: none", "runtime: none", "source: one library book"],
      status: "PASS",
    },
    {
      date: "~2016",
      event: "FIRST RUNTIME",
      readings: ["device: family laptop", "internet: 1/12 of mom’s salary", "budget: counted by the gigabyte"],
      status: "PASS",
    },
    {
      date: "2017",
      event: "TREMOR — hands shook too much to solder",
      readings: ["fault: motor control", "workaround: organize a team", "result: RoboSics, the org chart"],
      status: "OK",
    },
    {
      date: "Mar 2020",
      event: "NASA ROVER FLIGHT CANCELLED",
      readings: ["lead time: T-2 days", "cause: pandemic", "team status: still assembled"],
      status: "FAIL",
    },
    {
      date: "2020",
      event: "VENTILATOR DEPLOYED",
      readings: ["pivot: rover → ventilator", "scope: low-cost, C-19", "recognition: national call"],
      status: "PIVOT",
    },
    {
      date: "2022",
      event: "1000°F HELD",
      readings: ["test: rocket heat shield", "result: survived", "award: NASA Gold, first Bangladeshi"],
      status: "PASS",
    },
    {
      date: "2024",
      event: "DX: ADHD",
      readings: ["site: Rose-Hulman", "effect: curiosity turned inward", "outcome: games about my own brain"],
      status: "OK",
    },
    {
      date: "pending",
      event: "TARGET: walk the dog on Mars",
      readings: ["trace to be continued"],
      status: undefined,
    },
  ] satisfies CalRow[],
  /** The tremor row, expanded into the org chart it became. */
  tremorChart: {
    fault: "Hands shook too much to solder.",
    response: "So I organized.",
    root: "Ibtihal — coordination",
    branches: ["Electronics", "Firmware", "Mechanical", "Comp / strategy"],
    label: "RoboSics org chart, drawn from a tremor.",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH06 — CERTIFICATIONS
// Recognition as stamped cal-certs. <=12 words each. NASA Gold gets the
// single gold accent.
// ─────────────────────────────────────────────────────────────────────────
export type Cert = {
  title: string;
  org: string;
  year: string;
  /** Stamp the cert: gold accent reserved for NASA Gold only. */
  gold?: boolean;
};

export const certifications = {
  channel: "CH06",
  channelName: "CERTIFICATIONS",
  intro: "Stamped. Dated. Each one a passed test.",
  certs: [
    { title: "NASA Gold Honor — first Bangladeshi to win.", org: "Space Center University, Houston", year: "2022", gold: true },
    { title: "President’s Silver Award, National Children’s Award.", org: "President of Bangladesh", year: "2019" },
    { title: "Selected for national ‘Act Covid-19’ call.", org: "Government of Bangladesh", year: "2020" },
    { title: "Electrical Lead, NASA Rover Challenge.", org: "Team Bangladesh · Huntsville", year: "2020" },
    { title: "10th globally, Arduino Week Exhibition.", org: "International Arduino Week", year: "2020" },
    { title: "Talent of the Year in Science.", org: "National Creative Talent Hunt", year: "2019" },
    { title: "Bronze, National High School Programming Contest.", org: "NHSPC · grade 9", year: "2017" },
  ] satisfies Cert[],
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH07 — BENCH NOTES
// The beyond-the-resume asides. Handwritten-margin register — warm, first
// person, breaks protocol. Instrument Serif.
// ─────────────────────────────────────────────────────────────────────────
export type BenchNote = {
  margin: string;
  note: string;
};

export const benchNotes = {
  channel: "CH07",
  channelName: "BENCH NOTES",
  intro: "Margins. Off-protocol. The part the datasheet leaves out.",
  notes: [
    {
      margin: "Times Square",
      note: "Lost my wallet in New York. Busked $250 back with a punk rocker named Devlin. Best lab I never booked.",
    },
    {
      margin: "300+ strays",
      note: "Founded an animal-care society mid-pandemic. Fed 300+ street dogs, vaccinated most of Thakurgaon’s. They don’t read résumés. They read whether you show up.",
    },
    {
      margin: "G-Series",
      note: "Wrote 15+ lyrics. The ones I helped my mom write got published by G-Series, a top Bangladeshi label. Her name on a record is the proudest line I have.",
    },
    {
      margin: "200+ kids",
      note: "Started Bangladesh’s first library coding club on Raspberry Pis we built ourselves. 200+ mentees, age eleven and up. I keep going back.",
    },
  ] satisfies BenchNote[],
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CH08 — SIGNAL OUT
// Contact. TRANSMIT button, no-telemetry colophon, live-bandwidth-ledger
// caption, and the Mars closer.
// ─────────────────────────────────────────────────────────────────────────
export const contact = {
  channel: "CH08",
  channelName: "SIGNAL OUT",
  blurb: "Looking for a CS or engineering internship. I build hardware that has to work for a real person on the other end — gloves, robots, the occasional ventilator. If your problem has a human waiting on it, email me.",
  email: meta.email,
  transmitLabel: "TRANSMIT",
  links: [
    { label: "GitHub", href: meta.github },
    { label: "LinkedIn", href: meta.linkedin },
  ],
  /** No-telemetry colophon — the instrument doesn't phone home. */
  colophon: "No analytics. No trackers. The needle runs in your browser and tells no one.",
  /** Live-bandwidth-ledger caption. */
  bandwidthCaption: "Internet once cost 1/12 of my mom’s salary. I count bytes.",
  /** The Mars closer. */
  marsCloser: "FUTURE ACQUISITION — one (1) dog, walked, Mars. Date pending.",
} as const;

// ─────────────────────────────────────────────────────────────────────────
// Critic verdict — filled by the next stage. Leave as ''.
// ─────────────────────────────────────────────────────────────────────────
export const criticVerdict = "";
