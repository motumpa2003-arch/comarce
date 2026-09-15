/** Synthetic name and address banks. No real customer data is ever used. */

export const FIRST_NAMES = [
  "Aarav", "Ananya", "Rahul", "Priya", "Kabir", "Meera", "Vikram", "Sneha",
  "Arjun", "Divya", "Rohan", "Isha", "Aditya", "Nandini", "Karthik", "Tara",
  "Siddharth", "Riya", "Manish", "Aditi", "Neel", "Kavya", "Yash", "Pooja",
  "Dev", "Shreya", "Imran", "Zoya", "Aman", "Naina", "Farhan", "Leela",
  "Nikhil", "Anjali", "Varun", "Ira", "Rehan", "Mira", "Gaurav", "Sara",
  "Advait", "Trisha", "Om", "Bhavna", "Kunal", "Rhea", "Sameer", "Ayesha",
  "Vivaan", "Charu",
];

export const LAST_NAMES = [
  "Sharma", "Mehta", "Verma", "Iyer", "Nair", "Reddy", "Kapoor", "Bose",
  "Chatterjee", "Desai", "Gupta", "Joshi", "Kulkarni", "Malhotra", "Pillai",
  "Rao", "Sethi", "Shah", "Singh", "Banerjee", "Fernandes", "Ghosh", "Hegde",
  "Jain", "Khanna", "Mukherjee", "Patel", "Qureshi", "Saxena", "Trivedi",
];

export interface CityRecord {
  city: string;
  state: string;
  pincodes: string[];
  lat: number;
  lng: number;
  tier: 1 | 2 | 3;
}

export const CITIES: CityRecord[] = [
  { city: "Bengaluru", state: "Karnataka", pincodes: ["560001", "560038", "560066", "560103"], lat: 12.9716, lng: 77.5946, tier: 1 },
  { city: "Mumbai", state: "Maharashtra", pincodes: ["400001", "400050", "400076"], lat: 19.076, lng: 72.8777, tier: 1 },
  { city: "New Delhi", state: "Delhi", pincodes: ["110001", "110016", "110070"], lat: 28.6139, lng: 77.209, tier: 1 },
  { city: "Hyderabad", state: "Telangana", pincodes: ["500001", "500032", "500081"], lat: 17.385, lng: 78.4867, tier: 1 },
  { city: "Chennai", state: "Tamil Nadu", pincodes: ["600001", "600040", "600096"], lat: 13.0827, lng: 80.2707, tier: 1 },
  { city: "Pune", state: "Maharashtra", pincodes: ["411001", "411045", "411057"], lat: 18.5204, lng: 73.8567, tier: 1 },
  { city: "Kolkata", state: "West Bengal", pincodes: ["700001", "700029", "700091"], lat: 22.5726, lng: 88.3639, tier: 1 },
  { city: "Ahmedabad", state: "Gujarat", pincodes: ["380001", "380015", "380058"], lat: 23.0225, lng: 72.5714, tier: 1 },
  { city: "Jaipur", state: "Rajasthan", pincodes: ["302001", "302020"], lat: 26.9124, lng: 75.7873, tier: 2 },
  { city: "Kochi", state: "Kerala", pincodes: ["682001", "682024"], lat: 9.9312, lng: 76.2673, tier: 2 },
  { city: "Chandigarh", state: "Punjab", pincodes: ["160001", "160022"], lat: 30.7333, lng: 76.7794, tier: 2 },
  { city: "Indore", state: "Madhya Pradesh", pincodes: ["452001", "452010"], lat: 22.7196, lng: 75.8577, tier: 2 },
  { city: "Lucknow", state: "Uttar Pradesh", pincodes: ["226001", "226010"], lat: 26.8467, lng: 80.9462, tier: 2 },
  { city: "Guwahati", state: "Assam", pincodes: ["781001", "781022"], lat: 26.1445, lng: 91.7362, tier: 3 },
  { city: "Bhubaneswar", state: "Odisha", pincodes: ["751001", "751024"], lat: 20.2961, lng: 85.8245, tier: 3 },
  { city: "Coimbatore", state: "Tamil Nadu", pincodes: ["641001", "641028"], lat: 11.0168, lng: 76.9558, tier: 3 },
];

export const STREETS = [
  "MG Road", "Church Street", "Residency Road", "Hosur Road", "Linking Road",
  "Turner Road", "Park Street", "Camac Street", "Sarjapur Road", "Baner Road",
  "Anna Salai", "Nungambakkam High Road", "Banjara Hills Road No. 12",
  "Jubilee Hills Road No. 36", "SG Highway", "Ring Road", "Civil Lines",
  "Sector 17 Market", "Marine Drive", "Palm Beach Road",
];

export const LANDMARKS = [
  "Near Metro Station", "Opposite City Mall", "Behind Central Library",
  "Next to Coffee House", "Above HDFC Bank", "Near Tech Park Gate 2",
  "Beside Community Park", "Opposite Bus Depot",
];

export const APARTMENTS = [
  "Prestige Residency", "Brigade Heights", "Sobha Enclave", "Lodha Aurum",
  "Godrej Woodsman", "Purva Riviera", "Salarpuria Sattva", "Adarsh Palm Retreat",
  "Rohan Nilay", "Kalpataru Serenity",
];

export const EMAIL_DOMAINS = ["example.com", "demomail.com", "mailbox.test", "inbox.example"];

export const REVIEW_TITLES = [
  "Exactly what I hoped for",
  "Solid buy, would repeat",
  "Better than the photos",
  "Good but not perfect",
  "Worth the price",
  "Impressed with the finish",
  "Does the job well",
  "Great value for money",
  "Arrived quickly, packed well",
  "Small niggles, still recommend",
  "Third one I have bought",
  "Held up after three months",
  "Lives up to the description",
  "Quietly well made",
  "Replaced something twice the price",
  "Happy, with one caveat",
  "Better in person",
  "No regrets",
  "Does exactly one thing, does it well",
  "Careful packaging, quick delivery",
  "Sizing runs true",
  "Would buy for someone else too",
  "Six months in, still fine",
  "Good, once you get used to it",
  "Not flawless, still keeping it",
  "Bought on a whim, glad I did",
  "Fair price for what it is",
];

export const REVIEW_BODIES_POSITIVE = [
  "Ordered on a Tuesday, arrived Thursday, packaging was intact and the product matches the listing photos closely. Build quality feels a step above what I expected at this price.",
  "I have been using this daily for about six weeks now. No complaints — it has held up better than the one it replaced, which cost considerably more.",
  "The finish is genuinely nice in person. Colour is very close to what is shown online, maybe a shade deeper. Sizing was accurate for me.",
  "Bought this after reading the other reviews and they were right. Sturdy, well made, and the support team answered my query within a few hours.",
  "Great value. I compared three options in this range and this was the only one that felt properly finished rather than assembled to a price.",
  "Second purchase from this brand. Consistent quality, and the return window meant I could try it without worrying.",
  "The photographs undersell it, if anything. Stitching is even, nothing is glued where it should be sewn, and the weight feels right in the hand.",
  "Bought this to replace something that lasted eight months. This one already feels like it will outlast it by years.",
  "Delivery was a day early. Everything was wrapped properly with no loose packaging rattling around, which I appreciated.",
  "I was sceptical at this price but the details hold up — the edges are finished, the hardware does not feel hollow, and nothing creaks.",
  "Bought one, then bought two more as gifts. That is probably the most honest review I can give.",
  "Six months of near-daily use and it still looks close to new. A quick clean and it comes straight back.",
  "The description is accurate to the millimetre, which made choosing the right size straightforward for once.",
  "Customer service replaced a part I damaged myself, at cost, within a week. That is why I will keep buying here.",
  "It does exactly what it claims and nothing it does not need to. Refreshing in a category full of gimmicks.",
  "Lighter than I expected without feeling cheap. Whatever they have done with the materials, it works.",
  "Third order from this store. Same standard of packing and the same accurate delivery window every time.",
  "My partner liked it enough that I have had to order a second one. Consider that a five-star review by proxy.",
  "The colour is very slightly warmer than the photograph, and I prefer it that way. Everything else is exactly as listed.",
  "Reasonable price, sensible design, no fuss. I have spent far more on far worse.",
];

export const REVIEW_BODIES_MIXED = [
  "Product itself is good, but delivery took two days longer than the estimate. Would still buy again given the price.",
  "Quality is fine for the money. One small scuff on arrival, though customer service offered a partial refund without any argument.",
  "Works well overall. The instructions could be clearer, and I had to look up a video to get it set up properly.",
  "Comfortable and looks smart, but runs slightly small. I would size up if you are between sizes.",
  "Does what it says. Battery life is a little short of the claimed figure in real use, closer to eighty percent of it.",
  "No complaints about the product. The courier left it with a neighbour without telling me, which cost me an afternoon.",
  "Looks better than it feels. Perfectly good at this price, just do not expect the finish of something twice as expensive.",
  "It arrived well packed and works fine, but the setup took longer than it should have for something this simple.",
  "Good value, though one of the fittings was slightly out of alignment. Ten minutes with a screwdriver sorted it.",
  "Happy with the purchase overall. The listing photos are shot in bright light, so the shade reads a little darker at home.",
  "Does the job, but the spare parts are harder to find than I expected. Worth knowing before you commit.",
  "Solid product let down slightly by the packaging, which arrived crushed on one corner. No damage inside.",
];

export const REVIEW_BODIES_NEGATIVE = [
  "Not quite what I expected — the material feels thinner in person than the photos suggest. Return process was smooth at least.",
  "Stopped working properly after a few weeks. Replacement was arranged quickly, so two stars rather than one.",
  "Fit was off for me and the colour is noticeably lighter than shown. Sending it back.",
  "Arrived with a mark along one edge. The replacement had the same issue, so I have asked for a refund instead.",
  "Description mentions a feature this simply does not have. Support confirmed it was a listing error, which is fair enough, but I needed that feature.",
  "Too small for the use I bought it for, and that is partly on me — but the dimensions listed are for the smaller of the two sizes shown.",
  "It works, but the noise it makes is hard to live with in a small room. Wish someone had mentioned that.",
  "Three weeks and the finish has already worn at the contact points. Not what I expected at this price.",
];

export const SUPPORT_SUBJECTS = [
  "Order arrived with a missing item",
  "Need to change my delivery address",
  "Refund not credited yet",
  "Wrong size delivered",
  "Coupon code did not apply at checkout",
  "Requesting an invoice with GST details",
  "Product damaged in transit",
  "Cancel my order before dispatch",
  "Exchange for a different colour",
  "Delivery is delayed past the estimate",
];

export const NOTE_SNIPPETS = [
  "Prefers evening delivery slots.",
  "Corporate buyer — needs GST invoices.",
  "High-value customer, prioritise support tickets.",
  "Previously raised a damaged-parcel complaint; resolved.",
  "Opted out of SMS, email only.",
];
