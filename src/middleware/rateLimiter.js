import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.log("Rate limit error", error);
    next(error); // Pass error to error-handling middleware
  }
};

export default rateLimiter;