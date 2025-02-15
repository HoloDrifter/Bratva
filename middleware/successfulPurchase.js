const Order = require("../models/order");

//  Updated Middleware to Verify Order by `orderId`
const successfulPurchase = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    //  Verify the user has purchased this specific order
    const order = await Order.findOne({ userId, _id: orderId, status: "Paid" });

    if (!order) {
      return res
        .status(403)
        .json({ message: "Access denied: You have not purchased this order." });
    }

    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Rendering Thank You page", error: err.message });
  }
};

module.exports = successfulPurchase;
