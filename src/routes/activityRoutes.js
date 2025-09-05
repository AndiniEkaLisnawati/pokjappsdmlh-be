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
    let activityImageUrl = null;

    if (req.file) {
      const { data, error } = await supabase.storage
        .from('activity-images')
        .upload(`public/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: req.file.mimetype,
        });
      if (error) {
        throw error;
      }
      const { publicURL, error: urlError } = supabase.storage
        .from('activity-images')
        .getPublicUrl(data.path);
      if (urlError) {
        throw urlError;
      }
      activityImageUrl = publicURL;
    }

    const newActivity = await prisma.activity.create({
      data: {
        ...req.body,
        activityImage: activityImageUrl,
      },
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Error creating activity' });
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
    let activityImageUrl = req.body.image || null;
    if (req.file) {
      const { data, error } = await supabase.storage
        .from('activity-images')
        .upload(`public/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: req.file.mimetype,
        });
      if (error) {
        throw error;
      }
      const { publicURL, error: urlError } = supabase.storage
        .from('activity-images')
        .getPublicUrl(data.path);
      if (urlError) {
        throw urlError;
      }
      activityImageUrl = publicURL;
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: String(id) },
      data: {
        ...req.body,
        activityImage: activityImageUrl,
      },
    });

    res.status(200).json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Error updating activity' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.activity.delete({
      where: { id: String(id) },
    });
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Error deleting activity' });
  }
});



module.exports = router;