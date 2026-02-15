import AffiliateLink from "../models/AffiliateLink.js";

// Track affiliate click
export const trackClick = async (req, res) => {
  try {
    const { shortCode, productName, url } = req.body;

    let link;
    if (shortCode) {
      link = await AffiliateLink.findOne({ shortCode, isActive: true });
    } else if (productName) {
      link = await AffiliateLink.findOne({ productName, isActive: true });
    }

    if (link) {
      link.clicks += 1;
      link.lastClickedAt = new Date();
      await link.save();
    } else if (productName && url) {
      // Auto-create if doesn't exist
      link = await AffiliateLink.create({
        productName,
        affiliateUrl: url,
        clicks: 1,
        lastClickedAt: new Date(),
      });
    }

    res.json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Track conversion
export const trackConversion = async (req, res) => {
  try {
    const { shortCode, revenue } = req.body;

    const link = await AffiliateLink.findOne({ shortCode, isActive: true });
    if (!link) {
      return res.status(404).json({ success: false, error: "Link not found" });
    }

    link.conversions += 1;
    if (revenue) {
      link.revenue += revenue;
    }
    await link.save();

    res.json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get affiliate stats
export const getStats = async (req, res) => {
  try {
    const stats = await AffiliateLink.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
          totalConversions: { $sum: "$conversions" },
          totalRevenue: { $sum: "$revenue" },
          avgConversionRate: {
            $avg: {
              $cond: [
                { $gt: ["$clicks", 0] },
                { $divide: ["$conversions", "$clicks"] },
                0,
              ],
            },
          },
        },
      },
    ]);

    const topPerformers = await AffiliateLink.find({ isActive: true })
      .sort({ clicks: -1 })
      .limit(10)
      .select("productName clicks conversions revenue");

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          avgConversionRate: 0,
        },
        topPerformers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create affiliate link
export const createLink = async (req, res) => {
  try {
    const link = await AffiliateLink.create(req.body);
    res.status(201).json({ success: true, data: link });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all links
export const getLinks = async (req, res) => {
  try {
    const links = await AffiliateLink.find().sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
