import { z } from "zod";

const validateRequest = (schema) => (req, res, next) => {
  try {
    const data = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace req.body/query/params with validated data (strip unknown keys)
    req.body = data.body;
    req.query = data.query;
    req.params = data.params;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

export default validateRequest;
