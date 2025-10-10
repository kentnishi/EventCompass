export type EventSummary = {
id: number;
title: string;
startTime: string; // ISO
};


export type PreferencesPayload = {
popularDays: { day: string; count: number }[];
popularTimes: { time: string; score: number }[];
vendors: { name: string; rating: number }[];
themes: string[];
};


export type LastEventPayload = {
event: {
id: number;
title: string;
when: string;
where: string;
};
stats: { total: number; attended: number; walkins: number; noshow: number; pct: number };
feedback: { pro: string; con: string };
};