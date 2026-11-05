import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const categories = [
    { name: "Photo Studios", count: 48 },
    { name: "Sound Stages", count: 17 },
    { name: "Podcast Rooms", count: 32 },
    { name: "Music Suites", count: 26 },
    { name: "Art Workshops", count: 21 },
  ];
  res.json(categories);
});

export default router