export const reactions = [
  'LIKE',
  'LOVE',
  'HAHA',
  'WOW',
  'SAD',
  'ANGRY',
] as const;
export type ReactionType = (typeof reactions)[number];
