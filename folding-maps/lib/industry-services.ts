export type IndustryServiceRecommendation = {
  slug: string;
  rationale: string;
};

export const industryServiceRecommendations: Record<string, IndustryServiceRecommendation[]> = {
  'aerospace-and-defense': [
    { slug: 'ai-strategy', rationale: 'Assess data, security, engineering assurance and programme ownership before introducing AI into controlled work.' },
    { slug: 'secure-ai-systems', rationale: 'Provide cited access to approved technical knowledge within defined security and access boundaries.' },
    { slug: 'workflow-automation', rationale: 'Improve requirements, supplier evidence and approval workflows without removing accountable review.' },
  ],
  agriculture: [
    { slug: 'enterprise-ai', rationale: 'Prioritise practical improvements that fit seasonal operations, available data and internal capacity.' },
    { slug: 'workflow-automation', rationale: 'Connect field observations, stock, planning and fulfilment with clear exception handling.' },
    { slug: 'ai-implementation', rationale: 'Deliver a bounded decision-support service for one crop, herd or operating unit.' },
  ],
  'automotive-and-assembly': [
    { slug: 'workflow-automation', rationale: 'Coordinate quality, maintenance, material and launch exceptions across existing plant systems.' },
    { slug: 'agentic-ai', rationale: 'Prepare multi-step investigation and response work while preserving engineering and quality approval.' },
    { slug: 'legacy-modernisation', rationale: 'Replace fragile production databases and spreadsheet processes with maintainable operational systems.' },
  ],
  chemicals: [
    { slug: 'ai-strategy', rationale: 'Evaluate process data, regulatory constraints and decision rights before selecting priority use cases.' },
    { slug: 'secure-ai-systems', rationale: 'Support secure access to formulations, safety information and technical records with source attribution.' },
    { slug: 'workflow-automation', rationale: 'Improve document control, batch exception and compliance workflows with deterministic approval gates.' },
  ],
  'consumer-packaged-goods': [
    { slug: 'ai-strategy', rationale: 'Prioritise opportunities across demand, innovation, commercial planning and supply operations.' },
    { slug: 'workflow-automation', rationale: 'Reduce manual coordination in product, promotion, supplier and customer workflows.' },
    { slug: 'claude-implementation', rationale: 'Establish cited market, competitor and consumer research methods for commercial teams.' },
  ],
  education: [
    { slug: 'ai-strategy', rationale: 'Define where AI supports teaching, administration and student services within institutional policy.' },
    { slug: 'secure-ai-systems', rationale: 'Give staff controlled access to approved policy, curriculum and operational knowledge.' },
    { slug: 'chatgpt-training-for-teams', rationale: 'Develop role-specific capability for leaders, educators, professional services and technical teams.' },
  ],
  'electric-power-and-natural-gas': [
    { slug: 'enterprise-ai', rationale: 'Create common architecture and controls across asset, network, service and corporate functions.' },
    { slug: 'secure-ai-systems', rationale: 'Support restricted operational and engineering knowledge with identity and evidence controls.' },
    { slug: 'workflow-automation', rationale: 'Improve work preparation, exception management and regulatory evidence across complex processes.' },
  ],
  'energy-and-materials': [
    { slug: 'ai-strategy', rationale: 'Assess data quality, operating risk and delivery capability across sites and value-chain activities.' },
    { slug: 'agentic-ai', rationale: 'Coordinate variable research, planning and operational tasks within explicit authority boundaries.' },
    { slug: 'legacy-modernisation', rationale: 'Modernise critical planning and information systems that restrict integration and analysis.' },
  ],
  'engineering-construction-and-building-materials': [
    { slug: 'legacy-modernisation', rationale: 'Replace disconnected project databases and spreadsheet controls with shared, maintainable systems.' },
    { slug: 'workflow-automation', rationale: 'Improve document, change, procurement and site-reporting workflows across project partners.' },
    { slug: 'enterprise-ai', rationale: 'Focus investment on practical use cases that fit specialist contractors and regional operators.' },
  ],
  'financial-services': [
    { slug: 'enterprise-ai', rationale: 'Establish shared architecture, assurance and portfolio governance across regulated functions.' },
    { slug: 'secure-ai-systems', rationale: 'Provide controlled access to client, policy and product knowledge with auditable permissions.' },
    { slug: 'chatgpt-training-for-teams', rationale: 'Build role-specific proficiency in verification, data handling and accountable use.' },
  ],
  healthcare: [
    { slug: 'ai-strategy', rationale: 'Assess clinical, operational, information-governance and adoption requirements before delivery.' },
    { slug: 'secure-ai-systems', rationale: 'Support secure, cited access to approved policy and professional knowledge.' },
    { slug: 'ai-implementation', rationale: 'Deliver bounded services with defined clinical or operational ownership and evaluation.' },
  ],
  industrials: [
    { slug: 'workflow-automation', rationale: 'Improve quote, order, quality and service workflows across operational systems.' },
    { slug: 'legacy-modernisation', rationale: 'Modernise specialist applications and databases that limit visibility and integration.' },
    { slug: 'agentic-ai', rationale: 'Prepare multi-step operational work and route exceptions to accountable specialists.' },
  ],
  infrastructure: [
    { slug: 'ai-strategy', rationale: 'Prioritise use cases against programme outcomes, asset risk and long-term operating requirements.' },
    { slug: 'ai-implementation', rationale: 'Build decision-support services around programme, asset and supplier information.' },
    { slug: 'secure-ai-systems', rationale: 'Protect commercially sensitive and security-relevant project knowledge.' },
  ],
  'life-sciences': [
    { slug: 'ai-strategy', rationale: 'Evaluate data provenance, validation, quality systems and accountable ownership before implementation.' },
    { slug: 'secure-ai-systems', rationale: 'Provide controlled access to research, quality and regulatory knowledge with full source visibility.' },
    { slug: 'claude-implementation', rationale: 'Create rigorous, cited research workflows with explicit expert verification.' },
  ],
  logistics: [
    { slug: 'workflow-automation', rationale: 'Improve booking, exception, documentation and customer communication across transport workflows.' },
    { slug: 'agentic-ai', rationale: 'Coordinate variable multi-system tasks while escalating commercial and operational exceptions.' },
    { slug: 'legacy-modernisation', rationale: 'Replace fragile planning and control tools that prevent consistent operational visibility.' },
  ],
  'metals-and-mining': [
    { slug: 'legacy-modernisation', rationale: 'Modernise production, maintenance and reporting systems that limit site-level integration.' },
    { slug: 'workflow-automation', rationale: 'Improve shift handover, work preparation and evidence capture across operating teams.' },
    { slug: 'secure-ai-systems', rationale: 'Securely connect technical procedures, asset history and operating knowledge.' },
  ],
  'oil-and-gas': [
    { slug: 'secure-ai-systems', rationale: 'Provide controlled access to engineering, safety and asset knowledge within strict data boundaries.' },
    { slug: 'agentic-ai', rationale: 'Prepare complex work packs and investigations while retaining formal technical authority.' },
    { slug: 'ai-strategy', rationale: 'Assess process safety, information quality and operational ownership before deployment.' },
  ],
  'packaging-and-paper': [
    { slug: 'workflow-automation', rationale: 'Improve order, specification, production and quality coordination across the plant.' },
    { slug: 'legacy-modernisation', rationale: 'Replace fragmented planning tools and databases with maintainable operational software.' },
    { slug: 'enterprise-ai', rationale: 'Select practical improvements that fit site economics and available delivery capacity.' },
  ],
  'private-capital': [
    { slug: 'claude-implementation', rationale: 'Establish cited market, company and sector research workflows for investment teams.' },
    { slug: 'secure-ai-systems', rationale: 'Protect confidential deal and portfolio information while improving knowledge access.' },
    { slug: 'ai-strategy', rationale: 'Define repeatable AI priorities across investment, diligence and portfolio value creation.' },
  ],
  'public-sector': [
    { slug: 'enterprise-ai', rationale: 'Create shared standards, architecture and assurance across departments and service teams.' },
    { slug: 'secure-ai-systems', rationale: 'Support secure, cited access to policy, case and operational knowledge.' },
    { slug: 'chatgpt-training-for-teams', rationale: 'Develop practical capability for leaders, service professionals and digital teams.' },
  ],
  'real-estate': [
    { slug: 'legacy-modernisation', rationale: 'Modernise property, asset and workflow systems that depend on manual reconciliation.' },
    { slug: 'ai-chatbot', rationale: 'Improve resident, tenant and customer access to approved service information.' },
    { slug: 'workflow-automation', rationale: 'Coordinate enquiries, maintenance, compliance and document workflows across portfolios.' },
  ],
  retail: [
    { slug: 'ai-chatbot', rationale: 'Provide consistent customer and colleague support linked to approved product and policy data.' },
    { slug: 'workflow-automation', rationale: 'Improve merchandising, supplier, fulfilment and service exception workflows.' },
    { slug: 'ai-implementation', rationale: 'Deliver a measurable use case within one store process or one service channel.' },
  ],
  semiconductors: [
    { slug: 'secure-ai-systems', rationale: 'Protect intellectual property while improving access to engineering and manufacturing knowledge.' },
    { slug: 'agentic-ai', rationale: 'Coordinate complex analysis and engineering preparation within defined approval boundaries.' },
    { slug: 'legacy-modernisation', rationale: 'Modernise specialist tools and data workflows that constrain engineering productivity.' },
  ],
  'social-sector': [
    { slug: 'enterprise-ai', rationale: 'Focus limited capacity on mission-linked improvements with proportionate governance.' },
    { slug: 'secure-ai-systems', rationale: 'Provide controlled access to policy and programme knowledge while protecting sensitive information.' },
    { slug: 'chatgpt-training-for-teams', rationale: 'Develop responsible, role-specific practice for frontline, fundraising and leadership teams.' },
  ],
  'technology-media-and-telecommunications': [
    { slug: 'enterprise-ai', rationale: 'Standardise reusable architecture, controls and evaluation across product and service teams.' },
    { slug: 'agentic-ai', rationale: 'Build multi-step product, support and engineering workflows around existing platforms.' },
    { slug: 'legacy-modernisation', rationale: 'Modernise critical software and data processes while maintaining service continuity.' },
  ],
  travel: [
    { slug: 'ai-chatbot', rationale: 'Improve customer access to confirmed itinerary, policy and service information.' },
    { slug: 'workflow-automation', rationale: 'Coordinate enquiry, booking, disruption and supplier workflows with visible exceptions.' },
    { slug: 'agentic-ai', rationale: 'Coordinate multi-system disruption and recovery work while keeping customer commitments under human control.' },
  ],
};

export function getIndustryServiceRecommendations(slug: string) {
  return industryServiceRecommendations[slug] ?? [];
}
