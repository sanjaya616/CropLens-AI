import { ConditionId, VerifiedGuidance, DatasetSample } from '../types';

export const GEMINI_MODEL = 'gemini-3.8-flash';

export const SRI_LANKA_TEA_DISTRICTS = [
  'Nuwara Eliya (Up-Country High Grown)',
  'Badulla / Bandarawela (Uva Province)',
  'Kandy (Mid-Country)',
  'Matale (Central Province)',
  'Ratnapura (Sabaragamuwa Low-Country)',
  'Kegalle (Sabaragamuwa)',
  'Galle (Southern Low-Country)',
  'Matara (Southern Low-Country)',
  'Kalutara (Western Province)',
  'Kurunegala (North Western)',
  'Monaragala (Uva Province)',
];

export const PLANT_STAGES = [
  { value: 'NOT_SPECIFIED', label: 'Not specified' },
  { value: 'NURSERY', label: 'Nursery / Cutting' },
  { value: 'YOUNG_TEA', label: 'Young Tea (< 3 years)' },
  { value: 'MATURE_BUSH', label: 'Mature Bush (In plucking)' },
  { value: 'PRUNED_BUSH', label: 'Pruned / Recovering Bush' },
];

export const WEATHER_CONDITIONS = [
  'Not known / Not specified',
  'Continuous Monsoon Rain / Heavy Dew',
  'Mist / Extended High Humidity (> 85%)',
  'Intermittent Sun and Rain',
  'Dry and Sunny Weather',
  'High Winds / Cold Elevation Exposure',
];

export const OFFICIAL_TRI_SOURCES = {
  HOME: 'https://www.tri.lk/',
  PATHOLOGY: 'https://www.tri.lk/plant-pathology/',
  ENTOMOLOGY: 'https://www.tri.lk/entomology-and-nematology/',
  ADVISORY_TEL: '+94 52 225 8211',
  ADVISORY_EMAIL: 'director@tri.lk',
  TALAWAKELLE_HQ: 'Tea Research Institute of Sri Lanka, St. Coombs, Talawakelle, Sri Lanka',
  RATNAPURA_STATION: 'Low Country Regional Centre, Ratnapura, Sri Lanka',
};

// All initial conditions are marked PENDING_REVIEW per Priority 6.
// They require administrator review and approval before being marked APPROVED.
export const VERIFIED_CONDITIONS_CATALOG: Record<ConditionId, VerifiedGuidance> = {
  ALGAL_LEAF_SPOT: {
    conditionId: 'ALGAL_LEAF_SPOT',
    name: 'Algal Leaf Spot',
    category: 'disease',
    scientificName: 'Cephaleuros virescens (Algal pathogen)',
    visibleSymptoms: [
      'Circular, slightly raised orange-brown to reddish velvety spots on the upper leaf surface',
      'Margins of spots often appear fuzzy due to projecting algal filaments during wet periods',
      'Older spots turn dull grayish-green or dark brown with slight crusting',
      'Predominantly targets older, shaded mature leaves and weakened bushes',
    ],
    additionalInformation:
      'Unlike fungal diseases, Algal Leaf Spot is caused by a parasitic green alga (Cephaleuros virescens) that enters leaf tissue during humid, cloudy monsoon periods. It flourishes in poorly aerated canopies and impoverished soils.',
    monitoringGuidance: [
      'Inspect lower canopy and shaded branches during the South-West and North-East monsoon periods',
      'Check whether the spots wipe off easily or form embedded raised velvety disks',
      'Assess bush vigor and shade tree density; excessive shade directly accelerates algal spore germination',
    ],
    preventionInformation: [
      'Maintain adequate canopy aeration through regulated shade tree pruning (e.g., Erythrina and Gliricidia)',
      'Ensure balanced soil nutrition, avoiding potassium and zinc deficiencies which weaken the leaf cuticle',
      'Prune severely infested lower foliage during regular field sanitary rounds',
      'Consult regional Tea Research Institute advisory officers before applying any prophylactic sprays',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Plant Pathology Division (Foliar Diseases)',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.PATHOLOGY,
    publicationDate: '2023',
    lastReviewed: '2025-01-15',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  BLACK_BLIGHT: {
    conditionId: 'BLACK_BLIGHT',
    name: 'Black Blight (Black Rot)',
    category: 'disease',
    scientificName: 'Corticium theae / Corticium invisum',
    visibleSymptoms: [
      'Dark brown to pitch-black necrotic patches appearing on mature leaves and young stems',
      'Diseased leaves frequently turn blackened, dry, and remain suspended by fine fungal web threads',
      'Visible white to brownish mycelial cords or thin fungal sheets extending along petioles and twigs',
      'Rapid spreading among touching leaves under continuous mist and rain',
    ],
    additionalInformation:
      'Black Blight is an aggressive foliar fungal infection occurring predominantly in high-rainfall tea planting zones. The fungal hyphae bind dead leaves to live stems, allowing the pathogen to persist through dry spells.',
    monitoringGuidance: [
      'Regularly scout interior bush canopies where dead leaves linger after rainfall',
      'Differentiate from Blister Blight by the dark brown/black appearance and the presence of fungal strands on petioles',
      'Record the cluster count of affected contiguous bushes in the field',
    ],
    preventionInformation: [
      'Carefully collect and remove dead blackened leaves clinging to stems during field sanitation',
      'Prune low hanging and dense intertwining branches to promote rapid morning drying of the canopy',
      'Regulate high shade trees to improve air circulation across tea rows',
      'Follow certified TRI advisory circulars for approved management schedules in epidemic zones',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Plant Pathology Division (Canopy & Stem Blights)',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.PATHOLOGY,
    publicationDate: '2023',
    lastReviewed: '2025-01-15',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  BLISTER_BLIGHT: {
    conditionId: 'BLISTER_BLIGHT',
    name: 'Blister Blight',
    category: 'disease',
    scientificName: 'Exobasidium vexans',
    visibleSymptoms: [
      'Small, circular, translucent, pale yellow or light green spots on young succulent leaves and buds',
      'Within 7-10 days, the spot depresses on the upper surface and bulges on the lower surface forming a distinct "blister"',
      'Underside of the blister becomes chalky white due to millions of basidiospores',
      'Severe infection causes young shoots to curl, blacken, collapse, and die back',
    ],
    additionalInformation:
      'Blister Blight is the most economically significant foliar fungal disease of tea in Sri Lanka. It exclusively attacks tender succulent harvestable shoots (bud, first and second leaf) during overcast, misty monsoon periods with less than 4 hours of daily sunshine.',
    monitoringGuidance: [
      'Daily monitoring of tender harvestable flush during monsoon months (South-West: May-Sept, North-East: Oct-Jan)',
      'Inspect the reverse side of young leaves for chalky white spore powder',
      'Pay special attention to recently pruned recovery fields and young nurseries',
    ],
    preventionInformation: [
      'Maintain strict 7 to 8-day plucking rounds to remove susceptible young flush before blisters mature and sporulate',
      'Prune tea bushes during dry weather periods so bud break coincides with sunny months',
      'Regulate upper shade canopy to ensure tea leaves dry within 2 hours of sunrise',
      'Refer to TRI Circular P-02 for official blister forecast models and approved prophylactic schedules',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Plant Pathology Advisory Circulars (Blister Blight)',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.PATHOLOGY,
    publicationDate: '2024',
    lastReviewed: '2025-02-10',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  GRAY_BLIGHT: {
    conditionId: 'GRAY_BLIGHT',
    name: 'Gray Blight',
    category: 'disease',
    scientificName: 'Pestalotiopsis theae (Teleomorph: Pestalotia theae)',
    visibleSymptoms: [
      'Concentric oval or irregular grayish-white patches on mature leaves with dark brown borders',
      'Distinct concentric rings ("target board" appearance) on the upper leaf surface',
      'Tiny black pinpoint dots (acervuli/spore masses) scattered across the center of older gray lesions',
      'Often initiates from leaf margins or mechanical plucking injury points',
    ],
    additionalInformation:
      'Gray Blight is a wound-parasite fungal disease. It enters through mechanical wounds, plucking injuries, hail damage, or sunburned leaf edges. While typically secondary, it can cause severe premature leaf drop in weakened bushes.',
    monitoringGuidance: [
      'Check mature leaves and maintenance foliage for concentric gray patches with dark borders',
      'Use a 10x hand lens to verify black acervuli dots in the grayish necrotic area',
      'Evaluate whether plucking shear damage or sun scorch preceded the symptom onset',
    ],
    preventionInformation: [
      'Handle tea bushes gently during mechanical harvesting and manual plucking to minimize leaf tearing',
      'Maintain adequate maintenance leaf cover to shade internal branches from sun scorch',
      'Ensure balanced potash (muriate of potash) fertilization to enhance leaf cuticle thickness',
      'Collect and bury heavily fallen blight foliage during field weeding operations',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Plant Pathology Division (Wound & Foliar Blights)',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.PATHOLOGY,
    publicationDate: '2023',
    lastReviewed: '2025-01-20',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  SPIDER_MITES: {
    conditionId: 'SPIDER_MITES',
    name: 'Spider Mites (Red Spider & Scarlet Mite)',
    category: 'pest', // STRICT REQUIREMENT: Pest, not a disease!
    scientificName: 'Oligonychus coffeae (Red Spider) / Brevipalpus californicus (Scarlet Mite)',
    visibleSymptoms: [
      'Bronze, rusty, or coppery discoloration appearing along the midrib and upper surface of mature leaves',
      'Leaves lose their glossy green appearance, turning dull, leathery, and dry',
      'Fine silken webbing on the leaf surface trapping dust and minute reddish mite bodies',
      'Severe feeding infestation leads to extensive premature defoliation and bush debility',
    ],
    additionalInformation:
      'IMPORTANT: Spider Mites are arachnid PESTS, NOT A FUNGAL OR BACTERIAL DISEASE. They puncture epidermal cells with piercing mouthparts and suck plant sap. Mite populations spike rapidly during prolonged dry, warm, and dusty periods (January-April in Uva, July-September in Western districts).',
    monitoringGuidance: [
      'Examine the upper surface of mature leaves along the main vein using a pocket 10x-20x hand lens',
      'Tap suspect leaves over a white sheet of paper to observe moving reddish or scarlet specks',
      'Monitor roadside tea bushes and dry ridge tops where dust accumulation fosters rapid mite reproduction',
    ],
    preventionInformation: [
      'Conserve natural predators such as predatory phytoseiid mites, ladybird beetles, and stethorus beetles',
      'Avoid unauthorized broad-spectrum synthetic pyrethroid insecticides which wipe out natural mite predators',
      'Pave or wet dusty estate road sections adjoining tea fields to suppress dust deposits on leaves',
      'During drought spells, maintain bush hydration and consult TRI Entomology division for approved selective options',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Entomology & Nematology Division (Mite Pest Management)',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.ENTOMOLOGY,
    publicationDate: '2024',
    lastReviewed: '2025-02-15',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  HEALTHY: {
    conditionId: 'HEALTHY',
    name: 'Healthy Tea Leaf',
    category: 'healthy',
    scientificName: 'Camellia sinensis (L.) Kuntze',
    visibleSymptoms: [
      'Uniform vibrant deep green to medium green coloration across the entire leaf blade',
      'Glossy, smooth, intact cuticle with prominent serrated margins characteristic of tea foliage',
      'Complete absence of fungal blisters, necrotic rings, chlorotic lesions, or velvety algal spots',
      'Clean leaf surface free from mite webbing, rusting, or necrotic margins',
    ],
    additionalInformation:
      'The leaf exhibits normal physiological vigor and morphology consistent with well-nourished, disease-free Camellia sinensis. Good agronomic maintenance supports active photosynthesis and strong flush generation.',
    monitoringGuidance: [
      'Continue standard weekly plucking cycles (two leaves and a bud)',
      'Regularly scout field boundaries for early warning signs of season-specific foliar pests or fungal blights',
      'Maintain standard soil pH testing (target pH 4.5 - 5.5 for optimal tea growth in Sri Lanka)',
    ],
    preventionInformation: [
      'Follow recommended TRI T-65 or balanced VP fertilizer mixtures based on soil testing',
      'Maintain clean weeding without damaging bush collar bark',
      'Ensure proper drainage channels to prevent waterlogging during monsoon downpours',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Agronomy and Bush Physiology Guidelines',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.HOME,
    publicationDate: '2024',
    lastReviewed: '2025-01-10',
    reviewStatus: 'pending_review', // Strictly PENDING_REVIEW until approved
  },

  UNKNOWN: {
    conditionId: 'UNKNOWN',
    name: 'Uncertain / Inconclusive Symptoms',
    category: 'unclear',
    scientificName: 'Inconclusive / Mixed Etiology',
    visibleSymptoms: [
      'Visible leaf markings do not distinctly match the specific diagnostic patterns of the 6 tea conditions',
      'Potential mechanical damage, fertilizer burn, insect chewing, or abiotic stress marks',
      'Overlapping atypical symptoms preventing safe single-category identification',
    ],
    additionalInformation:
      'Preliminary AI screening cannot conclusively categorize the condition without physical laboratory examination. Multiple abiotic or biotic factors can create non-specific foliar necrosis.',
    monitoringGuidance: [
      'Observe adjacent bushes in the same field block to see if pattern repeats',
      'Check if symptom is localized to solitary leaves or widespread across branches',
      'Collect sample specimens for examination by local tea estate agricultural extension officers',
    ],
    preventionInformation: [
      'Do not apply chemical products speculatively without positive identification',
      'Monitor field changes over the next 5-7 days and re-photograph if symptoms evolve',
      'Contact the nearest Tea Research Institute advisory extension office',
    ],
    officialSourceTitle: 'TRI Sri Lanka - Advisory & Extension Services',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.HOME,
    lastReviewed: '2025-01-01',
    reviewStatus: 'pending_review',
  },

  NOT_TEA: {
    conditionId: 'NOT_TEA',
    name: 'Non-Tea Specimen Detected',
    category: 'unclear',
    scientificName: 'Non-Camellia Plant',
    visibleSymptoms: [
      'Leaf morphology, venation, or margins do not correspond to Camellia sinensis (tea)',
      'Vegetation shown belongs to an unsupported crop, weed, or ornamental plant',
    ],
    additionalInformation:
      'CropLens AI Version 1 is strictly specialized for Sri Lankan tea leaves (Camellia sinensis). Analysis of other crops (rice, coconut, rubber, cinnamon, vegetables) is intentionally not supported in this version.',
    monitoringGuidance: [
      'Please upload a photograph showing exclusively tea bush leaves or flush',
      'Ensure the tea leaf blade, margins, and petiole are clearly visible in the frame',
    ],
    preventionInformation: [
      'Use the application exclusively for tea plantation management',
    ],
    officialSourceTitle: 'CropLens AI - Crop Scope Policy',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.HOME,
    lastReviewed: '2025-01-01',
    reviewStatus: 'pending_review',
  },

  POOR_IMAGE: {
    conditionId: 'POOR_IMAGE',
    name: 'Unusable Photograph Quality',
    category: 'unclear',
    scientificName: 'N/A',
    visibleSymptoms: [
      'Photograph is blurry, out of focus, or taken from too great a distance',
      'Severe backlighting, harsh shadows, or washed-out flash glare obscures leaf details',
      'Subject is obscured by background clutter or fingers covering affected zones',
    ],
    additionalInformation:
      'High-quality visual details are mandatory for preliminary screening. Small fungal blisters, algal filaments, and minute mite signs cannot be identified from low-fidelity or out-of-focus imagery.',
    monitoringGuidance: [
      'Please re-photograph the tea leaf in natural diffuse daylight',
      'Hold the smartphone steady approximately 15-25 cm from the leaf surface',
      'Use a plain neutral background such as your hand palm or a clean white sheet behind the leaf',
    ],
    preventionInformation: [
      'Review the CropLens AI Photographing Guide before submitting a new assessment',
    ],
    officialSourceTitle: 'CropLens AI - Quality Standards',
    officialSourceUrl: OFFICIAL_TRI_SOURCES.HOME,
    lastReviewed: '2025-01-01',
    reviewStatus: 'pending_review',
  },
};

// Priority 7: Misleading Unsplash sample URLs removed.
// Local dataset binary files must be provided from Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0).
export const HAS_LOCAL_DATASET_IMAGES = false;

export const DATASET_EVALUATION_SAMPLES: DatasetSample[] = [
  {
    id: 'smp-blister-01',
    groundTruthLabel: 'BLISTER_BLIGHT',
    commonName: 'Blister Blight (Exobasidium vexans)',
    category: 'disease',
    scientificName: 'Exobasidium vexans',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Tender young tea leaf exhibiting typical translucent bulging blisters with white sporulating under-surface.',
  },
  {
    id: 'smp-gray-01',
    groundTruthLabel: 'GRAY_BLIGHT',
    commonName: 'Gray Blight (Pestalotiopsis theae)',
    category: 'disease',
    scientificName: 'Pestalotiopsis theae',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Mature tea leaf displaying concentric circular gray patches with distinct dark margins and tiny pinpoint spore dots.',
  },
  {
    id: 'smp-algal-01',
    groundTruthLabel: 'ALGAL_LEAF_SPOT',
    commonName: 'Algal Leaf Spot (Cephaleuros virescens)',
    category: 'disease',
    scientificName: 'Cephaleuros virescens',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Lower canopy mature foliage showing velvety circular orange-brown rust-like algal patches.',
  },
  {
    id: 'smp-mites-01',
    groundTruthLabel: 'SPIDER_MITES',
    commonName: 'Spider Mites (Oligonychus coffeae)',
    category: 'pest',
    scientificName: 'Oligonychus coffeae',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Bronze and coppery discolored tea leaf surface with micro-webbing along midrib caused by sap-sucking arachnid pests.',
  },
  {
    id: 'smp-black-01',
    groundTruthLabel: 'BLACK_BLIGHT',
    commonName: 'Black Blight (Corticium theae)',
    category: 'disease',
    scientificName: 'Corticium theae',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Dark blackened patch spreading across leaf blade with characteristic necrotic tissue drying.',
  },
  {
    id: 'smp-healthy-01',
    groundTruthLabel: 'HEALTHY',
    commonName: 'Healthy Tea Leaf (Camellia sinensis)',
    category: 'healthy',
    scientificName: 'Camellia sinensis',
    sourceDataset: 'Mendeley Sri Lankan Tea Leaf Dataset v5 (CC BY 4.0)',
    description: 'Vibrant, glossy, uniform green tea foliage with intact margins, free from foliar pathogens and mite damage.',
  },
];
