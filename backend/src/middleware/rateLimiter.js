import ratelimiter from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Check if the request is allowed
    const { success } = await ratelimiter.limit(req.ip);

    if (!success) {
      // If not allowed, send a 429 Too Many Requests response
      return res.status(429).json({
        error: `Too many requests by IP ${req.ip}. Please try again later.`,
      });
    }

    // If allowed, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default rateLimiter;
