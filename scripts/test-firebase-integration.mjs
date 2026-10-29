import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getAdminDb } from "../api/_lib/firebaseAdmin.ts";
import orderHandler from "../api/orders.ts";

describe("Firebase & Customer Integration Tests", () => {
  const db = getAdminDb();

  test("Firebase Admin SDK initializes connected database", () => {
    assert.ok(db, "Firestore Admin DB instance must be initialized");
  });

  test("Server-side order placement persists order with customerId", async () => {
    const testOrderId = `TEST-${Date.now()}`;
    const testCustomerId = `cust_${Date.now()}`;

    let responseStatus = 0;
    let responseJson = null;

    const mockReq = {
      method: "POST",
      body: JSON.stringify({
        id: testOrderId,
        customerId: testCustomerId,
        customerEmail: "student@csjmu.ac.in",
        customerName: "Saumya Singh",
        customerPhone: "+91 98765 43210",
        items: [
          { id: "cheese-sandwich", name: "Cheese Sandwich", quantity: 1, price: 59 },
          { id: "cold-coffee", name: "Cold Coffee", quantity: 1, price: 49 },
        ],
        totalAmount: 148, // 108 + 40 delivery
        orderType: "Delivery",
        deliveryLocation: {
          lat: 26.5018,
          lng: 80.2662,
          building: "Central Library & Reading Hall",
          room: "2nd Floor Desk 14",
          instructions: "Call on reaching main gate",
        },
      }),
    };

    const mockRes = {
      setHeader: () => {},
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
          end: () => {},
        };
      },
    };

    await orderHandler(mockReq, mockRes);

    assert.equal(responseStatus, 201, "Must return HTTP 201 on valid order creation");
    assert.equal(responseJson.success, true);
    assert.equal(responseJson.order.id, testOrderId);
    assert.equal(responseJson.order.customerId, testCustomerId);
    assert.equal(responseJson.order.deliveryLocation.isVerifiedCampus, true);

    // Verify order in Firestore
    if (db) {
      const docSnap = await db.collection("orders").doc(testOrderId).get();
      assert.ok(docSnap.exists, "Order document must exist in Firestore");
      const savedData = docSnap.data();
      assert.equal(savedData.customerId, testCustomerId);
      assert.equal(savedData.deliveryLocation.building, "Central Library & Reading Hall");

      // Cleanup
      await db.collection("orders").doc(testOrderId).delete();
    }
  });

  test("Customer order retrieval endpoint filters by customerId", async () => {
    const custId = `cust_filter_${Date.now()}`;
    const orderId = `ORDER-${Date.now()}`;

    if (db) {
      await db.collection("orders").doc(orderId).set({
        id: orderId,
        customerId: custId,
        customerName: "Filter Test",
        customerPhone: "+91 99999 88888",
        items: [{ id: "test", name: "Test Item", quantity: 1, price: 50 }],
        totalAmount: 50,
        status: "Pending",
        orderType: "Takeaway",
        timestamp: Date.now(),
        createdAt: "3:00 PM",
      });

      let status = 0;
      let json = null;
      const mockReq = {
        method: "GET",
        query: { customerId: custId },
      };
      const mockRes = {
        setHeader: () => {},
        status: (code) => {
          status = code;
          return {
            json: (data) => {
              json = data;
            },
            end: () => {},
          };
        },
      };

      await orderHandler(mockReq, mockRes);
      assert.equal(status, 200);
      assert.equal(json.success, true);
      assert.ok(json.orders.some((o) => o.id === orderId));

      // Cleanup
      await db.collection("orders").doc(orderId).delete();
    }
  });

  test("Client bundle security: No private keys in client code", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const clientFirebasePath = path.resolve(process.cwd(), "src/lib/firebase.ts");
    const clientContent = fs.readFileSync(clientFirebasePath, "utf-8");

    assert.ok(
      !clientContent.includes("BEGIN PRIVATE KEY"),
      "src/lib/firebase.ts must NEVER contain private keys"
    );
    assert.ok(
      !clientContent.includes("firebase-adminsdk"),
      "src/lib/firebase.ts must NEVER contain service account email"
    );
  });
});
