import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Import the authoritative campus boundary and helper functions from backend and frontend
import {
  isPointInCampusBoundary as backendIsPointInCampus,
  CSJMU_BOUNDARY_COORDINATES as BACKEND_BOUNDARY,
  CSJMU_BOUNDING_BOX as BACKEND_BBOX,
} from "../api/_lib/campusBoundary.ts";

import {
  isPointInCampusBoundary as frontendIsPointInCampus,
  validateCampusDeliveryPoint,
  findNearestLandmark,
  CSJMU_BOUNDARY_COORDINATES as FRONTEND_BOUNDARY,
  CSJMU_CAMPUS_CENTER,
  CSJMU_LANDMARKS,
} from "../src/data/campusBoundary.ts";

import orderHandler from "../api/orders.ts";

describe("Campus Delivery Location & Boundary Enforcement Tests", () => {
  // Test 1: Authoritative boundary synchronization
  test("Frontend and backend campus boundary coordinates must be 100% identical", () => {
    assert.equal(
      FRONTEND_BOUNDARY.length,
      BACKEND_BOUNDARY.length,
      "Coordinate counts must match"
    );
    for (let i = 0; i < FRONTEND_BOUNDARY.length; i++) {
      assert.deepEqual(
        FRONTEND_BOUNDARY[i],
        BACKEND_BOUNDARY[i],
        `Coordinate vertex #${i} must match exactly`
      );
    }
  });

  // Test 2: Valid points inside the CSJMU campus
  test("Accurately identifies verified points inside CSJMU campus", () => {
    const validPoints = [
      { name: "Campus Centroid", lat: CSJMU_CAMPUS_CENTER.lat, lng: CSJMU_CAMPUS_CENTER.lng },
      { name: "Central Library", lat: 26.5018, lng: 80.2662 },
      { name: "UIET Engineering Block", lat: 26.5048, lng: 80.2692 },
      { name: "Administrative Secretariat", lat: 26.5028, lng: 80.2675 },
      { name: "Main Auditorium", lat: 26.5008, lng: 80.2655 },
      { name: "IBM Management Dept", lat: 26.5038, lng: 80.2680 },
      { name: "Computer Science IT Block", lat: 26.5042, lng: 80.2698 },
      { name: "Boys Hostel Complex", lat: 26.5065, lng: 80.2675 },
      { name: "Girls Hostel Complex", lat: 26.5055, lng: 80.2665 },
      { name: "Sports Complex", lat: 26.5005, lng: 80.2685 },
    ];

    for (const vp of validPoints) {
      const frontendResult = frontendIsPointInCampus(vp.lat, vp.lng);
      const backendResult = backendIsPointInCampus(vp.lat, vp.lng);
      assert.equal(
        frontendResult,
        true,
        `Frontend must accept ${vp.name} (${vp.lat}, ${vp.lng})`
      );
      assert.equal(
        backendResult,
        true,
        `Backend must accept ${vp.name} (${vp.lat}, ${vp.lng})`
      );

      const valRes = validateCampusDeliveryPoint(vp.lat, vp.lng);
      assert.equal(valRes.valid, true);
      assert.match(valRes.message, /inside CSJMU campus/i);
    }
  });

  // Test 3: Points outside the CSJMU campus (must be strictly rejected)
  test("Strictly rejects points outside the permitted CSJMU campus boundary", () => {
    const outsidePoints = [
      { name: "Kalyanpur Railway Station", lat: 26.4930, lng: 80.2570 },
      { name: "IIT Kanpur Campus", lat: 26.5123, lng: 80.2329 },
      { name: "Rawatpur Crossing", lat: 26.4812, lng: 80.3015 },
      { name: "Kanpur Central Railway Station", lat: 26.4542, lng: 80.3503 },
      { name: "Just South of CSJMU Boundary Road", lat: 26.4950, lng: 80.2670 },
      { name: "Just North of CSJMU Perimeter", lat: 26.5110, lng: 80.2680 },
      { name: "Just East of CSJMU Perimeter", lat: 26.5020, lng: 80.2760 },
      { name: "Just West of CSJMU Perimeter", lat: 26.5020, lng: 80.2590 },
    ];

    for (const op of outsidePoints) {
      const frontendResult = frontendIsPointInCampus(op.lat, op.lng);
      const backendResult = backendIsPointInCampus(op.lat, op.lng);
      assert.equal(
        frontendResult,
        false,
        `Frontend must reject ${op.name} (${op.lat}, ${op.lng})`
      );
      assert.equal(
        backendResult,
        false,
        `Backend must reject ${op.name} (${op.lat}, ${op.lng})`
      );

      const valRes = validateCampusDeliveryPoint(op.lat, op.lng);
      assert.equal(valRes.valid, false);
      assert.equal(
        valRes.message,
        "Sorry! TCC currently delivers only within the CSJMU university campus."
      );
    }
  });

  // Test 4: Missing, non-numeric, or malformed coordinates
  test("Properly rejects missing, NaN, non-numeric, or out-of-range coordinates", () => {
    const malformedCases = [
      [null, null],
      [undefined, undefined],
      [NaN, 80.267],
      [26.503, NaN],
      ["26.503", "80.267"], // string instead of number
      [95.0, 80.267],       // out of latitude range
      [26.503, 195.0],      // out of longitude range
      [-26.503, 80.267],    // southern hemisphere
      [0, 0],               // null island
    ];

    for (const [lat, lng] of malformedCases) {
      assert.equal(
        frontendIsPointInCampus(lat, lng),
        false,
        `Frontend should reject malformed: ${lat}, ${lng}`
      );
      assert.equal(
        backendIsPointInCampus(lat, lng),
        false,
        `Backend should reject malformed: ${lat}, ${lng}`
      );
    }
  });

  // Test 5: Nearest landmark lookup and distance calculation
  test("Correctly resolves nearest CSJMU landmark and distance", () => {
    // Coordinate near UIET
    const nearUIET = findNearestLandmark(26.5049, 80.2693);
    assert.ok(nearUIET);
    assert.equal(nearUIET.landmark.id, "uiet-engineering");
    assert.ok(nearUIET.distanceMeters < 50);

    // Coordinate near Central Library
    const nearLib = findNearestLandmark(26.5019, 80.2663);
    assert.ok(nearLib);
    assert.equal(nearLib.landmark.id, "central-library");
    assert.ok(nearLib.distanceMeters < 50);
  });

  // Test 6: Backend HTTP endpoint rejection when client sends outside address
  test("Backend POST /api/orders rejects delivery order placed outside CSJMU campus with HTTP 400", async () => {
    let responseStatus = 0;
    let responseJson = null;

    const mockReq = {
      method: "POST",
      body: JSON.stringify({
        customerName: "Sneha Patel",
        customerPhone: "+91 98765 43210",
        items: [{ id: "cold-coffee", name: "Cold Coffee", quantity: 1, price: 49 }],
        totalAmount: 89,
        orderType: "Delivery",
        deliveryLocation: {
          lat: 26.4542, // Kanpur Central (Outside!)
          lng: 80.3503,
          building: "Kanpur Central Station",
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

    assert.equal(responseStatus, 400, "Must return HTTP 400 for outside location");
    assert.equal(responseJson.success, false);
    assert.equal(
      responseJson.error,
      "Sorry! TCC currently delivers only within the CSJMU university campus."
    );
  });

  // Test 7: Backend HTTP endpoint acceptance when client sends valid campus address
  test("Backend POST /api/orders accepts delivery order inside CSJMU campus with HTTP 201", async () => {
    let responseStatus = 0;
    let responseJson = null;

    const mockReq = {
      method: "POST",
      body: JSON.stringify({
        customerName: "Aman Gupta",
        customerPhone: "+91 98765 11111",
        items: [{ id: "butter-croissant", name: "Butter Croissant", quantity: 2, price: 69 }],
        totalAmount: 178,
        orderType: "Delivery",
        deliveryLocation: {
          lat: 26.5048,
          lng: 80.2692,
          building: "UIET Computer Science Block",
          room: "Lab 3",
          instructions: "Call on arrival",
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

    assert.equal(responseStatus, 201, "Must return HTTP 201 for valid campus location");
    assert.equal(responseJson.success, true);
    assert.equal(responseJson.order.deliveryLocation.building, "UIET Computer Science Block");
    assert.equal(responseJson.order.deliveryLocation.isVerifiedCampus, true);
    assert.equal(responseJson.order.deliveryLocation.lat, 26.5048);
    assert.equal(responseJson.order.deliveryLocation.lng, 80.2692);
  });
});
