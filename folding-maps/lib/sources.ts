/**
 * Every external source cited in the insight articles, in one place, so a
 * link that goes stale is fixed once and an article cannot quietly cite a
 * different edition of the same document.
 */
import type { ReportSource } from '@/lib/reportNarrative';

export const ukBusinessData = { label: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' };
export const ukAdoption = { label: 'DSIT AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' };
export const oecdWorkforce = { label: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' };
export const stanfordIndex = { label: 'Stanford HAI, AI Index 2025', href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf' };
export const nistGenAi = { label: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' };
export const metrStudy = { label: 'METR, Experienced Developer Productivity Study, 2025', href: 'https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf' };
export const jaggedFrontier = { label: 'Harvard Business School, Navigating the Jagged Technological Frontier', href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf' };
export const ncscOt = { label: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' };
export const ncscProtocols = { label: 'NCSC, Secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' };
export const foodStandards = { label: 'Food Standards Agency, chilling guidance', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' };
export const qjeStudy = { label: 'Quarterly Journal of Economics, Generative AI at Work, 2025', href: 'https://academic.oup.com/qje/article/140/2/889/7990658' };
export const lawSocietyResearch = { label: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' };
export const sraAi = { label: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' };
export const icoAi = { label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' };
export const openAiIronclad = { label: 'OpenAI, Ironclad customer story (vendor material)', href: 'https://openai.com/index/ironclad/' };
export const googleRadisson = { label: 'Google Cloud, Radisson Hotel Group customer story (vendor material)', href: 'https://cloud.google.com/customers/radisson' };
export const googleTaua = { label: 'Google Cloud, Tauá Resorts customer story (vendor material)', href: 'https://cloud.google.com/customers/taua-resorts' };
export const microsoftSno = { label: 'Microsoft, SNÖ Hotels customer story (vendor material)', href: 'https://www.microsoft.com/en/customers/story/25861-sno-hotels-dynamics-365-business-central' };
export const openAiBooking = { label: 'OpenAI, Booking.com customer story (vendor material)', href: 'https://openai.com/index/booking-com/' };

export const gartnerAgents = { label: 'Gartner, over 40 percent of agentic AI projects will be cancelled by end of 2027, June 2025', href: 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027' };

export const allSources: ReportSource[] = [
  gartnerAgents,
  ukBusinessData,
  ukAdoption,
  oecdWorkforce,
  stanfordIndex,
  nistGenAi,
  metrStudy,
  jaggedFrontier,
  ncscOt,
  ncscProtocols,
  foodStandards,
  qjeStudy,
  lawSocietyResearch,
  sraAi,
  icoAi,
  openAiIronclad,
  googleRadisson,
  googleTaua,
  microsoftSno,
  openAiBooking,
];
