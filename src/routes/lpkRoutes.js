const express = require("express");
const {PrismaClient} = require ("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();



router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const newLPK = await prisma.lPK.create({ data: data });
    res.json(newLPK);
  } catch (err) {
    console.error({error: err.message && err.errors} )
    res.status(400).json({ error: err.errors || err.message });
  }
});

router.get("/", async (req, res) => {
  const allLPK = await prisma.lPK.findMany();
  res.json(allLPK);
});

router.put("/:id", async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.lPK.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await prisma.lPK.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

module.exports = router;
