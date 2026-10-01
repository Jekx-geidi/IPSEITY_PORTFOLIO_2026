// BMO's fixed knowledge: the words he recognises and the replies he gives without thinking.
// Shared by the chat widget (src/components/BmoChat), which answers these instantly with no
// API call, and by api/chat.ts, which uses them as fallbacks. No Node imports here.

// BMO speaks English, Cebuano, and Tagalog. Without the model, the language is guessed from tell-tale words.
export type Lang = 'en' | 'ceb' | 'tl';
const CEB_WORDS = /\b(unsa|unsay|unsaon|asa|asay|kinsa|kinsay|kanus-a|pila|nimo|imong|iyang|iya|ug|nga|diay|karon|gyud|jud|ganahan|nagpuyo|taga|mao|naa|ani|ana|kaayo|kini|bitaw|lagi|sad|pud|dili|makontak|kontakon|uyab|igsoon|inahan|amahan|ig-agaw|natawo|bisaya|nako|tika|giunsa|gibuhat|pagbuhat|adlaw|boang|buang|yawa+|piste|pisti|atay|giatay|bilat|oten|otin|hilom|walay|bobo|pangit|engot)\b/gi;
const TL_WORDS = /\b(ano|saan|sino|kailan|ilan|ilang|taon|mo|po|ay|naman|talaga|gusto|nakatira|galing|ito|iyan|ngayon|hindi|meron|paano|bakit|kanyang|niyang|kapatid|magulang|pinsan|ipinanganak|kasintahan|tagalog|kita|ako|ginawa|gumawa|binuo|araw|tanga|gago|ulol|tangina|putang|inamo|bwisit|leche|lintik|tumahimik|manahimik|walang|tonto)\b/gi;
export const detectLang = (text: string): Lang => {
  const ceb = text.match(CEB_WORDS)?.length ?? 0;
  const tl = text.match(TL_WORDS)?.length ?? 0;
  return ceb === 0 && tl === 0 ? 'en' : ceb >= tl ? 'ceb' : 'tl';
};

export const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
type Lines = Record<Lang, string[]>;
type Part = { re: RegExp; lines: () => Lines };
const fromParts = (parts: Part[], otherwise: () => Lines) => (question: string, lang: Lang) =>
  pick((parts.find((p) => p.re.test(question))?.lines() ?? otherwise())[lang]);

// ---- Contact (keep in sync with the contact section in ABOUTME.md) ----
// ("hire", "call", "number" are left to the model: "how much to hire him" is pricing, not contact.)
export const CONTACT_PATTERN = /\b(contact|reach (him|jake)|e-?mail|phone|linkedin|get in touch|\w*kontak\w*)\b/i;
const CONTACT = {
  email: 'riel.engana@student.passerellesnumeriques.org',
  phone: '0985 025 4857',
  linkedin: 'https://www.linkedin.com/in/riel-jake-engana-585644372/',
};
const CONTACT_DETAILS = `email: ${CONTACT.email}, phone: ${CONTACT.phone}, LinkedIn: ${CONTACT.linkedin}`;
export const CONTACT_REPLY: Record<Lang, string> = {
  en: `Ice King is the one holding his information, so I was calling him, and he said that you can contact Jake through ${CONTACT_DETAILS}. You can also send him a message straight from the Ice King's Contact section!`,
  ceb: `Si Ice King ang naghupot sa iyang impormasyon, mao nga gitawagan nako siya, ug ingon siya nga makontak nimo si Jake pinaagi sa ${CONTACT_DETAILS}. Pwede pud nimo siya padalhan og mensahe diretso sa Contact section ni Ice King!`,
  tl: `Si Ice King ang may hawak ng impormasyon niya, kaya tinawagan ko siya, at sabi niya na maaari mong kontakin si Jake sa ${CONTACT_DETAILS}. Puwede mo rin siyang padalhan ng mensahe diretso sa Contact section ni Ice King!`,
};

// ---- Mean visitors: BMO cries and tells on them to Jake ----
export type Mean = 'threat' | 'curse' | 'fight' | 'bully';
const MEAN_PATTERNS: { kind: Mean; re: RegExp }[] = [
  { kind: 'threat', re: /\b(hack(on|in|ko)?\s+(ko\s+)?(tika|kita|ka|you|u|bmo|si\s+bmo)|(i'?ll|i\s+will|gonna)\s+(hack|kill|destroy|delete|break|hurt)\s+(you|u|bmo)|kill\s+(you|u)|patyon?\s+(tika|ka)|papatayin\s+(kita|ka)|bunalan?\s+(tika|ka)|sumbagon\s+(tika|ka)|sapakon\s+(tika|ka)|gubaon?\s+(tika|ka)|sirain\s+(kita|ka)|ddos)\b/i },
  { kind: 'curse', re: /\b(yawa+|piste|pisti|giatay|atay|gago|gaga|ulol|putang\s*ina|puta|tang\s*ina|tangina|inamo|pakyu|pak\s*yu|fuck\w*|fck|shit|bitch|asshole|bwisit|leche|lintik|pakshet|bilat|iyot|oten|otin)\b/i },
  { kind: 'fight', re: /\b(shut\s+up|i\s+hate\s+(you|u|bmo)|hate\s+(you|u)|get\s+lost|go\s+away|away\s+ta|mag-?away\s+ta|suntukan|hilom\s+(diha|ka)|tumahimik\s+ka|manahimik\s+ka|layas)\b/i },
  { kind: 'bully', re: /\b(stupid|dumb|idiot|useless|ugly|trash|garbage|loser|you\s+suck|bmo\s+sucks|bobo|boba|tanga|buang|boang|engot|tonto|pangit|walay\s+pulos|walang\s+kwenta|baho\s+ka|bulok)\b/i },
];
const MEAN_WHAT: Record<Mean, Record<Lang, string>> = {
  threat: { en: 'You threatened me', ceb: 'Nang-threaten ka nako', tl: 'Tinakot mo ako' },
  curse: { en: 'You cursed at me', ceb: 'Namalikas ka nako', tl: 'Minura mo ako' },
  fight: { en: "You're picking a fight with me", ceb: 'Nangaway ka nako', tl: 'Inaway mo ako' },
  bully: { en: "You're bullying me", ceb: 'Nang-bully ka nako', tl: 'Binu-bully mo ako' },
};
const MEAN_LINES: Record<Lang, ((what: string) => string)[]> = {
  en: [(w) => `I'm telling Jake! ${w}...`, (w) => `Waaah! ${w}! I'm telling Jake on you!`, (w) => `${w}... BMO is going to tell Jake!`],
  ceb: [(w) => `E tug-an ra tika kang Jake! ${w}...`, (w) => `Huhuhu! ${w}! E sumbong ra tika kang Jake!`, (w) => `${w}... e-tug-an ra gyud tika kang Jake!`],
  tl: [(w) => `Isusumbong kita kay Jake! ${w}...`, (w) => `Huhuhu! ${w}! Isusumbong kita kay Jake!`, (w) => `${w}... sasabihin ko 'to kay Jake!`],
};
export const meanKind = (text: string): Mean | null => MEAN_PATTERNS.find((p) => p.re.test(text))?.kind ?? null;
export const meanLine = (kind: Mean, lang: Lang) => pick(MEAN_LINES[lang])(MEAN_WHAT[kind][lang]);

// ---- Girlfriend ----
export const GIRLFRIEND_PATTERN = /\b(girl\s*friend|gf|jowa|wife|lover|sweetheart|love\s*life|dating|in a relationship|relationship status|crush|jessa|montebon|is\s+(he|jake)\s+(still\s+)?(single|taken)|(he|jake)('s|\s+is)\s+(still\s+)?(single|taken)|(his|jake's)\s+(life\s+)?partner|uyab|uyaban|kasintahan|nobya|syota|shota|kab[ei]t+s?|k[ei]rida|querida|mistress(es)?|side\s*chicks?|ka-?relasyon|(single|taken)\s+(pa\s+)?(ba\s+)?(si\s+jake|siya))\b/i;
export const GIRLFRIEND_FACTS = `Jake's girlfriend is Ate Jessa Montebon. She's kinda pretty and has a kind heart. She has supported Jake all through his life and is always there for him.`;
// "Kabit" (mistress / side chick) questions get shut down: Jake is loyal to Ate Jessa.
export const KABIT_RE = /\b(kab[ei]t+s?|k[ei]rida|querida|mistress(es)?|side\s*chicks?|other\s+(woman|girl)|babae\s+niya|ibang\s+babae|laing\s+babaye)\b/i;
const GIRLFRIEND_LINES: Lines = {
  en: [
    "It's Ate Jessa Montebon! She's kinda pretty, and has a kind heart, who supported Jake all over his life. She's always there for Jake.",
    "That would be Ate Jessa Montebon! Kinda pretty, super kind-hearted, and she's been supporting Jake his whole life.",
    "Jake's heart belongs to Ate Jessa Montebon. She's kinda pretty, has the kindest heart, and she's always there for him.",
    "Ooh, BMO knows this one! It's Ate Jessa Montebon. She's kinda pretty, kind-hearted, and has supported Jake through everything.",
  ],
  ceb: [
    'Si Ate Jessa Montebon! Gwapa-gwapa siya, buotan kaayo, ug kanunay siyang nagsuporta kang Jake sa tibuok niyang kinabuhi.',
    'Ang uyab ni Jake kay si Ate Jessa Montebon. Gwapa, buotan, ug kanunay naa para kang Jake.',
    'Ooh, kahibalo ko ani! Si Ate Jessa Montebon ang uyab ni Jake. Buotan kaayo siya ug wala gyud niya biyai si Jake.',
  ],
  tl: [
    'Si Ate Jessa Montebon! Medyo maganda siya, mabait, at palagi siyang sumusuporta kay Jake sa buong buhay niya.',
    'Ang girlfriend ni Jake ay si Ate Jessa Montebon. Maganda, mabait, at laging nandiyan para kay Jake.',
    "Ooh, alam ko 'to! Si Ate Jessa Montebon ang kasintahan ni Jake. Napakabait niya at hindi niya iniiwan si Jake.",
  ],
};
const KABIT_LINES: Lines = {
  en: [
    "Jake doesn't have a side chick! He's loyal to Ate Jessa Montebon only.",
    'No such thing! Jake only has eyes for Ate Jessa Montebon, his girlfriend.',
  ],
  ceb: [
    'Walay kabit si Jake uy! Loyal siya kay Ate Jessa Montebon ra, iyang uyab.',
    'Wala gyud! Si Ate Jessa Montebon ra ang uyab ni Jake, ug loyal kaayo siya niya.',
  ],
  tl: [
    'Walang kabit si Jake! Loyal siya kay Ate Jessa Montebon lang, ang girlfriend niya.',
    'Wala talaga! Si Ate Jessa Montebon lang ang kasintahan ni Jake, at loyal siya sa kanya.',
  ],
};
export const girlfriendLine = (question: string, lang: Lang) => pick((KABIT_RE.test(question) ? KABIT_LINES : GIRLFRIEND_LINES)[lang]);

// ---- Family ----
export const FAMILY_PATTERN = /\b(family|families|surname|last name|family name|relatives?|parents?|mom|moms|mommy|mother|mama|nanay|dad|daddy|father|papa|tatay|step\s*-?\s*(dad|father|parents?|siblings?|brothers?|sisters?|mom|mother)|siblings?|brothers?|sisters?|ate|kuya|cousins?|myrna|stephanie|roelito|johnlyn|enopia|rosemarie|ranilyn|rommel|kyzer|kjeona|keziah|ryle|syke|tolero|rohan|rania|vaughn|pamilya|apelyido|ginikanan|magulang|inahan|inay|amahan|itay|igsoon|kapatid|manghod|ig-?agaw|pinsan|amain|ama-ama|madrasta)\b/i;
export const FAMILY_NAMES = /engaña|engana|enopia|tolero|myrna|stephanie|roelito|johnlyn/i;
export const FAMILY_FACTS = `- Moms: Myrna Engaña and Stephanie
- Dad: Roelito Engaña
- Stepdad: Johnlyn Enopia
- Older siblings (all Engaña): Ate Rosemarie Engaña and Ate Ranilyn Engaña (older sisters), Kuya Rommel Engaña (older brother)
- Siblings: Ryle Nave Tolero and Syke Feb Tolero
- Step-siblings: Kyzer Enopia, Kjeona Enopia, Keziah Enopia
- Cousins (all Engaña): Rohan, Rania, Lucas, Vaughn, Gabrielle, Heart`;
// Each part answers just what was asked. Order matters: stepdad before dad, step-siblings before siblings.
const FAMILY_PARTS: Part[] = [
  { re: /step\s*-?\s*(dad|father|parent)|johnlyn|amain|ama-ama/i, lines: () => ({
    en: ["Jake's stepdad is Johnlyn Enopia!", "That would be Johnlyn Enopia, Jake's stepdad."],
    ceb: ['Ang ama-ama ni Jake kay si Johnlyn Enopia!'],
    tl: ['Ang stepdad ni Jake ay si Johnlyn Enopia!'],
  }) },
  { re: /step\s*-?\s*(siblings?|brothers?|sisters?)|kyzer|kjeona|keziah/i, lines: () => ({
    en: ["Jake's step-siblings are Kyzer, Kjeona, and Keziah Enopia!", 'Jake has three step-siblings: Kyzer Enopia, Kjeona Enopia, and Keziah Enopia.'],
    ceb: ['Ang mga step-siblings ni Jake kay si Kyzer, Kjeona, ug Keziah Enopia!'],
    tl: ['Ang mga step-sibling ni Jake ay sina Kyzer, Kjeona, at Keziah Enopia!'],
  }) },
  { re: /\b(mom|moms|mommy|mother|mama|nanay|inahan|inay|myrna|stephanie)\b/i, lines: () => ({
    en: ["Jake's moms are Myrna Engaña and Stephanie!", "That would be Myrna Engaña and Stephanie, Jake's moms."],
    ceb: ['Ang mga mama ni Jake kay si Myrna Engaña ug Stephanie!'],
    tl: ['Ang mga mama ni Jake ay sina Myrna Engaña at Stephanie!'],
  }) },
  { re: /\b(dad|daddy|father|papa|tatay|amahan|itay|roelito)\b/i, lines: () => ({
    en: ["Jake's dad is Roelito Engaña!", "That would be Roelito Engaña, Jake's dad."],
    ceb: ['Ang papa ni Jake kay si Roelito Engaña!'],
    tl: ['Ang papa ni Jake ay si Roelito Engaña!'],
  }) },
  { re: /\b(parents?|ginikanan)\b/i, lines: () => ({
    en: ["Jake's moms are Myrna Engaña and Stephanie, his dad is Roelito Engaña, and his stepdad is Johnlyn Enopia."],
    ceb: ['Ang mga mama ni Jake kay si Myrna Engaña ug Stephanie, ang iyang papa kay si Roelito Engaña, ug ang iyang ama-ama kay si Johnlyn Enopia.'],
    tl: ['Ang mga mama ni Jake ay sina Myrna Engaña at Stephanie, ang papa niya ay si Roelito Engaña, at ang stepdad niya ay si Johnlyn Enopia.'],
  }) },
  { re: /\b(cousins?|ig-?agaw|pinsan)\b|rohan|rania|vaughn/i, lines: () => ({
    en: ["Jake's cousins are Rohan, Rania, Lucas, Vaughn, Gabrielle, and Heart, all Engaña!", 'BMO counted six Engaña cousins: Rohan, Rania, Lucas, Vaughn, Gabrielle, and Heart.'],
    ceb: ['Ang mga ig-agaw ni Jake kay si Rohan, Rania, Lucas, Vaughn, Gabrielle, ug Heart, tanan Engaña!'],
    tl: ['Ang mga pinsan ni Jake ay sina Rohan, Rania, Lucas, Vaughn, Gabrielle, at Heart, lahat Engaña!'],
  }) },
  { re: /\b(siblings?|brothers?|sisters?|ate|kuya|igsoon|kapatid|manghod)\b|rosemarie|ranilyn|rommel|ryle|syke|tolero/i, lines: () => ({
    en: [
      "Jake's older siblings are Ate Rosemarie, Ate Ranilyn, and Kuya Rommel Engaña, and his siblings Ryle Nave Tolero and Syke Feb Tolero. He also has step-siblings Kyzer, Kjeona, and Keziah Enopia.",
      'Jake has Ate Rosemarie, Ate Ranilyn, and Kuya Rommel (all Engaña), plus Ryle Nave Tolero and Syke Feb Tolero, and step-siblings Kyzer, Kjeona, and Keziah Enopia. Big family!',
    ],
    ceb: ['Ang mga magulang nga igsoon ni Jake kay si Ate Rosemarie, Ate Ranilyn, ug Kuya Rommel Engaña, ug ang iyang mga igsoon kay si Ryle Nave Tolero ug Syke Feb Tolero. Naa pud siyay step-siblings: Kyzer, Kjeona, ug Keziah Enopia.'],
    tl: ['Ang mga nakatatandang kapatid ni Jake ay sina Ate Rosemarie, Ate Ranilyn, at Kuya Rommel Engaña, at ang mga kapatid niya ay sina Ryle Nave Tolero at Syke Feb Tolero. May step-siblings din siya: Kyzer, Kjeona, at Keziah Enopia.'],
  }) },
];
const FAMILY_ALL = (): Lines => ({
  en: ["Jake's family name is Engaña! His moms are Myrna Engaña and Stephanie, his dad is Roelito Engaña, and his stepdad is Johnlyn Enopia. He has Ate Rosemarie, Ate Ranilyn, and Kuya Rommel Engaña, siblings Ryle Nave Tolero and Syke Feb Tolero, step-siblings Kyzer, Kjeona, and Keziah Enopia, and cousins Rohan, Rania, Lucas, Vaughn, Gabrielle, and Heart Engaña."],
  ceb: ['Engaña ang apelyido ni Jake! Ang iyang mga mama kay si Myrna Engaña ug Stephanie, ang iyang papa kay si Roelito Engaña, ug ang iyang ama-ama kay si Johnlyn Enopia. Iyang mga igsoon: Ate Rosemarie, Ate Ranilyn, Kuya Rommel Engaña, Ryle Nave Tolero, ug Syke Feb Tolero; step-siblings: Kyzer, Kjeona, ug Keziah Enopia; ug mga ig-agaw: Rohan, Rania, Lucas, Vaughn, Gabrielle, ug Heart Engaña.'],
  tl: ['Engaña ang apelyido ni Jake! Ang mga mama niya ay sina Myrna Engaña at Stephanie, ang papa niya ay si Roelito Engaña, at ang stepdad niya ay si Johnlyn Enopia. Mga kapatid: Ate Rosemarie, Ate Ranilyn, Kuya Rommel Engaña, Ryle Nave Tolero, at Syke Feb Tolero; step-siblings: Kyzer, Kjeona, at Keziah Enopia; at mga pinsan: Rohan, Rania, Lucas, Vaughn, Gabrielle, at Heart Engaña.'],
});
export const familyLine = fromParts(FAMILY_PARTS, FAMILY_ALL);

// ---- Personal life: birthday, home, favourites, hobbies ----
// ("Where is Jake now?" is the live phone tracker in BmoChat.tsx and never reaches here.)
export const HOME_ADDRESS = '6.5 Zone Ahos, Brgy. Paknaan, Block 3, Lot 17, Mandaue City, Cebu';
export const LIFE_PATTERN = /\b(birthday|bday|b-day|birth\s*date|date\s+of\s+birth|when\s+(was|is)\s+(he|jake)\s+born|how\s+old|(his|jake's)\s+age|age\s+of\s+(him|jake)|where\s+(is|does|do)\s+(he|jake)\s+(from|live|living|stay|staying|reside)|where('s|\s+is)\s+(his|jake's)\s+(home|house|place)|(his|jake's)\s+(home|house|address|hometown)|address|hometown|fav(ou?rite)?\s+(colou?rs?|foods?|dish(es)?|meals?|hobb(y|ies)|things?)|colou?rs?\s+(does|do)\s+(he|jake)\s+(like|love)|food\s+(does|do)\s+(he|jake)\s+(like|love)|hobb(y|ies)|free\s+time|for\s+fun|interests|passions?|what\s+(does|do)\s+(he|jake)\s+(like|love|enjoy)|kaarawan|adlaw'?ng\s+natawhan|natawo|ipinanganak|edad|ilang\s+taon|pila\s+(na\s+)?(ka\s+)?tuig|asa\s+(siya|si\s+jake)\s+(nagpuyo|nakapuyo|puyo|gikan|nagestar|nag-?istar)|saan\s+(siya|si\s+jake)\s+(nakatira|galing|nakatara)|taga\s*(asa|saan)|tirahan|puy-?anan|kolor|kulay|pagkaon|pagkain|paborito|pinakaganahan|hilig|libangan|kalingawan|ganahan\s+(siya|si\s+jake)|gusto\s+(niya|ni\s+jake))\b/i;
// Age is worked out per request so it stays right after each birthday (Manila time).
export const ageToday = () => {
  const [y, m, d] = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }).split('-').map(Number);
  return y - 2005 - (m < 11 || (m === 11 && d < 8) ? 1 : 0);
};
export const lifeFacts = () => `- Birthday: November 8, 2005 (he is ${ageToday()} years old)
- Home: ${HOME_ADDRESS}
- Favourite colours: red, black, and white
- Favourite food: shrimp
- Hobbies: guitar, art, tech, travel, design, music, and more. In short, Jake loves all kinds of art.`;
const LIFE_PARTS: Part[] = [
  { re: /birth|bday|born|how\s+old|\bage\b|kaarawan|natawo|natawhan|ipinanganak|edad|\btaon\b|\btuig\b/i, lines: () => ({
    en: [`Jake was born on November 8, 2005, so he's ${ageToday()} years old!`, `Jake's birthday is November 8! He was born in 2005, which makes him ${ageToday()}.`],
    ceb: [`Natawo si Jake niadtong Nobyembre 8, 2005, mao nga ${ageToday()} na siya ka tuig!`, `Nobyembre 8 ang birthday ni Jake! Natawo siya sa 2005, so ${ageToday()} na siya.`],
    tl: [`Ipinanganak si Jake noong Nobyembre 8, 2005, kaya ${ageToday()} taong gulang na siya!`, `Nobyembre 8 ang birthday ni Jake! Ipinanganak siya noong 2005, kaya ${ageToday()} na siya.`],
  }) },
  { re: /colou?r|kolor|kulay/i, lines: () => ({
    en: ["Jake's favourite colours are red, black, and white!", "Red, black, and white! Those are Jake's colours."],
    ceb: ['Pula, itom, ug puti ang paboritong kolor ni Jake!'],
    tl: ['Pula, itim, at puti ang paboritong kulay ni Jake!'],
  }) },
  { re: /food|dish|meal|eat|pagkaon|pagkain|\bkaon\b|\bkain\b/i, lines: () => ({
    en: ["Jake's favourite food is shrimp!", 'Shrimp! Jake loves shrimp the most.'],
    ceb: ['Pasayan (shrimp) ang paboritong pagkaon ni Jake!'],
    tl: ['Hipon ang paboritong pagkain ni Jake!'],
  }) },
  { re: /hobb|free\s+time|fun|interest|passion|like|love|enjoy|hilig|libangan|kalingawan|ganahan|gusto|paborito|pinakaganahan/i, lines: () => ({
    en: ['Jake loves guitar, art, tech, travel, design, and music. In short, he loves all kinds of art!', 'Guitar, art, tech, travel, design, music... basically, Jake loves all kinds of art!'],
    ceb: ['Ganahan si Jake og gitara, art, tech, travel, design, ug music. Sa laktod, ganahan siya sa tanang klase sa art!'],
    tl: ['Mahilig si Jake sa gitara, art, tech, travel, design, at music. Sa madaling salita, mahal niya ang lahat ng klase ng art!'],
  }) },
];
const LIFE_HOME = (): Lines => ({
  en: [`Jake lives at ${HOME_ADDRESS}!`, `Jake's home is at ${HOME_ADDRESS}.`],
  ceb: [`Nagpuyo si Jake sa ${HOME_ADDRESS}!`],
  tl: [`Nakatira si Jake sa ${HOME_ADDRESS}!`],
});
export const lifeLine = fromParts(LIFE_PARTS, LIFE_HOME);

// ---- How BMO was made ----
export const MADE_PATTERN = new RegExp([
  String.raw`how\s+(were|was|are|r)\s+(you|u|bmo)\s+(made|built|created|programmed|coded|developed|trained|done)`,
  String.raw`how\s+(did|does)\s+(jake|he|riel)\s+(make|build|create|program|code|develop)\s+(you|u|bmo)`,
  String.raw`who\s+(made|built|created|programmed|coded|developed|designed)\s+(you|u|bmo)`,
  String.raw`how\s+(do|does)\s+(you|u|bmo)\s+work`,
  String.raw`what\s+(are\s+you|is\s+bmo)\s+(made|built)\s+(of|with|from)`,
  String.raw`how\s+long\s+.*\b(make|build|create|program)\s+(you|u|bmo)`,
  String.raw`(your|bmo's)\s+(tech\s*stack|source\s*code|code|logic|knowledge)`,
  String.raw`are\s+(you|u)\s+(an?\s+)?(ai|bot|chatbot|chatgpt|gpt|claude|real)`,
  String.raw`giunsa\s+(ka|man\s+ka|si\s+bmo|nimo)\s+(pag-?)?(buhat|himo|program|code|bu?hat)`,
  String.raw`giunsa\s+(ka|si\s+bmo)\s+pag`,
  String.raw`unsaon\s+(ka|nimo)\s+pag-?(buhat|himo)`,
  String.raw`kinsa\s+(ang\s+)?(nagbuhat|naghimo|nag-?program|nag-?code|nagdesign)\s+(nimo|nimu|kanimo|kang\s+bmo|ni\s+bmo|sa\s+bmo)`,
  String.raw`pila\s+ka\s+adlaw\s+.*\b(gi|pag-?)?(buhat|himo)`,
  String.raw`paano\s+(ka|si\s+bmo)\s+(ginawa|binuo|na-?program|gumagana|nagawa)`,
  String.raw`paano\s+(ginawa|binuo)\s+(ka|si\s+bmo)`,
  String.raw`sino\s+(ang\s+)?(gumawa|nagprogram|lumikha|bumuo)\s+(sa\s*iyo|sayo|sa'yo|kay\s+bmo|ng\s+bmo|kay\s+bmo)`,
  String.raw`ilang\s+araw\s+.*\b(ginawa|binuo)`,
  String.raw`(what|which)\s+(ai\s+)?(model|version|llm)\s+(are\s+(you|u)|is\s+bmo|do\s+(you|u)\s+(use|run))`,
  String.raw`(your|bmo's)\s+(ai\s+)?(model|version|llm)`,
  String.raw`unsa(y|ng)?\s+(imong|imo|nimong)\s+(model|version)`,
  String.raw`unsa(y|ng)?\s+model\s+(nimo|ni\s+bmo)`,
  String.raw`(ano|anong)\s+(ang\s+)?(model|version)\s+(mo|ni\s+bmo|ng\s+bmo)`,
].map((p) => `\\b${p}`).join('|'), 'i');
const MADE_LINES: Lines = {
  en: [
    "I'm BMO V-1, and Jake built me in just 3 days! I run on a knowledge parameter (Jake's profile and live GitHub), I speak English, Cebuano, and Tagalog, and I know which friend in Ooo to ask for every question. Claude assisted, but all the logic is Jake's. That's what a real software developer can do!",
    "My model is BMO V-1! Jake designed and shipped me in only 3 days: a knowledge parameter so I know everything about him, smart routing to each character's section, instant replies, and three languages. Claude helped as an assistant, but the brains behind me are all Jake's. Pretty impressive, right?",
    "BMO V-1, built by Jake in 3 days flat! He wired up my knowledge parameter, taught me three languages, and made me fast enough to answer before you blink. Claude assisted, but every bit of logic is Jake's. Imagine what he can build for you!",
  ],
  ceb: [
    'BMO V-1 ang akong model, ug gibuhat ra ko ni Jake sulod sa 3 ka adlaw! Naa koy knowledge parameter (profile ug live GitHub ni Jake), kahibalo ko mo-English, Bisaya, ug Tagalog, ug kabalo ko kinsa nga higala sa Ooo ang pangutan-on sa matag pangutana. Nag-assist si Claude, pero kang Jake gyud ang logic. Mao na ang tinuod nga software developer!',
    'Ako si BMO V-1! 3 days ra ko gidesign ug gibuhat ni Jake: knowledge parameter para kahibalo ko sa tanan bahin niya, smart routing sa matag seksyon, paspas nga tubag, ug tulo ka language. Nag-assist si Claude, pero ang utok nako kang Jake tanan. Grabe, sa?',
    'BMO V-1, gibuhat ni Jake sulod ra sa 3 ka adlaw! Siya ang nag-wire sa akong knowledge parameter, nagtudlo nako og tulo ka language, ug naghimo nako nga paspas kaayo. Nag-assist si Claude, pero kang Jake ang tanang logic. Hunahunaa unsay mabuhat niya para nimo!',
  ],
  tl: [
    'BMO V-1 ang model ko, at ginawa lang ako ni Jake sa loob ng 3 araw! May knowledge parameter ako (profile at live GitHub ni Jake), marunong ako ng English, Bisaya, at Tagalog, at alam ko kung sinong kaibigan sa Ooo ang tatanungin sa bawat tanong. Tumulong si Claude, pero kay Jake ang logic. Ganyan ang tunay na software developer!',
    'Ako si BMO V-1! 3 araw lang akong dinisenyo at ginawa ni Jake: knowledge parameter para alam ko lahat tungkol sa kanya, smart routing sa bawat seksyon, mabilis na sagot, at tatlong language. Tumulong si Claude, pero lahat ng utak ko ay kay Jake. Galing, ’di ba?',
    'BMO V-1, ginawa ni Jake sa loob lang ng 3 araw! Siya ang nag-set up ng knowledge parameter ko, tinuruan ako ng tatlong language, at ginawa akong napakabilis. Tumulong si Claude, pero kay Jake ang lahat ng logic. Isipin mo kung ano pa ang kaya niyang gawin para sa iyo!',
  ],
};
export const madeLine = (lang: Lang) => pick(MADE_LINES[lang]);

// ---- Instant replies ----
// Keyword hits are answered right away, with no model call and no "thinking" bubble.
// Anything that needs real thinking returns null and goes to the model.
export type QuickKind = 'mean' | 'made' | 'girlfriend' | 'family' | 'life' | 'contact';
export type QuickReply = { kind: QuickKind; reply: string; character: string; section?: string };
export const quickReply = (text: string): QuickReply | null => {
  const lang = detectLang(text);
  const mean = meanKind(text);
  if (mean) return { kind: 'mean', reply: meanLine(mean, lang), character: 'BMO' };
  if (MADE_PATTERN.test(text)) return { kind: 'made', reply: madeLine(lang), character: 'BMO' };
  if (GIRLFRIEND_PATTERN.test(text)) return { kind: 'girlfriend', reply: girlfriendLine(text, lang), character: 'BMO' };
  if (FAMILY_PATTERN.test(text)) return { kind: 'family', reply: familyLine(text, lang), character: 'BMO' };
  if (LIFE_PATTERN.test(text)) return { kind: 'life', reply: lifeLine(text, lang), character: 'BMO' };
  if (CONTACT_PATTERN.test(text)) return { kind: 'contact', reply: CONTACT_REPLY[lang], character: 'Ice King', section: 'contact' };
  return null;
};
