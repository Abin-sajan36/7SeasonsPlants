import { ParcelTariffRow } from '../types';

/**
 * Standard Contractual Tariffs taken directly from official Postal Department chart
 * (Within State = Kerala, Zone/Metro = Tamil Nadu & Karnataka)
 */
export const DEFAULT_SPEED_POST_TARIFF_TABLE: ParcelTariffRow[] = [
  { maxGrams: 500, kerala: 42, tamilNadu: 48, karnataka: 48 },
  { maxGrams: 1000, kerala: 57, tamilNadu: 77, karnataka: 77 },
  { maxGrams: 1500, kerala: 76, tamilNadu: 130, karnataka: 130 },
  { maxGrams: 2000, kerala: 105, tamilNadu: 166, karnataka: 166 },
  { maxGrams: 3000, kerala: 131, tamilNadu: 224, karnataka: 224 },
  { maxGrams: 4000, kerala: 157, tamilNadu: 277, karnataka: 277 },
  { maxGrams: 5000, kerala: 184, tamilNadu: 325, karnataka: 325 },
  { maxGrams: 6000, kerala: 213, tamilNadu: 395, karnataka: 395 },
  { maxGrams: 7000, kerala: 244, tamilNadu: 467, karnataka: 467 },
  { maxGrams: 8000, kerala: 273, tamilNadu: 537, karnataka: 537 },
  { maxGrams: 9000, kerala: 302, tamilNadu: 607, karnataka: 607 },
  { maxGrams: 10000, kerala: 331, tamilNadu: 679, karnataka: 679 },
  { maxGrams: 11000, kerala: 362, tamilNadu: 749, karnataka: 749 },
  { maxGrams: 12000, kerala: 391, tamilNadu: 821, karnataka: 821 },
  { maxGrams: 13000, kerala: 420, tamilNadu: 891, karnataka: 891 },
  { maxGrams: 14000, kerala: 449, tamilNadu: 961, karnataka: 961 },
  { maxGrams: 15000, kerala: 480, tamilNadu: 1033, karnataka: 1033 },
  { maxGrams: 16000, kerala: 509, tamilNadu: 1103, karnataka: 1103 },
  { maxGrams: 17000, kerala: 538, tamilNadu: 1175, karnataka: 1175 },
  { maxGrams: 18000, kerala: 567, tamilNadu: 1245, karnataka: 1245 },
  { maxGrams: 19000, kerala: 598, tamilNadu: 1315, karnataka: 1315 },
  { maxGrams: 20000, kerala: 627, tamilNadu: 1387, karnataka: 1387 },
  { maxGrams: 21000, kerala: 656, tamilNadu: 1457, karnataka: 1457 },
  { maxGrams: 22000, kerala: 685, tamilNadu: 1529, karnataka: 1529 },
  { maxGrams: 23000, kerala: 716, tamilNadu: 1599, karnataka: 1599 },
  { maxGrams: 24000, kerala: 745, tamilNadu: 1669, karnataka: 1669 },
  { maxGrams: 25000, kerala: 774, tamilNadu: 1741, karnataka: 1741 },
  { maxGrams: 26000, kerala: 803, tamilNadu: 1811, karnataka: 1811 },
  { maxGrams: 27000, kerala: 834, tamilNadu: 1883, karnataka: 1883 },
  { maxGrams: 28000, kerala: 863, tamilNadu: 1953, karnataka: 1953 },
  { maxGrams: 29000, kerala: 892, tamilNadu: 2023, karnataka: 2023 },
  { maxGrams: 30000, kerala: 921, tamilNadu: 2095, karnataka: 2095 },
  { maxGrams: 31000, kerala: 952, tamilNadu: 2165, karnataka: 2165 },
  { maxGrams: 32000, kerala: 981, tamilNadu: 2237, karnataka: 2237 },
  { maxGrams: 33000, kerala: 1010, tamilNadu: 2307, karnataka: 2307 },
  { maxGrams: 34000, kerala: 1039, tamilNadu: 2377, karnataka: 2377 },
  { maxGrams: 35000, kerala: 1070, tamilNadu: 2449, karnataka: 2449 },
];

export const DEFAULT_INDIA_POST_TARIFF_TABLE: ParcelTariffRow[] = [
  { maxGrams: 500, kerala: 37, tamilNadu: 40, karnataka: 40 },
  { maxGrams: 1000, kerala: 52, tamilNadu: 61, karnataka: 61 },
  { maxGrams: 1500, kerala: 68, tamilNadu: 82, karnataka: 82 },
  { maxGrams: 2000, kerala: 94, tamilNadu: 118, karnataka: 118 },
  { maxGrams: 3000, kerala: 118, tamilNadu: 147, karnataka: 147 },
  { maxGrams: 4000, kerala: 142, tamilNadu: 178, karnataka: 178 },
  { maxGrams: 5000, kerala: 166, tamilNadu: 207, karnataka: 207 },
  { maxGrams: 6000, kerala: 188, tamilNadu: 236, karnataka: 236 },
  { maxGrams: 7000, kerala: 212, tamilNadu: 265, karnataka: 265 },
  { maxGrams: 8000, kerala: 236, tamilNadu: 296, karnataka: 296 },
  { maxGrams: 9000, kerala: 260, tamilNadu: 325, karnataka: 325 },
  { maxGrams: 10000, kerala: 284, tamilNadu: 354, karnataka: 354 },
  { maxGrams: 11000, kerala: 306, tamilNadu: 383, karnataka: 383 },
  { maxGrams: 12000, kerala: 330, tamilNadu: 414, karnataka: 414 },
  { maxGrams: 13000, kerala: 354, tamilNadu: 443, karnataka: 443 },
  { maxGrams: 14000, kerala: 378, tamilNadu: 472, karnataka: 472 },
  { maxGrams: 15000, kerala: 402, tamilNadu: 501, karnataka: 501 },
  { maxGrams: 16000, kerala: 424, tamilNadu: 532, karnataka: 532 },
  { maxGrams: 17000, kerala: 448, tamilNadu: 561, karnataka: 561 },
  { maxGrams: 18000, kerala: 472, tamilNadu: 590, karnataka: 590 },
  { maxGrams: 19000, kerala: 496, tamilNadu: 619, karnataka: 619 },
  { maxGrams: 20000, kerala: 520, tamilNadu: 650, karnataka: 650 },
  { maxGrams: 21000, kerala: 542, tamilNadu: 679, karnataka: 679 },
  { maxGrams: 22000, kerala: 566, tamilNadu: 708, karnataka: 708 },
  { maxGrams: 23000, kerala: 590, tamilNadu: 737, karnataka: 737 },
  { maxGrams: 24000, kerala: 614, tamilNadu: 768, karnataka: 768 },
  { maxGrams: 25000, kerala: 638, tamilNadu: 797, karnataka: 797 },
  { maxGrams: 26000, kerala: 660, tamilNadu: 826, karnataka: 826 },
  { maxGrams: 27000, kerala: 684, tamilNadu: 855, karnataka: 855 },
  { maxGrams: 28000, kerala: 708, tamilNadu: 886, karnataka: 886 },
  { maxGrams: 29000, kerala: 732, tamilNadu: 915, karnataka: 915 },
  { maxGrams: 30000, kerala: 756, tamilNadu: 944, karnataka: 944 },
  { maxGrams: 31000, kerala: 778, tamilNadu: 973, karnataka: 973 },
  { maxGrams: 32000, kerala: 802, tamilNadu: 1004, karnataka: 1004 },
  { maxGrams: 33000, kerala: 826, tamilNadu: 1033, karnataka: 1033 },
  { maxGrams: 34000, kerala: 850, tamilNadu: 1062, karnataka: 1062 },
  { maxGrams: 35000, kerala: 874, tamilNadu: 1091, karnataka: 1091 },
];

/**
 * Parses XML text into sorted ParcelTariffRow items
 */
export function parseCourierTariffXml(
  xmlContent: string,
  targetCourier: 'speed-post' | 'india-post'
): { success: boolean; rows: ParcelTariffRow[]; error?: string } {
  try {
    const trimmed = (xmlContent || '').trim();
    if (!trimmed) {
      return { success: false, rows: [], error: 'XML file is empty.' };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'application/xml');

    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        rows: [],
        error: `Invalid XML syntax: ${parserError.textContent?.slice(0, 150) || 'Parse error'}`,
      };
    }

    // Look for row elements: <row>, <slab>, <tariff>, <tier>, <weight>
    const candidates = Array.from(
      doc.querySelectorAll('row, slab, tariff, tier, weight, item')
    );

    if (candidates.length === 0) {
      return {
        success: false,
        rows: [],
        error:
          'No valid tariff slabs found in XML. Expected elements like <slab maxGrams="500" kerala="42" tamilNadu="48" karnataka="48" />.',
      };
    }

    const rows: ParcelTariffRow[] = [];

    for (const el of candidates) {
      // Extract weight
      const weightAttr =
        el.getAttribute('maxGrams') ||
        el.getAttribute('weightUpto') ||
        el.getAttribute('weight_upto_gm') ||
        el.getAttribute('weight') ||
        el.getAttribute('upto') ||
        el.getAttribute('max') ||
        el.querySelector('maxGrams')?.textContent ||
        el.querySelector('weight')?.textContent ||
        '';

      let maxGrams = Number(weightAttr.replace(/[^0-9.]/g, '')) || 0;
      // If entered in kg (e.g. 0.5 or 1 or 2)
      if (maxGrams > 0 && maxGrams <= 50 && weightAttr.toLowerCase().includes('kg')) {
        maxGrams = Math.round(maxGrams * 1000);
      }

      if (maxGrams <= 0) continue;

      // Extract Kerala rate
      const keralaAttr =
        el.getAttribute('kerala') ||
        el.getAttribute('Kerala') ||
        el.getAttribute('withinState') ||
        el.getAttribute('within_state') ||
        el.querySelector('kerala')?.textContent ||
        el.querySelector('Kerala')?.textContent ||
        '0';
      const kerala = Number(keralaAttr.replace(/[^0-9.]/g, '')) || 0;

      // Extract Tamil Nadu rate
      const tnAttr =
        el.getAttribute('tamilNadu') ||
        el.getAttribute('tamil_nadu') ||
        el.getAttribute('TamilNadu') ||
        el.getAttribute('Tamil Nadu') ||
        el.getAttribute('zone') ||
        el.getAttribute('zoneMetro') ||
        el.querySelector('tamilNadu')?.textContent ||
        el.querySelector('tamil_nadu')?.textContent ||
        '0';
      const tamilNadu = Number(tnAttr.replace(/[^0-9.]/g, '')) || 0;

      // Extract Karnataka rate
      const kaAttr =
        el.getAttribute('karnataka') ||
        el.getAttribute('Karnataka') ||
        el.getAttribute('zone') ||
        el.getAttribute('zoneMetro') ||
        el.querySelector('karnataka')?.textContent ||
        el.querySelector('Karnataka')?.textContent ||
        '0';
      const karnataka = Number(kaAttr.replace(/[^0-9.]/g, '')) || 0;

      rows.push({
        maxGrams,
        kerala,
        tamilNadu,
        karnataka,
      });
    }

    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'Could not extract valid weight and state price columns from the XML file.',
      };
    }

    // Sort ascending by weight
    rows.sort((a, b) => a.maxGrams - b.maxGrams);

    // Deduplicate any repeated maxGrams keeping the last
    const uniqueMap = new Map<number, ParcelTariffRow>();
    rows.forEach((r) => uniqueMap.set(r.maxGrams, r));
    const finalRows = Array.from(uniqueMap.values()).sort((a, b) => a.maxGrams - b.maxGrams);

    return {
      success: true,
      rows: finalRows,
    };
  } catch (err: any) {
    return {
      success: false,
      rows: [],
      error: err?.message || 'Error parsing XML file.',
    };
  }
}

/**
 * Generates XML text representation from ParcelTariffRow items
 */
export function generateCourierTariffXml(
  courierId: 'speed-post' | 'india-post',
  rows: ParcelTariffRow[] = courierId === 'speed-post' ? DEFAULT_SPEED_POST_TARIFF_TABLE : DEFAULT_INDIA_POST_TARIFF_TABLE
): string {
  const courierTitle = courierId === 'speed-post' ? 'Speed Post' : 'India Post';
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Parcel Tariff Table (Contractual) w.e.f. 01.08.2026 (inclusive of GST) -->`,
    `<!-- Courier Service: ${courierTitle} -->`,
    `<parcelTariffTable courier="${courierId}" title="${courierTitle} Parcel Contractual">`,
  ];

  for (const r of rows) {
    xmlLines.push(
      `  <slab maxGrams="${r.maxGrams}" kerala="${r.kerala}" tamilNadu="${r.tamilNadu}" karnataka="${r.karnataka}" />`
    );
  }

  xmlLines.push('</parcelTariffTable>');
  return xmlLines.join('\n');
}

/**
 * Triggers browser download of the XML template
 */
export function downloadTariffXmlTemplate(
  courierId: 'speed-post' | 'india-post',
  rows?: ParcelTariffRow[]
): void {
  if (typeof document === 'undefined') return;

  const xmlText = generateCourierTariffXml(courierId, rows);
  const blob = new Blob([xmlText], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${courierId}_parcel_tariff_table.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates delivery charge based on the tariff table
 */
export function lookupTariffRate(
  weightGrams: number,
  state: string,
  table?: ParcelTariffRow[]
): number | null {
  if (!table || !Array.isArray(table) || table.length === 0) return null;
  if (weightGrams <= 0) return 0;

  const cleanState = (state || '').trim().toLowerCase();
  const sorted = [...table].sort((a, b) => a.maxGrams - b.maxGrams);

  // Helper to extract state rate
  const getStateRate = (row: ParcelTariffRow): number => {
    if (cleanState.includes('kerala')) return row.kerala;
    if (cleanState.includes('tamil') || cleanState.includes('nadu')) return row.tamilNadu;
    if (cleanState.includes('karnataka')) return row.karnataka;
    // Default to highest neighbor state
    return Math.max(row.tamilNadu, row.karnataka);
  };

  // Find lowest slab where weight is within slab limit
  const matched = sorted.find((s) => weightGrams <= s.maxGrams);
  if (matched) {
    return getStateRate(matched);
  }

  // Weight exceeds highest defined slab in the table
  const topSlab = sorted[sorted.length - 1];
  const topRate = getStateRate(topSlab);
  const excessGrams = weightGrams - topSlab.maxGrams;
  const excessUnitsOf500g = Math.ceil(excessGrams / 500);

  // Proportional rate per 500g based on average slope
  const secondTop = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  let incrementPer500g = 30;
  if (secondTop) {
    const diffRate = topRate - getStateRate(secondTop);
    const diffGrams = topSlab.maxGrams - secondTop.maxGrams;
    if (diffGrams > 0) {
      incrementPer500g = Math.max(15, Math.round((diffRate / diffGrams) * 500));
    }
  }

  return topRate + excessUnitsOf500g * incrementPer500g;
}
