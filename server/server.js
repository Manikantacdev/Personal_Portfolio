const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Message = require('./models/Message');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.post('/contact', async (req, res) => {
    const { fullName, email, mobile, subject, message } = req.body;

    try {
        // Save message to MongoDB
        const newMessage = new Message({ fullName, email, mobile, subject, message });
        await newMessage.save();

        // Send email to admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.ADMIN_EMAIL,
            subject: `New Message: ${subject}`,
            text: `
                Name: ${fullName}
                Email: ${email}
                Phone: ${mobile}
                Message: ${message}
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Email send error:', err);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        res.status(200).json({ message: 'Message sent successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
