const express = require('express')
const {PrismaClient} = require('@prisma/client');
const { route } = require('./lpkRoutes');
const { date } = require('zod');
const { id } = require('zod/locales');

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
  try{

    const allPartner = await prisma.partnership.findMany();
    res.json(allPartner);
  }catch(err){
    res.status(500).json({error: err.message})
  }
})

router.put('/:id', async(req, res) => {
 try {
  const data = req.body;
  const updated = await prisma.partnership.update({
    where: {id: req.params.id},
    data,
  });

  res.json(updated);
 } catch (err) {
  res.status(400).json({ error: err.message, detail: err });
 } 
})

router.delete('/:id', async(req, res) => {
  try {
    await prisma.partnership.delete({
      where: {id: req.params.id}
    })

    res.status(200).json({message: "Delete Succesfully"})
  } catch (err) {
    res.status(400).json({errors: res.message})
  }
})
module.exports = router;

