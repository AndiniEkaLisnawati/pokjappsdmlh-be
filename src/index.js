const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();
require('dotenv').config();

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth')
const AdminRoutes = require('./routes/admin')
const LPKRoutes = require('./routes/lpkRoutes')
const partnership = require('./routes/partneship')
const TrainingRoutes = require('./routes/Training')
const completedTrainingsRoutes = require('./routes/completedTrainings')
const activityRoutes = require('./routes/activityRoutes');
const curriculumRoutes = require('./routes/curriculumRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);
app.use('/api', AdminRoutes);

app.use('/api/lpk', LPKRoutes);
app.use('/api/partnership', partnership);

app.use('/api/training', TrainingRoutes);
app.use('/api/completedTrainings', completedTrainingsRoutes);

app.use('/api/activity', activityRoutes);
app.use('/api/curriculum', curriculumRoutes);

app.use('/api/lecturer', lecturerRoutes);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}\nDatabase Conected!`);
});