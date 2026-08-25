import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { foodStandards, ncscOt, ncscProtocols } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'A temperature excursion changes nothing until it triggers a defined response',
  standfirst: 'Temperature-controlled operations already produce abundant readings. The harder problem is turning a material change into a response that happens quickly and can be evidenced afterwards, with the equipment history and the operator’s own notes still visible.',
  thesis: 'A credible cold-chain service must connect signal quality, operating context, the colleague who responds and the evidence of correction in one traceable exception case.',
  sceneLabel: 'The situation',
  sceneTitle: 'A temperature excursion lasts eight minutes. The commercial consequence could last much longer',
  sceneParagraphs: [
    'An overnight operator sees a threshold breach. The number alone cannot explain whether a loading door opened, a unit entered defrost, a probe lost calibration or sensitive product faced a genuine excursion. Several systems hold fragments of the answer, while the response expectation depends on severity that has not yet been established.',
    'The decision clock starts before the evidence has assembled itself. The proposed collaboration creates value by building a trustworthy path from physical signal to owned response and recorded recovery; another alert would add little.',
  ],
  sections: [
    {
      heading: 'Contextual value of telemetry',
      paragraphs: [
        { text: 'The same temperature can represent routine loading, a defrost cycle, a failing unit or a product risk. Duration, asset state, product, location and recent activity change the interpretation. A system that applies a threshold without this context increases alert volume while leaving the operator’s underlying question unanswered.' },
        { text: 'The proposed evidence model therefore combines the reading and duration with asset state, product context and operator observation. The relative weights in the graphic are modelled design priorities. None measures a contribution to food safety or commercial performance.' },
        { text: 'For the eight-minute event, context is the difference between immediate escalation and documented observation. Yet context is useful only if the underlying signal can be trusted. The next step is to test the physical and digital path that produced it.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
    },
    {
      heading: 'Signal-quality controls',
      transition: 'Context can change the meaning of an excursion only if the underlying signal is reliable enough to support interpretation.',
      paragraphs: [
        { text: 'Missing heartbeats, implausible jumps and uncertain calibration should be visible as data exceptions. Quietly filling a gap or presenting a weak reading with false precision makes the operating risk harder to see. Discovery must therefore document sensor placement, calibration, gateways, connectivity and known blind spots before automated classification is trusted.' },
        { text: 'NCSC guidance supports maintaining a definitive view of operational technology and validating data at trust boundaries. It also supports architectural separation when information moves from operational equipment into analytical services. These controls reduce the chance that monitoring creates an unnecessary route back into equipment.', sources: [ncscOt, ncscProtocols] },
        { text: 'In the overnight event, signal validation determines whether the queue contains a product case or an instrumentation case. Once that distinction is explicit, the service can turn the event into a case an operator can act on and close.' },
      ],
    },
    {
      heading: 'Exception-case operating model',
      transition: 'Validation clarifies the signal but does not say who acts. Context and responsibility are what turn it into an exception case.',
      paragraphs: [
        { text: 'An alert records that a rule fired. An exception case assembles the validated signal, duration, operating context, the applicable policy, the named responder, the corrective action and the evidence of recovery. Missing information remains visible. The reviewer receives a decision object with enough context to act.' },
        { text: 'Every stage is necessary. Equal weighting in the control graphic denotes dependency and carries no claim about economic contribution. A validated signal that nobody is required to act on leaves the work undone; an action nobody records leaves the assurance file incomplete. Food-safety guidance likewise connects monitoring with effective corrective action while leaving responsibility with the operator.', sources: [foodStandards] },
        { text: 'For the eight-minute excursion, closure might record a loading event, stable subsequent readings and the operator’s inspection. Repeated cases can then reveal equipment or policy patterns. Before adopting this model, however, management should consider whether the additional structure risks overengineering routine monitoring.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }, { kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Monitoring without intervention',
      role: 'counterargument',
      transition: 'The exception case makes the response traceable, but the control case must still separate watching the plant from acting on it.',
      paragraphs: [
        { text: 'Cold-chain data can create value without changing an immediate operating decision. Routine records support assurance, trend analysis, maintenance and retrospective investigation. A service that forces every minor movement into an elaborate case could increase workload and distract from material events.' },
        { text: 'The design should therefore distinguish routine evidence from qualifying exceptions. Continuous records can remain available for reporting and analysis, while a case is created only when signal quality, duration and context meet an agreed policy. Historical replay can test that policy before live escalation.' },
        { text: 'This narrower claim is stronger than saying data is useful only when it changes a decision. The collaboration should be judged by whether it improves attention and evidence where action is required without making ordinary monitoring harder.' },
      ],
    },
    {
      heading: 'Parallel-pilot decision',
      role: 'conclusion',
      transition: 'Once monitoring is separated from control, a parallel pilot becomes the appropriate test of attention quality and missed-event risk.',
      paragraphs: [
        { text: 'The eight-minute event should be replayed through the proposed service. The pilot would test whether the signal is validated correctly, whether the context changes severity, whether the case reaches the colleague who can act on it, and whether closing it preserves enough evidence for later review.' },
        { text: 'Management should compare the service with current practice using signal coverage, alert precision, unassigned exception age, response time, closure completeness and reporting effort. The proposed targets remain hypotheses until representative live and historical cases have been observed.' },
        { text: 'A successful pilot would not transfer responsibility to software. It would give the operator a faster, more reliable account of what happened and what still needs to be decided. That is the operating value the original alert could not provide on its own.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Evidence model',
    title: 'A useful exception combines signal and operating context',
    summary: 'This is a modelled design weighting. It shows how a case can become more decision-ready without pretending that every input is equally important.',
    interpretation: {
      establishes: 'The proposed design needs more than a temperature number to support a reviewable operating decision.',
      doesNotEstablish: 'The weights are not measured contributions to food safety, response quality or financial value.',
      management: 'Test the evidence model against historical and live cases before using it to set severity.',
    },
    source: 'Quiet Gears service design, informed by FSA and NCSC guidance',
    points: [
      { label: 'Temperature and duration', value: 100, display: 'Core', detail: 'The observed excursion and its duration establish the initial operational question.' },
      { label: 'Asset operating state', value: 78, display: 'Material', detail: 'Defrost cycles, loading and equipment state can change the interpretation of a reading.' },
      { label: 'Product and location context', value: 66, display: 'Material', detail: 'Product sensitivity and sensor location influence consequence and priority.' },
      { label: 'Operator evidence', value: 48, display: 'Supporting', detail: 'Notes, inspection and corrective action complete the decision record.' },
    ],
  },
  {
    label: 'Control sequence',
    title: 'The value chain fails if any control stage is skipped',
    summary: 'A modelled control profile following the argument above. Equal weighting reflects dependency between the stages. None of it is a measured contribution.',
    interpretation: {
      establishes: 'The proposed exception route depends on validating the signal, classifying it in context, putting it in front of the right colleague, and evidencing the close.',
      doesNotEstablish: 'Equal bars do not mean the stages contribute equally to risk reduction or economic value.',
      management: 'Evaluate the complete route in parallel with current controls; optimisation of one isolated stage is insufficient.',
    },
    source: 'Quiet Gears synthesis of FSA, NCSC and NIST guidance',
    points: [
      { label: 'Validate signal', value: 100, display: 'Required', detail: 'Missing, stale or implausible readings must remain visible.' },
      { label: 'Classify context', value: 100, display: 'Required', detail: 'Threshold, duration, asset and product context establish materiality.' },
      { label: 'Assign response', value: 100, display: 'Required', detail: 'Every qualifying exception reaches a named colleague, with a stated time to respond.' },
      { label: 'Evidence closure', value: 100, display: 'Required', detail: 'Closure should preserve decision, corrective action and recovery evidence.' },
    ],
  },
];
