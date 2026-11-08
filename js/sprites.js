// Sprites pixel art dibujados como grillas de caracteres.
// Cada carácter mapea a un color de la paleta del sprite; '.' es transparente.
// Solo presentación: no lee ni modifica el estado del juego.

const SPRITES = {
  // Espada en diagonal (16x16).
  attack: {
    palette: {
      k: '#0d0b16',
      w: '#eee9ff',
      g: '#a59cc4',
      y: '#e3b341',
      r: '#e5534b',
    },
    pixels: [
      '.............kkk',
      '............kwwk',
      '...........kwwgk',
      '..........kwwgk.',
      '.........kwwgk..',
      '........kwwgk...',
      '...kk..kwwgk....',
      '...kykkwwgk.....',
      '....kyywgk......',
      '.....kyyk.......',
      '....krkyyk......',
      '...krk.kyk......',
      '..krk...kk......',
      '.kyk............',
      '.kk.............',
      '................',
    ],
  },

  // Escudo (16x16).
  defense: {
    palette: {
      k: '#0d0b16',
      l: '#6cb6ff',
      b: '#4a90e2',
      w: '#eee9ff',
    },
    pixels: [
      '................',
      '..kkkkkkkkkkkk..',
      '..kllllllbbbbk..',
      '..klwllllbbbbk..',
      '..klwllllbbbbk..',
      '..kllllllbbbbk..',
      '..kllllllbbbbk..',
      '..kllllllbbbbk..',
      '...kllllllbbk...',
      '...kllllllbbk...',
      '....kllllbbk....',
      '.....kllbbk.....',
      '......klbk......',
      '.......kk.......',
      '................',
      '................',
    ],
  },

  // Corazón (16x16).
  heal: {
    palette: {
      k: '#0d0b16',
      g: '#3fb950',
      d: '#2a7a38',
      w: '#eee9ff',
    },
    pixels: [
      '................',
      '................',
      '..kkkk....kkkk..',
      '.kggggk..kggggk.',
      'kggwwggkkggggggk',
      'kgwwggggggggggdk',
      'kgwgggggggggggdk',
      'kggggggggggggddk',
      '.kggggggggggddk.',
      '..kggggggggddk..',
      '...kggggggddk...',
      '....kggggddk....',
      '.....kggddk.....',
      '......kddk......',
      '.......kk.......',
      '................',
    ],
  },

  // Retrato de Thanos (32x32): titán morado con casco y guantelete alzado.
  thanos: {
    palette: {
      k: '#0d0b16',
      y: '#e3b341',
      o: '#a77c1c',
      p: '#8a55d8',
      m: '#6a35b8',
      n: '#4a2382',
      w: '#eee9ff',
      b: '#3b82f6',
      j: '#facc15',
      r: '#ef4444',
      v: '#a855f7',
      t: '#22c55e',
      s: '#f97316',
    },
    pixels: [
      '................................',
      '............kkkkkkkk............',
      '..........kkyyyyyyyykk..........',
      '.........kyyyyyyyyyyyyk.........',
      '........kyyyyoyyyyoyyyyk........',
      '........kyyykkkkkkkkyyyk........',
      '........kyyknmmmmmmnkyyk........',
      '........kyykmppppppmkyyk..kkkk..',
      '........kyyknwwmmwwnkyyk.kyoyyk.',
      '........kyykmppmmppmkyykkyyyyyyk',
      '........koykmpppnppmkyokkybyryjk',
      '.........kokmppnnppmkok.kyyyyyyk',
      '..........knpnnnnnnpnk..kyvytysk',
      '..........knnpkkkkpnnk..kyyyyyyk',
      '...........knnppppnnk....kyyyyk.',
      '............knnnnnnk......kyok..',
      '.............kkkkkk.......kyok..',
      '.............knnnnk.......kyok..',
      '....kkkkkkkkkknnnnkkkkkkkkkyok..',
      '...kyyyyyyyyyknnnnkyyyyyyyyyk...',
      '..kyyoyyyyyyykmmmmkyyyyyyyoyyk..',
      '.kyyoyyyyyyyykmppmkyyyyyyyyoyyk.',
      'kyyoyyyyyyyyykmppmkyyyyyyyyyoyyk',
      'kyyoyyyyyyyyykmppmkyyyyyyyyyoyyk',
      'kyoooooooooookmmmmkoooooooooooyk',
      'kkkkkkkkkkkkkkmmmmkkkkkkkkkkkkkk',
      '..kyyyyyyyyykmmppmmkyyyyyyyyyk..',
      '..kyoooooooykmmmmmmkyoooooooyk..',
      '..kyyyyyyyyykmnmmnmkyyyyyyyyyk..',
      '..kyoooooooykmmnnmmkyoooooooyk..',
      '..kyyyyyyyyykmmmmmmkyyyyyyyyyk..',
      '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
    ],
  },
};

// Devuelve un <svg> con un <rect> por cada tramo horizontal de pixeles del mismo color.
function createSpriteSvg(name) {
  const sprite = SPRITES[name];
  const height = sprite.pixels.length;
  const width = sprite.pixels[0].length;
  let rects = '';

  sprite.pixels.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      let run = 1;
      while (row[x + run] === key) run++;
      if (key !== '.') {
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${sprite.palette[key]}"/>`;
      }
      x += run;
    }
  });

  return `<svg class="sprite sprite--${name}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}
