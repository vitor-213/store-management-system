const validate = (schema, source = "body") => (req, res, next) => {
  const data = source === "query" ? req.query : req.body;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (source === "query") {
    req.query = result.data;
  } else {
    req.body = result.data;
  }

  next();
};

export default validate;
