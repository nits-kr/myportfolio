"use client";

const setIn = (obj, path, value) => {
  let curr = obj;
  for (let i = 0; i < path.length; i += 1) {
    const key = String(path[i]);
    const isLast = i === path.length - 1;

    if (isLast) {
      curr[key] = value;
      return;
    }

    if (!curr[key] || typeof curr[key] !== "object") {
      curr[key] = {};
    }
    curr = curr[key];
  }
};

export const zodResolver = (schema) => (values) => {
  const parsed = schema.safeParse(values);
  if (parsed.success) {
    return { values: parsed.data, errors: {} };
  }

  const errors = {};
  for (const issue of parsed.error.issues || []) {
    const path = issue.path && issue.path.length ? issue.path : ["root"];
    const key = path.map(String).join(".");
    if (errors.__seen && errors.__seen[key]) continue;

    setIn(errors, path, {
      type: issue.code || "validation",
      message: issue.message,
    });

    if (!errors.__seen) errors.__seen = {};
    errors.__seen[key] = true;
  }

  // internal
  if (errors.__seen) delete errors.__seen;

  return { values: {}, errors };
};
