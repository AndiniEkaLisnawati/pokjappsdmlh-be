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
router.post('/', upload.single('activityImage'), async (req, res) => {
  try {
    const {
      title,
      date,
      location,
      type,
      participants,
      photos,
      description,
      image,
      photosUrl,
    } = req.body;

    let activityImageUrl = image || "";

    if (req.file) {
  
      const { data, error } = await supabase.storage
        .from('activity-images')
        .upload(`public/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: req.file.mimetype,
        });
      if (error) throw error;

   
      const { data: publicUrlData, error: urlError } = supabase.storage
        .from('activity-images')
        .getPublicUrl(data.path);
      if (urlError) throw urlError;

      activityImageUrl = publicUrlData.publicUrl;
    }

    const newActivity = await prisma.activity.create({
      data: {
        title,
        date: new Date(date),
        location,
        type,
        participants: parseInt(participants),
        photos: parseInt(photos),
        description,
        image: activityImageUrl,
        photosUrl,
      },
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Error creating activity', details: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany();
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Error fetching activities' });
  }
}); 

router.put('/:id', upload.single('activityImage'), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.activity.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Activity not found!' });
    }

    let activityImageUrl = existing.image;

    if (req.file) {
      const newPath = `public/${Date.now()}_${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('activity-images')
        .upload(newPath, req.file.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      const { data: publicUrlData, error: urlError } = supabase.storage
        .from('activity-images')
        .getPublicUrl(data.path);

      if (urlError) throw urlError;

      activityImageUrl = publicUrlData.publicUrl;

   
      if (existing.image) {
        const prefix = '/storage/v1/object/public/activity-images/';
        if (existing.image.includes(prefix)) {
          const oldPath = existing.image.split(prefix)[1];
          await supabase.storage.from('activity-images').remove([oldPath]);
        }
      }
    }

    const updateActivity = await prisma.activity.update({
      where: { id: String(id) },
      data: {
        title: req.body.title || existing.title,
        date: req.body.date ? new Date(req.body.date) : existing.date,
        location: req.body.location || existing.location,
        type: req.body.type || existing.type,
        participants: req.body.participants? parseInt(req.body.participants): existing.participants,
        photos: req.body.photos ? parseInt(req.body.photos) : existing.photos,
        description: req.body.description || existing.description,
        image: activityImageUrl,
        photosUrl: req.body.photosUrl || existing.photosUrl,
      },
    });

    res.status(200).json(updateActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Error updating activity', details: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.activity.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Activity not found!' });
    }

    if (existing.image) {
      const prefix = '/storage/v1/object/public/activity-images/';
      if (existing.image.includes(prefix)) {
        const oldPath = existing.image.split(prefix)[1];
        await supabase.storage.from('activity-images').remove([oldPath]);
      }
    }

    await prisma.activity.delete({
      where: { id: String(id) },
    });

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Error deleting activity', details: error.message });
  }
});


module.exports = router;