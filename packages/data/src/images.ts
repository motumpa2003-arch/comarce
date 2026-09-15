/**
 * Curated, verified image pool.
 *
 * Every id below was checked against the CDN before being committed, so the
 * seeded catalogue never renders a broken tile. Keys are subject buckets, not
 * categories, so several categories can share a pool.
 */

const BASE = "https://images.unsplash.com/";

export function img(id: string, width = 1200, height?: number, quality = 78): string {
  const h = height ? `&h=${height}` : "";
  return `${BASE}${id}?auto=format&fit=crop&w=${width}${h}&q=${quality}`;
}

export function avatarImg(id: string, size = 128): string {
  return `${BASE}${id}?auto=format&fit=facearea&facepad=3&w=${size}&h=${size}&q=80`;
}

export const IMAGE_POOLS = {
  tshirt: [
    "photo-1521572163474-6864f9cf17ab",
    "photo-1576566588028-4147f3842f27",
    "photo-1618354691373-d851c5c3a990",
    "photo-1620012253295-c15cc3e65df4",
    "photo-1594381898411-846e7d193883",
  ],
  shirt: ["photo-1503341504253-dff4815485f1", "photo-1602810318383-e386cc2a3ccf"],
  jacket: [
    "photo-1544022613-e87ca75a784a",
    "photo-1551028719-00167b16eac5",
    "photo-1591047139829-d91aecb6caea",
    "photo-1520975954732-35dd22299614",
  ],
  trousers: [
    "photo-1542272604-787c3835535d",
    "photo-1541099649105-f69ad21f3246",
    "photo-1473966968600-fa801b869a1a",
  ],
  shoes: [
    "photo-1542291026-7eec264c27ff",
    "photo-1600185365483-26d7a4cc7519",
    "photo-1549298916-b41d501d3772",
    "photo-1560769629-975ec94e6a86",
    "photo-1491553895911-0055eca6402d",
    "photo-1595950653106-6c9ebd614d3a",
  ],
  bag: [
    "photo-1596462502278-27bfdc403348",
    "photo-1548036328-c9fa89d128fa",
    "photo-1553062407-98eeb64c6a62",
    "photo-1491637639811-60e2756cc1c7",
  ],
  eyewear: [
    "photo-1594633312681-425c7b97ccd1",
    "photo-1511499767150-a48a237f0083",
    "photo-1572635196237-14b3f281503f",
  ],
  watch: [
    "photo-1523275335684-37898b6baf30",
    "photo-1540932239986-30128078f3c5",
    "photo-1524805444758-089113d48a6d",
    "photo-1434493789847-2f02dc6ca35d",
    "photo-1434056886845-dac89ffe9b56",
  ],
  phone: [
    "photo-1620799140408-edc6dcb6d633",
    "photo-1511707171634-5f897ff02aa9",
    "photo-1592750475338-74b7b21085ab",
  ],
  laptop: [
    "photo-1517336714731-489689fd1ca8",
    "photo-1496181133206-80ce9b88a853",
    "photo-1541807084-5c52b6b3adef",
    "photo-1531297484001-80022131f5a1",
    "photo-1593642632823-8f785ba67e45",
  ],
  headphones: [
    "photo-1505740420928-5e560c06d30e",
    "photo-1606220945770-b5b6c2c55bf1",
    "photo-1583394838336-acd977736f90",
    "photo-1484704849700-f032a568e944",
    "photo-1546435770-a3e426bf472b",
  ],
  earbuds: ["photo-1572569511254-d8f925fe2cbb", "photo-1590658268037-6bf12165a8df"],
  smartwatch: [
    "photo-1546868871-7041f2a55e12",
    "photo-1579586337278-3befd40fd17a",
    "photo-1508685096489-7aacd43bd3b1",
  ],
  speaker: [
    "photo-1558756520-22cfe5d382ca",
    "photo-1608043152269-423dbba4e7e1",
    "photo-1545454675-3531b543be5d",
  ],
  camera: [
    "photo-1587829741301-dc798b83add3",
    "photo-1502920917128-1aa500764cbd",
    "photo-1516035069371-29a1b244cc32",
    "photo-1526170375885-4d8ecf77b99f",
  ],
  television: ["photo-1593305841991-05c297ba4575", "photo-1461151304267-38535e780c79"],
  appliance: ["photo-1585515320310-259814833e62", "photo-1574269909862-7e1d70bb8078"],
  fragrance: [
    "photo-1585790050230-5dd28404ccb9",
    "photo-1541643600914-78b084683601",
    "photo-1592945403244-b3fbafd7f539",
    "photo-1571781926291-c477ebfd024b",
  ],
  skincare: [
    "photo-1526947425960-945c6e72858f",
    "photo-1620916566398-39f1143ab7be",
  ],
  makeup: ["photo-1556228720-195a672e8a03"],
  seating: [
    "photo-1506617564039-2f3b650b7010",
    "photo-1567538096630-e0c55bd6374c",
    "photo-1592078615290-033ee584e267",
  ],
  sofa: [
    "photo-1555041469-a586c61ea9bc",
    "photo-1493663284031-b7e3aefcae8e",
    "photo-1550226891-ef816aed4a98",
  ],
  decor: [
    "photo-1556909114-f6e7ad7d3136",
    "photo-1513694203232-719a280e022f",
    "photo-1522708323590-d24dbb6b0267",
    "photo-1616486338812-3dadae4b4ace",
  ],
  lighting: ["photo-1616627561950-9f746e330187", "photo-1507473885765-e6ed057f782c"],
  candle: ["photo-1534349762230-e0cadf78f5da"],
  coffee: [
    "photo-1522335789203-aabd1fc54bc9",
    "photo-1447933601403-0c6688de566e",
    "photo-1559056199-641a0ac8b55e",
  ],
  produce: ["photo-1610632380989-680fe40816c6", "photo-1542838132-92c53300491e"],
  jewelry: [
    "photo-1611591437281-460bfbe1220a",
    "photo-1515562141207-7a88fb7ce338",
    "photo-1605100804763-247f67b3557e",
    "photo-1573408301185-9146fe634ad0",
  ],
  books: [
    "photo-1544947950-fa07a98d237f",
    "photo-1512820790803-83ca734da794",
    "photo-1543002588-bfa74002ed7e",
  ],
  pets: [
    "photo-1589829545856-d10d557cf95f",
    "photo-1552053831-71594a27632d",
    "photo-1514888286974-6c03e2ca1dba",
  ],
  fitness: [
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1517836357463-d25dfeac3438",
    "photo-1534438327276-14e5300c3a48",
    "photo-1518611012118-696072aa579a",
    "photo-1461896836934-ffe607ba8211",
    "photo-1571902943202-507ec2618e8f",
  ],
} as const;

export type ImagePoolKey = keyof typeof IMAGE_POOLS;

export const EDITORIAL = {
  heroWoman: "photo-1483985988355-763728e1935b",
  heroFashion: "photo-1445205170230-053b83016050",
  heroStreet: "photo-1490481651871-ab68de25d43d",
  heroCouple: "photo-1469334031218-e382a71b716b",
  heroStore: "photo-1441986300917-64674bd600d8",
  heroShopping: "photo-1441984904996-e0b6ba687e04",
  heroMan: "photo-1487412720507-e7ab37603c6f",
  outdoorHiker: "photo-1490114538077-0a7f8cb49891",
  outdoorPack: "photo-1551632811-561732d1e306",
  outdoorRange: "photo-1454496522488-7a8e488e8606",
  outdoorForest: "photo-1509316975850-ff9c5deb0cd9",
  interiorRoom: "photo-1522708323590-d24dbb6b0267",
  interiorStyled: "photo-1616486338812-3dadae4b4ace",
  deskTech: "photo-1531297484001-80022131f5a1",
} as const;

export const PORTRAITS = [
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1500648767791-00dcc994a43e",
  "photo-1534528741775-53994a69daeb",
  "photo-1544005313-94ddf0286df2",
  "photo-1438761681033-6461ffad8d80",
  "photo-1472099645785-5658abf4ff4e",
  "photo-1633332755192-727a05c4013d",
  "photo-1573497019940-1c28c88b4f3e",
  "photo-1560250097-0b93528c311a",
  "photo-1494790108377-be9c29b29330",
] as const;
