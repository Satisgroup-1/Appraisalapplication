export const serviceJourney = [
  { number: '01', title: 'Listen and frame', timing: 'Initial conversation', detail: 'We understand the commercial objective, operating friction, constraints and decision context.', output: 'A concise opportunity frame and the evidence needed for the next decision.' },
  { number: '02', title: 'Diagnose the work', timing: 'Focused discovery', detail: 'We follow real work, map handoffs, inspect data and systems, and separate fixed rules from judgement.', output: 'A fact base, baseline, risk view and prioritised opportunity map.' },
  { number: '03', title: 'Design the release', timing: 'Decision point', detail: 'We define the smallest useful release, its architecture, controls, measures, delivery plan and investment range.', output: 'A written recommendation with scope, deliverables, responsibilities and acceptance criteria.' },
  { number: '04', title: 'Build with users', timing: 'Short delivery cycles', detail: 'We configure, engineer and test the system with representative work and regular user feedback.', output: 'A working release, documented decisions and visible progress against acceptance tests.' },
  { number: '05', title: 'Adopt and assure', timing: 'Controlled launch', detail: 'We train users, monitor exceptions, resolve defects and confirm that controls work in the live process.', output: 'A supported launch, operating guide, ownership model and performance baseline.' },
  { number: '06', title: 'Improve what works', timing: 'Evidence-led expansion', detail: 'We review value, adoption, quality and risk before expanding automation, users or connected systems.', output: 'A benefits review and an evidence-backed roadmap for the next release.' },
];

export const servicePathways = [
  { title: 'Opportunity diagnostic', bestFor: 'You know where work is difficult but not which intervention will pay.', includes: ['Workflow and stakeholder interviews', 'Baseline and constraint analysis', 'Prioritised options with value and risk', 'Written recommendation and release brief'] },
  { title: 'Working system release', bestFor: 'You have a defined operational problem and need a dependable first production release.', includes: ['Solution and data architecture', 'Application, integration or automation build', 'Evaluation, security and control design', 'Launch, training and operating documentation'] },
  { title: 'AI operating support', bestFor: 'You already use AI or automation and need stronger performance, governance or adoption.', includes: ['Performance and exception review', 'Model, prompt and workflow evaluation', 'Control and supplier assessment', 'Improvement backlog and delivery support'] },
];

export const firstConversation = [
  { number: '01', title: 'Tell us the constraint', detail: 'Share the outcome you want, where work slows down and any systems or deadlines that shape the opportunity.' },
  { number: '02', title: 'Receive a direct response', detail: 'We reply within one working day and suggest the most useful next conversation, usually a focused 30-minute call.' },
  { number: '03', title: 'Leave with a next decision', detail: 'We explain whether the need calls for a diagnostic, a bounded release, support, or no project at all.' },
];

