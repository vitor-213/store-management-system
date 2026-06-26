const validate =
  (schema, source = "body") =>
  (req, res, next) => {
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

    // ✅ En lugar de reasignar, agregamos los datos validados a una propiedad personalizada
    if (source === "query") {
      req.validatedQuery = result.data;
      // También actualizamos req.query de forma segura
      Object.keys(result.data).forEach((key) => {
        req.query[key] = result.data[key];
      });
    } else {
      req.validatedBody = result.data;
      Object.keys(result.data).forEach((key) => {
        req.body[key] = result.data[key];
      });
    }

    next();
  };

export default validate;
