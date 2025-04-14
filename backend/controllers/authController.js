// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Signup controller
exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    console.log('Received signup request:', { name, email, password, role, file: req.file });

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profilePic: req.file ? req.file.path : null,
            role: role || 'user',
        });

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const mailOptions = {
            from: '"My App" <no-reply@myapp.com>',
            to: email,
            subject: role === 'admin' ? 'Welcome Admin!' : 'Welcome to My App!',
            text: role === 'admin'
                ? `Hi ${name},\n\nYour admin account has been created successfully.\n\n- The Team`
                : `Hi ${name},\n\nThanks for signing up. We're excited to have you on board!\n\n- The Team`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Email send error:', err.message);
            } else {
                console.log('Email sent via Mailtrap:', info.response);
            }
        });

        res.status(201).json({
            msg: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic,
            },
            token,
        });

    } catch (err) {
        console.error('Signup error:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            errors: err.errors,
        });

        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                msg: 'Validation error',
                errors: err.errors.map((e) => e.message),
            });
        }

        if (err.message === 'Only JPEG, PNG, and GIF images are allowed') {
            return res.status(400).json({ msg: err.message });
        }

        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            msg: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
            },
            token,
        });
    } catch (err) {
        console.error('Login error:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
        });
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get user controller
exports.getUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
