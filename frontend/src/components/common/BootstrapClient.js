"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return <span style={{ display: "none" }} aria-hidden="true" />;
}
