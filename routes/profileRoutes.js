const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const authenticateToken = require('../middleware/authMiddleware'); 
const User = require('../models/user')



router.put("/change-password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "New passwords do not match." });
    }

    try {
        // The user is attached to the request by the authenticateToken middleware
        const user = req.user;
        console.log(User)

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        // user.password = hashedPassword;
        // await user.save();
        

        res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

module.exports = router;
