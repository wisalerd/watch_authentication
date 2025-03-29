"use client"; // Ensure this is a client component

import { useEffect } from "react";

export default function Users() {
  useEffect(() => {
    window.location.href = "/users/welcome";
  }, []);
}
