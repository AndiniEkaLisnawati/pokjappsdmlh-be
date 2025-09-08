const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({ storage: multer.memoryStorage() });
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
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
      type,
    } = req.body;

  
    let profilePictureUrl = req.body.photo || "";

    
    if (req.file) {
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(
          `public/${Date.now()}_${req.file.originalname}`,
          req.file.buffer,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: req.file.mimetype,
          }
        );

      if (error) throw error;

      const { data: publicUrlData, error: urlError } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(data.path);

      if (urlError) throw urlError;

      profilePictureUrl = publicUrlData.publicUrl;
    }

    const newLecturer = await prisma.lecturer.create({
      data: {
        name,
        photo: profilePictureUrl,
        expertise: expertise
          ? Array.isArray(expertise)
            ? expertise
            : JSON.parse(expertise) 
          : [],
        position,
        education,
        experience,
        certifications: certifications
          ? Array.isArray(certifications)
            ? certifications
            : JSON.parse(certifications)
          : [],
        email,
        phone,
        trainings_conducted: trainings_conducted
          ? parseInt(trainings_conducted)
          : 0,
        participants_trained: participants_trained
          ? parseInt(participants_trained)
          : 0,
        status,
        type,
      },
    });

    res.status(201).json(newLecturer);
  } catch (error) {
    console.error("Error creating lecturer:", error);
    res.status(500).json({ error: "Error creating lecturer" });
  }
});


router.get("/", async (req, res) => {
  try {
    const lecturers = await prisma.lecturer.findMany();
    res.status(200).json(lecturers);
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    res.status(500).json({ error: "Error fetching lecturers" });
  }
});

router.put("/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.lecturer.findUnique({
      where: { id: String(id) },
    });
    if (!existing) {
     return res.status(404).json({ message: "Lecturer not found!" });
    }

    let profilePictureUrl = existing.photo;

    if (req.file) {
      const newPath = `public/${Date.now()}_${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(newPath, req.file.buffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from("profile-pictures")
        .getPublicUrl(data.path);

      if (urlError) throw urlError;

      profilePictureUrl = publicUrlData.publicUrl;

      if (existing.photo) {
        const prefix = "/storage/v1/object/public/profile-pictures/";
        if (existing.photo.includes(prefix)) {
          const oldPath = existing.photo.split(prefix)[1];
          await supabase.storage.from("profile-pictures").remove([oldPath]);
        }
      }
    }

    const updatedLecturer = await prisma.lecturer.update({
      where: { id: String(id) },
      data: {
        name: req.body.name || existing.name,
        photo: profilePictureUrl,
        expertise: req.body.expertise
          ? Array.isArray(req.body.expertise)
            ? req.body.expertise
            : JSON.parse(req.body.expertise)
          : existing.expertise,
        position: req.body.position || existing.position,
        education: req.body.education || existing.education,
        experience: req.body.experience || existing.experience,
        certifications: req.body.certifications
          ? Array.isArray(req.body.certifications)
            ? req.body.certifications
            : JSON.parse(req.body.certifications)
          : existing.certifications,
        email: req.body.email || existing.email,
        phone: req.body.phone || existing.phone,
        trainings_conducted: req.body.trainings_conducted
          ? parseInt(req.body.trainings_conducted)
          : existing.trainings_conducted,
        participants_trained: req.body.participants_trained
          ? parseInt(req.body.participants_trained)
          : existing.participants_trained,
        status: req.body.status || existing.status,
        type: req.body.type || existing.type,
      },
    });

    res.status(200).json(updatedLecturer);
  } catch (error) {
    console.error("Error updating lecturer:", error);
    res.status(500).json({ error: "Error updating lecturer" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.lecturer.findUnique({
      where: { id: String(id) },
    });

    if (!existing) {
     return res.status(404).json({ error: "Lecturer Not found!" });
    }

    if (existing.photo) {
      const prefix = "/storage/v1/object/public/profile-pictures/";
      if (existing.photo.includes(prefix)) {
        const oldPath = existing.photo.split(prefix)[1];
        await supabase.storage.from("profile-pictures").remove([oldPath]);
      }
    }

    await prisma.lecturer.delete({
      where: { id: String(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lecturer:", error);
    res.status(500).json({ error: "Error deleting lecturer" });
  }
});

module.exports = router;
