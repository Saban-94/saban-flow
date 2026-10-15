import { describe, it, expect } from "vitest";
import {
  CUSTOMERS,
  getCustomerById,
  calculateTotalCustomerDeposits,
  getDeliveryNotesForCustomer,
} from "./customers-data";
import {
  playDispatchChime,
  playUrgentSignatureAlarm,
  enableAudioOnFirstTouch,
  synthesizeDispatchChime,
} from "./audio-alerts";

describe("Customer CRM & Google Drive Folders", () => {
  it("loads all customer profiles with complete CRM data", () => {
    expect(CUSTOMERS.length).toBeGreaterThan(0);

    CUSTOMERS.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.name).toBeTruthy();
      expect(c.hp).toMatch(/^\d+$/);
      expect(c.phone).toBeTruthy();
      expect(c.address).toBeTruthy();
      expect(["לקוח עוגן", "שוטף מאושר", "דורש תשלום במזומן", "מלגזה באתר"]).toContain(c.tag);
      expect(["חכמת", "עלי"]).toContain(c.preferredDriver);
      expect(c.depositLedger).toBeDefined();
      expect(c.ordersHistory).toBeInstanceOf(Array);
      expect(c.invoicesHistory).toBeInstanceOf(Array);
    });
  });

  it("finds customer by ID and cross-references delivery notes", () => {
    const customer = getCustomerById("632122"); // א. ערן אזולא
    expect(customer).toBeDefined();
    expect(customer?.name).toContain("אזולא");

    const notes = getDeliveryNotesForCustomer("632122");
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0]?.customerNo).toBe("632122");
  });

  it("verifies 1:1 deposit ledger balances for bags and pallets", () => {
    CUSTOMERS.forEach((c) => {
      const { bales60002, pallets60060 } = c.depositLedger;

      // Balance = billed - returned
      expect(bales60002.openBalance).toBe(bales60002.billed - bales60002.returned);
      expect(pallets60060.openBalance).toBe(pallets60060.billed - pallets60060.returned);
      expect(bales60002.openBalance).toBeGreaterThanOrEqual(0);
      expect(pallets60060.openBalance).toBeGreaterThanOrEqual(0);
    });

    const aggregates = calculateTotalCustomerDeposits();
    expect(aggregates.totalActiveCustomers).toBe(63);
    expect(aggregates.totalFieldBales60002).toBeGreaterThan(0);
    expect(aggregates.totalFieldPallets60060).toBeGreaterThan(0);
  });
});

describe("Audio Alerts Engine", () => {
  it("executes audio synthesizer functions safely without crashing in test environment", async () => {
    expect(() => enableAudioOnFirstTouch()).not.toThrow();
    expect(() => synthesizeDispatchChime()).not.toThrow();
    expect(() => playUrgentSignatureAlarm()).not.toThrow();
    await expect(playDispatchChime()).resolves.not.toThrow();
  });
});
