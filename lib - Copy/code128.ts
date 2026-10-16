const CODE128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

function codewordsFor(value: string) {
  if (!value) throw new Error('Barcode value is empty.');
  if (/^\d+$/.test(value) && value.length % 2 === 0) {
    const words = [105]; // Start Code C
    for (let index = 0; index < value.length; index += 2) words.push(Number(value.slice(index, index + 2)));
    return words;
  }

  const words = [104]; // Start Code B
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code > 126) throw new Error('Code 128 supports printable ASCII characters only.');
    words.push(code - 32);
  }
  return words;
}

export function code128Svg(value: string) {
  const words = codewordsFor(value);
  let checksum = words[0];
  for (let index = 1; index < words.length; index += 1) checksum += words[index] * index;
  words.push(checksum % 103, 106);

  const quiet = 10;
  let x = quiet;
  const bars: string[] = [];
  for (const word of words) {
    const pattern = CODE128_PATTERNS[word];
    if (!pattern) throw new Error(`Unable to encode Code 128 value ${word}.`);
    for (let index = 0; index < pattern.length; index += 1) {
      const width = Number(pattern[index]);
      if (index % 2 === 0) bars.push(`<rect x="${x}" y="0" width="${width}" height="46" fill="#000"/>`);
      x += width;
    }
  }
  const totalWidth = x + quiet;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 46" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="Barcode ${value}"><rect width="${totalWidth}" height="46" fill="#fff"/>${bars.join('')}</svg>`;
}

export function code128SvgDataUrl(value: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(code128Svg(value))}`;
}
