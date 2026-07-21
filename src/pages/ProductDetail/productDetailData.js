import productsData from "../Products/productsData";

const colorSwatches = ["#bf8322", "#f5e6d3", "#4b3621", "#1e2a5e", "#7c1f1f"];

const featureLibrary = [
  "Evens skin tone, moisturizing, sun protection, UV protection.",
  "The high-resolution clarity of a crystal.",
  "Designed to provide a bold, smudge-proof look.",
];

const reviewLibrary = [
  {
    name: "Wilson",
    date: "October 13, 2024",
    rating: 5,
    title: "Best product and quality.",
    body: "This fragrance is simply divine! It lasts all day and is perfect for any occasion. I love how versatile it is, making it my go-to for both day and night. The bottle is stunning and truly reflects the elegance of the brand.",
  },
  {
    name: "Wilson",
    date: "October 13, 2024",
    rating: 5,
    title: "Best product and quality.",
    body: "I can't get enough of this scent! It stays with me from morning to night, and I always receive compliments. The bottle design is gorgeous, and it feels luxurious to use. A must-have in my beauty routine!",
  },
  {
    name: "Wilson",
    date: "October 13, 2024",
    rating: 5,
    title: "Best product and quality.",
    body: "What a delightful fragrance! It lingers beautifully and is perfect for both casual and formal events. The iconic bottle design is a true representation of timeless elegance. I always feel confident wearing it.",
  },
];

const ratingBreakdown = [
  { stars: 5, count: 935 },
  { stars: 4, count: 308 },
  { stars: 3, count: 2 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export function getProductDetail(id) {
  const product = productsData.find((item) => item.id === id);
  if (!product) return null;

  return {
    ...product,
    images: [product.img, product.img, product.img, product.img, product.img],
    colors: colorSwatches,
    rating: 4.9,
    reviewCount: 1245,
    ratingBreakdown,
    features: featureLibrary,
    reviews: reviewLibrary,
  };
}

