const QuizUser = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register function
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validate the required fields
        if (!username || !email || !password) {
            return res.status(400).json({ msg: "Please fill all required fields.", status: false });
        }

        // Check if username already exists
        const usernameCheck = await QuizUser.findOne({ username });
        if (usernameCheck)
            return res.status(400).json({ msg: "Username already exists. Try another one.", status: false });

        // Check if email already exists
        const emailCheck = await QuizUser.findOne({ email });
        if (emailCheck)
            return res.status(400).json({ msg: "Email already exists. Try another one.", status: false });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const user = await QuizUser.create({
            email,
            username,
            password: hashedPassword,
        });

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        return res.status(201).json({ status: true, user: user.toJSON(), token });
    } catch (ex) {
        console.error("Registration error:", ex);
        return res.status(500).json({ msg: "Internal Server Error", status: false });
    }
};

// Login function
module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate the required fields
        if (!username || !password) {
            return res.status(400).json({ msg: "Username and password are required.", status: false });
        }

        // Find the user by username
        const user = await QuizUser.findOne({ username });
        if (!user)
            return res.status(400).json({ msg: "User not found", status: false });

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ msg: "Incorrect username or password", status: false });

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        return res.status(200).json({ status: true, user: user.toJSON(), token });
    } catch (ex) {
        console.error("Login error:", ex);
        return res.status(500).json({ msg: "Internal Server Error", status: false });
    }
};
