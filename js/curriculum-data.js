/**
 * curriculum-data.js
 * Comprehensive chapter-based curriculum with 4 chapters:
 * Chapter 1: Capital Alphabets (A-Z)
 * Chapter 2: Small Alphabets (a-z)
 * Chapter 3: Numbers (0-9)
 * Chapter 4: Fun Shapes
 *
 * Each level contains vector strokes, checkpoints, phonics, and celebration object configs.
 */

function lerpPoint(p1, p2, t) {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

function quadraticBezier(p0, p1, p2, t) {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
}

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

function generateCheckpoints(stroke, count = 18) {
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

// --------------------------------------------------------------------------
// CHAPTER 1: CAPITAL ALPHABETS (A - Z)
// --------------------------------------------------------------------------
const CAPITAL_LETTERS = [
  {
    id: 'cap_A',
    char: 'A',
    title: 'Letter A',
    word: 'Apple',
    phonics: 'A says /æ/ as in Apple!',
    emoji: '🍎',
    color: '#FF477E',
    glowColor: 'rgba(255, 71, 126, 0.8)',
    guide: 'Climb up left, slide down right, and draw the belt across!',
    celebrationObject: { type: 'apple', title: 'Delicious Apple!', sound: 'crunch' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.82 }, to: { x: 0.50, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.78, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.33, y: 0.54 }, to: { x: 0.67, y: 0.54 } }
    ]
  },
  {
    id: 'cap_B',
    char: 'B',
    title: 'Letter B',
    word: 'Butterfly',
    phonics: 'B says /b/ as in Butterfly!',
    emoji: '🦋',
    color: '#00B4D8',
    glowColor: 'rgba(0, 180, 216, 0.8)',
    guide: 'Straight line down, top loop, and bottom loop!',
    celebrationObject: { type: 'butterfly', title: 'Fluttering Butterfly!', sound: 'flutter' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.72, y: 0.18 }, control2: { x: 0.72, y: 0.50 }, to: { x: 0.30, y: 0.50 } },
      { id: 3, label: '3', type: 'curve', from: { x: 0.30, y: 0.50 }, control1: { x: 0.75, y: 0.50 }, control2: { x: 0.75, y: 0.82 }, to: { x: 0.30, y: 0.82 } }
    ]
  },
  {
    id: 'cap_C',
    char: 'C',
    title: 'Letter C',
    word: 'Cat',
    phonics: 'C says /k/ as in Cat!',
    emoji: '🐱',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Start at top right, curve round like a crescent moon!',
    celebrationObject: { type: 'cat', title: 'Playful Kitten!', sound: 'meow' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.75, y: 0.28 }, control1: { x: 0.20, y: 0.12 }, control2: { x: 0.20, y: 0.88 }, to: { x: 0.75, y: 0.72 } }
    ]
  },
  {
    id: 'cap_D',
    char: 'D',
    title: 'Letter D',
    word: 'Dog',
    phonics: 'D says /d/ as in Dog!',
    emoji: '🐶',
    color: '#FB8500',
    glowColor: 'rgba(251, 133, 0, 0.8)',
    guide: 'Straight line down, then a giant tummy from top to bottom!',
    celebrationObject: { type: 'dog', title: 'Happy Puppy!', sound: 'bark' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.85, y: 0.18 }, control2: { x: 0.85, y: 0.82 }, to: { x: 0.30, y: 0.82 } }
    ]
  },
  {
    id: 'cap_E',
    char: 'E',
    title: 'Letter E',
    word: 'Elephant',
    phonics: 'E says /e/ as in Elephant!',
    emoji: '🐘',
    color: '#7209B7',
    glowColor: 'rgba(114, 9, 183, 0.8)',
    guide: 'Line down, top shelf, middle shelf, and bottom shelf!',
    celebrationObject: { type: 'elephant', title: 'Mighty Elephant!', sound: 'trumpet' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.72, y: 0.18 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.64, y: 0.50 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.30, y: 0.82 }, to: { x: 0.72, y: 0.82 } }
    ]
  },
  {
    id: 'cap_F',
    char: 'F',
    title: 'Letter F',
    word: 'Frog',
    phonics: 'F says /f/ as in Frog!',
    emoji: '🐸',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Line down, top branch, and middle branch!',
    celebrationObject: { type: 'frog', title: 'Hoppy Frog!', sound: 'ribbit' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.72, y: 0.18 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.64, y: 0.50 } }
    ]
  },
  {
    id: 'cap_G',
    char: 'G',
    title: 'Letter G',
    word: 'Giraffe',
    phonics: 'G says /g/ as in Giraffe!',
    emoji: '🦒',
    color: '#E09F3E',
    glowColor: 'rgba(224, 159, 62, 0.8)',
    guide: 'Curve around like a C, come up, and step inside!',
    celebrationObject: { type: 'giraffe', title: 'Tall Giraffe!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.75, y: 0.28 }, control1: { x: 0.20, y: 0.12 }, control2: { x: 0.20, y: 0.88 }, to: { x: 0.74, y: 0.55 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.55 }, to: { x: 0.52, y: 0.55 } }
    ]
  },
  {
    id: 'cap_H',
    char: 'H',
    title: 'Letter H',
    word: 'Helicopter',
    phonics: 'H says /h/ as in Helicopter!',
    emoji: '🚁',
    color: '#118AB2',
    glowColor: 'rgba(17, 138, 178, 0.8)',
    guide: 'Two tall poles, then a bridge across!',
    celebrationObject: { type: 'helicopter', title: 'Flying Helicopter!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.28, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.18 }, to: { x: 0.72, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.28, y: 0.50 }, to: { x: 0.72, y: 0.50 } }
    ]
  },
  {
    id: 'cap_I',
    char: 'I',
    title: 'Letter I',
    word: 'Ice Cream',
    phonics: 'I says /aɪ/ as in Ice Cream!',
    emoji: '🍦',
    color: '#F72585',
    glowColor: 'rgba(247, 37, 133, 0.8)',
    guide: 'Tall stick down, top hat, and bottom shoes!',
    celebrationObject: { type: 'icecream', title: 'Sweet Ice Cream Cone!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.35, y: 0.18 }, to: { x: 0.65, y: 0.18 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.35, y: 0.82 }, to: { x: 0.65, y: 0.82 } }
    ]
  },
  {
    id: 'cap_J',
    char: 'J',
    title: 'Letter J',
    word: 'Juggler',
    phonics: 'J says /dʒ/ as in Juggler!',
    emoji: '🤹',
    color: '#4361EE',
    glowColor: 'rgba(67, 97, 238, 0.8)',
    guide: 'Candy cane scoop, and top roof line!',
    celebrationObject: { type: 'juggler', title: 'Amazing Juggler!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.62, y: 0.18 }, control1: { x: 0.62, y: 0.78 }, control2: { x: 0.25, y: 0.86 }, to: { x: 0.25, y: 0.62 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.40, y: 0.18 }, to: { x: 0.80, y: 0.18 } }
    ]
  },
  {
    id: 'cap_K',
    char: 'K',
    title: 'Letter K',
    word: 'Kangaroo',
    phonics: 'K says /k/ as in Kangaroo!',
    emoji: '🦘',
    color: '#9B5DE5',
    glowColor: 'rgba(155, 93, 229, 0.8)',
    guide: 'Line down, kick in to middle, kick out to floor!',
    celebrationObject: { type: 'kangaroo', title: 'Bouncing Kangaroo!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.20 }, to: { x: 0.30, y: 0.50 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.50 }, to: { x: 0.74, y: 0.82 } }
    ]
  },
  {
    id: 'cap_L',
    char: 'L',
    title: 'Letter L',
    word: 'Lion',
    phonics: 'L says /l/ as in Lion!',
    emoji: '🦁',
    color: '#FF9F1C',
    glowColor: 'rgba(255, 159, 28, 0.8)',
    guide: 'Slide straight down, then slide to the right!',
    celebrationObject: { type: 'lion', title: 'Roaring Lion!', sound: 'roar' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.18 }, to: { x: 0.32, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.32, y: 0.82 }, to: { x: 0.74, y: 0.82 } }
    ]
  },
  {
    id: 'cap_M',
    char: 'M',
    title: 'Letter M',
    word: 'Monkey',
    phonics: 'M says /m/ as in Monkey!',
    emoji: '🐒',
    color: '#2EC4B6',
    glowColor: 'rgba(46, 196, 182, 0.8)',
    guide: 'Up to the sky, down to valley, up to peak, down to floor!',
    celebrationObject: { type: 'monkey', title: 'Cheeky Monkey!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.82 }, to: { x: 0.22, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.22, y: 0.18 }, to: { x: 0.50, y: 0.58 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.58 }, to: { x: 0.78, y: 0.18 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.78, y: 0.18 }, to: { x: 0.78, y: 0.82 } }
    ]
  },
  {
    id: 'cap_N',
    char: 'N',
    title: 'Letter N',
    word: 'Nest',
    phonics: 'N says /n/ as in Nest!',
    emoji: '🪺',
    color: '#3A86FF',
    glowColor: 'rgba(58, 134, 255, 0.8)',
    guide: 'Climb up, slide across, fly straight up!',
    celebrationObject: { type: 'nest', title: 'Cozy Bird Nest!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.82 }, to: { x: 0.28, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.72, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.72, y: 0.82 }, to: { x: 0.72, y: 0.18 } }
    ]
  },
  {
    id: 'cap_O',
    char: 'O',
    title: 'Letter O',
    word: 'Octopus',
    phonics: 'O says /ɒ/ as in Octopus!',
    emoji: '🐙',
    color: '#8338EC',
    glowColor: 'rgba(131, 56, 236, 0.8)',
    guide: 'Round like a big ball until it connects!',
    celebrationObject: { type: 'octopus', title: 'Friendly Octopus!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 }, { x: 0.28, y: 0.28 }, { x: 0.22, y: 0.50 },
          { x: 0.28, y: 0.72 }, { x: 0.50, y: 0.82 }, { x: 0.72, y: 0.72 },
          { x: 0.78, y: 0.50 }, { x: 0.72, y: 0.28 }, { x: 0.50, y: 0.18 }
        ]
      }
    ]
  },
  {
    id: 'cap_P',
    char: 'P',
    title: 'Letter P',
    word: 'Panda',
    phonics: 'P says /p/ as in Panda!',
    emoji: '🐼',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Line down, then round balloon on top!',
    celebrationObject: { type: 'panda', title: 'Cuddly Panda!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.78, y: 0.18 }, control2: { x: 0.78, y: 0.52 }, to: { x: 0.30, y: 0.52 } }
    ]
  },
  {
    id: 'cap_Q',
    char: 'Q',
    title: 'Letter Q',
    word: 'Queen',
    phonics: 'Q says /kw/ as in Queen!',
    emoji: '👑',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Draw a big circle, then a kicking tail!',
    celebrationObject: { type: 'queen', title: 'Royal Crown!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 }, { x: 0.28, y: 0.28 }, { x: 0.22, y: 0.50 },
          { x: 0.28, y: 0.72 }, { x: 0.50, y: 0.82 }, { x: 0.72, y: 0.72 },
          { x: 0.78, y: 0.50 }, { x: 0.72, y: 0.28 }, { x: 0.50, y: 0.18 }
        ]
      },
      { id: 2, label: '2', type: 'line', from: { x: 0.52, y: 0.62 }, to: { x: 0.76, y: 0.85 } }
    ]
  },
  {
    id: 'cap_R',
    char: 'R',
    title: 'Letter R',
    word: 'Rocket',
    phonics: 'R says /r/ as in Rocket!',
    emoji: '🚀',
    color: '#EF476F',
    glowColor: 'rgba(239, 71, 111, 0.8)',
    guide: 'Line down, balloon head, and slide out kickstand!',
    celebrationObject: { type: 'rocket', title: 'Blasting Rocket!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.18 }, to: { x: 0.30, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.30, y: 0.18 }, control1: { x: 0.78, y: 0.18 }, control2: { x: 0.78, y: 0.50 }, to: { x: 0.30, y: 0.50 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.45, y: 0.50 }, to: { x: 0.74, y: 0.82 } }
    ]
  },
  {
    id: 'cap_S',
    char: 'S',
    title: 'Letter S',
    word: 'Star',
    phonics: 'S says /s/ as in Star!',
    emoji: '⭐',
    color: '#FFD166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    guide: 'Wiggle like a snake from top to bottom!',
    celebrationObject: { type: 'star', title: 'Shining Star!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.70, y: 0.28 }, { x: 0.50, y: 0.18 }, { x: 0.30, y: 0.30 },
          { x: 0.38, y: 0.44 }, { x: 0.58, y: 0.54 }, { x: 0.70, y: 0.68 },
          { x: 0.50, y: 0.82 }, { x: 0.28, y: 0.74 }
        ]
      }
    ]
  },
  {
    id: 'cap_T',
    char: 'T',
    title: 'Letter T',
    word: 'Tiger',
    phonics: 'T says /t/ as in Tiger!',
    emoji: '🐯',
    color: '#F3722C',
    glowColor: 'rgba(243, 114, 44, 0.8)',
    guide: 'Wide roof on top, and tree trunk straight down!',
    celebrationObject: { type: 'tiger', title: 'Brave Tiger!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.24, y: 0.18 }, to: { x: 0.76, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 } }
    ]
  },
  {
    id: 'cap_U',
    char: 'U',
    title: 'Letter U',
    word: 'Unicorn',
    phonics: 'U says /juː/ as in Unicorn!',
    emoji: '🦄',
    color: '#B5179E',
    glowColor: 'rgba(181, 23, 158, 0.8)',
    guide: 'Dive down, scoop the floor, and climb back up!',
    celebrationObject: { type: 'unicorn', title: 'Magical Unicorn!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'curve',
        from: { x: 0.28, y: 0.18 },
        control1: { x: 0.28, y: 0.90 },
        control2: { x: 0.72, y: 0.90 },
        to: { x: 0.72, y: 0.18 }
      }
    ]
  },
  {
    id: 'cap_V',
    char: 'V',
    title: 'Letter V',
    word: 'Volcano',
    phonics: 'V says /v/ as in Volcano!',
    emoji: '🌋',
    color: '#D90429',
    glowColor: 'rgba(217, 4, 41, 0.8)',
    guide: 'Slide down left, climb up right!',
    celebrationObject: { type: 'volcano', title: 'Lava Volcano!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.24, y: 0.18 }, to: { x: 0.50, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.82 }, to: { x: 0.76, y: 0.18 } }
    ]
  },
  {
    id: 'cap_W',
    char: 'W',
    title: 'Letter W',
    word: 'Whale',
    phonics: 'W says /w/ as in Whale!',
    emoji: '🐋',
    color: '#0077B6',
    glowColor: 'rgba(0, 119, 182, 0.8)',
    guide: 'Down, up, down, up like ocean waves!',
    celebrationObject: { type: 'whale', title: 'Singing Whale!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.18, y: 0.18 }, to: { x: 0.32, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.32, y: 0.82 }, to: { x: 0.50, y: 0.38 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.38 }, to: { x: 0.68, y: 0.82 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.68, y: 0.82 }, to: { x: 0.82, y: 0.18 } }
    ]
  },
  {
    id: 'cap_X',
    char: 'X',
    title: 'Letter X',
    word: 'Xylophone',
    phonics: 'X says /z/ as in Xylophone!',
    emoji: '🎼',
    color: '#4CC9F0',
    glowColor: 'rgba(76, 201, 240, 0.8)',
    guide: 'Criss cross! Slide across, then cross over!',
    celebrationObject: { type: 'xylophone', title: 'Musical Xylophone!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.26, y: 0.18 }, to: { x: 0.74, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.18 }, to: { x: 0.26, y: 0.82 } }
    ]
  },
  {
    id: 'cap_Y',
    char: 'Y',
    title: 'Letter Y',
    word: 'Yacht',
    phonics: 'Y says /j/ as in Yacht!',
    emoji: '⛵',
    color: '#F77F00',
    glowColor: 'rgba(247, 127, 0, 0.8)',
    guide: 'Make a little V in the sky, then stem down!',
    celebrationObject: { type: 'yacht', title: 'Sailing Yacht!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.50, y: 0.50 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.72, y: 0.18 }, to: { x: 0.50, y: 0.50 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.50 }, to: { x: 0.50, y: 0.82 } }
    ]
  },
  {
    id: 'cap_Z',
    char: 'Z',
    title: 'Letter Z',
    word: 'Zebra',
    phonics: 'Z says /z/ as in Zebra!',
    emoji: '🦓',
    color: '#2A9D8F',
    glowColor: 'rgba(42, 157, 143, 0.8)',
    guide: 'Zip across, zag down, zip across floor!',
    celebrationObject: { type: 'zebra', title: 'Striped Zebra!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.26, y: 0.20 }, to: { x: 0.74, y: 0.20 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.74, y: 0.20 }, to: { x: 0.26, y: 0.80 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.26, y: 0.80 }, to: { x: 0.74, y: 0.80 } }
    ]
  }
];

// --------------------------------------------------------------------------
// CHAPTER 2: SMALL ALPHABETS (a - z)
// --------------------------------------------------------------------------
const SMALL_LETTERS = [
  {
    id: 'small_a',
    char: 'a',
    title: 'Small a',
    word: 'Ant',
    phonics: 'a says /æ/ as in Ant!',
    emoji: '🐜',
    color: '#FF477E',
    glowColor: 'rgba(255, 71, 126, 0.8)',
    guide: 'Circle around counter-clockwise, then draw a short stick down!',
    celebrationObject: { type: 'ant', title: 'Busy Little Ant!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.65, y: 0.42 }, { x: 0.45, y: 0.36 }, { x: 0.30, y: 0.52 },
          { x: 0.32, y: 0.72 }, { x: 0.52, y: 0.82 }, { x: 0.68, y: 0.72 }
        ]
      },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.36 }, to: { x: 0.68, y: 0.82 } }
    ]
  },
  {
    id: 'small_b',
    char: 'b',
    title: 'Small b',
    word: 'Ball',
    phonics: 'b says /b/ as in Ball!',
    emoji: '⚽',
    color: '#00B4D8',
    glowColor: 'rgba(0, 180, 216, 0.8)',
    guide: 'Tall stick straight down, then a round tummy on the right!',
    celebrationObject: { type: 'ball', title: 'Bouncing Soccer Ball!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.18 }, to: { x: 0.32, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.32, y: 0.46 }, control1: { x: 0.76, y: 0.44 }, control2: { x: 0.76, y: 0.82 }, to: { x: 0.32, y: 0.82 } }
    ]
  },
  {
    id: 'small_c',
    char: 'c',
    title: 'Small c',
    word: 'Car',
    phonics: 'c says /k/ as in Car!',
    emoji: '🚗',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Start at middle right, curve round like a little moon!',
    celebrationObject: { type: 'car', title: 'Zooming Red Car!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.70, y: 0.45 }, control1: { x: 0.28, y: 0.36 }, control2: { x: 0.28, y: 0.84 }, to: { x: 0.70, y: 0.75 } }
    ]
  },
  {
    id: 'small_d',
    char: 'd',
    title: 'Small d',
    word: 'Duck',
    phonics: 'd says /d/ as in Duck!',
    emoji: '🦆',
    color: '#FB8500',
    glowColor: 'rgba(251, 133, 0, 0.8)',
    guide: 'Round tummy on the left, then tall stick straight down!',
    celebrationObject: { type: 'duck', title: 'Quacking Duck!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.68, y: 0.46 }, control1: { x: 0.24, y: 0.44 }, control2: { x: 0.24, y: 0.82 }, to: { x: 0.68, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.18 }, to: { x: 0.68, y: 0.82 } }
    ]
  },
  {
    id: 'small_e',
    char: 'e',
    title: 'Small e',
    word: 'Egg',
    phonics: 'e says /e/ as in Egg!',
    emoji: '🥚',
    color: '#7209B7',
    glowColor: 'rgba(114, 9, 183, 0.8)',
    guide: 'Hit the baseball across, then run around the bases!',
    celebrationObject: { type: 'egg', title: 'Golden Hatching Egg!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.58 }, to: { x: 0.70, y: 0.58 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.70, y: 0.58 }, control1: { x: 0.65, y: 0.32 }, control2: { x: 0.28, y: 0.34 }, to: { x: 0.28, y: 0.62 } },
      { id: 3, label: '3', type: 'curve', from: { x: 0.28, y: 0.62 }, control1: { x: 0.28, y: 0.84 }, control2: { x: 0.60, y: 0.84 }, to: { x: 0.72, y: 0.74 } }
    ]
  },
  {
    id: 'small_f',
    char: 'f',
    title: 'Small f',
    word: 'Fish',
    phonics: 'f says /f/ as in Fish!',
    emoji: '🐟',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Candy cane hook down, then cross the arms!',
    celebrationObject: { type: 'fish', title: 'Swimming Fish!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.62, y: 0.22 }, control1: { x: 0.40, y: 0.16 }, control2: { x: 0.44, y: 0.40 }, to: { x: 0.44, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.30, y: 0.44 }, to: { x: 0.64, y: 0.44 } }
    ]
  },
  {
    id: 'small_g',
    char: 'g',
    title: 'Small g',
    word: 'Guitar',
    phonics: 'g says /g/ as in Guitar!',
    emoji: '🎸',
    color: '#E09F3E',
    glowColor: 'rgba(224, 159, 62, 0.8)',
    guide: 'Round circle, then a fishing hook underground!',
    celebrationObject: { type: 'guitar', title: 'Rocking Guitar!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.65, y: 0.42 }, { x: 0.42, y: 0.36 }, { x: 0.28, y: 0.50 },
          { x: 0.32, y: 0.68 }, { x: 0.52, y: 0.74 }, { x: 0.68, y: 0.64 }, { x: 0.65, y: 0.42 }
        ]
      },
      { id: 2, label: '2', type: 'curve', from: { x: 0.68, y: 0.42 }, control1: { x: 0.68, y: 0.85 }, control2: { x: 0.30, y: 0.94 }, to: { x: 0.30, y: 0.82 } }
    ]
  },
  {
    id: 'small_h',
    char: 'h',
    title: 'Small h',
    word: 'Hat',
    phonics: 'h says /h/ as in Hat!',
    emoji: '🎩',
    color: '#118AB2',
    glowColor: 'rgba(17, 138, 178, 0.8)',
    guide: 'Tall stick straight down, then arch over and down!',
    celebrationObject: { type: 'hat', title: 'Magic Top Hat!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.18 }, to: { x: 0.32, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.32, y: 0.52 }, control1: { x: 0.48, y: 0.40 }, control2: { x: 0.68, y: 0.42 }, to: { x: 0.68, y: 0.82 } }
    ]
  },
  {
    id: 'small_i',
    char: 'i',
    title: 'Small i',
    word: 'Igloo',
    phonics: 'i says /ɪ/ as in Igloo!',
    emoji: '❄️',
    color: '#F72585',
    glowColor: 'rgba(247, 37, 133, 0.8)',
    guide: 'Short stick straight down, then a bright dot on top!',
    celebrationObject: { type: 'snowflake', title: 'Sparkling Snowflake!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.42 }, to: { x: 0.50, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.24 }, to: { x: 0.50, y: 0.28 } }
    ]
  },
  {
    id: 'small_j',
    char: 'j',
    title: 'Small j',
    word: 'Jellyfish',
    phonics: 'j says /dʒ/ as in Jellyfish!',
    emoji: '🪼',
    color: '#4361EE',
    glowColor: 'rgba(67, 97, 238, 0.8)',
    guide: 'Dive down underground and hook left, then a dot on top!',
    celebrationObject: { type: 'jellyfish', title: 'Glowing Jellyfish!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.56, y: 0.40 }, control1: { x: 0.56, y: 0.82 }, control2: { x: 0.30, y: 0.94 }, to: { x: 0.30, y: 0.80 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.56, y: 0.24 }, to: { x: 0.56, y: 0.28 } }
    ]
  },
  {
    id: 'small_k',
    char: 'k',
    title: 'Small k',
    word: 'Kite',
    phonics: 'k says /k/ as in Kite!',
    emoji: '🪁',
    color: '#9B5DE5',
    glowColor: 'rgba(155, 93, 229, 0.8)',
    guide: 'Tall stick straight down, little kick in, kick out!',
    celebrationObject: { type: 'kite', title: 'Flying Colorful Kite!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.18 }, to: { x: 0.32, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.45 }, to: { x: 0.32, y: 0.62 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.32, y: 0.62 }, to: { x: 0.70, y: 0.82 } }
    ]
  },
  {
    id: 'small_l',
    char: 'l',
    title: 'Small l',
    word: 'Leaf',
    phonics: 'l says /l/ as in Leaf!',
    emoji: '🍃',
    color: '#FF9F1C',
    glowColor: 'rgba(255, 159, 28, 0.8)',
    guide: 'One tall straight stick from sky to ground!',
    celebrationObject: { type: 'leaf', title: 'Dancing Autumn Leaf!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 } }
    ]
  },
  {
    id: 'small_m',
    char: 'm',
    title: 'Small m',
    word: 'Moon',
    phonics: 'm says /m/ as in Moon!',
    emoji: '🌙',
    color: '#2EC4B6',
    glowColor: 'rgba(46, 196, 182, 0.8)',
    guide: 'Short stick down, arch one, arch two!',
    celebrationObject: { type: 'moon', title: 'Glowing Crescent Moon!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.20, y: 0.42 }, to: { x: 0.20, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.20, y: 0.52 }, control1: { x: 0.35, y: 0.38 }, control2: { x: 0.50, y: 0.40 }, to: { x: 0.50, y: 0.82 } },
      { id: 3, label: '3', type: 'curve', from: { x: 0.50, y: 0.52 }, control1: { x: 0.65, y: 0.38 }, control2: { x: 0.80, y: 0.40 }, to: { x: 0.80, y: 0.82 } }
    ]
  },
  {
    id: 'small_n',
    char: 'n',
    title: 'Small n',
    word: 'Nut',
    phonics: 'n says /n/ as in Nut!',
    emoji: '🌰',
    color: '#3A86FF',
    glowColor: 'rgba(58, 134, 255, 0.8)',
    guide: 'Short stick down, then one happy arch over and down!',
    celebrationObject: { type: 'nut', title: 'Golden Acorn!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.42 }, to: { x: 0.28, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.28, y: 0.52 }, control1: { x: 0.48, y: 0.38 }, control2: { x: 0.72, y: 0.40 }, to: { x: 0.72, y: 0.82 } }
    ]
  },
  {
    id: 'small_o',
    char: 'o',
    title: 'Small o',
    word: 'Owl',
    phonics: 'o says /ɒ/ as in Owl!',
    emoji: '🦉',
    color: '#8338EC',
    glowColor: 'rgba(131, 56, 236, 0.8)',
    guide: 'Round and round in a circle until it meets!',
    celebrationObject: { type: 'owl', title: 'Wise Old Owl!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.42 }, { x: 0.32, y: 0.48 }, { x: 0.26, y: 0.62 },
          { x: 0.32, y: 0.76 }, { x: 0.50, y: 0.82 }, { x: 0.68, y: 0.76 },
          { x: 0.74, y: 0.62 }, { x: 0.68, y: 0.48 }, { x: 0.50, y: 0.42 }
        ]
      }
    ]
  },
  {
    id: 'small_p',
    char: 'p',
    title: 'Small p',
    word: 'Pen',
    phonics: 'p says /p/ as in Pen!',
    emoji: '🖊️',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Stick underground, then loop around on top right!',
    celebrationObject: { type: 'pen', title: 'Magic Fountain Pen!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.32, y: 0.40 }, to: { x: 0.32, y: 0.92 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.32, y: 0.42 }, control1: { x: 0.74, y: 0.40 }, control2: { x: 0.74, y: 0.76 }, to: { x: 0.32, y: 0.76 } }
    ]
  },
  {
    id: 'small_q',
    char: 'q',
    title: 'Small q',
    word: 'Quilt',
    phonics: 'q says /kw/ as in Quilt!',
    emoji: '🧵',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Round circle left, stick underground with a little flick!',
    celebrationObject: { type: 'quilt', title: 'Warm Cozy Quilt!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.68, y: 0.42 }, control1: { x: 0.26, y: 0.40 }, control2: { x: 0.26, y: 0.76 }, to: { x: 0.68, y: 0.76 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.40 }, to: { x: 0.68, y: 0.92 } }
    ]
  },
  {
    id: 'small_r',
    char: 'r',
    title: 'Small r',
    word: 'Rainbow',
    phonics: 'r says /r/ as in Rainbow!',
    emoji: '🌈',
    color: '#EF476F',
    glowColor: 'rgba(239, 71, 111, 0.8)',
    guide: 'Stick down, climb up, and bend a little branch right!',
    celebrationObject: { type: 'rainbow', title: 'Magical 7-Color Rainbow!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.35, y: 0.42 }, to: { x: 0.35, y: 0.82 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.35, y: 0.54 }, control1: { x: 0.52, y: 0.38 }, control2: { x: 0.70, y: 0.40 }, to: { x: 0.72, y: 0.48 } }
    ]
  },
  {
    id: 'small_s',
    char: 's',
    title: 'Small s',
    word: 'Sun',
    phonics: 's says /s/ as in Sun!',
    emoji: '☀️',
    color: '#FFD166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    guide: 'Little snake wiggle from middle to floor!',
    celebrationObject: { type: 'sun', title: 'Bright Smiling Sun!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.66, y: 0.48 }, { x: 0.50, y: 0.42 }, { x: 0.34, y: 0.50 },
          { x: 0.40, y: 0.60 }, { x: 0.60, y: 0.66 }, { x: 0.66, y: 0.74 },
          { x: 0.50, y: 0.82 }, { x: 0.34, y: 0.76 }
        ]
      }
    ]
  },
  {
    id: 'small_t',
    char: 't',
    title: 'Small t',
    word: 'Train',
    phonics: 't says /t/ as in Train!',
    emoji: '🚂',
    color: '#F3722C',
    glowColor: 'rgba(243, 114, 44, 0.8)',
    guide: 'Straight down with an umbrella hook, then cross!',
    celebrationObject: { type: 'train', title: 'Choo Choo Train!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.46, y: 0.22 }, control1: { x: 0.46, y: 0.70 }, control2: { x: 0.50, y: 0.82 }, to: { x: 0.66, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.32, y: 0.42 }, to: { x: 0.64, y: 0.42 } }
    ]
  },
  {
    id: 'small_u',
    char: 'u',
    title: 'Small u',
    word: 'Umbrella',
    phonics: 'u says /ʌ/ as in Umbrella!',
    emoji: '☂️',
    color: '#B5179E',
    glowColor: 'rgba(181, 23, 158, 0.8)',
    guide: 'Dive down, scoop along bottom, climb up, straight down stick!',
    celebrationObject: { type: 'umbrella', title: 'Rainy Umbrella!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.32, y: 0.42 }, control1: { x: 0.32, y: 0.84 }, control2: { x: 0.68, y: 0.84 }, to: { x: 0.68, y: 0.42 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.42 }, to: { x: 0.68, y: 0.82 } }
    ]
  },
  {
    id: 'small_v',
    char: 'v',
    title: 'Small v',
    word: 'Van',
    phonics: 'v says /v/ as in Van!',
    emoji: '🚐',
    color: '#D90429',
    glowColor: 'rgba(217, 4, 41, 0.8)',
    guide: 'Slide down left, climb up right!',
    celebrationObject: { type: 'van', title: 'Camper Van!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.42 }, to: { x: 0.50, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.82 }, to: { x: 0.72, y: 0.42 } }
    ]
  },
  {
    id: 'small_w',
    char: 'w',
    title: 'Small w',
    word: 'Watch',
    phonics: 'w says /w/ as in Watch!',
    emoji: '⌚',
    color: '#0077B6',
    glowColor: 'rgba(0, 119, 182, 0.8)',
    guide: 'Down, up, down, up little waves!',
    celebrationObject: { type: 'watch', title: 'Tick-Tock Watch!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.42 }, to: { x: 0.34, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.34, y: 0.82 }, to: { x: 0.50, y: 0.54 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.54 }, to: { x: 0.66, y: 0.82 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.66, y: 0.82 }, to: { x: 0.78, y: 0.42 } }
    ]
  },
  {
    id: 'small_x',
    char: 'x',
    title: 'Small x',
    word: 'Fox',
    phonics: 'x says /ks/ as in Fox!',
    emoji: '🦊',
    color: '#4CC9F0',
    glowColor: 'rgba(76, 201, 240, 0.8)',
    guide: 'Slant cross from top-left, slant cross from top-right!',
    celebrationObject: { type: 'fox', title: 'Clever Fox!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.42 }, to: { x: 0.70, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.70, y: 0.42 }, to: { x: 0.30, y: 0.82 } }
    ]
  },
  {
    id: 'small_y',
    char: 'y',
    title: 'Small y',
    word: 'Yo-yo',
    phonics: 'y says /j/ as in Yo-yo!',
    emoji: '🪀',
    color: '#F77F00',
    glowColor: 'rgba(247, 127, 0, 0.8)',
    guide: 'Little v slant, then long tail down to bottom-left!',
    celebrationObject: { type: 'yoyo', title: 'Spinning Yo-yo!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.42 }, to: { x: 0.50, y: 0.66 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.70, y: 0.42 }, to: { x: 0.32, y: 0.92 } }
    ]
  },
  {
    id: 'small_z',
    char: 'z',
    title: 'Small z',
    word: 'Zip',
    phonics: 'z says /z/ as in Zip!',
    emoji: '🤐',
    color: '#2A9D8F',
    glowColor: 'rgba(42, 157, 143, 0.8)',
    guide: 'Zip across, zag down, zip across floor!',
    celebrationObject: { type: 'zipper', title: 'Speedy Zipper!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.30, y: 0.44 }, to: { x: 0.70, y: 0.44 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.70, y: 0.44 }, to: { x: 0.30, y: 0.80 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.30, y: 0.80 }, to: { x: 0.70, y: 0.80 } }
    ]
  }
];

// --------------------------------------------------------------------------
// CHAPTER 3: NUMBERS (0 - 9)
// --------------------------------------------------------------------------
const NUMBERS = [
  {
    id: 'num_0',
    char: '0',
    title: 'Number 0',
    word: 'Zero',
    phonics: 'Zero means nothing or empty!',
    emoji: '🍩',
    color: '#FF477E',
    glowColor: 'rgba(255, 71, 126, 0.8)',
    guide: 'Start at top, curve round like a tall oval until it meets!',
    celebrationObject: { type: 'donut', title: 'Sweet Donut Zero!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 }, { x: 0.30, y: 0.28 }, { x: 0.26, y: 0.50 },
          { x: 0.30, y: 0.72 }, { x: 0.50, y: 0.82 }, { x: 0.70, y: 0.72 },
          { x: 0.74, y: 0.50 }, { x: 0.70, y: 0.28 }, { x: 0.50, y: 0.18 }
        ]
      }
    ]
  },
  {
    id: 'num_1',
    char: '1',
    title: 'Number 1',
    word: 'One Sun',
    phonics: '1! One bright sun in the sky!',
    emoji: '☀️',
    color: '#00B4D8',
    glowColor: 'rgba(0, 180, 216, 0.8)',
    guide: 'Little slant up, straight line down, and ground bar!',
    celebrationObject: { type: 'sun', title: '1 Shining Sun!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.38, y: 0.28 }, to: { x: 0.50, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.50, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.32, y: 0.82 }, to: { x: 0.68, y: 0.82 } }
    ]
  },
  {
    id: 'num_2',
    char: '2',
    title: 'Number 2',
    word: 'Two Birds',
    phonics: '2! Two singing birds in the tree!',
    emoji: '🐦',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Curve around like a swan neck, slide down left, line across floor!',
    celebrationObject: { type: 'swan', title: '2 Beautiful Swans!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.32, y: 0.30 }, control1: { x: 0.36, y: 0.14 }, control2: { x: 0.72, y: 0.16 }, to: { x: 0.68, y: 0.40 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.40 }, to: { x: 0.28, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.28, y: 0.82 }, to: { x: 0.74, y: 0.82 } }
    ]
  },
  {
    id: 'num_3',
    char: '3',
    title: 'Number 3',
    word: 'Three Balloons',
    phonics: '3! Three colorful floating balloons!',
    emoji: '🎈',
    color: '#FB8500',
    glowColor: 'rgba(251, 133, 0, 0.8)',
    guide: 'Top bubble, and bottom bubble to the floor!',
    celebrationObject: { type: 'balloons', count: 3, title: '3 Floating Balloons!' },
    strokes: [
      { id: 1, label: '1', type: 'curve', from: { x: 0.32, y: 0.22 }, control1: { x: 0.68, y: 0.16 }, control2: { x: 0.74, y: 0.46 }, to: { x: 0.46, y: 0.48 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.46, y: 0.48 }, control1: { x: 0.76, y: 0.52 }, control2: { x: 0.72, y: 0.84 }, to: { x: 0.30, y: 0.80 } }
    ]
  },
  {
    id: 'num_4',
    char: '4',
    title: 'Number 4',
    word: 'Four Cars',
    phonics: '4! Four wheels on a race car!',
    emoji: '🏎️',
    color: '#7209B7',
    glowColor: 'rgba(114, 9, 183, 0.8)',
    guide: 'Down and turn right, then cut through with a straight down stick!',
    celebrationObject: { type: 'cars', count: 4, title: '4 Speedy Race Cars!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.60, y: 0.18 }, to: { x: 0.26, y: 0.58 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.26, y: 0.58 }, to: { x: 0.76, y: 0.58 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.60, y: 0.32 }, to: { x: 0.60, y: 0.82 } }
    ]
  },
  {
    id: 'num_5',
    char: '5',
    title: 'Number 5',
    word: 'Five Stars',
    phonics: '5! Five twinkling stars in the night!',
    emoji: '⭐',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Short line down, fat round belly, then give him a top hat!',
    celebrationObject: { type: 'stars', count: 5, title: '5 Twinkling Stars!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.36, y: 0.18 }, to: { x: 0.34, y: 0.46 } },
      { id: 2, label: '2', type: 'curve', from: { x: 0.34, y: 0.46 }, control1: { x: 0.78, y: 0.42 }, control2: { x: 0.78, y: 0.82 }, to: { x: 0.28, y: 0.78 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.36, y: 0.18 }, to: { x: 0.72, y: 0.18 } }
    ]
  },
  {
    id: 'num_6',
    char: '6',
    title: 'Number 6',
    word: 'Six Flowers',
    phonics: '6! Six blooming colorful flowers!',
    emoji: '🌸',
    color: '#118AB2',
    glowColor: 'rgba(17, 138, 178, 0.8)',
    guide: 'Slide down diagonally and roll up into a ball!',
    celebrationObject: { type: 'flowers', count: 6, title: '6 Blooming Flowers!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.64, y: 0.18 }, { x: 0.38, y: 0.36 }, { x: 0.26, y: 0.60 },
          { x: 0.32, y: 0.80 }, { x: 0.54, y: 0.82 }, { x: 0.74, y: 0.68 },
          { x: 0.66, y: 0.52 }, { x: 0.44, y: 0.50 }, { x: 0.28, y: 0.62 }
        ]
      }
    ]
  },
  {
    id: 'num_7',
    char: '7',
    title: 'Number 7',
    word: 'Seven Rainbows',
    phonics: '7! Seven colors of the rainbow!',
    emoji: '🌈',
    color: '#F72585',
    glowColor: 'rgba(247, 37, 133, 0.8)',
    guide: 'Fly across the sky, then slide down to the left!',
    celebrationObject: { type: 'rainbow', title: '7-Color Rainbow Magic!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.28, y: 0.18 }, to: { x: 0.76, y: 0.18 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.76, y: 0.18 }, to: { x: 0.36, y: 0.82 } }
    ]
  },
  {
    id: 'num_8',
    char: '8',
    title: 'Number 8',
    word: 'Eight Octopus Arms',
    phonics: '8! Eight wiggly arms on an octopus!',
    emoji: '🐙',
    color: '#4361EE',
    glowColor: 'rgba(67, 97, 238, 0.8)',
    guide: 'Make an S and keep going, cross back to the top!',
    celebrationObject: { type: 'octopus', count: 8, title: '8-Armed Dancing Octopus!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.18 }, { x: 0.34, y: 0.26 }, { x: 0.36, y: 0.40 },
          { x: 0.50, y: 0.50 }, { x: 0.68, y: 0.62 }, { x: 0.66, y: 0.78 },
          { x: 0.50, y: 0.82 }, { x: 0.32, y: 0.76 }, { x: 0.32, y: 0.60 },
          { x: 0.50, y: 0.50 }, { x: 0.66, y: 0.38 }, { x: 0.64, y: 0.24 },
          { x: 0.50, y: 0.18 }
        ]
      }
    ]
  },
  {
    id: 'num_9',
    char: '9',
    title: 'Number 9',
    word: 'Nine Jewels',
    phonics: '9! Nine sparkling shiny jewels!',
    emoji: '💎',
    color: '#9B5DE5',
    glowColor: 'rgba(155, 93, 229, 0.8)',
    guide: 'Make a loop at the top, then line straight down to the floor!',
    celebrationObject: { type: 'jewels', count: 9, title: '9 Sparkling Diamonds!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.68, y: 0.36 }, { x: 0.50, y: 0.18 }, { x: 0.30, y: 0.28 },
          { x: 0.32, y: 0.46 }, { x: 0.50, y: 0.54 }, { x: 0.68, y: 0.46 },
          { x: 0.68, y: 0.18 }
        ]
      },
      { id: 2, label: '2', type: 'line', from: { x: 0.68, y: 0.18 }, to: { x: 0.68, y: 0.82 } }
    ]
  }
];

// --------------------------------------------------------------------------
// CHAPTER 4: FUN SHAPES
// --------------------------------------------------------------------------
const SHAPES = [
  {
    id: 'shape_circle',
    char: '⚪',
    title: 'Magic Circle',
    word: 'Circle',
    phonics: 'A round circle with no corners!',
    emoji: '⚪',
    color: '#FFB703',
    glowColor: 'rgba(255, 183, 3, 0.8)',
    guide: 'Start at the top and curve all the way around like a big pizza!',
    celebrationObject: { type: 'sun', title: 'Warm Sunshine Circle!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.16 }, { x: 0.28, y: 0.25 }, { x: 0.18, y: 0.50 },
          { x: 0.28, y: 0.75 }, { x: 0.50, y: 0.84 }, { x: 0.72, y: 0.75 },
          { x: 0.82, y: 0.50 }, { x: 0.72, y: 0.25 }, { x: 0.50, y: 0.16 }
        ]
      }
    ]
  },
  {
    id: 'shape_square',
    char: '⏹️',
    title: 'Super Square',
    word: 'Square',
    phonics: 'A square with 4 equal sides!',
    emoji: '⏹️',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Top line, right side down, bottom line across, left side up!',
    celebrationObject: { type: 'giftbox', title: 'Surprise Gift Box Square!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.22, y: 0.22 }, to: { x: 0.78, y: 0.22 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.78, y: 0.22 }, to: { x: 0.78, y: 0.78 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.78, y: 0.78 }, to: { x: 0.22, y: 0.78 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.22, y: 0.78 }, to: { x: 0.22, y: 0.22 } }
    ]
  },
  {
    id: 'shape_triangle',
    char: '🔺',
    title: 'Tasty Triangle',
    word: 'Triangle',
    phonics: 'A triangle with 3 sharp corners!',
    emoji: '🔺',
    color: '#FF477E',
    glowColor: 'rgba(255, 71, 126, 0.8)',
    guide: 'Climb up to the peak, slide down to right, connect the floor!',
    celebrationObject: { type: 'pizza', title: 'Yummy Pizza Slice Triangle!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.20, y: 0.80 }, to: { x: 0.50, y: 0.20 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.50, y: 0.20 }, to: { x: 0.80, y: 0.80 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.80, y: 0.80 }, to: { x: 0.20, y: 0.80 } }
    ]
  },
  {
    id: 'shape_star',
    char: '⭐',
    title: 'Magic Star',
    word: 'Star',
    phonics: 'A shining star with 5 sparkling points!',
    emoji: '⭐',
    color: '#FFD166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    guide: 'Criss-cross five points without lifting your finger!',
    celebrationObject: { type: 'star', title: 'Supernova Golden Star!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.16 }, to: { x: 0.60, y: 0.82 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.60, y: 0.82 }, to: { x: 0.18, y: 0.40 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.18, y: 0.40 }, to: { x: 0.82, y: 0.40 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.82, y: 0.40 }, to: { x: 0.40, y: 0.82 } },
      { id: 5, label: '5', type: 'line', from: { x: 0.40, y: 0.82 }, to: { x: 0.50, y: 0.16 } }
    ]
  },
  {
    id: 'shape_heart',
    char: '❤️',
    title: 'Loving Heart',
    word: 'Heart',
    phonics: 'A sweet loving heart full of kindness!',
    emoji: '❤️',
    color: '#EF476F',
    glowColor: 'rgba(239, 71, 111, 0.8)',
    guide: 'Left hump down to the point, then right hump down to the point!',
    celebrationObject: { type: 'heart', title: 'Floating Valentine Heart Balloon!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'curve',
        from: { x: 0.50, y: 0.36 },
        control1: { x: 0.18, y: 0.12 },
        control2: { x: 0.16, y: 0.58 },
        to: { x: 0.50, y: 0.84 }
      },
      {
        id: 2,
        label: '2',
        type: 'curve',
        from: { x: 0.50, y: 0.36 },
        control1: { x: 0.82, y: 0.12 },
        control2: { x: 0.84, y: 0.58 },
        to: { x: 0.50, y: 0.84 }
      }
    ]
  },
  {
    id: 'shape_diamond',
    char: '🔷',
    title: 'Flying Diamond',
    word: 'Diamond',
    phonics: 'A diamond kite soaring up in the breeze!',
    emoji: '🔷',
    color: '#4CC9F0',
    glowColor: 'rgba(76, 201, 240, 0.8)',
    guide: 'Top to right, right to bottom, bottom to left, left to top!',
    celebrationObject: { type: 'kite', title: 'Soaring Diamond Kite!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.80, y: 0.50 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.80, y: 0.50 }, to: { x: 0.50, y: 0.82 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.50, y: 0.82 }, to: { x: 0.20, y: 0.50 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.20, y: 0.50 }, to: { x: 0.50, y: 0.18 } }
    ]
  },
  {
    id: 'shape_rectangle',
    char: '▭',
    title: 'Roomy Rectangle',
    word: 'Rectangle',
    phonics: 'A rectangle has two long sides and two short sides!',
    emoji: '📦',
    color: '#3A86FF',
    glowColor: 'rgba(58, 134, 255, 0.8)',
    guide: 'Long top line, short right line down, long bottom line across, short left line up!',
    celebrationObject: { type: 'giftbox', title: 'Gift Box Rectangle!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.16, y: 0.30 }, to: { x: 0.84, y: 0.30 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.84, y: 0.30 }, to: { x: 0.84, y: 0.70 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.84, y: 0.70 }, to: { x: 0.16, y: 0.70 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.16, y: 0.70 }, to: { x: 0.16, y: 0.30 } }
    ]
  },
  {
    id: 'shape_oval',
    char: '⬭',
    title: 'Shiny Oval',
    word: 'Oval',
    phonics: 'An oval is stretched like an egg or a racetrack!',
    emoji: '🥚',
    color: '#9B5DE5',
    glowColor: 'rgba(155, 93, 229, 0.8)',
    guide: 'Start at top, curve around wide and smooth like an egg!',
    celebrationObject: { type: 'egg', title: 'Golden Egg Oval!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'polyline',
        points: [
          { x: 0.50, y: 0.24 }, { x: 0.26, y: 0.32 }, { x: 0.18, y: 0.50 },
          { x: 0.26, y: 0.68 }, { x: 0.50, y: 0.76 }, { x: 0.74, y: 0.68 },
          { x: 0.82, y: 0.50 }, { x: 0.74, y: 0.32 }, { x: 0.50, y: 0.24 }
        ]
      }
    ]
  },
  {
    id: 'shape_crescent',
    char: '🌙',
    title: 'Crescent Moon',
    word: 'Crescent',
    phonics: 'A glowing crescent moon smiling in the night sky!',
    emoji: '🌙',
    color: '#FFD166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    guide: 'Outer curve from top to bottom, then inner scoop back up!',
    celebrationObject: { type: 'moon', title: 'Crescent Moon!' },
    strokes: [
      {
        id: 1,
        label: '1',
        type: 'curve',
        from: { x: 0.65, y: 0.18 },
        control1: { x: 0.12, y: 0.18 },
        control2: { x: 0.12, y: 0.82 },
        to: { x: 0.65, y: 0.82 }
      },
      {
        id: 2,
        label: '2',
        type: 'curve',
        from: { x: 0.65, y: 0.82 },
        control1: { x: 0.38, y: 0.68 },
        control2: { x: 0.38, y: 0.32 },
        to: { x: 0.65, y: 0.18 }
      }
    ]
  },
  {
    id: 'shape_pentagon',
    char: '⬟',
    title: 'Playful Pentagon',
    word: 'Pentagon',
    phonics: 'A pentagon has 5 straight sides like a little house!',
    emoji: '🏠',
    color: '#06D6A0',
    glowColor: 'rgba(6, 214, 160, 0.8)',
    guide: 'Top roof slant right, down side, bottom floor, left side, roof slant up!',
    celebrationObject: { type: 'star', title: 'Pentagon Castle!' },
    strokes: [
      { id: 1, label: '1', type: 'line', from: { x: 0.50, y: 0.18 }, to: { x: 0.82, y: 0.42 } },
      { id: 2, label: '2', type: 'line', from: { x: 0.82, y: 0.42 }, to: { x: 0.70, y: 0.80 } },
      { id: 3, label: '3', type: 'line', from: { x: 0.70, y: 0.80 }, to: { x: 0.30, y: 0.80 } },
      { id: 4, label: '4', type: 'line', from: { x: 0.30, y: 0.80 }, to: { x: 0.18, y: 0.42 } },
      { id: 5, label: '5', type: 'line', from: { x: 0.18, y: 0.42 }, to: { x: 0.50, y: 0.18 } }
    ]
  }
];

// Precompute checkpoints for each item across all chapters
function processChapterItems(items) {
  items.forEach(item => {
    item.strokes.forEach(stroke => {
      stroke.checkpoints = generateCheckpoints(stroke, 20);
    });
  });
  return items;
}

export const CHAPTERS = [
  {
    id: 'chapter_small',
    name: 'Small Letters',
    badge: '🔡',
    tagline: 'Write Handwriting a – z',
    themeColor: '#00B4D8',
    items: processChapterItems(SMALL_LETTERS)
  },
  {
    id: 'chapter_capital',
    name: 'Capital Letters',
    badge: '🔤',
    tagline: 'Master Alphabet A – Z',
    themeColor: '#FF477E',
    items: processChapterItems(CAPITAL_LETTERS)
  },
  {
    id: 'chapter_numbers',
    name: 'Numbers 0 – 9',
    badge: '🔢',
    tagline: 'Count and Draw 0 to 9',
    themeColor: '#FFB703',
    items: processChapterItems(NUMBERS)
  },
  {
    id: 'chapter_shapes',
    name: 'Fun Shapes',
    badge: '🔶',
    tagline: 'Draw Circles, Stars & More',
    themeColor: '#7209B7',
    items: processChapterItems(SHAPES)
  }
];

export function getRandomPracticeItem(filter = 'all') {
  let pool = [];
  CHAPTERS.forEach(ch => {
    if (filter === 'letters' && (ch.id === 'chapter_small' || ch.id === 'chapter_capital')) {
      pool.push(...ch.items.map(it => ({ ...it, chapterId: ch.id, categoryName: ch.name })));
    } else if (filter === 'numbers' && ch.id === 'chapter_numbers') {
      pool.push(...ch.items.map(it => ({ ...it, chapterId: ch.id, categoryName: ch.name })));
    } else if (filter === 'shapes' && ch.id === 'chapter_shapes') {
      pool.push(...ch.items.map(it => ({ ...it, chapterId: ch.id, categoryName: ch.name })));
    } else if (filter === 'all') {
      pool.push(...ch.items.map(it => ({ ...it, chapterId: ch.id, categoryName: ch.name })));
    }
  });
  if (pool.length === 0) {
    CHAPTERS.forEach(ch => pool.push(...ch.items.map(it => ({ ...it, chapterId: ch.id, categoryName: ch.name }))));
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

