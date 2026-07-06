import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("StatusBadge", () => {
  it.each(["delivered", "onTheWay", "preparing", "pending", "cancelled"] as const)(
    "renders %s status",
    (status) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(`status.${status}`)).toBeInTheDocument();
    },
  );
});
