const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newTraining = await prisma.training.create({ data: data });
    res.json(newTraining);
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

router.get('/', async (req, res) => {
    const allTrainings = await prisma.training.findMany();
    res.json(allTrainings);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const updatedTraining = await prisma.training.update({
            where: { id: Number(id) },
            data: data
        });
        res.json(updatedTraining);
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.training.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

module.exports = router;
