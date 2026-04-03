/** Diseases aligned with cauliflower_diseases & leaf_diseases (excludes Healthy / Fresh Leaf / inactive rows). */
export const marqueeDiseases = [
  { en: "Alternaria Leaf Spot", km: "អាល់ទែណារីយ៉ាអុចស្លឹក" },
  { en: "Anthracnose", km: "ជំងឺអង់ត្រាកណូស" },
  { en: "Bacterial Soft Rot", km: "បាក់តេរីរលួយទន់" },
  { en: "Black Rot", km: "រលួយខ្មៅ" },
  { en: "Damping Off", km: "ជំងឺរលាកគល់" },
  { en: "Downy Mildew", km: "ជំងឺអុចពណ៌លឿង" },
  { en: "Gummy Stem Blight", km: "ជំងឺរលាកចេញជ័រ" },
  { en: "Powdery Mildew", km: "ជំងឺអុចម៉្សៅពណ៌ស" },
] as const;

export const cucurbitFamily = [
  { name: "Cucumber", from: "from-green-400", to: "to-emerald-600", light: false, image: "/vegetable/cucumber_family/cucumber.png" },
  { name: "Watermelon", from: "from-rose-400", to: "to-red-500", light: false, image: "/vegetable/cucumber_family/watermelon.png" },
  { name: "Yellow Watermelon", from: "from-amber-300", to: "to-yellow-500", light: false, image: "/vegetable/cucumber_family/yellow_watermelon.png" },
  { name: "Wax Gourd", from: "from-slate-200", to: "to-slate-400", light: true, image: "/vegetable/cucumber_family/wax_Gourd.png" },
  { name: "Pumpkin", from: "from-orange-400", to: "to-orange-500", light: false, image: "/vegetable/cucumber_family/pumkin.png" },
  { name: "Squash", from: "from-yellow-400", to: "to-amber-500", light: false, image: "/vegetable/cucumber_family/squash.png" },
];

export const brassicaFamily = [
  { name: "Cauliflower", from: "from-stone-100", to: "to-stone-200", light: true, image: "/vegetable/cauliflower_family/cauliflower.jpg" },
  { name: "Broccoli", from: "from-green-500", to: "to-green-700", light: false, image: "/vegetable/cauliflower_family/brocoli.png" },
  { name: "Romanesco", from: "from-lime-400", to: "to-green-500", light: false, image: "/vegetable/cauliflower_family/romanesco.png" },
  { name: "Broccolini", from: "from-emerald-400", to: "to-emerald-600", light: false, image: "/vegetable/cauliflower_family/Broccolini.png" },
  { name: "Cabbage", from: "from-green-300", to: "to-green-500", light: false, image: "/vegetable/cauliflower_family/cabbage.png" },
];
