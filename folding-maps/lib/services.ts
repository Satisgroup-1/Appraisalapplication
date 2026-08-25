export type ServiceUseCase = {
  title: string;
  problem: string;
  example: string;
  path: [string, string, string, string];
};

export type Service = {
  slug: string;
  number: string;
  group: 'Advise' | 'Build' | 'Embed';
  title: string;
  shortTitle: string;
  promise: string;
  summary: string;
  explanation: string;
  technologies: string[];
  stages: { label: string; detail: string }[];
  useCases: ServiceUseCase[];
  provisions: string[];
  safeguards: string[];
};

const serviceDemandOrder = [
  'ai-strategy',
  'workflow-automation',
  'claude-implementation',
  'chatgpt-training-for-teams',
  'ai-chatbot',
  'ai-implementation',
  'secure-ai-systems',
  'enterprise-ai',
  'agentic-ai',
  'legacy-modernisation',
] as const;

const serviceCatalogue: Service[] = [
  {
    slug: 'ai-strategy', number: '01', group: 'Advise', title: 'AI Strategy & Readiness', shortTitle: 'Strategy and readiness',
    promise: 'A prioritised AI direction grounded in what your organisation can support now.',
    summary: 'We connect AI opportunities to commercial outcomes, then assess the workflows, data, technology, governance and capability needed to deliver them.',
    explanation: 'Strategy and readiness belong in one decision process. We map valuable work, inspect the evidence behind current capability, compare opportunities using common value, feasibility and risk criteria, and sequence delivery around the gaps that must be resolved first.',
    technologies: ['Opportunity mapping', 'Readiness assessment', 'Target architecture', 'AI roadmap'],
    stages: [
      { label: 'Context', detail: 'Frame objectives, market pressures and operating constraints.' },
      { label: 'Inspect', detail: 'Review workflows, data, systems, governance and capability evidence.' },
      { label: 'Prioritise', detail: 'Compare options using common value, feasibility and risk criteria.' },
      { label: 'Sequence', detail: 'Create an owned roadmap with remediation, measures and review gates.' },
    ],
    useCases: [
      { title: 'Operations strategy', problem: 'A growing business sees many automation opportunities but cannot identify the strongest starting point.', example: 'Workflow and readiness evidence shows that document intake and exception handling should precede a general assistant rollout.', path: ['Operating goals', 'Evidence review', 'Use-case score', 'Release roadmap'] },
      { title: 'Pilot recovery', problem: 'A promising prototype has stalled between demonstration and dependable daily use.', example: 'The review separates model limitations from missing integration, unclear ownership and weak acceptance criteria, then defines a recovery release.', path: ['Pilot evidence', 'Failure modes', 'Readiness gaps', 'Recovery plan'] },
    ],
    provisions: ['Executive and user workshops', 'Workflow, data and system assessment', 'Prioritised use-case portfolio', 'Phased roadmap and remediation plan'],
    safeguards: ['Evidence before technology selection', 'Explicit assumptions and dependencies', 'Risk assessment at use-case level', 'Decision gates before material expansion'],
  },
  {
    slug: 'ai-implementation', number: '02', group: 'Build', title: 'Custom AI Systems', shortTitle: 'Custom AI systems',
    promise: 'Bespoke AI systems engineered around real work, data and controls.',
    summary: 'We design, build, integrate and launch purpose-built AI systems, from a bounded first release through to operational handover.',
    explanation: 'A custom implementation connects models to the surrounding software system. It includes data preparation, retrieval, orchestration, authentication, evaluation, observability, exception handling and user experience. Prompts and an off-the-shelf workspace cover very little of it.',
    technologies: ['LLM orchestration', 'Secure APIs', 'Retrieval systems', 'Evaluation harnesses'],
    stages: [
      { label: 'Ingest', detail: 'Validate requests, identity, context and source data.' },
      { label: 'Reason', detail: 'Route work through models, tools and deterministic rules.' },
      { label: 'Assure', detail: 'Apply evaluation, permissions, review and exception controls.' },
      { label: 'Operate', detail: 'Deliver outputs, telemetry and a route for correction.' },
    ],
    useCases: [
      { title: 'Document operations', problem: 'Teams repeatedly read, classify and transfer information from complex documents.', example: 'A controlled service extracts proposed fields, attaches source evidence and sends uncertain items to a reviewer.', path: ['Documents', 'Extraction', 'Confidence gate', 'System record'] },
      { title: 'Decision support', problem: 'Operational decisions require evidence spread across several systems and policies.', example: 'A decision workspace assembles relevant records, applies approved rules and presents a reviewable recommendation.', path: ['System context', 'Evidence synthesis', 'Human review', 'Recorded decision'] },
    ],
    provisions: ['Solution and data architecture', 'Application and integration engineering', 'Evaluation and control implementation', 'Deployment and operational handover'],
    safeguards: ['Least-privilege system access', 'Representative acceptance tests', 'Logged model and tool activity', 'Fallback and incident paths before launch'],
  },
  {
    slug: 'agentic-ai', number: '03', group: 'Build', title: 'Agentic AI', shortTitle: 'AI agents',
    promise: 'Agents that act within explicit authority, with evidence and people kept in the loop.',
    summary: 'We build agents that plan, use tools and complete variable multi-step work within carefully designed boundaries.',
    explanation: 'An agent receives a goal, observes state, selects tools and iterates until it reaches a stop condition. Dependability comes from constrained tools, validated inputs, state management, approval gates, audit logs and tested recovery behaviour.',
    technologies: ['Tool calling', 'Agent state', 'Browser control', 'Human approvals'],
    stages: [
      { label: 'Observe', detail: 'Read authorised context and current workflow state.' },
      { label: 'Plan', detail: 'Select a bounded sequence of permitted actions.' },
      { label: 'Act', detail: 'Use tools with schema validation and authority checks.' },
      { label: 'Confirm', detail: 'Verify the result, record evidence and escalate uncertainty.' },
    ],
    useCases: [
      { title: 'Case coordination agent', problem: 'Staff move repeatedly between inboxes, portals and records to progress routine cases.', example: 'An agent assembles the case, drafts updates and proposes system actions, pausing for approval before external changes.', path: ['Case state', 'Task plan', 'Approved tools', 'Case update'] },
      { title: 'Research agent', problem: 'Recurring market or supplier research consumes specialist time and lacks a consistent evidence trail.', example: 'An agent searches approved sources, extracts claims, flags conflicts and produces a cited research pack for review.', path: ['Research brief', 'Source search', 'Evidence check', 'Cited pack'] },
    ],
    provisions: ['Agent opportunity and authority design', 'Tool, memory and state architecture', 'Human approval and exception workflows', 'Evaluation and live monitoring'],
    safeguards: ['Explicit permitted actions', 'Human approval before material writes', 'Schema-validated tool inputs', 'Kill switch and bounded execution'],
  },
  {
    slug: 'ai-chatbot', number: '04', group: 'Build', title: 'Conversational AI', shortTitle: 'Conversational AI',
    promise: 'Useful text and voice conversations that resolve requests and know when to hand over.',
    summary: 'We build customer and employee assistants across web, messaging and telephony, connected to approved knowledge, workflows and support teams.',
    explanation: 'Conversational AI uses the same core system whether a person types or speaks. Retrieval, permissions and business rules ground the answer, while channel-specific controls handle dialogue state, identity, consent, interruptions, confirmation and transfer to a person.',
    technologies: ['Retrieval augmented generation', 'Dialogue state', 'Channel integration', 'Speech and telephony'],
    stages: [
      { label: 'Understand', detail: 'Identify the request, user context and permitted access.' },
      { label: 'Retrieve', detail: 'Find approved knowledge or call an authorised business tool.' },
      { label: 'Converse', detail: 'Respond in text or speech and confirm material details.' },
      { label: 'Resolve', detail: 'Complete the interaction or hand over with full context.' },
    ],
    useCases: [
      { title: 'Customer support assistant', problem: 'Support teams repeatedly answer product, delivery and policy questions across several channels.', example: 'An assistant answers from approved material, cites the relevant policy and opens a ticket when confidence is low.', path: ['Customer request', 'Knowledge retrieval', 'Grounded answer', 'Resolve or handover'] },
      { title: 'Voice appointment handling', problem: 'Front desks lose time to repeat calls for booking, rescheduling and preparation questions.', example: 'A voice service checks availability, confirms identity, updates the calendar and transfers sensitive requests.', path: ['Caller speech', 'Intent and identity', 'Calendar action', 'Confirmation'] },
    ],
    provisions: ['Conversation and knowledge architecture', 'Web, messaging and telephony integration', 'Identity, consent and handover controls', 'Evaluation and conversation analytics'],
    safeguards: ['Source-grounded material answers', 'Role-aware knowledge access', 'Confirmation before material action', 'Immediate human transfer and recovery'],
  },
  {
    slug: 'workflow-automation', number: '05', group: 'Build', title: 'AI Workflow Automation', shortTitle: 'Workflow automation',
    promise: 'Connected workflows that remove handoffs while keeping exceptions visible.',
    summary: 'We automate repeatable work across inboxes, documents, databases and business platforms, using AI only where interpretation is required.',
    explanation: 'Good automation separates predictable rules from probabilistic interpretation. Events trigger a workflow, validated data moves between systems, AI handles bounded classification or generation, and exceptions enter an owned review queue.',
    technologies: ['n8n', 'Make', 'Zapier', 'Cloud functions'],
    stages: [
      { label: 'Trigger', detail: 'Detect an event from an inbox, form, schedule or system.' },
      { label: 'Transform', detail: 'Validate, enrich and interpret the incoming information.' },
      { label: 'Route', detail: 'Apply rules, approvals and exception handling.' },
      { label: 'Record', detail: 'Update systems, notify owners and preserve an audit trail.' },
    ],
    useCases: [
      { title: 'Enquiry to opportunity', problem: 'Inbound enquiries are manually read, copied and routed before anyone can respond.', example: 'A workflow validates the request, classifies need, creates the CRM record and assigns the right response owner.', path: ['Inbox or form', 'Classify and enrich', 'CRM update', 'Owner notification'] },
      { title: 'Invoice exception handling', problem: 'Finance staff spend time checking routine invoices while genuine exceptions remain mixed into the queue.', example: 'Rules validate known fields, AI interprets supporting text and only unresolved discrepancies reach an approver.', path: ['Invoice received', 'Validation', 'Exception check', 'Post or review'] },
    ],
    provisions: ['Workflow discovery and process design', 'Automation and integration engineering', 'Approval and exception queues', 'Monitoring, documentation and ownership transfer'],
    safeguards: ['Deterministic rules where possible', 'Idempotent and retry-safe updates', 'Human review for uncertain cases', 'Complete processing and error logs'],
  },
  {
    slug: 'secure-ai-systems', number: '06', group: 'Build', title: 'Secure AI Systems', shortTitle: 'Secure AI',
    promise: 'Specialised AI that keeps sensitive data inside a security boundary you control.',
    summary: 'We implement local and offline models for isolated environments, with controlled private or hybrid connections only where the risk case permits them.',
    explanation: 'Secure AI begins with the threat model and information classification. We decide whether a workload requires fully offline inference, local retrieval and network isolation, or can use a governed hybrid route with policy-based model selection, redaction and tightly scoped integrations.',
    technologies: ['Local inference', 'Offline retrieval', 'Policy routing', 'Network isolation'],
    stages: [
      { label: 'Classify', detail: 'Map data sensitivity, threats, users and acceptable connectivity.' },
      { label: 'Specialise', detail: 'Select and evaluate models against the actual domain workload.' },
      { label: 'Isolate', detail: 'Deploy local, offline or controlled hybrid architecture.' },
      { label: 'Assure', detail: 'Test security, quality, access boundaries and operational recovery.' },
    ],
    useCases: [
      { title: 'Offline sensitive analysis', problem: 'Specialists need model assistance on restricted material that cannot be sent to a cloud service.', example: 'A local model and offline retrieval index analyse approved documents inside an isolated network with no external inference route.', path: ['Restricted data', 'Local retrieval', 'Offline inference', 'Reviewed result'] },
      { title: 'Controlled private assistant', problem: 'Executives need help across confidential sources while different information classes require different processing routes.', example: 'A policy layer keeps sensitive work local, redacts approved requests for external models and records every route decision.', path: ['User request', 'Data classification', 'Policy route', 'Controlled response'] },
    ],
    provisions: ['Threat model and data classification', 'Local model and infrastructure selection', 'Offline retrieval and application engineering', 'Security testing and operational handover'],
    safeguards: ['No cloud route for isolated workloads', 'Network and identity segmentation', 'Encrypted storage and audited access', 'Controlled updates and removable-media procedures'],
  },
  {
    slug: 'legacy-modernisation', number: '07', group: 'Build', title: 'Legacy System Modernisation', shortTitle: 'Legacy modernisation',
    promise: 'Replace fragile legacy tools without losing the rules and data the business depends on.',
    summary: 'We turn spreadsheets, Access databases and ageing applications into supported systems with clearer workflows, reliable data and safer change.',
    explanation: 'Modernisation begins by recovering the true operating model from code, formulas, records and user practice. We separate valuable business rules from accidental complexity, design the target system, migrate through testable stages and keep a rollback route until acceptance.',
    technologies: ['System archaeology', 'Data migration', 'Web applications', 'API integration'],
    stages: [
      { label: 'Recover', detail: 'Map rules, data, users, dependencies and failure points.' },
      { label: 'Design', detail: 'Define the target workflow, architecture and migration boundary.' },
      { label: 'Migrate', detail: 'Clean, reconcile and move data through repeatable pipelines.' },
      { label: 'Cut over', detail: 'Validate, train, parallel-run and retire the old system safely.' },
    ],
    useCases: [
      { title: 'Operational database replacement', problem: 'A critical desktop database depends on one person and cannot support secure concurrent work.', example: 'The rules and records move into a role-based web application with tested migration and a complete audit history.', path: ['Legacy rules', 'Target model', 'Migration checks', 'Modern application'] },
      { title: 'Spreadsheet operating system', problem: 'A network of spreadsheets drives planning but creates duplicated data and hidden formula risk.', example: 'The process becomes a shared application with validated inputs, workflow states and management reporting.', path: ['Workbook network', 'Process model', 'Controlled data', 'Shared workflow'] },
    ],
    provisions: ['Legacy discovery and dependency mapping', 'Target architecture and experience design', 'Application rebuild and data migration', 'Parallel run and controlled retirement'],
    safeguards: ['Reconciled migration totals', 'Business-rule regression tests', 'Rollback and continuity plan', 'Documented ownership and support model'],
  },
  {
    slug: 'claude-implementation', number: '08', group: 'Build', title: 'Enterprise AI Platform Implementation', shortTitle: 'AI platform implementation',
    promise: 'The right managed AI platform, configured and connected for the work your teams perform.',
    summary: 'We select and implement Claude, ChatGPT or Perplexity environments without forcing separate projects for each product.',
    explanation: 'Platform choice follows the workload, data boundary and user experience. We compare managed workspaces, APIs and research surfaces, then configure identity, retention, instructions, knowledge, connectors, evaluations and support around defined roles and tasks.',
    technologies: ['Claude', 'ChatGPT', 'Perplexity', 'Secure integrations'],
    stages: [
      { label: 'Select', detail: 'Compare task fit, information boundaries and platform controls.' },
      { label: 'Configure', detail: 'Set identity, administration, instructions and retention policy.' },
      { label: 'Connect', detail: 'Add approved knowledge, APIs and permissioned business tools.' },
      { label: 'Evaluate', detail: 'Test quality, safety, adoption and operational support.' },
    ],
    useCases: [
      { title: 'Team productivity rollout', problem: 'Staff use personal AI accounts with inconsistent practice and no shared governance.', example: 'A managed workspace launches with role playbooks, approved data rules, champions and representative task evaluations.', path: ['Managed identity', 'Role playbook', 'AI workspace', 'Adoption evidence'] },
      { title: 'Connected operations assistant', problem: 'Users can reason in a chat workspace but must manually carry every action into business systems.', example: 'Permissioned connectors retrieve case data and propose updates that a user approves before execution.', path: ['User intent', 'System context', 'Approval gate', 'System action'] },
      { title: 'Research platform rollout', problem: 'Research teams repeat broad searches and lack a consistent way to verify current sources.', example: 'A governed research workflow defines source standards, citation checks and expert acceptance before findings enter a decision.', path: ['Research brief', 'Current sources', 'Citation review', 'Accepted finding'] },
    ],
    provisions: ['Vendor-neutral platform selection', 'Workspace and organisation configuration', 'Knowledge and integration engineering', 'Evaluation, training and adoption support'],
    safeguards: ['Managed identity and least privilege', 'Approved data-use and retention policy', 'Representative task evaluation', 'Human confirmation for external actions'],
  },
  {
    slug: 'enterprise-ai', number: '10', group: 'Embed', title: 'AI Adoption & Operating Model', shortTitle: 'AI adoption',
    promise: 'A scale-appropriate way to adopt AI across people, workflows and control functions.',
    summary: 'We embed AI into how a growing team already works, without importing unnecessary complexity or moving ownership away from the people doing the job.',
    explanation: 'The operating model should fit the organisation. A growing business may need one accountable owner and a focused release rhythm, while a larger organisation needs shared platforms, reusable controls and federated business ownership. Both require role change, adoption evidence and measured value.',
    technologies: ['Adoption diagnostics', 'Role playbooks', 'Federated governance', 'Portfolio telemetry'],
    stages: [
      { label: 'Focus', detail: 'Choose priority workflows, owners and measurable outcomes.' },
      { label: 'Standardise', detail: 'Define the lightest suitable platforms, patterns and controls.' },
      { label: 'Embed', detail: 'Launch role workflows with training and local ownership.' },
      { label: 'Assure', detail: 'Review quality, risk, adoption and realised value.' },
    ],
    useCases: [
      { title: 'Growing-team adoption', problem: 'A small operations team needs more capacity but cannot support a large platform programme.', example: 'One priority workflow launches with a named owner, practical policy, user training and a simple value review.', path: ['Priority constraint', 'Lightweight standard', 'Team release', 'Value evidence'] },
      { title: 'Multi-department rollout', problem: 'Different teams need distinct workflows while central functions require consistent controls.', example: 'A shared platform provides identity, logging and evaluation while each function owns approved sources and task patterns.', path: ['Central standard', 'Function context', 'Role workflow', 'Portfolio telemetry'] },
    ],
    provisions: ['Adoption and operating-model diagnostic', 'Platform, governance and delivery playbooks', 'Role workflows and capability building', 'Portfolio assurance and improvement support'],
    safeguards: ['Named outcome owners', 'Controls proportionate to organisation size', 'Value measured in target workflows', 'Portfolio-level incident management'],
  },
  {
    slug: 'chatgpt-training-for-teams', number: '11', group: 'Embed', title: 'AI Training for Teams', shortTitle: 'AI training',
    promise: 'Role-specific training that changes how real work is performed safely.',
    summary: 'We train leaders, general users, champions and technical teams using approved tools and representative organisational tasks.',
    explanation: 'Effective training combines conceptual understanding, task decomposition, context design, verification and policy. Participants practise on realistic work, compare weak and strong methods, and leave with repeatable workflows rather than prompt tricks.',
    technologies: ['Claude', 'ChatGPT', 'Perplexity', 'Role playbooks'],
    stages: [
      { label: 'Diagnose', detail: 'Identify roles, tasks, confidence, policy and learning needs.' },
      { label: 'Practise', detail: 'Work through realistic examples with approved data and tools.' },
      { label: 'Verify', detail: 'Apply source, quality and risk checks to each output.' },
      { label: 'Embed', detail: 'Create role playbooks, champions and continuing support.' },
    ],
    useCases: [
      { title: 'Role-based team training', problem: 'Generic awareness sessions do not translate into better daily work.', example: 'Finance, operations and commercial teams each practise distinct tasks using shared governance and review principles.', path: ['Role tasks', 'Guided practice', 'Quality check', 'Team playbook'] },
      { title: 'Board and leadership briefing', problem: 'Leaders need enough technical and governance understanding to make accountable decisions.', example: 'A decision-focused session covers capability, failure modes, oversight and the questions to ask before approval.', path: ['Decision context', 'Capability model', 'Risk scenarios', 'Leadership checklist'] },
    ],
    provisions: ['Training-needs and workflow assessment', 'Bespoke workshops and exercises', 'Leadership, champion and technical pathways', 'Playbooks and follow-up clinics'],
    safeguards: ['Approved or synthetic training data', 'Verification taught in every workflow', 'Policy explained through scenarios', 'Capability assessed through completed tasks'],
  },
];

export const services: Service[] = serviceDemandOrder.flatMap((slug, index) => {
  const service = serviceCatalogue.find((item) => item.slug === slug);
  return service ? [{ ...service, number: String(index + 1).padStart(2, '0') }] : [];
});

export const serviceAliases: Record<string, string> = {
  'ai-readiness': 'ai-strategy',
  'claude-consulting': 'claude-implementation',
  'voice-ai': 'ai-chatbot',
  'private-ai-concierge': 'secure-ai-systems',
  'chatgpt-implementation': 'claude-implementation',
  'perplexity-implementation': 'claude-implementation',
  'ai-for-smes': 'enterprise-ai',
  'ai-london': 'enterprise-ai',
};

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
