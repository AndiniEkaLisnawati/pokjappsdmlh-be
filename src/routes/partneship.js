const express = require('express')
const {PrismaClient} = require('@prisma/client');
const { route } = require('./lpkRoutes');
const { date } = require('zod');

const router = express.Router()
const prisma = new PrismaClient();

router.post('/',async(req, res) => {

   try {
    const {
      partnerName,
      scope,
      pksNumber,
      region,
      trainingsHeld,
      startDate,
      endDate,
      status,
      category
    } = req.body;

    const newPartner = await prisma.partnership.create({
      data: {
        partnerName,
        scope,
        pksNumber,
        region,
        trainingsHeld,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        category
      }
    });
        res.json(newPartner)
    } catch (err) {
        console.error({error: err.message && err.errors})
        res.status(400).json({error: err.message || err.errors})
    }
});

router.get('/', async(req,res) => {

})

module.exports = router;