// ---------------------------------------------------------------------------
// 7Seasonsplants Botanical Intelligence & Knowledge Engine
// Mannarathayil Gardens LLP - South Indian Tropical Horticulture Specialist
// ---------------------------------------------------------------------------

export interface BotanicalProfile {
  commonName: string;
  botanicalName: string;
  family: string;
  lightRequirement: 'Low Light' | 'Bright Indirect' | 'Direct Sun' | 'Partial Shade';
  lightLux: string;
  wateringScheduleKeralaTN: {
    summer: string;
    monsoon: string;
    winter: string;
  };
  idealSoilMix: string;
  humidityNeed: 'Low (30-40%)' | 'Moderate (50-65%)' | 'High (70-90%)';
  fertilizerNeeds: string;
  petSafe: boolean;
  airPurifying: boolean;
  commonPests: string[];
  vulnerabilities: string[];
  climateNote: string;
  nurseryTips: string[];
}

export const BOTANICAL_DATABASE: Record<string, BotanicalProfile> = {
  monstera: {
    commonName: 'Monstera Deliciosa (Swiss Cheese Plant)',
    botanicalName: 'Monstera deliciosa',
    family: 'Araceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '2,000 - 4,000 Lux (within 3-5 ft of bright window, no direct scorch)',
    wateringScheduleKeralaTN: {
      summer: 'Every 3 to 5 days when top 2 inches of potting medium feel dry.',
      monsoon: 'Every 7 to 10 days. Ensure tray has no standing water to prevent root rot.',
      winter: 'Every 5 to 7 days, checking moisture with wooden probe before irrigating.',
    },
    idealSoilMix: 'Coarse Aroid Mix: 40% coco chips/coir, 25% perlite, 20% vermicompost, 15% pine bark/charcoal.',
    humidityNeed: 'High (70-90%)',
    fertilizerNeeds: 'Balanced organic seaweed liquid (19-19-19 or 20-20-20 at 1/4 strength) once a month during growth season.',
    petSafe: false, // Calcium oxalate crystals
    airPurifying: true,
    commonPests: ['Spider mites under leaf veins', 'Scale on petioles', 'Thrips'],
    vulnerabilities: ['Root rot from waterlogged potting soil', 'Crispy brown margins from dry AC draft', 'Yellowing lower leaves from overwatering'],
    climateNote: 'Thrives in South Indian warmth and natural humidity. Clean broad leaves monthly with a soft damp cloth to optimize transpiration.',
    nurseryTips: [
      'Provide a sturdy coco-coir pole for aerial roots to cling onto to trigger mature split leaves (fenestrations).',
      'Never allow the pot to sit in standing drainage saucer water.',
    ],
  },
  pothos: {
    commonName: 'Golden Pothos / Money Plant',
    botanicalName: 'Epipremnum aureum',
    family: 'Araceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '1,000 - 2,500 Lux (tolerates low light, variegated forms need brighter indirect)',
    wateringScheduleKeralaTN: {
      summer: 'Every 4 to 6 days when topsoil is visibly dry.',
      monsoon: 'Every 8 to 12 days. Highly prone to yellow leaf rot in stagnant wet soil during monsoons.',
      winter: 'Every 6 to 8 days.',
    },
    idealSoilMix: '50% coco peat, 30% perlite, 20% well-rotted vermicompost.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Organic vermicompost tea or mild seaweed drench once every 45 days.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Mealybugs in leaf crevices', 'Fungus gnats'],
    vulnerabilities: ['Black stem base rot from overwatering', 'Pale yellow foliage from low light', 'Drooping limp vines when severely thirsty'],
    climateNote: 'Extremely forgiving in Kerala & Tamil Nadu. Grows vigorously in hanging baskets, totems, or water jars.',
    nurseryTips: [
      'If stems become leggy, prune tips just above a node to stimulate dense multi-branch bushiness.',
      'Water thoroughly until water runs through drainage holes, then discard runoff.',
    ],
  },
  snakeplant: {
    commonName: 'Snake Plant / Sansevieria',
    botanicalName: 'Dracaena trifasciata (formerly Sansevieria)',
    family: 'Asparagaceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '500 - 3,000 Lux (adapts to low light corners to partial morning sun)',
    wateringScheduleKeralaTN: {
      summer: 'Every 10 to 14 days when the entire pot soil is bone dry.',
      monsoon: 'Once every 20 to 30 days. Excess moisture in high monsoon humidity causes rapid rhizome collapse.',
      winter: 'Every 14 to 21 days.',
    },
    idealSoilMix: 'Gritty Succulent Mix: 40% coarse river sand/pumice, 30% perlite, 20% coco peat, 10% biochar.',
    humidityNeed: 'Low (30-40%)',
    fertilizerNeeds: 'Light organic feeding twice a year in spring and late monsoon.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Mealybugs deep inside rosette leaves'],
    vulnerabilities: ['Rhizome rot from overwatering', 'Soft mushy brown base', 'Splitting leaves from irregular deluge watering'],
    climateNote: 'Practically indestructible in South Indian homes. Excellent for air-conditioned bedrooms due to nocturnal oxygen release (CAM metabolism).',
    nurseryTips: [
      'Always water around the soil rim; never pour water directly into the central rosette crown.',
      'Use unglazed terracotta or porous ceramic pots with generous drainage holes.',
    ],
  },
  zzplant: {
    commonName: 'ZZ Plant (Zanzibar Gem)',
    botanicalName: 'Zamioculcas zamiifolia',
    family: 'Araceae',
    lightRequirement: 'Low Light',
    lightLux: '400 - 1,500 Lux (flourishes in low-light bedrooms, offices, corridors)',
    wateringScheduleKeralaTN: {
      summer: 'Every 10 to 14 days.',
      monsoon: 'Once every 25 to 30 days. Thick potato-like underground tubers store weeks of moisture.',
      winter: 'Every 15 to 20 days.',
    },
    idealSoilMix: '45% perlite/gravel, 35% coco peat, 20% vermicompost for ultra-fast drainage.',
    humidityNeed: 'Low (30-40%)',
    fertilizerNeeds: 'Minimal; slow-release organic pellets once every 4 months.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Scale insects on glossy leaflets'],
    vulnerabilities: ['Tuber rot from overwatering', 'Yellowing lower leaflets', 'Wrinkled rachis stems when underwatered'],
    climateNote: 'Ideal corporate and apartment plant in Kochi, Chennai, Bangalore, and Trivandrum.',
    nurseryTips: [
      'If in doubt, hold off on watering. A ZZ plant tolerates a month of drought far better than one extra overwatering.',
    ],
  },
  peacelily: {
    commonName: 'Peace Lily',
    botanicalName: 'Spathiphyllum wallisii',
    family: 'Araceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '800 - 2,000 Lux (never direct sun; leaves scorch within 1 hour of direct rays)',
    wateringScheduleKeralaTN: {
      summer: 'Every 3 to 4 days. When thirsty, the plant dramatically droops its entire foliage.',
      monsoon: 'Every 6 to 8 days, when top 1.5 inches feel dry.',
      winter: 'Every 5 to 7 days.',
    },
    idealSoilMix: 'Rich Moisture-Retentive Mix: 45% coco peat, 25% perlite, 20% vermicompost, 10% leaf mold.',
    humidityNeed: 'High (70-90%)',
    fertilizerNeeds: 'High-phosphorus organic liquid feed once a month to encourage white spathe blooms.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Aphids on tender blooms', 'Mealybugs', 'Spider mites'],
    vulnerabilities: ['Black crispy leaf tips from fluoride/salts in tap water', 'Root suffocation if pot tray stays full of water'],
    climateNote: 'Natural fit for tropical Kerala climate. Use filtered or rested tap water to prevent tip necrosis.',
    nurseryTips: [
      'Water immediately as soon as initial soft drooping occurs; it rebounds within 2-3 hours.',
      'Cut off spent fading green flower spikes at the soil line to stimulate new blooms.',
    ],
  },
  fiddleleaf: {
    commonName: 'Fiddle Leaf Fig',
    botanicalName: 'Ficus lyrata',
    family: 'Moraceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '3,000 - 5,000 Lux (loves bright morning sun filtered through sheer curtains)',
    wateringScheduleKeralaTN: {
      summer: 'Every 4 to 6 days when top 2-3 inches are dry.',
      monsoon: 'Every 8 to 12 days. Highly sensitive to soggy root conditions during rainy spells.',
      winter: 'Every 7 to 10 days.',
    },
    idealSoilMix: 'Well-Aerated Loam: 40% coco peat, 30% perlite, 20% vermicompost, 10% biochar.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Balanced 20-20-20 water-soluble organic feed every 30 days during active spring/summer flushes.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Spider mites', 'Thrips', 'Bacterial leaf spot'],
    vulnerabilities: ['Edema (reddish-brown specks on new leaves from erratic watering)', 'Sudden leaf dropping if moved between different light zones', 'Dark brown spots on leaf margins from root rot'],
    climateNote: 'Requires a stationary permanent spot. Avoid drafty AC vents or fluctuating wind paths.',
    nurseryTips: [
      'Dust large violin leaves every 2 weeks using a damp microfiber cloth to boost photosynthesis.',
      'Rotate the pot 90 degrees every month so all sides receive balanced light and grow upright.',
    ],
  },
  rubberplant: {
    commonName: 'Rubber Plant (Burgundy / Tineke)',
    botanicalName: 'Ficus elastica',
    family: 'Moraceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '2,500 - 4,500 Lux (tolerates 1-2 hours of gentle morning sun)',
    wateringScheduleKeralaTN: {
      summer: 'Every 5 to 7 days.',
      monsoon: 'Every 10 to 14 days.',
      winter: 'Every 7 to 10 days.',
    },
    idealSoilMix: '50% coco peat, 25% perlite, 15% vermicompost, 10% river sand.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Organic neem cake powder top-dressing + vermicompost every 45 days.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Scale insects along midrib', 'Mealybugs'],
    vulnerabilities: ['Yellowing and dropping of lower mature leaves from wet soil', 'Dull fading color when kept in deep shade'],
    climateNote: 'Robust grower in South Indian climates. Burgundy foliage turns rich deep purple with ample bright light.',
    nurseryTips: [
      'Wipe leaves with diluted neem emulsion to maintain high gloss and discourage foliar pests.',
    ],
  },
  arecapalm: {
    commonName: 'Areca Palm (Golden Cane Palm)',
    botanicalName: 'Dypsis lutescens',
    family: 'Arecaceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '2,000 - 4,000 Lux (filtered outdoor shade or bright indoor living rooms)',
    wateringScheduleKeralaTN: {
      summer: 'Every 3 to 4 days, keeping root zone consistently moist but never soggy.',
      monsoon: 'Every 6 to 8 days. Ensure container drainage is clear.',
      winter: 'Every 5 to 7 days.',
    },
    idealSoilMix: '45% coco peat, 25% coarse river sand, 20% vermicompost, 10% perlite.',
    humidityNeed: 'High (70-90%)',
    fertilizerNeeds: 'Epsom salts (1 tsp per liter) every 2 months to prevent magnesium deficiency tip burn + organic vermicompost.',
    petSafe: true, // Non-toxic to cats and dogs!
    airPurifying: true,
    commonPests: ['Spider mites in dry AC environments', 'Whiteflies'],
    vulnerabilities: ['Brown frizzy leaf tips from dry air or municipal tap water salts', 'Yellow fronds from nutrient deficiency'],
    climateNote: 'Native to Madagascar, excels in Kerala and coastal South India. Spectacular indoor humidifying capability.',
    nurseryTips: [
      'Trim fully brown fronds at the base of the cane using clean shears.',
      'Mist fronds in dry summer afternoons if kept in air-conditioned living rooms.',
    ],
  },
  aglaonema: {
    commonName: 'Aglaonema (Chinese Evergreen / Lipstick / Red Valentine)',
    botanicalName: 'Aglaonema commutatum',
    family: 'Araceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '800 - 2,500 Lux (green varieties tolerate low light; pink/red varieties need medium-bright indirect light)',
    wateringScheduleKeralaTN: {
      summer: 'Every 5 to 7 days when top 2 inches dry out.',
      monsoon: 'Every 10 to 14 days. Avoid overhead watering to prevent bacterial petiole rot.',
      winter: 'Every 7 to 10 days.',
    },
    idealSoilMix: 'Chunky Aroid Mix: 40% coco chips, 30% coco peat, 20% perlite, 10% vermicompost.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Dilute balanced organic liquid feed every 45 days.',
    petSafe: false,
    airPurifying: true,
    commonPests: ['Mealybugs in leaf sheaths', 'Fungus gnats'],
    vulnerabilities: ['Mushy yellow stem rot from overwatering in winter/monsoon', 'Fading red/pink coloration in deep shade'],
    climateNote: 'Superb performer across Kerala and Tamil Nadu. One of the easiest colorful tropical houseplants.',
    nurseryTips: [
      'Water directly into the potting medium; avoid splashing water into the center of the leafy sheath.',
    ],
  },
  calathea: {
    commonName: 'Calathea / Prayer Plant',
    botanicalName: 'Goeppertia (Calathea) spp.',
    family: 'Marantaceae',
    lightRequirement: 'Bright Indirect',
    lightLux: '1,000 - 2,500 Lux (gentle diffused light; direct sun curls and bleaches patterns immediately)',
    wateringScheduleKeralaTN: {
      summer: 'Every 3 to 4 days. Keep potting soil evenly damp like a wrung-out sponge.',
      monsoon: 'Every 5 to 7 days.',
      winter: 'Every 4 to 6 days.',
    },
    idealSoilMix: '45% coco peat, 25% perlite, 20% vermicompost, 10% leaf mold (pH 6.0-6.5).',
    humidityNeed: 'High (70-90%)',
    fertilizerNeeds: 'Very gentle 1/4 strength organic kelp extract once every 4 weeks.',
    petSafe: true, // Pet-friendly!
    airPurifying: true,
    commonPests: ['Spider mites', 'Fungus gnats'],
    vulnerabilities: ['Leaf curling and crispy edges from low humidity or hard tap water', 'Root rot if soil is compacted'],
    climateNote: 'Natural affinity for high Kerala monsoon humidity. Loves rainwater or rested water.',
    nurseryTips: [
      'Leaves pray upright at night and spread flat by day. If leaves curl inward during the day, it is thirsty or in direct sun.',
    ],
  },
  hibiscus: {
    commonName: 'Tropical Hibiscus (Chembarathi / Gudhal)',
    botanicalName: 'Hibiscus rosa-sinensis',
    family: 'Malvaceae',
    lightRequirement: 'Direct Sun',
    lightLux: '10,000+ Lux (minimum 5-6 hours of unfiltered direct sun for profuse blooming)',
    wateringScheduleKeralaTN: {
      summer: 'Daily or twice daily during intense hot spells (topsoil dries rapidly in containers).',
      monsoon: 'Every 2 to 3 days depending on rainfall. Ensure instant container drainage.',
      winter: 'Every 2 to 4 days.',
    },
    idealSoilMix: 'Rich Garden Loam: 40% red garden soil, 30% vermicompost/cow manure, 20% coco peat, 10% sand.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Heavy feeder: High potassium organic manure (banana peel tea, wood ash, bone meal) every 2 weeks.',
    petSafe: true,
    airPurifying: false,
    commonPests: ['Mealybugs on flower buds', 'Whiteflies', 'Aphids on tender shoot tips'],
    vulnerabilities: ['Bud drop from erratic moisture or sudden pest attack', 'Yellowing leaves from lack of nitrogen or overwatering'],
    climateNote: 'Iconic South Indian flowering shrub. Continuous vibrant blooms year-round under full tropical sun.',
    nurseryTips: [
      'Prune aggressively in late monsoon to encourage bushy growth and maximize upcoming flower clusters.',
      'Spray organic neem emulsion every 10 days to keep flower buds free from mealybug clusters.',
    ],
  },
  jasmine: {
    commonName: 'Arabian Jasmine (Mogra / Gundumalli / Mulla)',
    botanicalName: 'Jasminum sambac',
    family: 'Oleaceae',
    lightRequirement: 'Direct Sun',
    lightLux: '8,000 - 15,000 Lux (4-6 hours direct sun essential for intense floral fragrance)',
    wateringScheduleKeralaTN: {
      summer: 'Daily morning watering.',
      monsoon: 'Only when topsoil is dry. Waterlogging stops flower bud formation.',
      winter: 'Every 2 to 3 days.',
    },
    idealSoilMix: '40% loamy soil, 30% decomposed cow dung/vermicompost, 20% coco peat, 10% river sand.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Mustard cake drench or vermicompost + bone meal every 15 days before flowering flushes.',
    petSafe: true,
    airPurifying: false,
    commonPests: ['Caterpillars eating tender buds', 'Spider mites in dry weather'],
    vulnerabilities: ['No flowers if kept in partial shade', 'Leaf spot in unventilated damp spots'],
    climateNote: 'Thrives across Tamil Nadu and Kerala. Pruning after each harvest wave stimulates new flower-bearing shoots.',
    nurseryTips: [
      'Withhold watering slightly for 2-3 days before flower bud formation, then fertilize and water deeply.',
    ],
  },
  tulsi: {
    commonName: 'Holy Basil (Krishna / Rama Tulsi)',
    botanicalName: 'Ocimum tenuiflorum / sanctum',
    family: 'Lamiaceae',
    lightRequirement: 'Direct Sun',
    lightLux: '6,000 - 12,000 Lux (bright sunny balcony or courtyard, 4-6 hours sun)',
    wateringScheduleKeralaTN: {
      summer: 'Daily or every morning.',
      monsoon: 'Every 2 to 4 days. Excess water causes root rot and leaf drop in monsoon.',
      winter: 'Every 2 to 3 days.',
    },
    idealSoilMix: '50% garden soil, 30% vermicompost, 20% sand/perlite (needs sharp drainage).',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Compost tea or cow dung slurry once a month. No chemical fertilizers needed.',
    petSafe: true,
    airPurifying: true,
    commonPests: ['Aphids', 'Whiteflies', 'Powdery mildew in stagnant humid air'],
    vulnerabilities: ['Root rot from waterlogging', 'Leggy woody stems if flower spikes (Manjari) are not pinched'],
    climateNote: 'Revered Ayurvedic herb in every Kerala household. Pinch flower spikes regularly to prolong vitality.',
    nurseryTips: [
      'Pinch off flower spikes as soon as they appear to keep foliage bushy, aromatic, and vegetative.',
    ],
  },
  curryleaf: {
    commonName: 'Curry Leaf Plant (Kariveppila / Kadi Patta)',
    botanicalName: 'Murraya koenigii',
    family: 'Rutaceae',
    lightRequirement: 'Direct Sun',
    lightLux: '8,000+ Lux (needs minimum 4-6 hours direct sun to generate aromatic essential oils)',
    wateringScheduleKeralaTN: {
      summer: 'Every 1 to 2 days in containers, saturating completely.',
      monsoon: 'Every 4 to 6 days. Avoid water stagnant around roots.',
      winter: 'Every 2 to 3 days.',
    },
    idealSoilMix: 'Slightly Acidic Loam: 40% red garden soil, 30% vermicompost, 20% coco peat, 10% coarse sand.',
    humidityNeed: 'Moderate (50-65%)',
    fertilizerNeeds: 'Sour curd / buttermilk diluted in water (1:10) once a month; Epsom salt (1 tsp/month) for rich green chlorophyll.',
    petSafe: true,
    airPurifying: false,
    commonPests: ['Psyllids causing leaf curl', 'Scales', 'Swallowtail butterfly caterpillars (Papilio demoleus)'],
    vulnerabilities: ['Pale yellow leaves (Iron/Nitrogen deficiency)', 'Stunted growth in alkaline or clayey heavy soil'],
    climateNote: 'Flourishes outdoors in Kerala and Tamil Nadu. Prune mature stems to harvest leaves, which triggers multi-branching.',
    nurseryTips: [
      'Drench soil with diluted sour buttermilk every 3-4 weeks to acidify the root zone and stimulate intense aroma.',
    ],
  },
};

// Quick species lookup helper
export function findBotanicalProfile(plantName: string): BotanicalProfile | null {
  if (!plantName) return null;
  const clean = plantName.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, profile] of Object.entries(BOTANICAL_DATABASE)) {
    if (
      clean.includes(key) ||
      profile.commonName.toLowerCase().includes(plantName.toLowerCase()) ||
      profile.botanicalName.toLowerCase().includes(plantName.toLowerCase())
    ) {
      return profile;
    }
  }

  // Common aliases
  if (clean.includes('moneyplant') || clean.includes('devilsivy') || clean.includes('epipremnum')) return BOTANICAL_DATABASE.pothos;
  if (clean.includes('sansevieria') || clean.includes('motherinlaw') || clean.includes('snake')) return BOTANICAL_DATABASE.snakeplant;
  if (clean.includes('zanzibar') || clean.includes('zamioculcas') || clean.includes('zz')) return BOTANICAL_DATABASE.zzplant;
  if (clean.includes('spathiphyllum') || clean.includes('peace')) return BOTANICAL_DATABASE.peacelily;
  if (clean.includes('lyrata') || clean.includes('fiddle')) return BOTANICAL_DATABASE.fiddleleaf;
  if (clean.includes('elastica') || clean.includes('rubber') || clean.includes('burgundy')) return BOTANICAL_DATABASE.rubberplant;
  if (clean.includes('dypsis') || clean.includes('areca') || clean.includes('cane')) return BOTANICAL_DATABASE.arecapalm;
  if (clean.includes('chineseevergreen') || clean.includes('aglao') || clean.includes('valentine')) return BOTANICAL_DATABASE.aglaonema;
  if (clean.includes('prayer') || clean.includes('calathea') || clean.includes('maranta')) return BOTANICAL_DATABASE.calathea;
  if (clean.includes('chembarathi') || clean.includes('gudhal') || clean.includes('hibiscus')) return BOTANICAL_DATABASE.hibiscus;
  if (clean.includes('mogra') || clean.includes('mulla') || clean.includes('jasmine') || clean.includes('malli')) return BOTANICAL_DATABASE.jasmine;
  if (clean.includes('basil') || clean.includes('tulasi') || clean.includes('tulsi')) return BOTANICAL_DATABASE.tulsi;
  if (clean.includes('karivep') || clean.includes('curry') || clean.includes('kadipatta')) return BOTANICAL_DATABASE.curryleaf;

  return null;
}

// In-memory query cache for sub-millisecond responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class BotanicalCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxItems = 150;
  private ttlMs = 1000 * 60 * 60 * 6; // 6 hours

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  set<T>(key: string, data: T): void {
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export const botanicalCache = new BotanicalCache();

// Instant botanical diagnostic rule engine (accurate fallback + caching)
export function analyzeBotanicalSymptoms(
  plantName: string,
  symptoms: string,
  environment: string
) {
  const profile = findBotanicalProfile(plantName);
  const s = (symptoms || '').toLowerCase();
  const env = (environment || 'indoor').toLowerCase();
  const p = profile ? profile.commonName : plantName || 'Tropical Houseplant';

  // 1. Pest / Insect / Fungal spore identification
  if (s.includes('pest') || s.includes('mealy') || s.includes('bug') || s.includes('mite') || s.includes('white') || s.includes('web') || s.includes('scale') || s.includes('mold') || s.includes('spot')) {
    const isMealybug = s.includes('white') || s.includes('mealy') || s.includes('cotton');
    const isMite = s.includes('web') || s.includes('mite') || s.includes('speck');
    const isFungal = s.includes('mold') || s.includes('spot') || s.includes('black');

    let specificCause = 'Foliar pest colonization favored by warm tropical humidity.';
    let problem = `Pest Infestation on ${p}`;
    let urgency: 'High' | 'Medium' = 'High';

    if (isMealybug) {
      problem = `Mealybug Infestation (Pseudococcidae) on ${p}`;
      specificCause = 'Sap-sucking mealybugs nesting in leaf axils, excreting sticky honeydew that attracts sooty mold.';
    } else if (isMite) {
      problem = `Spider Mite Outbreak (Tetranychidae) on ${p}`;
      specificCause = 'Microscopic spider mites multiplying in dry indoor air or air-conditioned rooms, piercing leaf cells.';
    } else if (isFungal) {
      problem = `Fungal Leaf Spot / Spore Blight on ${p}`;
      specificCause = 'Fungal pathogens (Alternaria or Cercospora) triggered by overhead watering and poor air ventilation.';
    }

    return {
      diagnosis: {
        problem,
        cause: specificCause,
        urgency,
        actionPlan: [
          'Isolate the affected plant immediately from other nursery specimens to prevent pest migration.',
          'Prepare an organic horticultural spray: Mix 5ml cold-pressed Neem Oil + 2ml mild liquid soap in 1 liter of lukewarm water.',
          'Wipe down both upper and under sides of all leaves with a soft microfiber cloth soaked in the neem emulsion.',
          'Prune heavily infected or black-spotted leaves using sterilized pruning shears and dispose away from garden soil.',
          'Increase room ventilation by keeping windows cracked or using a gentle oscillating fan to stop spore germination.',
        ],
        preventativeTips: `Under Kerala & Tamil Nadu conditions, apply a preventative neem spray twice a month and inspect leaf axils weekly. ${profile ? profile.climateNote : ''}`,
      },
    };
  }

  // 2. Overwatering & Root Zone Suffocation (Very common in humid climates)
  if (s.includes('yellow') || s.includes('foul') || s.includes('smell') || s.includes('wet') || s.includes('rot') || s.includes('droop') || s.includes('mushy')) {
    return {
      diagnosis: {
        problem: `Overwatering & Root Hypoxia Stress in ${p}`,
        cause: `Potting medium saturation without adequate dry-down period, leading to oxygen starvation in roots. ${profile ? `Note for ${profile.commonName}: In South India, water during monsoon only every ${profile.wateringScheduleKeralaTN.monsoon}.` : ''}`,
        urgency: 'High' as const,
        actionPlan: [
          'Immediately remove excess water from the drainage saucer; never let the nursery pot stand in stagnant water.',
          'Gently aerate the top 2 inches of potting mix using a clean wooden skewer to restore root zone oxygenation.',
          'Hold off all irrigation until the top 2-3 inches of soil feel completely dry to touch.',
          'Relocate the plant to a brighter location with filtered, indirect morning sunlight to stimulate healthy transpiration.',
          'If stems feel mushy at the base, unpot the plant, trim away brown rotten roots, and repot in a porous aroid mix.',
        ],
        preventativeTips: `Always follow the "2-Inch Soil Finger Test" before watering. In Kerala monsoons, reduce watering by 50-60% as ambient air maintains 80%+ relative humidity.`,
      },
    };
  }

  // 3. Dehydration, Sun Scorch or Low Humidity
  if (s.includes('crisp') || s.includes('brown tip') || s.includes('dry') || s.includes('curl') || s.includes('scorch') || s.includes('burn')) {
    return {
      diagnosis: {
        problem: `Transpiration Deficit & Moisture Scarcity in ${p}`,
        cause: `Low ambient humidity (often caused by air conditioners or dry summer heat) or salt buildup from hard tap water scorching leaf margins.`,
        urgency: 'Medium' as const,
        actionPlan: [
          'Perform a deep bottom-soaking: Place the container in 2-3 inches of clean water for 25 minutes until topsoil is evenly damp.',
          'Carefully snip away brittle brown leaf tips with clean shears, leaving a tiny 1mm brown border so healthy tissue is not wounded.',
          'Move the plant away from direct air conditioning blast vents or harsh afternoon sun.',
          'Group tropical plants together to form a natural high-humidity microclimate, or place pot on a pebble water tray.',
        ],
        preventativeTips: `Use rested tap water or rainwater to avoid fluoride tip scorch. For ${p}, ideal humidity is ${profile ? profile.humidityNeed : '60-80%'}.`,
      },
    };
  }

  // 4. General Acclimatization / Nutrient Deficiency
  return {
    diagnosis: {
      problem: `Environmental Acclimatization & Nutrient Imbalance in ${p}`,
      cause: `Transition stress from moving between nursery greenhouse and home environment, combined with seasonal micronutrient depletion in container mix.`,
      urgency: 'Medium' as const,
      actionPlan: [
        'Place in a permanent spot with bright indirect light (2,000 - 3,500 Lux) and avoid frequent location changes.',
        'Top-dress the container with 2 handfuls of organic vermicompost or apply a mild seaweed liquid drench.',
        'Ensure the pot has at least 3 unobstructed drainage holes to facilitate free water drainage.',
        'Wipe foliage gently with a damp cotton pad to remove dust and maximize light absorption.',
      ],
      preventativeTips: `Feed with organic balanced nutrients once every 30-45 days. ${profile ? profile.fertilizerNeeds : 'Apply organic seaweed extract monthly.'}`,
    },
  };
}
