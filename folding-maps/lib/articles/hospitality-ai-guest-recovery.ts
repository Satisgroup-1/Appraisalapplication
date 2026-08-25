import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { googleRadisson, googleTaua, icoAi, microsoftSno, openAiBooking } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Recovering a disrupted stay means reconciling five systems before anyone can act',
  standfirst: 'A disrupted stay becomes harder when reservation, property, loyalty and maintenance systems tell different versions of the same journey. AI can help staff explain and coordinate recovery after identity, entitlement and authority are reconciled.',
  thesis: 'A dependable guest-recovery service must reconcile guest identity, booking entitlement and live property state, then route feasible remedies through explicit compensation and escalation authority.',
  sceneLabel: 'The situation',
  sceneTitle: 'The guest has a confirmation and the room cannot be occupied',
  sceneParagraphs: [
    'After a delayed journey, a guest arrives with a valid confirmation. The property-management system shows the room assigned, a maintenance note marks it unavailable and the loyalty profile appears under a second email address. The front-desk colleague must resolve the stay while checking facts across several screens and waiting for authority to offer an alternative.',
    'This composite scene describes no real property or guest. It follows one disruption from identification to closure to show where connected records, controlled automation and human judgement can shorten recovery.',
  ],
  sections: [
    {
      heading: 'Recovery case formation',
      paragraphs: [
        { text: 'The confirmation proves a reservation, while leaving the feasible remedy unresolved. The colleague needs to know who the guest is, what was promised, which room and service alternatives exist now, what the policy permits and who can approve an exception.' },
        { text: 'A recovery case should therefore preserve guest and booking identifiers, promised product, disruption type, live property state, entitlement, the options offered, the colleague handling it, what was said to the guest and the evidence of closure. Every source retains its timestamp because availability and maintenance facts can change during the conversation.' },
        { text: 'The first evidence graphic treats all five record groups as required. Equal values express dependency and carry no measured contribution to satisfaction, speed or cost. A complete record will not guarantee a good recovery, but a missing identity or property state can make the proposed remedy invalid.' },
        { text: 'The scene now has a unit of work. The next problem is reconciling multiple identifiers without joining the wrong guest or booking.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 2 }],
    },
    {
      heading: 'Identity and entitlement',
      transition: 'Once the recovery case is defined, identity resolution determines which promises and permissions legitimately belong inside it.',
      paragraphs: [
        { text: 'A guest may appear under a booking reference, channel identifier, loyalty number, email and telephone number. Exact matches can be deterministic. Probabilistic matches need confidence, visible evidence and manual review. The system should never silently merge profiles because an incorrect match can expose personal data and apply another guest’s preferences or entitlement.' },
        { text: 'Entitlement derives from the booked product, rate conditions, loyalty status, disruption and approved service policy. These inputs should be versioned and reviewable. A model may explain the result in natural language; it should not invent a benefit or reinterpret a failed eligibility rule.' },
        { text: 'Purpose limitation matters when CRM history or inferred preferences enter the case. ICO guidance requires processing to be lawful and documented at every stage. The colleague handling the recovery needs only the information that helps resolve this service failure, with retention and access aligned to that purpose.', sources: [icoAi] },
        { text: 'Identity and entitlement establish what may be offered. Live property state determines what can actually be delivered.' },
      ],
    },
    {
      heading: 'Property state and remedy options',
      transition: 'Entitlement sets the permitted remedy space; current operational state narrows it to options the property can fulfil.',
      paragraphs: [
        { text: 'Reservation systems describe sold inventory and booking commitments. The property-management system carries room assignment and stay state. Housekeeping and maintenance records can make nominal inventory unavailable. Recovery logic must reconcile timestamps and source authority across those systems before proposing a room move, upgrade, external relocation or service credit.' },
        { text: 'The architecture uses connectors to form a read model for the recovery case. It does not replace source systems. Each option records the facts and policy version used, its capacity reservation and any dependency such as transport or manager approval. A stale connector places the option on hold.' },
        { text: 'First-party customer stories from Radisson, Tauá Resorts and SNÖ Hotels describe programmes built around more connected data and operating systems. They illustrate the feasibility of shared records in specific estates. The accounts do not establish a guest-recovery result for another group.', sources: [googleRadisson, googleTaua, microsoftSno] },
        { text: 'The system diagram shows where data converges and where authority remains. The colleague chooses among feasible options within policy, while a manager handles exceptions above the delegated limit.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 3 }],
    },
    {
      heading: 'Authority and recovery economics',
      transition: 'Feasible options still require a controlled decision, so the operating design must connect service judgement with compensation authority and measurement.',
      paragraphs: [
        { text: 'Compensation policy should define bands by disruption, entitlement and local operating context. Front-desk colleagues need enough authority to resolve common cases during the interaction. Higher-cost, unusual or sensitive remedies move to a named approver with the same evidence view.' },
        { text: 'A language model can draft a clear explanation from approved facts and remedies. The colleague checks the tone, the accuracy and what is being promised before it is sent. Accepted communications become events in the recovery history so another colleague can continue without asking the guest to repeat the story.' },
        { text: 'Measurement begins with acknowledgement time, time to feasible option, handoffs, repeat contacts, policy adherence, compensation by band and closure completeness. Guest feedback and future behaviour may add outcome evidence, with careful treatment of attribution and privacy. The second evidence view is a measurement architecture. It predicts no uplift.' },
        { text: 'Booking.com describes AI use across travel planning and service contexts. Its own account shows the breadth of channel coordination across a large estate, while supplying no forecast for the property-level recovery measures proposed here.', sources: [openAiBooking] },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 2 }],
    },
    {
      heading: 'Human service can outrun integration',
      role: 'counterargument',
      transition: 'A controlled service can make evidence and authority clearer, but the strongest objection is that hospitality recovery depends on human discretion under local conditions.',
      paragraphs: [
        { text: 'An experienced colleague can often resolve disruption through local knowledge and discretion faster than a new system can reconcile imperfect records. A rigid workflow may narrow empathy, delay a simple gesture or turn policy into a ceiling when an unusual situation warrants generosity.' },
        { text: 'Integration can also create a fragile dependency. A central case that waits for every connector may be slower than direct inspection, and centralised identity increases privacy and security consequence. The right fallback is an explicit manual route with delegated authority, later reconciliation and no requirement to wait for generated text.' },
        { text: 'The service belongs on recurring cross-system failures where reconstruction and approval delay are material. It should stay out of a straightforward conversation that one colleague can resolve safely. Override reasons become evidence about where policy, data or interface design is too restrictive.' },
        { text: 'This counterargument keeps the release focused on coordination. It does not ask software to substitute for judgement or care.' },
      ],
    },
    {
      heading: 'Recovery release threshold',
      role: 'conclusion',
      transition: 'The value of local discretion defines the release test: connected evidence must improve coordination while preserving the colleague’s ability to act.',
      paragraphs: [
        { text: 'For the guest in the opening scene, the service should reconcile identity, confirm what was promised, show the maintenance conflict, hold a feasible alternative and show the colleague’s authority before a commitment is made. Uncertain identity, stale property state or an out-of-band remedy triggers review.' },
        { text: 'A pilot should cover one disruption type at a small group of properties and run beside current escalation. Release requires fewer reconstructive handoffs, controlled policy exceptions, reliable connector health, no material privacy incident and staff evidence that the case helps them resolve the guest’s problem.' },
        { text: 'The guest should experience one conversation with a colleague who can act. The architecture behind it should be invisible to them. Connected systems matter when they give the colleague accurate options and authority at the moment recovery is still possible.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Case completeness',
    title: 'Recovery depends on five reconciled records',
    summary: 'A modelled dependency model for a guest-recovery case. Equal values are requirements and contain no measured hotel outcome.',
    interpretation: {
      establishes: 'The proposed route needs identity, promise, property state, authority and closure evidence before a colleague can act on it.',
      doesNotEstablish: 'A complete case does not guarantee guest satisfaction, faster resolution or lower compensation.',
      management: 'Test how fresh each connector is, and who maintains it, before measuring the quality of generated messages.',
    },
    source: 'Quiet Gears hospitality operating design (design values awaiting measurement)',
    points: [
      { label: 'Guest and booking identity', value: 100, display: 'Required', detail: 'The case must link the right guest, stay and channel reference.' },
      { label: 'Entitlement and promise', value: 100, display: 'Required', detail: 'The booked product and policy determine the permitted remedy space.' },
      { label: 'Live property state', value: 100, display: 'Required', detail: 'Room, housekeeping and maintenance state determine what can be fulfilled.' },
      { label: 'Recovery authority', value: 100, display: 'Required', detail: 'A named colleague or approver must hold authority for the remedy.' },
      { label: 'Action and closure evidence', value: 100, display: 'Required', detail: 'Commitments and outcomes must remain visible to the next colleague.' },
    ],
  },
  {
    label: 'Pilot measures',
    title: 'Recovery quality cannot be reduced to compensation cost',
    summary: 'Modelled measurement priorities for a parallel pilot. Values show proposed decision relevance. None of them forecasts an improvement.',
    interpretation: {
      establishes: 'The evaluation must cover who picks the case up, whether the remedy is feasible, the hand-offs, the policy and the guest outcome, across the complete recovery route.',
      doesNotEstablish: 'The weights do not predict satisfaction, loyalty, revenue or operating savings.',
      management: 'Use a balanced review so lower compensation cannot disguise slower or less humane recovery.',
    },
    source: 'Quiet Gears evaluation design (design values awaiting measurement)',
    points: [
      { label: 'Time until a colleague takes the case', value: 90, display: 'Core', detail: 'Measure the gap between the disruption being logged and one named colleague picking it up.' },
      { label: 'Time to feasible option', value: 100, display: 'Core', detail: 'Measure when a deliverable remedy becomes available. It is not when text is generated.' },
      { label: 'Repeat contacts and handoffs', value: 82, display: 'Material', detail: 'Repeated explanation is evidence of coordination failure.' },
      { label: 'Policy and compensation control', value: 88, display: 'Material', detail: 'Track approved bands, overrides and escalation decisions.' },
      { label: 'Guest outcome evidence', value: 78, display: 'Material', detail: 'Use feedback and subsequent behaviour carefully because attribution is incomplete.' },
    ],
  },
];
