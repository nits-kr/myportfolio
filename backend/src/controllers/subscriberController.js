import Subscriber from "../models/Subscriber.js";

// @desc    Register a new subscriber
// @route   POST /api/subscribers
// @access  Public
export const subscribe = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed",
        data: subscriber,
      });
    }

    subscriber = await Subscriber.create({ name, email });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: subscriber,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
