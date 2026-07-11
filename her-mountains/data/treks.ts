// data/treks.ts
// Photos are read dynamically from public/photos/{id}/ at runtime.
// cover.jpg  → hero image
// anything else (1.jpg, 2.jpg, DSC_001.jpg, etc.) → gallery
// Just drop files in the folder — no code changes needed.

export const treks = [
  {
    id: "harishchandragad",
    name: "Harishchandragad",
    state: "Maharashtra",
    yourLines: ["The first climb where I saw how far you'd go."],
    prompts: ["What do you remember most about the Konkan Kada?"],
  },
  {
    id: "kalsubai",
    name: "Kalsubai",
    state: "Maharashtra",
    yourLines: ["Highest point in Maharashtra — you didn't even flinch."],
    prompts: ["Was the ladder section scary or fun?"],
  },
  {
    id: "netravati",
    name: "Netravati",
    state: "Karnataka",
    yourLines: ["The trek that tested your patience, not just your legs."],
    prompts: ["What kept you going on the tougher stretches?"],
  },
  {
    id: "brahmatal",
    name: "Brahmatal",
    state: "Uttarakhand",
    yourLines: ["Snow, silence, and you smiling anyway."],
    prompts: ["Which moment on the snow felt unreal?"],
  },
  {
    id: "uttari-betta",
    name: "Uttari Betta",
    state: "Karnataka",
    yourLines: ["A quieter trek, but still yours."],
    prompts: ["What made this one special?"],
  },
  {
    id: "hampta-pass",
    name: "Hampta Pass",
    state: "Himachal Pradesh",
    yourLines: ["Two valleys, one you, completely in her element."],
    prompts: ["What surprised you most about crossing the pass?"],
  },
  {
    id: "kunti-betta",
    name: "Kunti Betta",
    state: "Karnataka",
    yourLines: ["A sunrise you chased before the world woke up."],
    prompts: ["Was the sunrise worth the early start?"],
  },
];
