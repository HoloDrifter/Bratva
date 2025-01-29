const Order = require("../models/order");

// thank you page logic
const successfulPurchase = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assume `req.user` contains the authenticated user info
    const productId = req.params.productId || req.body.productId; // (get this id from body)

    // Verify the user has purchased the product
    const order = await Order.findOne({ userId, productId, status: "Paid" });
    if (!order) {
      return res
        .status(403)
        .json({
          message: "Access denied: You have not purchased this product.",
        });
    }

    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Rendering Thank you page", error: err.message });
  }
};

module.exports = successfulPurchase;
