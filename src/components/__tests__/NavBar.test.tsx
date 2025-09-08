import React from "react";
import { render, screen } from "@testing-library/react";
import NavBar from "@/components/NavBar";

// Mock next/navigation to control pathname
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("NavBar", () => {
  it("sets aria-current=page on active link", () => {
    render(<NavBar />);
    const home = screen.getByRole("link", { name: /home/i });
    const about = screen.getByRole("link", { name: /about/i });

    expect(home).toHaveAttribute("aria-current", "page");
    expect(about).not.toHaveAttribute("aria-current");
  });
});


