export type UpcAResult = {
  digits: string;
  formatted: string;
  valid: boolean;
  reason?: string;
};

const LEFT: Record<string, string> = {
  '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
  '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011',
};

const RIGHT: Record<string, string> = {
  '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010', '4': '1011100',
  '5': '1001110', '6': '1010000', '7': '1000100', '8': '1001000', '9': '1110100',
};

function checkDigit(firstEleven: string) {
  const sum = firstEleven.split('').reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10);
}

export function normalizeUpcA(value = ''): UpcAResult {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11) digits += checkDigit(digits);
  if (digits.length !== 12) {
    return { digits, formatted: value, valid: false, reason: 'UPC-A artwork requires an 11- or 12-digit UPC.' };
  }
  const expected = checkDigit(digits.slice(0, 11));
  if (digits[11] !== expected) {
    return { digits, formatted: `${digits[0]}-${digits.slice(1, 6)}-${digits.slice(6, 11)}-${digits[11]}`, valid: false, reason: `The Commerce7 UPC has an invalid check digit. Expected ${expected}.` };
  }
  return {
    digits,
    formatted: `${digits[0]}-${digits.slice(1, 6)}-${digits.slice(6, 11)}-${digits[11]}`,
    valid: true,
  };
}

export function upcASvg(value = '') {
  const upc = normalizeUpcA(value);
  if (!upc.valid) return '';

  const leftBits = upc.digits.slice(0, 6).split('').map((digit) => LEFT[digit]).join('');
  const rightBits = upc.digits.slice(6).split('').map((digit) => RIGHT[digit]).join('');
  const bits = `101${leftBits}01010${rightBits}101`;
  const module = 3;
  const quiet = 10;
  const startX = quiet * module;
  const width = (95 + quiet * 2) * module;
  const height = 150;
  const top = 10;
  const normalBottom = 108;
  const guardBottom = 120;
  const guard = (index: number) => index <= 2 || (index >= 45 && index <= 49) || index >= 92;

  const bars: string[] = [];
  let runStart = -1;
  let runGuard = false;
  for (let i = 0; i <= bits.length; i += 1) {
    const one = i < bits.length && bits[i] === '1';
    if (one && runStart < 0) {
      runStart = i;
      runGuard = guard(i);
    }
    const guardChanged = one && runStart >= 0 && guard(i) !== runGuard;
    if ((!one || guardChanged) && runStart >= 0) {
      const end = guardChanged ? i : i;
      const x = startX + runStart * module;
      const w = (end - runStart) * module;
      const bottom = runGuard ? guardBottom : normalBottom;
      bars.push(`<rect x="${x}" y="${top}" width="${w}" height="${bottom - top}" fill="#000"/>`);
      runStart = one ? i : -1;
      runGuard = one ? guard(i) : false;
    }
  }

  const text: string[] = [];
  text.push(`<text x="${startX - module * 4}" y="137" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#000">${upc.digits[0]}</text>`);
  for (let i = 1; i <= 5; i += 1) {
    const x = startX + (3 + i * 7 + 3.5) * module;
    text.push(`<text x="${x}" y="137" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#000">${upc.digits[i]}</text>`);
  }
  for (let i = 0; i <= 4; i += 1) {
    const x = startX + (50 + i * 7 + 3.5) * module;
    text.push(`<text x="${x}" y="137" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#000">${upc.digits[i + 6]}</text>`);
  }
  text.push(`<text x="${startX + 95 * module + module * 4}" y="137" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#000">${upc.digits[11]}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="UPC ${upc.formatted}"><rect width="100%" height="100%" fill="#fff"/>${bars.join('')}${text.join('')}</svg>`;
}

export function upcASvgDataUrl(value = '') {
  const svg = upcASvg(value);
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : '';
}
