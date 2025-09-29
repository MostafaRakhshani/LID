export type Lot = {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  images: string[];
  description?: string;
};

export const lots: Lot[] = [
  {
    id: "kitchen-1",
    title: "لوازم آشپزخانه — محمولهٔ پایلوت",
    category: "لوازم خانه",
    basePrice: 500_000_000,
    currentPrice: 500_000_000,
    startAt: new Date().toISOString(),
    // ۲۰ دقیقه از الان
    endAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  images: ["/lots/spoon.jpg"],
    description: "۸ پالت، ۱۲٬۰۰۰ عدد قاشق و چنگال — تحویل: انبار منطقه آزاد چابهار",
  },
  {
    id: "apparel-1",
    title: "پوشاک — سری مخلوط",
    category: "پوشاک",
    basePrice: 300_000_000,
    currentPrice: 300_000_000,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    images: ["/placeholder.png"],
  }
];
