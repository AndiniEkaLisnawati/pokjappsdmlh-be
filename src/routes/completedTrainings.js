const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newCompleteTraining = await prisma.completedTraining.create({ data: data });
        res.json(newCompleteTraining);
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

router.get('/', async (req, res) => {
    const allCompleteTrainings = await prisma.completedTraining.findMany();
    res.json(allCompleteTrainings);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const updatedCompleteTraining = await prisma.completedTraining.update({
            where: { id: Number(id) },
            data: data
        });
        res.json(updatedCompleteTraining);
    }
    catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.completedTraining.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});
module.exports = router;