const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();
const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


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

    const existing = await prisma.partnership.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return res.status(404).json({ status: "error", message: "Partnership not found!" });
    }
    
    const data = { ...req.body };

    if (req.file) {
      const prefix = "/storage/v1/object/public/logos/";
      if (existing.logoUrl.includes(prefix)) {
        const path = existing.logoUrl.split(prefix)[1];
        await supabase.storage.from("logos").remove([path]);
      }

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
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
        trainingsHeld: data.trainingsHeld ? Number(data.trainingsHeld) : existing.trainingsHeld,
      }
    });

    res.json({ status: "success", data: updated });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.partnership.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return res.status(404).json({ status: "error", message: "Partnership not found!" });
    }

   
    if (existing.logoUrl) {
      const url = new URL(existing.logoUrl);
      const path = url.pathname.replace('/storage/v1/object/public/logos/', '');
      console.log("Deleting file:", path);

      const { error: deleteError } = await supabase.storage.from("logos").remove([path]);
      if (deleteError) console.error("Error deleting logo:", deleteError);
    }

    
    await prisma.partnership.delete({
      where: { id: String(id) },
    });

    res.json({ status: "success", message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
});
module.exports = router;
