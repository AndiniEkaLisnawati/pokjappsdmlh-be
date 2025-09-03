const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(process.env.DATABASE_URL, process.env.JWT_SECRET);

const upload = multer({ storage: multer.memoryStorage() });


router.post('/', upload.single('logo'), async (req, res) => {
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
      category,
      phoneNumber,
      contactPerson,
      email
    } = req.body;

    let logoUrl = null;

    if (req.file) {
  
      const fileName = `partner-logos/${Date.now()}-${req.file.originalname}`;

  
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

 
      const { data: publicUrl } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      logoUrl = publicUrl.publicUrl;
    }

    const newPartner = await prisma.partnership.create({
      data: {
        partnerName,
        scope,
        pksNumber,
        region,
        trainingsHeld: Number(trainingsHeld) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        category,
        phoneNumber,
        logoUrl,
        contactPerson,
        email
      }
    });

    res.status(201).json({ status: "success", data: newPartner });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: "error", message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const allPartner = await prisma.partnership.findMany();
    res.json({ status: "success", data: allPartner });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (req.file) {
      const fileName = `partner-logos/${Date.now()}-${req.file.originalname}`;
      const { data: uploaded, error } = await supabase.storage
        .from('logos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true, 
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      data.logoUrl = publicUrl.publicUrl;
    }

    const updated = await prisma.partnership.update({
      where: { id: String(id) },
      data,
    });

    res.json({ status: "success", data: updated });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.partnership.delete({
      where: { id: String(req.params.id) }
    });

    res.json({ status: "success", message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

module.exports = router;
