"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function OverviewPage() {
    // Redirect to the main dashboard
    useEffect(() => {
        redirect("/");
    }, []);

    return null;
}
