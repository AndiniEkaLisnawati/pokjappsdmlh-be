const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newCurriculum = await prisma.curriculum.create({ data: data });
        res.json(newCurriculum);
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

router.get('/', async (req, res) => {
    const allCurriculums = await prisma.curriculum.findMany();
    res.json(allCurriculums);
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const updatedCurriculum = await prisma.curriculum.update({
            where: { id: String(id) },
            data: data,
        });
        res.json(updatedCurriculum);
    } catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;  
    try {
        await prisma.curriculum.delete({
            where: { id: String(id) }
        });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error({error: err.message && err.errors} )
        res.status(400).json({ error: err.errors || err.message });
    }
});

module.exports = router;