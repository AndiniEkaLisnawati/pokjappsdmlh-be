const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user');
const app = express();
const authRoutes = require('./routes/auth')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});