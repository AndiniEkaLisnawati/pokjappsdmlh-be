const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const { 
        name,               
        photo,              
        expertise,         
        position,          
        education,        
        experience,       
        certifications,   
        email,           
        phone,           
        trainings_conducted,
        participants_trained,
        status,
        type
    } = req.body;
    let profilePictureUrl = null;
    if (req.file) {
        const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(`public/${Date.now()}_${req.file.originalname}`, req.file.buffer, {
          cacheControl: '3600',
            upsert: false,
            contentType: req.file.mimetype,
        });
        if (error) {
            throw error;
        }
        const { publicURL, error: urlError } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);
        if (urlError) {
            throw urlError;
        }
        profilePictureUrl = publicURL;
    }

    const newLecturer = await prisma.lecturer.create({
        data: {
            name,
            photo: profilePictureUrl,
            expertise,
            position,
            education,
            experience,
            certifications,
            email,
            phone,
            trainings_conducted,
            participants_trained,
            status,
            type
        }
    });
    res.status(201).json(newLecturer);
  } catch (error) {
    console.error('Error creating lecturer:', error);
    res.status(500).json({ error: 'Error creating lecturer' });
  }
});

router.get('/', async (req, res) => {
  try {
    const lecturers = await prisma.lecturer.findMany();
    res.status(200).json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ error: 'Error fetching lecturers' });
  }
}); 

router.put('/:id', async (req, res)=>{
    const { id } = req.params;
    const {
        name,
        photo,
        expertise,
        position,
        education,
        experience,
        certifications,
        email,
        phone,
        trainings_conducted,
        participants_trained,
        status,
        type
    } = req.body;

    try {
        const updatedLecturer = await prisma.lecturer.update({
            where: { id: String(id) },
            data: {
                name,
                photo,
                expertise,
                position,
                education,
                experience,
                certifications,
                email,
                phone,
                trainings_conducted,
                participants_trained,
                status,
                type
            }
        });
        res.status(200).json(updatedLecturer);
    } catch (error) {
        console.error('Error updating lecturer:', error);
        res.status(500).json({ error: 'Error updating lecturer' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.lecturer.delete({
            where: { id: String(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting lecturer:', error);
        res.status(500).json({ error: 'Error deleting lecturer' });
    }
});

module.exports = router;
