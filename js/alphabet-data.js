/**
 * alphabet-data.js
 * Rich vector stroke definitions, phonics, and metadata for all 26 uppercase alphabet letters (A-Z).
 * Each stroke provides start/end vectors and sampled checkpoints for real-time MediaPipe tracking.
 */

// Helper to interpolate between two points
function lerpPoint(p1, p2, t) {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

// Helper to sample quadratic bezier curve
function quadraticBezier(p0, p1, p2, t) {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
}

// Helper to sample cubic bezier curve
function cubicBezier(p0, p1, p2, p3, t) {
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;
  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: ax * t3 + bx * t2 + cx * t + p0.x,
    y: ay * t3 + by * t2 + cy * t + p0.y
  };
}

// Convert stroke definitions into discrete ordered checkpoints
function generateCheckpoints(stroke, count = 16) {
  const checkpoints = [];
  if (stroke.type === 'line') {
    for (let i = 0; i <= count; i++) {
      checkpoints.push(lerpPoint(stroke.from, stroke.to, i / count));
    }
  } else if (stroke.type === 'curve') {
    if (stroke.control2) {
      for (let i = 0; i <= count; i++) {
        checkpoints.push(cubicBezier(stroke.from, stroke.control1, stroke.control2, stroke.to, i / count));
      }
    } else {
      for (let i = 0; i <= count; i++) {
        checkpoints.push(quadraticBezier(stroke.from, stroke.control, stroke.to, i / count));
      }
    }
  } else if (stroke.type === 'polyline' && Array.isArray(stroke.points)) {
    const pts = stroke.points;
    const segments = pts.length - 1;
    const perSeg = Math.max(3, Math.floor(count / segments));
    for (let s = 0; s < segments; s++) {
      for (let i = 0; i < perSeg; i++) {
        checkpoints.push(lerpPoint(pts[s], pts[s + 1], i / perSeg));
      }
    }
    checkpoints.push(pts[pts.length - 1]);
  }
  return checkpoints;
}

export const ALPHABET_DATA = [
  {
    letter: 'A',
    word: 'Apple',
    phonics: 'A says /æ/ as in Apple!',
    emoji: '🍎',
    color: '#FF477E',
    glowColor: 'rgba(255, 71, 126, 0.8)',
    guide: 'Start at the bottom left, go up to the top, slide down to the right, then draw the belt across!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.82 }, to: { x: 0.50, y: 0.18 }, instruction: 'Up to the top!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.78, y: 0.82 }, instruction: 'Slide down right!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.33, y: 0.54 }, to: { x: 0.67, y: 0.54 }, instruction: 'Cross the bridge!' }
    ]
  },
  {
    letter: 'B',
    word: 'Butterfly',
    phonics: 'B says /b/ as in Butterfly!',
    emoji: '🦋',
    color: '#00B4D8',
    glowColor: 'rgba(0, 180, 216, 0.8)',
    guide: 'Draw a straight line down, then loop around the top, and loop around the bottom!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight line down!' },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.72, y: 0.18 }, control2: { x: 0.72, y: 0.50 }, to: { x: 0.30, y: 0.50 }, instruction: 'Top bubble!' },
      { id: 3, label: '3', type: 'curve', from: { x: 0.30, y: 0.50 }, control1: { x: 0.75, y: 0.50 }, control2: { x: 0.75, y: 0.82 }, to: { x: 0.30, y: 0.82 }, instruction: 'Bottom bubble!' }
    ]
  },
  {
    letter: 'C',
    word: 'Cat',
    phonics: 'C says /k/ as in Cat!',
    emoji: '🐱',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Start at the top right, curve all the way around like a crescent moon!',
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.75, y: 0.28 }, control1: { x: 0.20, y: 0.12 }, control2: { x: 0.20, y: 0.88 }, to: { x: 0.75, y: 0.72 }, instruction: 'Round and round!' }
    ]
  },
  {
    letter: 'D',
    word: 'Dog',
    phonics: 'D says /d/ as in Dog!',
    emoji: '🐶',
    color: '#FB8500',
    glowColor: 'rgba(251, 133, 0, 0.8)',
    guide: 'Draw a straight line down, then a giant tummy from top to bottom!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight line down!' },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.85, y: 0.18 }, control2: { x: 0.85, y: 0.82 }, to: { x: 0.30, y: 0.82 }, instruction: 'Big round tummy!' }
    ]
  },
  {
    letter: 'E',
    word: 'Elephant',
    phonics: 'E says /e/ as in Elephant!',
    emoji: '🐘',
    color: '#7209B7',
    glowColor: 'rgba(114, 9, 183, 0.8)',
    guide: 'Draw down, then top shelf, middle shelf, and bottom shelf!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight line down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.72, y: 0.18 }, instruction: 'Top line!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.64, y: 0.50 }, instruction: 'Middle line!' },
      { id: 4, label: '4', type: 'line', from: { x: 0.30, y: 0.82 }, to: { x: 0.72, y: 0.82 }, instruction: 'Bottom line!' }
    ]
  },
  {
    letter: 'F',
    word: 'Frog',
    phonics: 'F says /f/ as in Frog!',
    emoji: '🐸',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Draw down, then top flag, and middle flag!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.72, y: 0.18 }, instruction: 'Top branch!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.64, y: 0.50 }, instruction: 'Middle branch!' }
    ]
  },
  {
    letter: 'G',
    word: 'Giraffe',
    phonics: 'G says /g/ as in Giraffe!',
    emoji: '🦒',
    color: '#E09F3E',
    glowColor: 'rgba(224, 159, 62, 0.8)',
    guide: 'Curve around like a C, come up, and step inside!',
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.75, y: 0.28 }, control1: { x: 0.20, y: 0.12 }, control2: { x: 0.20, y: 0.88 }, to: { x: 0.74, y: 0.55 }, instruction: 'Round and up!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.55 }, to: { x: 0.52, y: 0.55 }, instruction: 'Step inside!' }
    ]
  },
  {
    letter: 'H',
    word: 'Helicopter',
    phonics: 'H says /h/ as in Helicopter!',
    emoji: '🚁',
    color: '#118AB2',
    glowColor: 'rgba(17, 138, 178, 0.8)',
    guide: 'Two tall poles, then a bridge to connect them!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.28, y: 0.82 }, instruction: 'Left pole down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.18 }, to: { x: 0.72, y: 0.82 }, instruction: 'Right pole down!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.28, y: 0.50 }, to: { x: 0.72, y: 0.50 }, instruction: 'Connect across!' }
    ]
  },
  {
    letter: 'I',
    word: 'Ice Cream',
    phonics: 'I says /aɪ/ as in Ice Cream!',
    emoji: '🍦',
    color: '#F72585',
    glowColor: 'rgba(247, 37, 133, 0.8)',
    guide: 'A straight standing stick, with a hat on top and shoes below!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.35, y: 0.18 }, to: { x: 0.65, y: 0.18 }, instruction: 'Top hat!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.35, y: 0.82 }, to: { x: 0.65, y: 0.82 }, instruction: 'Bottom shoes!' }
    ]
  },
  {
    letter: 'J',
    word: 'Juggler',
    phonics: 'J says /dʒ/ as in Juggler!',
    emoji: '🤹',
    color: '#4361EE',
    glowColor: 'rgba(67, 97, 238, 0.8)',
    guide: 'Draw down and scoop up like a candy cane, with a roof on top!',
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.62, y: 0.18 }, control1: { x: 0.62, y: 0.78 }, control2: { x: 0.25, y: 0.86 }, to: { x: 0.25, y: 0.62 }, instruction: 'Candy cane scoop!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.40, y: 0.18 }, to: { x: 0.80, y: 0.18 }, instruction: 'Roof line!' }
    ]
  },
  {
    letter: 'K',
    word: 'Kangaroo',
    phonics: 'K says /k/ as in Kangaroo!',
    emoji: '🦘',
    color: '#9B5DE5',
    glowColor: 'rgba(155, 93, 229, 0.8)',
    guide: 'Straight line down, kick in to the middle, then kick out to the floor!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.20 }, to: { x: 0.30, y: 0.50 }, instruction: 'Kick in!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.74, y: 0.82 }, instruction: 'Kick out!' }
    ]
  },
  {
    letter: 'L',
    word: 'Lion',
    phonics: 'L says /l/ as in Lion!',
    emoji: '🦁',
    color: '#FF9F1C',
    glowColor: 'rgba(255, 159, 28, 0.8)',
    guide: 'Slide straight down, then slide to the right!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.18 }, to: { x: 0.32, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.32, y: 0.82 }, to: { x: 0.74, y: 0.82 }, instruction: 'Turn right!' }
    ]
  },
  {
    letter: 'M',
    word: 'Monkey',
    phonics: 'M says /m/ as in Monkey!',
    emoji: '🐒',
    color: '#2EC4B6',
    glowColor: 'rgba(46, 196, 182, 0.8)',
    guide: 'Climb up, slide to the valley, climb the mountain, slide to the floor!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.82 }, to: { x: 0.22, y: 0.18 }, instruction: 'Up to the sky!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.22, y: 0.18 }, to: { x: 0.50, y: 0.58 }, instruction: 'Down to the valley!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.58 }, to: { x: 0.78, y: 0.18 }, instruction: 'Up to the peak!' },
      { id: 4, label: '4', type: 'line', from: { x: 0.78, y: 0.18 }, to: { x: 0.78, y: 0.82 }, instruction: 'Down to the floor!' }
    ]
  },
  {
    letter: 'N',
    word: 'Nest',
    phonics: 'N says /n/ as in Nest!',
    emoji: '🪺',
    color: '#3A86FF',
    glowColor: 'rgba(58, 134, 255, 0.8)',
    guide: 'Climb up, slide all the way across, then fly straight up!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.82 }, to: { x: 0.28, y: 0.18 }, instruction: 'Climb straight up!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.72, y: 0.82 }, instruction: 'Slide across!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.72, y: 0.82 }, to: { x: 0.72, y: 0.18 }, instruction: 'Straight up!' }
    ]
  },
  {
    letter: 'O',
    word: 'Octopus',
    phonics: 'O says /ɒ/ as in Octopus!',
    emoji: '🐙',
    color: '#8338EC',
    glowColor: 'rgba(131, 56, 236, 0.8)',
    guide: 'Start at the top, curve all the way around like a big ball until it closes!',
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 },
          { x: 0.28, y: 0.28 },
          { x: 0.22, y: 0.50 },
          { x: 0.28, y: 0.72 },
          { x: 0.50, y: 0.82 },
          { x: 0.72, y: 0.72 },
          { x: 0.78, y: 0.50 },
          { x: 0.72, y: 0.28 },
          { x: 0.50, y: 0.18 }
        ],
        instruction: 'Roll the big ball!'
      }
    ]
  },
  {
    letter: 'P',
    word: 'Panda',
    phonics: 'P says /p/ as in Panda!',
    emoji: '🐼',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Draw down, then add a round balloon at the top!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.78, y: 0.18 }, control2: { x: 0.78, y: 0.52 }, to: { x: 0.30, y: 0.52 }, instruction: 'Round balloon!' }
    ]
  },
  {
    letter: 'Q',
    word: 'Queen',
    phonics: 'Q says /kw/ as in Queen!',
    emoji: '👑',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Draw a big circle, then give it a little kicking tail!',
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 },
          { x: 0.28, y: 0.28 },
          { x: 0.22, y: 0.50 },
          { x: 0.28, y: 0.72 },
          { x: 0.50, y: 0.82 },
          { x: 0.72, y: 0.72 },
          { x: 0.78, y: 0.50 },
          { x: 0.72, y: 0.28 },
          { x: 0.50, y: 0.18 }
        ],
        instruction: 'Big circle!'
      },
      { id: 2, label: '2', type: 'line', from: { x: 0.52, y: 0.62 }, to: { x: 0.76, y: 0.85 }, instruction: 'Little kicking tail!' }
    ]
  },
  {
    letter: 'R',
    word: 'Rocket',
    phonics: 'R says /r/ as in Rocket!',
    emoji: '🚀',
    color: '#EF476F',
    glowColor: 'rgba(239, 71, 111, 0.8)',
    guide: 'Straight line down, make a balloon head, then slide out a kickstand!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 }, instruction: 'Straight down!' },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.78, y: 0.18 }, control2: { x: 0.78, y: 0.50 }, to: { x: 0.30, y: 0.50 }, instruction: 'Round head!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.45, y: 0.50 }, to: { x: 0.74, y: 0.82 }, instruction: 'Slide out kickstand!' }
    ]
  },
  {
    letter: 'S',
    word: 'Star',
    phonics: 'S says /s/ as in Star!',
    emoji: '⭐',
    color: '#FFD166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    guide: 'Wiggle like a snake from top to bottom!',
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.70, y: 0.28 },
          { x: 0.50, y: 0.18 },
          { x: 0.30, y: 0.30 },
          { x: 0.38, y: 0.44 },
          { x: 0.58, y: 0.54 },
          { x: 0.70, y: 0.68 },
          { x: 0.50, y: 0.82 },
          { x: 0.28, y: 0.74 }
        ],
        instruction: 'Slither like a snake!'
      }
    ]
  },
  {
    letter: 'T',
    word: 'Tiger',
    phonics: 'T says /t/ as in Tiger!',
    emoji: '🐯',
    color: '#F3722C',
    glowColor: 'rgba(243, 114, 44, 0.8)',
    guide: 'Draw a wide roof on top, then a tall tree trunk right down the middle!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.24, y: 0.18 }, to: { x: 0.76, y: 0.18 }, instruction: 'Wide roof!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 }, instruction: 'Straight down the middle!' }
    ]
  },
  {
    letter: 'U',
    word: 'Unicorn',
    phonics: 'U says /juː/ as in Unicorn!',
    emoji: '🦄',
    color: '#B5179E',
    glowColor: 'rgba(181, 23, 158, 0.8)',
    guide: 'Dive down, scoop along the bottom, and climb back up!',
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'curve',
        from: { x: 0.28, y: 0.18 },
        control1: { x: 0.28, y: 0.90 },
        control2: { x: 0.72, y: 0.90 },
        to: { x: 0.72, y: 0.18 },
        instruction: 'Underground tunnel!'
      }
    ]
  },
  {
    letter: 'V',
    word: 'Volcano',
    phonics: 'V says /v/ as in Volcano!',
    emoji: '🌋',
    color: '#D90429',
    glowColor: 'rgba(217, 4, 41, 0.8)',
    guide: 'Slide down diagonally to the point, then climb up to the right!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.24, y: 0.18 }, to: { x: 0.50, y: 0.82 }, instruction: 'Slide down left!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.82 }, to: { x: 0.76, y: 0.18 }, instruction: 'Climb up right!' }
    ]
  },
  {
    letter: 'W',
    word: 'Whale',
    phonics: 'W says /w/ as in Whale!',
    emoji: '🐋',
    color: '#0077B6',
    glowColor: 'rgba(0, 119, 182, 0.8)',
    guide: 'Down, up, down, up like ocean waves!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.18, y: 0.18 }, to: { x: 0.32, y: 0.82 }, instruction: 'Down wave!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.32, y: 0.82 }, to: { x: 0.50, y: 0.38 }, instruction: 'Up wave!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.38 }, to: { x: 0.68, y: 0.82 }, instruction: 'Down wave!' },
      { id: 4, label: '4', type: 'line', from: { x: 0.68, y: 0.82 }, to: { x: 0.82, y: 0.18 }, instruction: 'Up wave!' }
    ]
  },
  {
    letter: 'X',
    word: 'Xylophone',
    phonics: 'X says /z/ as in Xylophone!',
    emoji: '🎼',
    color: '#4CC9F0',
    glowColor: 'rgba(76, 201, 240, 0.8)',
    guide: 'Criss cross! Slide from top left to bottom right, then cross from top right to bottom left!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.26, y: 0.18 }, to: { x: 0.74, y: 0.82 }, instruction: 'Slide across!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.18 }, to: { x: 0.26, y: 0.82 }, instruction: 'Cross over!' }
    ]
  },
  {
    letter: 'Y',
    word: 'Yacht',
    phonics: 'Y says /j/ as in Yacht!',
    emoji: '⛵',
    color: '#F77F00',
    glowColor: 'rgba(247, 127, 0, 0.8)',
    guide: 'Make a little V in the sky, then draw a straight stick down to the ground!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.50, y: 0.50 }, instruction: 'Slant to middle!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.18 }, to: { x: 0.50, y: 0.50 }, instruction: 'Slant to meet it!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.50 }, to: { x: 0.50, y: 0.82 }, instruction: 'Straight trunk down!' }
    ]
  },
  {
    letter: 'Z',
    word: 'Zebra',
    phonics: 'Z says /z/ as in Zebra!',
    emoji: '🦓',
    color: '#2A9D8F',
    glowColor: 'rgba(42, 157, 143, 0.8)',
    guide: 'Zip across, zag down diagonally, and zip across the floor!',
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.26, y: 0.20 }, to: { x: 0.74, y: 0.20 }, instruction: 'Zip across!' },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.20 }, to: { x: 0.26, y: 0.80 }, instruction: 'Zag down!' },
      { id: 3, label: '3', type: 'line', from: { x: 0.26, y: 0.80 }, to: { x: 0.74, y: 0.80 }, instruction: 'Zip floor!' }
    ]
  }
];

// Precompute checkpoints for each letter
ALPHABET_DATA.forEach(item => {
  item.strokes.forEach(stroke => {
    stroke.checkpoints = generateCheckpoints(stroke, 20);
  });
});
