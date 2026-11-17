export interface Milestone {
  id: string;
  text: string;
}

export interface Stage {
  months: number;
  label: string;
  items: Milestone[];
}

// Adapted from the CDC "Learn the Signs. Act Early." checklists (2022 update). Each list is what
// 75% or more of children do by that age, so a missing item is a reason to ask, not to worry.
export const STAGES: Stage[] = [
  {
    months: 2,
    label: '2 months',
    items: [
      { id: 'm2-1', text: 'Smiles when you talk to or smile at them' },
      { id: 'm2-2', text: 'Makes sounds other than crying' },
      { id: 'm2-3', text: 'Watches you as you move' },
      { id: 'm2-4', text: 'Holds head up when on tummy' },
    ],
  },
  {
    months: 4,
    label: '4 months',
    items: [
      { id: 'm4-1', text: 'Smiles on their own to get your attention' },
      { id: 'm4-2', text: 'Chuckles when you try to make them laugh' },
      { id: 'm4-3', text: 'Brings hands to mouth' },
      { id: 'm4-4', text: 'Holds a toy when you put it in their hand' },
      { id: 'm4-5', text: 'Pushes up onto elbows on tummy' },
    ],
  },
  {
    months: 6,
    label: '6 months',
    items: [
      { id: 'm6-1', text: 'Knows familiar people' },
      { id: 'm6-2', text: 'Laughs' },
      { id: 'm6-3', text: 'Makes squealing noises' },
      { id: 'm6-4', text: 'Reaches to grab a toy they want' },
      { id: 'm6-5', text: 'Rolls from tummy to back' },
    ],
  },
  {
    months: 9,
    label: '9 months',
    items: [
      { id: 'm9-1', text: 'Is shy, clingy or fearful around strangers' },
      { id: 'm9-2', text: 'Babbles sounds like "mamamama" and "babababa"' },
      { id: 'm9-3', text: 'Looks for objects when dropped out of sight' },
      { id: 'm9-4', text: 'Moves things from one hand to the other' },
      { id: 'm9-5', text: 'Sits without support' },
    ],
  },
  {
    months: 12,
    label: '12 months',
    items: [
      { id: 'm12-1', text: 'Plays games with you, like pat-a-cake' },
      { id: 'm12-2', text: 'Waves "bye-bye"' },
      { id: 'm12-3', text: 'Calls a parent "mama", "dada" or another special name' },
      { id: 'm12-4', text: 'Picks things up between thumb and pointer finger' },
      { id: 'm12-5', text: 'Pulls up to stand and walks holding on to furniture' },
    ],
  },
  {
    months: 15,
    label: '15 months',
    items: [
      { id: 'm15-1', text: 'Copies other children while playing' },
      { id: 'm15-2', text: 'Tries to say one or two words besides "mama" or "dada"' },
      { id: 'm15-3', text: 'Points to ask for something or to get help' },
      { id: 'm15-4', text: 'Tries to use things the right way, like a phone or book' },
      { id: 'm15-5', text: 'Takes a few steps on their own' },
    ],
  },
  {
    months: 18,
    label: '18 months',
    items: [
      { id: 'm18-1', text: 'Points to show you something interesting' },
      { id: 'm18-2', text: 'Tries to say three or more words besides "mama" or "dada"' },
      { id: 'm18-3', text: 'Follows one-step directions without gestures' },
      { id: 'm18-4', text: 'Walks without holding on to anyone or anything' },
      { id: 'm18-5', text: 'Tries to use a spoon' },
    ],
  },
  {
    months: 24,
    label: '2 years',
    items: [
      { id: 'm24-1', text: 'Notices when others are hurt or upset' },
      { id: 'm24-2', text: 'Says at least two words together, like "more milk"' },
      { id: 'm24-3', text: 'Points to at least two body parts when asked' },
      { id: 'm24-4', text: 'Plays with more than one toy at the same time' },
      { id: 'm24-5', text: 'Kicks a ball' },
    ],
  },
  {
    months: 36,
    label: '3 years',
    items: [
      { id: 'm36-1', text: 'Notices other children and joins them to play' },
      { id: 'm36-2', text: 'Talks with you in a conversation, at least two back-and-forths' },
      { id: 'm36-3', text: 'Says their first name when asked' },
      { id: 'm36-4', text: 'Draws a circle when you show them how' },
      { id: 'm36-5', text: 'Puts on some clothes by themselves' },
    ],
  },
  {
    months: 48,
    label: '4 years',
    items: [
      { id: 'm48-1', text: 'Pretends to be something else during play' },
      { id: 'm48-2', text: 'Says sentences with four or more words' },
      { id: 'm48-3', text: 'Names a few colours of items' },
      { id: 'm48-4', text: 'Catches a large ball most of the time' },
      { id: 'm48-5', text: 'Serves themselves food or pours water, with help' },
    ],
  },
  {
    months: 60,
    label: '5 years',
    items: [
      { id: 'm60-1', text: 'Follows rules or takes turns when playing games' },
      { id: 'm60-2', text: 'Tells a story with at least two events' },
      { id: 'm60-3', text: 'Counts to 10' },
      { id: 'm60-4', text: 'Hops on one foot' },
      { id: 'm60-5', text: 'Buttons some buttons' },
    ],
  },
];

export function stageFor(ageMonths: number): { current: Stage | null; next: Stage | null } {
  const index = STAGES.findLastIndex((stage) => stage.months <= ageMonths);
  return { current: STAGES[index] ?? null, next: STAGES[index + 1] ?? null };
}
