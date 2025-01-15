const express = require("express");
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bcrypt = require('bcrypt');

const User = require('./models/userModel');
const checkAuth = require('./middleware/checkAuth');
const checkAdmin = require('./middleware/checkAdmin');

const app = express();

dotenv.config();

const port = process.env.PORT || 8080;

connectDB();

app.use(bodyParser.json());
//app.use(checkAuth);

//REGISTER
app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password: pass, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hash,
            role
        });

        const { password, ...userData } = user._doc;

        return res.status(201).json(userData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

//LOGIN
app.post('/login', async (req, res) => {
    try {
       const { email, password: pass } = req.body;
       const user = await User.findOne({ email });

       if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
       }

       const isValid = await bcrypt.compare(pass, user.password);

       if (!isValid) {
            return res.status(400).json({
                message: 'Invalid password or email'
            });
       }

       const { password, ...userData } = user._doc;

        return res.status(201).json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


app.get('/shop', checkAuth, async (req, res) => {
    return res.send('All shop items')
});

app.get('/dashboard', checkAuth, checkAdmin, async (req, res) => {
    return res.send('dashboard page')
});

{/*
    app.get('/info', checkAuth, verify, checkRole, async (req, res) => {
    return res.send('All info')
})
*/}



app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
