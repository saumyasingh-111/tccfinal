import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getAdminDb } from "../api/_lib/firebaseAdmin.ts";
import { createToken, getAdminCredentials } from "../api/_lib/authHelper.ts";
import adminHandler from "../api/admin.ts";
import menuHandler from "../api/menu.ts";
import orderHandler from "../api/orders.ts";

function createMockReqRes(method, query = {}, body = {}, token = null) {
  let statusCode = 200;
  let responseData = null;
  const headers = {};

  const req = {
    method,
    query,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      "content-type": "application/json",
    },
  };

  const res = {
    setHeader: (k, v) => {
      headers[k] = v;
    },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: (data) => {
      if (data && !responseData) {
        try {
          responseData = JSON.parse(data);
        } catch {
          responseData = data;
        }
      }
      return res;
    },
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
  };
}

describe("Admin Portal & Database Integration Tests", () => {
  const db = getAdminDb();
  const { email } = getAdminCredentials();
  const adminToken = createToken(email);

  test("Database and Admin token generation", () => {
    assert.ok(db, "Firestore Admin instance must be initialized");
    assert.ok(adminToken, "Admin JWT token must be generated");
  });

  test("Unauthorized request is rejected with HTTP 401", async () => {
    const { req, res, getStatus, getData } = createMockReqRes("GET", { action: "inventory" }, {}, "invalid_token");
    await adminHandler(req, res);
    assert.equal(getStatus(), 401);
    assert.equal(getData().success, false);
  });

  test("Dashboard Stats API returns real aggregated metrics", async () => {
    const { req, res, getStatus, getData } = createMockReqRes("GET", { action: "stats" }, {}, adminToken);
    await adminHandler(req, res);
    assert.equal(getStatus(), 200);
    assert.equal(getData().success, true);
    const { stats } = getData();
    assert.ok(typeof stats.totalRevenue === "number");
    assert.ok(typeof stats.totalOrders === "number");
    assert.ok(typeof stats.pendingOrders === "number");
    assert.ok(typeof stats.totalCustomers === "number");
    assert.ok(typeof stats.lowStockCount === "number");
    assert.ok(Array.isArray(stats.bestSellers));
    assert.ok(Array.isArray(stats.recentOrders));
  });

  test("Menu items CRUD via /api/menu", async () => {
    const testItemId = `test-dish-${Date.now()}`;
    const testItem = {
      id: testItemId,
      name: "Truffle Cheese Momos",
      category: "momo",
      price: 89,
      description: "Test dish description",
      image: "/dark-white-delight.jpg",
      isVegetarian: true,
      isAvailable: true,
    };

    // 1. Create
    const createReq = createMockReqRes("POST", {}, { item: testItem }, adminToken);
    await menuHandler(createReq.req, createReq.res);
    assert.equal(createReq.getStatus(), 201);
    assert.equal(createReq.getData().success, true);

    // Verify in Firestore
    const doc = await db.collection("menu_items").doc(testItemId).get();
    assert.ok(doc.exists);
    assert.equal(doc.data().name, "Truffle Cheese Momos");

    // 2. Update / Availability toggle
    const updateReq = createMockReqRes("PUT", {}, { item: { ...testItem, isAvailable: false, price: 99 } }, adminToken);
    await menuHandler(updateReq.req, updateReq.res);
    assert.equal(updateReq.getStatus(), 200);
    const updatedDoc = await db.collection("menu_items").doc(testItemId).get();
    assert.equal(updatedDoc.data().isAvailable, false);
    assert.equal(updatedDoc.data().price, 99);

    // 3. Delete
    const delReq = createMockReqRes("DELETE", { id: testItemId }, {}, adminToken);
    await menuHandler(delReq.req, delReq.res);
    assert.equal(delReq.getStatus(), 200);
    const deletedDoc = await db.collection("menu_items").doc(testItemId).get();
    assert.ok(!deletedDoc.exists);
  });

  test("Inventory CRUD and stock delta adjustment via /api/admin", async () => {
    const invId = `inv-test-${Date.now()}`;
    const invItem = {
      id: invId,
      name: "Organic Oat Milk",
      category: "Dairy",
      quantity: 15,
      unit: "liters",
      lowStockThreshold: 4,
    };

    // 1. Create
    const createReq = createMockReqRes("POST", { action: "inventory" }, { item: invItem }, adminToken);
    await adminHandler(createReq.req, createReq.res);
    assert.equal(createReq.getStatus(), 201);
    assert.equal(createReq.getData().item.status, "In Stock");

    // 2. Adjust delta (-12 => quantity 3, which is <= 4 threshold => Low Stock)
    const adjReq = createMockReqRes("PATCH", { action: "inventory", id: invId }, { delta: -12 }, adminToken);
    await adminHandler(adjReq.req, adjReq.res);
    assert.equal(adjReq.getStatus(), 200);
    assert.equal(adjReq.getData().item.quantity, 3);
    assert.equal(adjReq.getData().item.status, "Low Stock");

    // 3. Delete
    const delReq = createMockReqRes("DELETE", { action: "inventory", id: invId }, {}, adminToken);
    await adminHandler(delReq.req, delReq.res);
    assert.equal(delReq.getStatus(), 200);
    const deletedDoc = await db.collection("inventory").doc(invId).get();
    assert.ok(!deletedDoc.exists);
  });

  test("Customer Reviews submission, moderation, and deletion", async () => {
    // 1. Submit review (public)
    const subReq = createMockReqRes("POST", { action: "submit_review" }, {
      customerName: "Kalyanpur Student",
      rating: 5,
      comment: "Delicious pizza and cozy corner!",
      targetType: "cafe",
    });
    await adminHandler(subReq.req, subReq.res);
    assert.equal(subReq.getStatus(), 201);
    const reviewId = subReq.getData().review.id;
    assert.equal(subReq.getData().review.status, "pending");

    // 2. Moderate review to "approved" (admin)
    const modReq = createMockReqRes("PATCH", { action: "reviews" }, { id: reviewId, status: "approved" }, adminToken);
    await adminHandler(modReq.req, modReq.res);
    assert.equal(modReq.getStatus(), 200);
    const revDoc = await db.collection("reviews").doc(reviewId).get();
    assert.equal(revDoc.data().status, "approved");

    // 3. Delete review (admin)
    const delReq = createMockReqRes("DELETE", { action: "reviews", id: reviewId }, {}, adminToken);
    await adminHandler(delReq.req, delReq.res);
    assert.equal(delReq.getStatus(), 200);
    const deletedDoc = await db.collection("reviews").doc(reviewId).get();
    assert.ok(!deletedDoc.exists);
  });

  test("Offers CRUD and public checkout coupon validation", async () => {
    const offerCode = `TEST${Date.now().toString().slice(-4)}`;
    const offerItem = {
      code: offerCode,
      title: "Test 20% Off",
      description: "20% discount on orders above 100",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscount: 40,
      isActive: true,
    };

    // 1. Create offer
    const createReq = createMockReqRes("POST", { action: "offers" }, { offer: offerItem }, adminToken);
    await adminHandler(createReq.req, createReq.res);
    assert.equal(createReq.getStatus(), 201);

    // 2. Validate coupon on order of ₹150 (20% of 150 = 30)
    const valReq = createMockReqRes("GET", { action: "validate_coupon", code: offerCode, subtotal: "150" });
    await adminHandler(valReq.req, valReq.res);
    assert.equal(valReq.getStatus(), 200);
    assert.equal(valReq.getData().coupon.discountAmount, 30);

    // 3. Delete offer
    const offerDocSnap = await db.collection("offers").where("code", "==", offerCode).get();
    assert.ok(!offerDocSnap.empty);
    const offerId = offerDocSnap.docs[0].id;

    const delReq = createMockReqRes("DELETE", { action: "offers", id: offerId }, {}, adminToken);
    await adminHandler(delReq.req, delReq.res);
    assert.equal(delReq.getStatus(), 200);
  });

  test("Order placement updates status, paymentStatus, and persists in Firestore", async () => {
    const orderId = `ORD-TEST-${Date.now()}`;
    const orderData = {
      id: orderId,
      customerName: "Integration Tester",
      customerPhone: "+91 98765 12345",
      items: [{ id: "cold-coffee", name: "Cold Coffee", quantity: 2, price: 49 }],
      subtotal: 98,
      deliveryFee: 0,
      totalAmount: 98,
      orderType: "Takeaway",
      paymentMethod: "UPI / QR / Cash",
      paymentStatus: "Pending",
    };

    // 1. Place order
    const placeReq = createMockReqRes("POST", {}, orderData);
    await orderHandler(placeReq.req, placeReq.res);
    assert.equal(placeReq.getStatus(), 201);

    // 2. Admin update status to Confirmed and payment to Paid
    const updateReq = createMockReqRes("PATCH", {}, { id: orderId, status: "Confirmed", paymentStatus: "Paid" }, adminToken);
    await orderHandler(updateReq.req, updateReq.res);
    assert.equal(updateReq.getStatus(), 200);

    // Verify in Firestore
    const ordDoc = await db.collection("orders").doc(orderId).get();
    assert.ok(ordDoc.exists);
    assert.equal(ordDoc.data().status, "Confirmed");
    assert.equal(ordDoc.data().paymentStatus, "Paid");

    // Cleanup
    await db.collection("orders").doc(orderId).delete();
  });
});
