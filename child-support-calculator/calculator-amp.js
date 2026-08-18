/* Florida Statutes section 61.30 guideline schedule. Verified August 13, 2026. */
const GUIDELINE_ROWS = [
  [800, 190, 211, 213, 216, 218, 220],
  [850, 202, 257, 259, 262, 265, 268],
  [900, 213, 302, 305, 309, 312, 315],
  [950, 224, 347, 351, 355, 359, 363],
  [1000, 235, 365, 397, 402, 406, 410],
  [1050, 246, 382, 443, 448, 453, 458],
  [1100, 258, 400, 489, 495, 500, 505],
  [1150, 269, 417, 522, 541, 547, 553],
  [1200, 280, 435, 544, 588, 594, 600],
  [1250, 290, 451, 565, 634, 641, 648],
  [1300, 300, 467, 584, 659, 688, 695],
  [1350, 310, 482, 603, 681, 735, 743],
  [1400, 320, 498, 623, 702, 765, 790],
  [1450, 330, 513, 642, 724, 789, 838],
  [1500, 340, 529, 662, 746, 813, 869],
  [1550, 350, 544, 681, 768, 836, 895],
  [1600, 360, 560, 701, 790, 860, 920],
  [1650, 370, 575, 720, 812, 884, 945],
  [1700, 380, 591, 740, 833, 907, 971],
  [1750, 390, 606, 759, 855, 931, 996],
  [1800, 400, 622, 779, 877, 955, 1022],
  [1850, 410, 638, 798, 900, 979, 1048],
  [1900, 421, 654, 818, 923, 1004, 1074],
  [1950, 431, 670, 839, 946, 1029, 1101],
  [2000, 442, 686, 859, 968, 1054, 1128],
  [2050, 452, 702, 879, 991, 1079, 1154],
  [2100, 463, 718, 899, 1014, 1104, 1181],
  [2150, 473, 734, 919, 1037, 1129, 1207],
  [2200, 484, 751, 940, 1060, 1154, 1234],
  [2250, 494, 767, 960, 1082, 1179, 1261],
  [2300, 505, 783, 980, 1105, 1204, 1287],
  [2350, 515, 799, 1000, 1128, 1229, 1314],
  [2400, 526, 815, 1020, 1151, 1254, 1340],
  [2450, 536, 831, 1041, 1174, 1279, 1367],
  [2500, 547, 847, 1061, 1196, 1304, 1394],
  [2550, 557, 864, 1081, 1219, 1329, 1420],
  [2600, 568, 880, 1101, 1242, 1354, 1447],
  [2650, 578, 896, 1121, 1265, 1379, 1473],
  [2700, 588, 912, 1141, 1287, 1403, 1500],
  [2750, 597, 927, 1160, 1308, 1426, 1524],
  [2800, 607, 941, 1178, 1328, 1448, 1549],
  [2850, 616, 956, 1197, 1349, 1471, 1573],
  [2900, 626, 971, 1215, 1370, 1494, 1598],
  [2950, 635, 986, 1234, 1391, 1517, 1622],
  [3000, 644, 1001, 1252, 1412, 1540, 1647],
  [3050, 654, 1016, 1271, 1433, 1563, 1671],
  [3100, 663, 1031, 1289, 1453, 1586, 1695],
  [3150, 673, 1045, 1308, 1474, 1608, 1720],
  [3200, 682, 1060, 1327, 1495, 1631, 1744],
  [3250, 691, 1075, 1345, 1516, 1654, 1769],
  [3300, 701, 1090, 1364, 1537, 1677, 1793],
  [3350, 710, 1105, 1382, 1558, 1700, 1818],
  [3400, 720, 1120, 1401, 1579, 1723, 1842],
  [3450, 729, 1135, 1419, 1599, 1745, 1867],
  [3500, 738, 1149, 1438, 1620, 1768, 1891],
  [3550, 748, 1164, 1456, 1641, 1791, 1915],
  [3600, 757, 1179, 1475, 1662, 1814, 1940],
  [3650, 767, 1194, 1493, 1683, 1837, 1964],
  [3700, 776, 1208, 1503, 1702, 1857, 1987],
  [3750, 784, 1221, 1520, 1721, 1878, 2009],
  [3800, 793, 1234, 1536, 1740, 1899, 2031],
  [3850, 802, 1248, 1553, 1759, 1920, 2053],
  [3900, 811, 1261, 1570, 1778, 1940, 2075],
  [3950, 819, 1275, 1587, 1797, 1961, 2097],
  [4000, 828, 1288, 1603, 1816, 1982, 2119],
  [4050, 837, 1302, 1620, 1835, 2002, 2141],
  [4100, 846, 1315, 1637, 1854, 2023, 2163],
  [4150, 854, 1329, 1654, 1873, 2044, 2185],
  [4200, 863, 1342, 1670, 1892, 2064, 2207],
  [4250, 872, 1355, 1687, 1911, 2085, 2229],
  [4300, 881, 1369, 1704, 1930, 2106, 2251],
  [4350, 889, 1382, 1721, 1949, 2127, 2273],
  [4400, 898, 1396, 1737, 1968, 2147, 2295],
  [4450, 907, 1409, 1754, 1987, 2168, 2317],
  [4500, 916, 1423, 1771, 2006, 2189, 2339],
  [4550, 924, 1436, 1788, 2024, 2209, 2361],
  [4600, 933, 1450, 1804, 2043, 2230, 2384],
  [4650, 942, 1463, 1821, 2062, 2251, 2406],
  [4700, 951, 1477, 1838, 2081, 2271, 2428],
  [4750, 959, 1490, 1855, 2100, 2292, 2450],
  [4800, 968, 1503, 1871, 2119, 2313, 2472],
  [4850, 977, 1517, 1888, 2138, 2334, 2494],
  [4900, 986, 1530, 1905, 2157, 2354, 2516],
  [4950, 993, 1542, 1927, 2174, 2372, 2535],
  [5000, 1000, 1551, 1939, 2188, 2387, 2551],
  [5050, 1006, 1561, 1952, 2202, 2402, 2567],
  [5100, 1013, 1571, 1964, 2215, 2417, 2583],
  [5150, 1019, 1580, 1976, 2229, 2432, 2599],
  [5200, 1025, 1590, 1988, 2243, 2447, 2615],
  [5250, 1032, 1599, 2000, 2256, 2462, 2631],
  [5300, 1038, 1609, 2012, 2270, 2477, 2647],
  [5350, 1045, 1619, 2024, 2283, 2492, 2663],
  [5400, 1051, 1628, 2037, 2297, 2507, 2679],
  [5450, 1057, 1638, 2049, 2311, 2522, 2695],
  [5500, 1064, 1647, 2061, 2324, 2537, 2711],
  [5550, 1070, 1657, 2073, 2338, 2552, 2727],
  [5600, 1077, 1667, 2085, 2352, 2567, 2743],
  [5650, 1083, 1676, 2097, 2365, 2582, 2759],
  [5700, 1089, 1686, 2109, 2379, 2597, 2775],
  [5750, 1096, 1695, 2122, 2393, 2612, 2791],
  [5800, 1102, 1705, 2134, 2406, 2627, 2807],
  [5850, 1107, 1713, 2144, 2418, 2639, 2820],
  [5900, 1111, 1721, 2155, 2429, 2651, 2833],
  [5950, 1116, 1729, 2165, 2440, 2663, 2847],
  [6000, 1121, 1737, 2175, 2451, 2676, 2860],
  [6050, 1126, 1746, 2185, 2462, 2688, 2874],
  [6100, 1131, 1754, 2196, 2473, 2700, 2887],
  [6150, 1136, 1762, 2206, 2484, 2712, 2900],
  [6200, 1141, 1770, 2216, 2495, 2724, 2914],
  [6250, 1145, 1778, 2227, 2506, 2737, 2927],
  [6300, 1150, 1786, 2237, 2517, 2749, 2941],
  [6350, 1155, 1795, 2247, 2529, 2761, 2954],
  [6400, 1160, 1803, 2258, 2540, 2773, 2967],
  [6450, 1165, 1811, 2268, 2551, 2785, 2981],
  [6500, 1170, 1819, 2278, 2562, 2798, 2994],
  [6550, 1175, 1827, 2288, 2573, 2810, 3008],
  [6600, 1179, 1835, 2299, 2584, 2822, 3021],
  [6650, 1184, 1843, 2309, 2595, 2834, 3034],
  [6700, 1189, 1850, 2317, 2604, 2845, 3045],
  [6750, 1193, 1856, 2325, 2613, 2854, 3055],
  [6800, 1196, 1862, 2332, 2621, 2863, 3064],
  [6850, 1200, 1868, 2340, 2630, 2872, 3074],
  [6900, 1204, 1873, 2347, 2639, 2882, 3084],
  [6950, 1208, 1879, 2355, 2647, 2891, 3094],
  [7000, 1212, 1885, 2362, 2656, 2900, 3103],
  [7050, 1216, 1891, 2370, 2664, 2909, 3113],
  [7100, 1220, 1897, 2378, 2673, 2919, 3123],
  [7150, 1224, 1903, 2385, 2681, 2928, 3133],
  [7200, 1228, 1909, 2393, 2690, 2937, 3142],
  [7250, 1232, 1915, 2400, 2698, 2946, 3152],
  [7300, 1235, 1921, 2408, 2707, 2956, 3162],
  [7350, 1239, 1927, 2415, 2716, 2965, 3172],
  [7400, 1243, 1933, 2423, 2724, 2974, 3181],
  [7450, 1247, 1939, 2430, 2733, 2983, 3191],
  [7500, 1251, 1945, 2438, 2741, 2993, 3201],
  [7550, 1255, 1951, 2446, 2750, 3002, 3211],
  [7600, 1259, 1957, 2453, 2758, 3011, 3220],
  [7650, 1263, 1963, 2461, 2767, 3020, 3230],
  [7700, 1267, 1969, 2468, 2775, 3030, 3240],
  [7750, 1271, 1975, 2476, 2784, 3039, 3250],
  [7800, 1274, 1981, 2483, 2792, 3048, 3259],
  [7850, 1278, 1987, 2491, 2801, 3057, 3269],
  [7900, 1282, 1992, 2498, 2810, 3067, 3279],
  [7950, 1286, 1998, 2506, 2818, 3076, 3289],
  [8000, 1290, 2004, 2513, 2827, 3085, 3298],
  [8050, 1294, 2010, 2521, 2835, 3094, 3308],
  [8100, 1298, 2016, 2529, 2844, 3104, 3318],
  [8150, 1302, 2022, 2536, 2852, 3113, 3328],
  [8200, 1306, 2028, 2544, 2861, 3122, 3337],
  [8250, 1310, 2034, 2551, 2869, 3131, 3347],
  [8300, 1313, 2040, 2559, 2878, 3141, 3357],
  [8350, 1317, 2046, 2566, 2887, 3150, 3367],
  [8400, 1321, 2052, 2574, 2895, 3159, 3376],
  [8450, 1325, 2058, 2581, 2904, 3168, 3386],
  [8500, 1329, 2064, 2589, 2912, 3178, 3396],
  [8550, 1333, 2070, 2597, 2921, 3187, 3406],
  [8600, 1337, 2076, 2604, 2929, 3196, 3415],
  [8650, 1341, 2082, 2612, 2938, 3205, 3425],
  [8700, 1345, 2088, 2619, 2946, 3215, 3435],
  [8750, 1349, 2094, 2627, 2955, 3224, 3445],
  [8800, 1352, 2100, 2634, 2963, 3233, 3454],
  [8850, 1356, 2106, 2642, 2972, 3242, 3464],
  [8900, 1360, 2111, 2649, 2981, 3252, 3474],
  [8950, 1364, 2117, 2657, 2989, 3261, 3484],
  [9000, 1368, 2123, 2664, 2998, 3270, 3493],
  [9050, 1372, 2129, 2672, 3006, 3279, 3503],
  [9100, 1376, 2135, 2680, 3015, 3289, 3513],
  [9150, 1380, 2141, 2687, 3023, 3298, 3523],
  [9200, 1384, 2147, 2695, 3032, 3307, 3532],
  [9250, 1388, 2153, 2702, 3040, 3316, 3542],
  [9300, 1391, 2159, 2710, 3049, 3326, 3552],
  [9350, 1395, 2165, 2717, 3058, 3335, 3562],
  [9400, 1399, 2171, 2725, 3066, 3344, 3571],
  [9450, 1403, 2177, 2732, 3075, 3353, 3581],
  [9500, 1407, 2183, 2740, 3083, 3363, 3591],
  [9550, 1411, 2189, 2748, 3092, 3372, 3601],
  [9600, 1415, 2195, 2755, 3100, 3381, 3610],
  [9650, 1419, 2201, 2763, 3109, 3390, 3620],
  [9700, 1422, 2206, 2767, 3115, 3396, 3628],
  [9750, 1425, 2210, 2772, 3121, 3402, 3634],
  [9800, 1427, 2213, 2776, 3126, 3408, 3641],
  [9850, 1430, 2217, 2781, 3132, 3414, 3647],
  [9900, 1432, 2221, 2786, 3137, 3420, 3653],
  [9950, 1435, 2225, 2791, 3143, 3426, 3659],
  [10000, 1437, 2228, 2795, 3148, 3432, 3666],
];

const OVER_10000_RATES = [0.05, 0.075, 0.095, 0.11, 0.12, 0.125];


(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0});
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const state = Object.create(null);

const readDomValue = (id) => {
  const el = $(id);
  return el ? el.value : "";
};
const getValue = (id) => Object.prototype.hasOwnProperty.call(state, id) ? state[id] : readDomValue(id);
const remember = (id, value) => {
  state[id] = value == null ? "" : String(value);
};
const rememberEvent = (id, event) => {
  if (event && event.target && typeof event.target.value !== "undefined") remember(id, event.target.value);
  else remember(id, readDomValue(id));
};
const n = (id) => Math.max(0, Number(getValue(id)) || 0);
const setText = (id, value) => {
  const el = $(id);
  if (el) el.textContent = value;
};
const on = (id, event, handler) => {
  const el = $(id);
  if (el) el.addEventListener(event, handler);
};

const MINIMUM_WAGE = new Date() >= new Date("2026-09-30T00:00:00-04:00") ? 15 : 14;
const MINIMUM_MONTHLY_GROSS = MINIMUM_WAGE * 40 * 52 / 12;

function bracketTax(taxable, status) {
  const tops = status === "Married filing jointly" ? [24800,100800,211400,403550,512450,768700] :
    status === "Head of household" ? [17700,67450,105700,201750,256200,640600] :
    status === "Married filing separately" ? [12400,50400,105700,201775,256225,384350] :
    [12400,50400,105700,201775,256225,640600];
  const rates = [.10,.12,.22,.24,.32,.35,.37];
  let tax = 0;
  let last = 0;
  tops.forEach((top, i) => {
    tax += Math.max(0, Math.min(taxable, top) - last) * rates[i];
    last = top;
  });
  if (taxable > last) tax += (taxable - last) * rates[rates.length - 1];
  return tax;
}

function parentIncome(side) {
  const grossMonthly = n("gross" + side);
  const grossAnnual = grossMonthly * 12;
  const status = getValue("status" + side) || "Single";
  const type = getValue("type" + side) || "w2";
  const deps = n("dependents" + side);
  const isSE = type === "se";
  const seTaxable = isSE ? grossAnnual * .9235 : 0;
  const ssAnnual = Math.min(isSE ? seTaxable : grossAnnual, 184500) * (isSE ? .124 : .062);
  const medicareAnnual = (isSE ? seTaxable : grossAnnual) * (isSE ? .029 : .0145);
  const halfSE = isSE ? (ssAnnual + medicareAnnual) / 2 : 0;
  const standard = status === "Married filing jointly" ? 32200 :
    status === "Head of household" ? 24150 : 16100;
  const taxable = Math.max(0, grossAnnual - halfSE - standard);
  const federalBeforeCredits = bracketTax(taxable, status);
  const creditThreshold = status === "Married filing jointly" ? 400000 : 200000;
  const creditPhaseout = Math.max(0, Math.ceil((grossAnnual - creditThreshold) / 1000) * 50);
  const availableChildCredit = Math.max(0, deps * 2200 - creditPhaseout);
  const childCreditUsed = Math.min(federalBeforeCredits, availableChildCredit);
  const federalAnnual = Math.max(0, federalBeforeCredits - childCreditUsed);
  const federalMonthly = federalAnnual / 12;
  const socialSecurityMonthly = ssAnnual / 12;
  const medicareMonthly = medicareAnnual / 12;
  const taxes = federalMonthly + socialSecurityMonthly + medicareMonthly;
  const allowed = ["union","retirement","insurance","otherSupport","alimony"]
    .reduce((sum, key) => sum + n(key + side), 0);
  const net = Math.max(0, grossMonthly - taxes - allowed);
  return {
    grossMonthly, grossAnnual, standard, halfSE, taxable, federalBeforeCredits,
    childCreditUsed, federalMonthly, socialSecurityMonthly, medicareMonthly,
    taxes, allowed, net
  };
}

function guidelineNeed(combined, count) {
  const idx = Math.min(Math.max(Math.round(count), 1), 6);
  if (combined < 800) return null;
  if (combined > 10000) {
    return GUIDELINE_ROWS[GUIDELINE_ROWS.length - 1][idx] +
      (combined - 10000) * OVER_10000_RATES[idx - 1];
  }
  let row = GUIDELINE_ROWS[0];
  for (const candidate of GUIDELINE_ROWS) {
    if (candidate[0] <= combined) row = candidate;
    else break;
  }
  return row[idx];
}

function renderLive(side) {
  const data = parentIncome(side);
  setText("liveFederal" + side, money.format(data.federalMonthly));
  setText("liveSS" + side, money.format(data.socialSecurityMonthly));
  setText("liveMedicare" + side, money.format(data.medicareMonthly));
  setText("liveTaxes" + side, money.format(data.taxes));
  setText("liveNet" + side, money.format(data.net));
  return data;
}

function renderDetailed(side, data) {
  setText("mathGross" + side, money.format(data.grossMonthly));
  setText("mathAnnual" + side, money.format(data.grossAnnual));
  setText("mathStandard" + side, money.format(data.standard));
  setText("mathHalfSE" + side, money.format(data.halfSE));
  setText("mathTaxable" + side, money.format(data.taxable));
  setText("mathFedBefore" + side, money.format(data.federalBeforeCredits));
  setText("mathCredit" + side, money.format(data.childCreditUsed));
  setText("mathFederal" + side, money.format(data.federalMonthly));
  setText("mathSS" + side, money.format(data.socialSecurityMonthly));
  setText("mathMedicare" + side, money.format(data.medicareMonthly));
  setText("mathAllowed" + side, money.format(data.allowed));
  setText("mathNet" + side, money.format(data.net));
}

function syncOvernights(sourceSide, event) {
  const otherSide = sourceSide === "A" ? "B" : "A";
  const sourceId = "overnights" + sourceSide;
  const otherId = "overnights" + otherSide;
  rememberEvent(sourceId, event);
  const value = Math.min(365, Math.max(0, Math.round(Number(getValue(sourceId)) || 0)));
  const otherValue = 365 - value;
  remember(sourceId, value);
  remember(otherId, otherValue);
  const source = $(sourceId);
  const other = $(otherId);
  if (source) source.value = value;
  if (other) other.value = otherValue;
}

function showMessage(amount, direction, combined, netA, netB, basic, additions, method, explanation) {
  const result = $("result");
  if (result) result.hidden = false;
  setText("amount", amount);
  setText("direction", direction);
  setText("combined", typeof combined === "number" ? money.format(combined) : combined);
  setText("netA", typeof netA === "number" ? money.format(netA) : netA);
  setText("netB", typeof netB === "number" ? money.format(netB) : netB);
  setText("basic", typeof basic === "number" ? money.format(basic) : basic);
  setText("additions", typeof additions === "number" ? money.format(additions) : additions);
  setText("method", method);
  setText("explanation", explanation);
}

function calculateSupport() {
  syncOvernights("A");
  const a = renderLive("A");
  const b = renderLive("B");
  renderDetailed("A", a);
  renderDetailed("B", b);

  if (a.grossMonthly < MINIMUM_MONTHLY_GROSS || b.grossMonthly < MINIMUM_MONTHLY_GROSS) {
    showMessage(
      "Income below public-calculator limit",
      "Talk with an attorney for an individualized calculation",
      "—","—","—","—","—",
      "Minimum-wage limitation",
      "Each parent's gross earned income must be at least the full-time Florida minimum-wage equivalent of " +
        money.format(MINIMUM_MONTHLY_GROSS) + " per month for this public calculator."
    );
    setText("calcStatus", "Enter monthly gross income for both parents at or above the calculator's minimum-income floor.");
    return;
  }

  const combined = a.net + b.net;
  const children = Number(getValue("children") || 1);
  const basic = guidelineNeed(combined, children);

  if (combined < 800) {
    showMessage(
      "Separate analysis required",
      "Combined monthly net income is below the statutory schedule.",
      combined, a.net, b.net, "Not calculated", "—",
      "Low-income rule",
      "Florida law requires a case-specific low-income calculation. Please speak with an attorney."
    );
    setText("calcStatus", "A separate low-income calculation is required.");
    return;
  }

  const shareA = a.net / combined;
  const shareB = b.net / combined;
  const prepaidA = n("childcareA") + n("healthA") + n("medicalA");
  const prepaidB = n("childcareB") + n("healthB") + n("medicalB");
  const additions = prepaidA + prepaidB;
  const overA = n("overnightsA");
  const overB = 365 - overA;
  const pctA = overA / 365;
  const pctB = overB / 365;
  const shared = pctA >= .2 && pctB >= .2;

  let from;
  let to;
  let transfer;
  let formula;

  if (shared) {
    const aOwes = basic * 1.5 * shareA * pctB + additions * shareA - prepaidA;
    const bOwes = basic * 1.5 * shareB * pctA + additions * shareB - prepaidB;
    if (aOwes >= bOwes) {
      from = "Parent A";
      to = "Parent B";
      transfer = aOwes - bOwes;
    } else {
      from = "Parent B";
      to = "Parent A";
      transfer = bOwes - aOwes;
    }
    formula =
      "Substantial time-sharing: basic need " + money.format(basic) +
      " × 1.5, allocated by each parent's net-income share and the other parent's overnight percentage, " +
      "then adjusted for child expenses already paid. Parent A obligation before offset: " + money.format(aOwes) +
      "; Parent B obligation before offset: " + money.format(bOwes) + ".";
  } else if (overA >= overB) {
    from = "Parent B";
    to = "Parent A";
    transfer = (basic + additions) * shareB - prepaidB;
    formula =
      "Regular guideline: (" + money.format(basic) + " basic need + " + money.format(additions) +
      " child expenses) × Parent B's " + pct(shareB) + " income share − " +
      money.format(prepaidB) + " already paid by Parent B.";
  } else {
    from = "Parent A";
    to = "Parent B";
    transfer = (basic + additions) * shareA - prepaidA;
    formula =
      "Regular guideline: (" + money.format(basic) + " basic need + " + money.format(additions) +
      " child expenses) × Parent A's " + pct(shareA) + " income share − " +
      money.format(prepaidA) + " already paid by Parent A.";
  }

  transfer = Math.max(0, transfer);
  const highIncome = combined > 10000
    ? " Combined net income exceeds $10,000; the statutory above-guideline percentage is included, but the result should be reviewed individually."
    : "";

  showMessage(
    money.format(transfer),
    transfer ? from + " pays " + to : "No transfer shown from these inputs",
    combined, a.net, b.net, basic, additions,
    shared ? "Substantial time-sharing" : "Regular guideline",
    (shared
      ? "Both parents have at least 73 overnights, so the substantial time-sharing method is applied."
      : "Only one parent has at least 73 overnights, so the regular guideline allocation is applied.") + highIncome
  );

  setText("shareA", pct(shareA));
  setText("shareB", pct(shareB));
  setText("overnightPctA", pct(pctA));
  setText("overnightPctB", pct(pctB));
  setText("supportMath", formula + " Estimated transfer: " + money.format(transfer) + " per month.");
  setText("calcStatus", "Calculation updated.");
}

function resetCalculator() {
  const form = $("calculator");
  if (form && typeof form.reset === "function") form.reset();
  Object.keys(state).forEach((key) => delete state[key]);
  initializeState();
  remember("overnightsA", 182);
  remember("overnightsB", 183);
  const overA = $("overnightsA");
  const overB = $("overnightsB");
  if (overA) overA.value = 182;
  if (overB) overB.value = 183;
  const result = $("result");
  if (result) result.hidden = true;
  ["A","B"].forEach((side) => {
    setText("liveFederal" + side, "$0");
    setText("liveSS" + side, "$0");
    setText("liveMedicare" + side, "$0");
    setText("liveTaxes" + side, "$0");
    setText("liveNet" + side, "$0");
  });
  setText("calcStatus", "");
}

const trackedIds = [
  "children","overnightsA","overnightsB",
  ...["A","B"].flatMap((side) => [
    "gross" + side,"type" + side,"status" + side,"dependents" + side,
    "union" + side,"retirement" + side,"insurance" + side,"otherSupport" + side,"alimony" + side,
    "childcare" + side,"health" + side,"medical" + side,
  ]),
];

function initializeState() {
  trackedIds.forEach((id) => {
    const el = $(id);
    if (el) remember(id, el.value);
  });
}

function trackAndRender(id, side) {
  const handler = (event) => {
    rememberEvent(id, event);
    renderLive(side);
  };
  on(id, "input", handler);
  on(id, "keyup", handler);
  on(id, "change", handler);
}

initializeState();

["A","B"].forEach((side) => {
  ["gross","dependents","union","retirement","insurance","otherSupport","alimony"].forEach((name) => {
    trackAndRender(name + side, side);
  });
  ["type","status"].forEach((name) => {
    trackAndRender(name + side, side);
  });
  ["childcare","health","medical"].forEach((name) => {
    const id = name + side;
    const handler = (event) => rememberEvent(id, event);
    on(id, "input", handler);
    on(id, "keyup", handler);
    on(id, "change", handler);
  });
});

const childrenHandler = (event) => rememberEvent("children", event);
on("children", "change", childrenHandler);

const overnightAHandler = (event) => syncOvernights("A", event);
const overnightBHandler = (event) => syncOvernights("B", event);
["input","keyup","change"].forEach((eventName) => {
  on("overnightsA", eventName, overnightAHandler);
  on("overnightsB", eventName, overnightBHandler);
});

on("calculateSupport", "click", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  calculateSupport();
});
on("calculator", "submit", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  calculateSupport();
});
on("resetCalculator", "click", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  resetCalculator();
});
})();