// The DualMind hot-colormap (exact stops from DualMindGame/CLAUDE.md).
const STOPS: [number, [number, number, number]][] = [
  [0.0, [20, 20, 35]],
  [0.15, [80, 0, 80]],
  [0.35, [200, 10, 100]],
  [0.55, [255, 50, 0]],
  [0.75, [255, 210, 0]],
  [1.0, [255, 255, 210]],
];

export function hot(t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i];
    const [b, cb] = STOPS[i + 1];
    if (t >= a && t <= b) {
      const f = (t - a) / (b - a);
      return [
        ca[0] + (cb[0] - ca[0]) * f,
        ca[1] + (cb[1] - ca[1]) * f,
        ca[2] + (cb[2] - ca[2]) * f,
      ];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export function hotCss(t: number, a = 1): string {
  const [r, g, b] = hot(t);
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
}

// A refined warm "ember" ramp for the scroll-cognition cloud:
// dark amber (calm) → ember → amber → gold → cream (peak). No purple.
export const EMBER_GLSL = /* glsl */ `
vec3 ember(float t){
  t = clamp(t,0.0,1.0);
  vec3 c0=vec3(58.,34.,23.)/255.;
  vec3 c1=vec3(120.,52.,28.)/255.;
  vec3 c2=vec3(188.,84.,34.)/255.;
  vec3 c3=vec3(228.,134.,46.)/255.;
  vec3 c4=vec3(246.,194.,92.)/255.;
  vec3 c5=vec3(255.,246.,220.)/255.;
  if(t<0.20) return mix(c0,c1,t/0.20);
  if(t<0.45) return mix(c1,c2,(t-0.20)/0.25);
  if(t<0.65) return mix(c2,c3,(t-0.45)/0.20);
  if(t<0.82) return mix(c3,c4,(t-0.65)/0.17);
  return mix(c4,c5,(t-0.82)/0.18);
}
`;

// GLSL version of the same colormap, for the BOLD-field shader.
export const HOT_GLSL = /* glsl */ `
vec3 hot(float t){
  t = clamp(t,0.0,1.0);
  vec3 c0=vec3(20.,20.,35.)/255.;
  vec3 c1=vec3(80.,0.,80.)/255.;
  vec3 c2=vec3(200.,10.,100.)/255.;
  vec3 c3=vec3(255.,50.,0.)/255.;
  vec3 c4=vec3(255.,210.,0.)/255.;
  vec3 c5=vec3(255.,255.,210.)/255.;
  if(t<0.15) return mix(c0,c1,t/0.15);
  if(t<0.35) return mix(c1,c2,(t-0.15)/0.20);
  if(t<0.55) return mix(c2,c3,(t-0.35)/0.20);
  if(t<0.75) return mix(c3,c4,(t-0.55)/0.20);
  return mix(c4,c5,(t-0.75)/0.25);
}
`;
