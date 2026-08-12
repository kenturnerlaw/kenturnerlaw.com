import { readFile, writeFile } from "node:fs/promises";

const pages = {
  "index.html": ["Criminal Defense Attorney | Free Consultation | Ken Turner Law", "Arrested or under investigation? Contact criminal defense attorney Ken Turner for a free consultation. Serving Naples, Fort Myers, Miami, and Southwest Florida."],
  "arrested/index.html": ["Arrested in Florida? What to Do Next | Ken Turner Law", "Arrested or under investigation in Florida? Protect your rights, remain silent, and contact Ken Turner Law for a free criminal defense consultation."],
  "criminal-defense/index.html": ["Florida Criminal Defense Attorney | Ken Turner Law", "Florida criminal defense representation for DUI, drug charges, felonies, misdemeanors, traffic offenses, and probation violations. Free consultation."],
  "criminal-defense-naples/index.html": ["Naples Criminal Defense Attorney | Free Consultation", "Criminal defense attorney serving Naples and Collier County for DUI, drug, felony, misdemeanor, traffic, and probation cases. Free consultation."],
  "criminal-defense-fort-myers/index.html": ["Fort Myers Criminal Defense Attorney | Ken Turner Law", "Criminal defense representation in Fort Myers and Lee County for DUI, drug, felony, misdemeanor, traffic, and probation cases."],
  "criminal-defense-miami/index.html": ["Miami Criminal Defense Attorney | Ken Turner Law", "Criminal defense representation in Miami for DUI, drug charges, felonies, misdemeanors, traffic offenses, and probation violations."],
  "criminal-defense-labelle/index.html": ["LaBelle Criminal Defense Attorney | Ken Turner Law", "Criminal defense representation in LaBelle and Hendry County for DUI, drug, felony, misdemeanor, traffic, and probation cases."],
  "dui/index.html": ["Florida DUI Defense Attorney | Ken Turner Law", "Arrested for DUI in Florida? Learn about the criminal case, license consequences, evidence, and possible defenses. Free consultation."],
  "drug-charges/index.html": ["Florida Drug Charges Defense Attorney | Ken Turner Law", "Defense for Florida drug possession, sale, trafficking, and prescription-drug allegations. Discuss the charge and evidence in a free consultation."],
  "domestic-violence/index.html": ["Florida Domestic Violence Defense Attorney", "Defense for Florida domestic violence allegations, no-contact orders, injunction-related issues, and related criminal charges. Free consultation."],
  "felony-charges/index.html": ["Florida Felony Defense Attorney | Ken Turner Law", "Facing a felony charge in Florida? Learn about classifications, possible consequences, court procedure, evidence, and defense options."],
  "misdemeanor-charges/index.html": ["Florida Misdemeanor Defense Attorney | Ken Turner Law", "Defense for Florida misdemeanor charges, including court appearances, evidence review, negotiations, motions, and trial preparation."],
  "violation-of-probation/index.html": ["Florida Probation Violation Attorney | Ken Turner Law", "Accused of violating probation in Florida? Learn about warrants, hearings, evidence, possible penalties, and available defense options."],
  "suspended-license/index.html": ["Florida Suspended License Attorney | Ken Turner Law", "Defense for driving with a suspended or revoked license in Florida, including habitual traffic offender and reinstatement-related issues."],
  "traffic-offenses/index.html": ["Florida Criminal Traffic Attorney | Ken Turner Law", "Defense for Florida criminal traffic charges, suspended licenses, reckless driving, leaving the scene, and related driving offenses."],
  "divorce/index.html": ["Naples Divorce Attorney | Ken Turner Law", "Divorce representation in Naples for parenting, support, property, debt, alimony, enforcement, and modification issues."],
  "child-custody/index.html": ["Naples Child Custody Attorney | Ken Turner Law", "Florida parenting-plan and child-custody representation addressing timesharing, parental responsibility, relocation, support, and enforcement."],
  "best-interests-of-the-child-florida/index.html": ["Best Interests of the Child in Florida | Ken Turner Law", "A plain-language guide to the factors Florida courts consider when deciding parenting plans, parental responsibility, and timesharing."],
  "unbundled-legal-services-florida/index.html": ["Florida Unbundled Legal Services | Ken Turner Law", "Limited-scope family law services for people who need an attorney for specific tasks rather than full representation."],
  "practice-areas/index.html": ["Legal Services | Criminal Defense and Family Law", "Explore Ken Turner Law services, led by Florida criminal defense and supported by traffic, DUI, probation, divorce, and child-custody representation."],
  "reviews/index.html": ["Client Reviews of Ken Turner Law", "Read verified client reviews concerning communication, preparation, legal representation, and service at Ken Turner Law."],
  "clients/index.html": ["Current Client Resources | Ken Turner Law", "Access scheduling, client resources, document, billing, and communication information for current Ken Turner Law clients."],
  "blog/index.html": ["Florida Criminal Defense and Legal Updates", "Read Florida criminal defense explanations, legal updates, traffic guidance, and family law information from Ken Turner Law."],
  "updates/index.html": ["Ken Turner Law Firm Updates", "Firm announcements, website changes, new client resources, and service updates from Ken Turner Law."],
  "dont-pay-your-traffic-ticket-yet/index.html": ["Before You Pay a Florida Traffic Ticket", "Paying a Florida traffic ticket may cause points, insurance increases, or license consequences. Review your options before paying."],
  "negative-consequences-of-paying-a-traffic-ticket/index.html": ["Consequences of Paying a Florida Traffic Ticket", "Learn how paying a Florida traffic ticket can affect points, insurance costs, driving privileges, and future traffic matters."],
  "what-do-i-do-when-i-get-a-traffic-ticket/index.html": ["What to Do After a Florida Traffic Ticket", "Received a Florida traffic ticket? Learn what to check, which deadlines matter, and why paying immediately may not be the best option."],
  "why-do-i-need-an-attorney-for-a-traffic-ticket/index.html": ["Do I Need an Attorney for a Florida Traffic Ticket?", "Learn when legal representation may help with a Florida traffic ticket, court appearance, points, insurance, or license consequences."],
  "florida-criminal-defense-answers/index.html": ["Florida Criminal Defense Questions and Answers", "Plain-language answers about Florida arrests, searches, police questioning, bond, arraignment, discovery, probation, and criminal procedure."],
  "florida-criminal-defense-answers/can-police-search-my-car/index.html": ["Can Police Search My Car in Florida?", "Learn when Florida police may search a vehicle, how consent affects a search, and why the legality depends on the circumstances."],
  "florida-criminal-defense-answers/can-police-search-my-phone/index.html": ["Can Police Search My Phone in Florida?", "Learn when police may search a phone, the role of warrants and consent, and why digital searches raise distinct constitutional issues."],
  "florida-criminal-defense-answers/how-does-bond-work-in-florida/index.html": ["How Does Bond Work in Florida?", "A plain-language explanation of Florida bond, first appearance, release conditions, bond modification, and consequences of violations."],
  "florida-criminal-defense-answers/should-i-consent-to-a-search/index.html": ["Should I Consent to a Police Search in Florida?", "You may politely decline consent to a search. Learn what consent means, what police may do next, and why you should not physically resist."],
  "florida-criminal-defense-answers/should-i-talk-to-police/index.html": ["Should I Talk to Police Without an Attorney?", "Learn why remaining silent and requesting an attorney can protect you during a Florida criminal investigation or arrest."],
  "florida-criminal-defense-answers/what-happens-after-a-dui-arrest/index.html": ["What Happens After a DUI Arrest in Florida?", "A step-by-step overview of the criminal case, driver’s license deadlines, evidence, court appearances, and defense review after a Florida DUI arrest."],
  "florida-criminal-defense-answers/what-happens-after-a-probation-violation/index.html": ["What Happens After a Florida Probation Violation?", "Learn about violation affidavits, warrants, detention, hearings, evidence, and possible outcomes after an alleged Florida probation violation."],
  "florida-criminal-defense-answers/what-happens-at-arraignment/index.html": ["What Happens at a Florida Arraignment?", "Learn the purpose of arraignment, how pleas are entered, whether appearance may be waived, and what usually happens next."],
  "florida-criminal-defense-answers/what-happens-at-first-appearance/index.html": ["What Happens at First Appearance in Florida?", "Learn what a Florida judge considers at first appearance, including probable cause, release conditions, bond, and no-contact orders."],
  "florida-criminal-defense-answers/what-is-a-motion-to-suppress/index.html": ["What Is a Motion to Suppress in Florida?", "Learn how a motion to suppress challenges unlawfully obtained evidence and how suppression may affect a Florida criminal case."],
  "florida-criminal-defense-answers/what-is-a-no-contact-order/index.html": ["What Is a Florida No-Contact Order?", "Learn how Florida no-contact orders work, what conduct may violate an order, and why only the court can change its conditions."],
  "florida-criminal-defense-answers/what-is-criminal-discovery/index.html": ["What Is Criminal Discovery in Florida?", "Learn what may be included in Florida criminal discovery, how the defense reviews evidence, and why discovery can change case strategy."],
  "florida-criminal-defense-answers/what-is-probable-cause/index.html": ["What Is Probable Cause in Florida?", "Learn how probable cause affects arrests, warrants, searches, detention, and evidence in Florida criminal cases."],
  "florida-criminal-defense-answers/what-is-reasonable-suspicion/index.html": ["What Is Reasonable Suspicion in Florida?", "Learn how reasonable suspicion differs from probable cause and when it may permit a temporary stop or investigation in Florida."],
};

const heroHeadings = {
  "arrested/index.html": "Arrested or Under Investigation?",
  "criminal-defense/index.html": "Florida Criminal Defense Representation",
  "criminal-defense-naples/index.html": "Criminal Defense Attorney in Naples",
  "criminal-defense-fort-myers/index.html": "Criminal Defense Attorney in Fort Myers",
  "criminal-defense-miami/index.html": "Criminal Defense Attorney in Miami",
  "criminal-defense-labelle/index.html": "Criminal Defense Attorney in LaBelle",
  "dui/index.html": "Arrested for DUI in Florida?",
  "drug-charges/index.html": "Accused of a Drug Crime in Florida?",
  "domestic-violence/index.html": "Facing a Domestic Violence Allegation?",
  "felony-charges/index.html": "Charged With a Felony in Florida?",
  "misdemeanor-charges/index.html": "Charged With a Misdemeanor?",
  "violation-of-probation/index.html": "Accused of Violating Probation?",
  "suspended-license/index.html": "Driving With a Suspended License?",
  "traffic-offenses/index.html": "Facing a Criminal Traffic Charge?",
  "divorce/index.html": "Divorce Representation in Naples",
  "child-custody/index.html": "Florida Parenting and Child Custody Cases",
};

const esc = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

for (const [file, [title, description]] of Object.entries(pages)) {
  let html = await readFile(file, "utf8");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta\s+name=["']?description["']?\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta name="description" content="${esc(description)}">`);
  html = html.replace(/<meta\s+content=["'][^"']*["']\s+name=["']?description["']?\s*\/?\s*>/i, `<meta name="description" content="${esc(description)}">`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta property="og:title" content="${esc(title)}">`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta property="og:description" content="${esc(description)}">`);
  if (heroHeadings[file]) {
    html = html.replace(/<h1 class="ampstart-fullpage-hero-heading mb3">([\s\S]*?)<\/h1>/, (_, inner) => {
      const revised = inner.replace(/<span class="block caps h[23]">[\s\S]*?<\/span>/, `<h1 class="block caps h2">${heroHeadings[file]}</h1>`);
      if (revised === inner) throw new Error(`Hero service heading missing in ${file}`);
      return `<div class="ampstart-fullpage-hero-heading mb3">${revised}</div>`;
    });
  }
  html = html.replaceAll("BOOK PHONE APPOINTMENT", "BOOK FREE CONSULTATION");
  html = html.replaceAll("Drug Posession", "Drug Possession");
  html = html.replaceAll("DEPENDANCY", "DEPENDENCY").replaceAll("Dependancy", "Dependency");
  html = html.replace(/<div class="ampstart-navbar-trigger([^>]*)>☰<\/div>/, (tag, attrs) => {
    const cleaned = attrs.replace(/\s+aria-label=["'][^"']*["']/gi, "");
    return `<div class="ampstart-navbar-trigger${cleaned} aria-label="Open site navigation">☰</div>`;
  });
  html = html.replace(/[ \t]+$/gm, "");
  await writeFile(file, html);
}

let home = await readFile("index.html", "utf8");
home = home.replace('<h1 id="kt-home-title">Arrested?</h1>', '<h1 id="kt-home-title">Arrested or Under Investigation?</h1>');
home = home.replace('Call immediately. Criminal defense representation available now.', 'Criminal defense representation is available now in Naples, Fort Myers, Miami, and Southwest Florida.');
await writeFile("index.html", home);

const schemas = {
  "blog/index.html": { "@context": "https://schema.org", "@type": "CollectionPage", name: "Florida Criminal Defense and Legal Updates", description: pages["blog/index.html"][1], url: "https://www.kenturnerlaw.com/blog/", isPartOf: { "@type": "WebSite", name: "Ken Turner Law", url: "https://www.kenturnerlaw.com/" } },
  "practice-areas/index.html": { "@context": "https://schema.org", "@type": "CollectionPage", name: "Legal Services at Ken Turner Law", description: pages["practice-areas/index.html"][1], url: "https://www.kenturnerlaw.com/practice-areas/", isPartOf: { "@type": "WebSite", name: "Ken Turner Law", url: "https://www.kenturnerlaw.com/" } },
};
for (const [file, schema] of Object.entries(schemas)) {
  let html = await readFile(file, "utf8");
  if (!/application\/ld\+json/i.test(html)) html = html.replace(/<\/head>/i, `<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`);
  await writeFile(file, html);
}

console.log(`Updated SEO language on ${Object.keys(pages).length} pages.`);
