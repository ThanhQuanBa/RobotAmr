const { generateGuideAnswer } = require('./shared/generate-guide-answer');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

// --- AMR Fleet State (In-Memory / Real-time Cache) ---
const amrFleet = [
  {
    id: 'amr-01',
    name: 'Scout Alpha',
    status: 'IDLE',
    pose: { x: 50, y: 80, theta: 0 },
    battery: 100,
    speed: 0,
    currentRouteId: null,
    currentBookingId: null,
    lastUpdate: Date.now()
  },
  {
    id: 'amr-02',
    name: 'Scout Beta',
    status: 'IDLE',
    pose: { x: 100, y: 350, theta: 0 },
    battery: 87,
    speed: 0,
    currentRouteId: null,
    currentBookingId: null,
    lastUpdate: Date.now()
  }
];

function getAmr(id) {
  return amrFleet.find(a => a.id === id);
}

function getIdleAmr() {
  return amrFleet.find(a => a.status === 'IDLE');
}

// --- POIs for simulation ---
const mapPOIs = [
  { id: 'poi-start', name: 'Entrance Gate', x: 50, y: 80 },
  { id: 'poi-1', name: 'Main Hall', x: 200, y: 120 },
  { id: 'poi-2', name: 'Exhibition A', x: 400, y: 200 },
  { id: 'poi-3', name: 'Garden Area', x: 550, y: 300 },
  { id: 'poi-4', name: 'Museum Wing', x: 650, y: 150 },
  { id: 'poi-end', name: 'Exit / Gift Shop', x: 700, y: 350 }
];

// --- Seed Database on Startup ---
async function seedDatabase() {
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    await prisma.user.create({
      data: { username: 'admin', password: 'password', role: 'operator' }
    });
  }
  const visitor = await prisma.user.findUnique({ where: { username: 'visitor1' } });
  if (!visitor) {
    await prisma.user.create({
      data: { username: 'visitor1', password: 'password', role: 'visitor' }
    });
  }

  const routesCount = await prisma.route.count();
  if (routesCount === 0) {
    await prisma.route.createMany({
      data: [
        { name: 'Campus Full Tour', length: 2000, estTime: 45 },
        { name: 'Museum Highlights', length: 800, estTime: 20 },
        { name: 'Garden & Outdoor', length: 1200, estTime: 30 }
      ]
    });
  }
  console.log('Database seeded successfully.');
}

// ============================================================
// AUTHENTICATION APIs
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (user && user.password === password) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = await prisma.user.create({
    data: { username, password, role: 'visitor' }
  });

  res.json({ success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
});

// ============================================================
// FLOW 1: TOUR BOOKING & SCHEDULING
// ============================================================
app.get('/api/tours/slots', async (req, res) => {
  const routes = await prisma.route.findMany();
  res.json({ routes, timeSlots });
});

app.post('/api/bookings', async (req, res) => {
  const { visitorName, routeId, timeSlot, userId } = req.body;
  if (!visitorName || !routeId || !timeSlot) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const idleAmr = getIdleAmr();

  const newBooking = await prisma.booking.create({
    data: {
      visitorName,
      routeId,
      timeSlot,
      userId: userId || null,
      status: idleAmr ? 'SCHEDULED' : 'PENDING'
    }
  });

  const populatedBooking = await prisma.booking.findUnique({
    where: { id: newBooking.id },
    include: { route: true }
  });

  res.json({
    success: true,
    booking: populatedBooking,
    assignedAmr: idleAmr ? idleAmr.id : null
  });
});

// ============================================================
// ADMIN: ROUTE MANAGEMENT (CRUD)
// ============================================================
app.get('/api/routes', async (req, res) => {
  const routes = await prisma.route.findMany({ include: { bookings: true, waypoints: true } });
  res.json(routes);
});

app.post('/api/routes', async (req, res) => {
  const { name, length, estTime, waypoints } = req.body;
  if (!name || !length || !estTime) {
    return res.status(400).json({ error: 'Missing required fields (name, length, estTime)' });
  }
  const newRoute = await prisma.route.create({ 
    data: { 
      name, 
      length: parseInt(length), 
      estTime: parseInt(estTime),
      waypoints: {
        create: waypoints ? waypoints.map(wp => ({ x: parseFloat(wp.x), y: parseFloat(wp.y), isPOI: wp.isPOI, poiName: wp.poiName })) : []
      }
    },
    include: { waypoints: true }
  });
  res.json({ success: true, route: newRoute });
});

app.put('/api/routes/:id', async (req, res) => {
  const { name, length, estTime, waypoints } = req.body;
  try {
    if (waypoints) {
      await prisma.waypoint.deleteMany({ where: { routeId: req.params.id } });
    }
    const updated = await prisma.route.update({
      where: { id: req.params.id },
      data: { 
        name, 
        length: parseInt(length), 
        estTime: parseInt(estTime),
        ...(waypoints && { waypoints: { create: waypoints.map(wp => ({ x: parseFloat(wp.x), y: parseFloat(wp.y), isPOI: wp.isPOI, poiName: wp.poiName })) } })
      },
      include: { waypoints: true }
    });
    res.json({ success: true, route: updated });
  } catch (err) {
    res.status(404).json({ error: 'Route not found' });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    await prisma.booking.deleteMany({ where: { routeId: req.params.id } });
    await prisma.route.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: 'Route not found' });
  }
});

// ============================================================
// ADMIN: BOOKING MANAGEMENT
// ============================================================
app.get('/api/bookings', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { route: true, user: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(bookings);
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ error: 'Booking not found' });
  }
});

// ============================================================
// ADMIN: AMR FLEET MANAGEMENT
// ============================================================
app.get('/api/amr/fleet', (req, res) => {
  res.json(amrFleet);
});

app.get('/api/amr/:id', (req, res) => {
  const amr = getAmr(req.params.id);
  if (!amr) return res.status(404).json({ error: 'AMR not found' });
  res.json(amr);
});

// ============================================================
// MAP & POI DATA
// ============================================================
app.get('/api/map/pois', (req, res) => {
  res.json(mapPOIs);
});

// ============================================================
// FLOW 2 & 4: TOUR EXECUTION & REAL-TIME TELEMETRY
// ============================================================
const simulationIntervals = {};

app.post('/api/tours/:bookingId/start', async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const amrId = req.body.amrId || 'amr-01';
  const amr = getAmr(amrId);
  if (!amr) return res.status(404).json({ error: 'AMR not found' });
  if (amr.status !== 'IDLE') return res.status(400).json({ error: `AMR ${amrId} is currently busy (${amr.status})` });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'IN_PROGRESS' }
  });

  amr.status = 'EN_ROUTE';
  amr.currentRouteId = booking.routeId;
  amr.currentBookingId = booking.id;

  startSimulationLoop(amrId);

  res.json({ success: true, message: `Tour started on ${amr.name}`, amr });
});

function startSimulationLoop(amrId) {
  if (simulationIntervals[amrId]) clearInterval(simulationIntervals[amrId]);

  const amr = getAmr(amrId);
  if (!amr) return;

  // Build waypoint sequence from POIs
  const waypoints = [...mapPOIs];
  let waypointIdx = 0;

  simulationIntervals[amrId] = setInterval(() => {
    if (amr.status === 'FAULT') {
      amr.speed = 0;
      clearInterval(simulationIntervals[amrId]);
      io.emit('amr_telemetry', { fleet: amrFleet });
      return;
    }

    if (amr.status === 'EN_ROUTE' && waypointIdx < waypoints.length) {
      const target = waypoints[waypointIdx];
      const dx = target.x - amr.pose.x;
      const dy = target.y - amr.pose.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Arrived at POI
        amr.status = 'AT_POI';
        amr.speed = 0;
        io.emit('amr_at_poi', { amrId: amr.id, poi: target });

        // Simulate dwell time at POI then move on
        setTimeout(() => {
          waypointIdx++;
          if (waypointIdx >= waypoints.length) {
            // Tour complete
            amr.status = 'IDLE';
            amr.speed = 0;
            amr.currentRouteId = null;
            amr.currentBookingId = null;
            clearInterval(simulationIntervals[amrId]);
            io.emit('tour_complete', { amrId: amr.id });
          } else {
            amr.status = 'EN_ROUTE';
          }
          io.emit('amr_telemetry', { fleet: amrFleet });
        }, 3000); // 3s dwell
      } else {
        const speed = 2.5;
        amr.pose.x += (dx / distance) * speed;
        amr.pose.y += (dy / distance) * speed;
        amr.pose.theta = Math.atan2(dy, dx);
        amr.speed = speed;
        amr.battery = Math.max(0, amr.battery - 0.02);
      }

      amr.lastUpdate = Date.now();
      io.emit('amr_telemetry', { fleet: amrFleet });
    }
  }, 100); // 10Hz
}

// ============================================================
// FLOW 3: AI TOUR-GUIDE INTERACTION (Gemini AI)
// ============================================================
const { GoogleGenAI } = require('@google/genai');

let geminiAI;
try {
  if (process.env.GEMINI_API_KEY) {
    geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Gemini AI initialized successfully.');
  } else {
    console.warn('GEMINI_API_KEY not set. AI Guide will use fallback responses.');
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error.message);
}

// Conversation history store (per session, in-memory)
const conversationHistories = new Map();

app.post('/api/ai/ask', async (req, res) => {
  const { question, poiName, language, sessionId } = req.body;
  if (!question) return res.status(400).json({ error: 'Question required' });

  // Fallback if Gemini not available
  if (!geminiAI) {
    const fallbackResponses = {
      vi: 'Xin lỗi, hệ thống AI đang offline. Vui lòng thử lại sau.',
      en: "I'm sorry, the AI system is currently offline. Please try again later.",
      ja: '申し訳ありませんが、AIシステムは現在オフラインです。',
      ko: '죄송합니다. AI 시스템이 현재 오프라인입니다.'
    };
    return res.json({
      question,
      answer: fallbackResponses[language] || fallbackResponses.en,
      poiContext: poiName || 'general',
      language: language || 'en',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const langNames = { vi: 'Vietnamese', en: 'English', ja: 'Japanese', ko: 'Korean' };
    const langName = langNames[language] || 'English';

    const systemPrompt = `You are SmartBus AI Tour Guide — a friendly, knowledgeable, and enthusiastic virtual tour guide assistant for the SmartBus Autonomous Mobile Robot (AMR) campus touring system at FPT University.

CONTEXT ABOUT FPT UNIVERSITY & POIs:
- FPT University: A leading technology-focused university in Vietnam, established by FPT Corporation. It is renowned for its innovative educational philosophy, global standard curriculum, modern green campus, and strong emphasis on IT, business, and language training. It aims to provide practical skills for students to thrive in the global tech industry.
- Entrance Gate: The welcoming entry point of the FPT campus, where visitors check in and board the AMR.
- Main Hall: A grand space designed with modern architecture.
- Exhibition A: Currently showcases technology projects and student innovations.
- Garden Area: Spans a large green area with beautiful trees and a peaceful lake.
- Museum Wing: Houses achievements and history of FPT University.
- Exit / Gift Shop: Where visitors can purchase FPT souvenirs.

CURRENT USER CONTEXT:
- Current POI: ${poiName || 'General Campus Area'}
- Preferred Language: ${langName} (${language})

INSTRUCTIONS:
- You MUST answer in ${langName} language.
- Provide detailed, informative, and engaging answers (up to 2-3 short paragraphs if needed).
- Be warm, friendly, and conversational.
- Use emojis sparingly to be friendly.
- Use your extensive internal knowledge to provide interesting facts and details about FPT University and related topics when asked.`;

    const sid = sessionId || 'default';
    if (!conversationHistories.has(sid)) {
      conversationHistories.set(sid, []);
    }
    const history = conversationHistories.get(sid);

    const contents = [
      ...history,
      { role: 'user', parts: [{ text: question }] }
    ];

    const answerText = await generateGuideAnswer(geminiAI, { contents, systemPrompt });

    // Save to conversation history (keep last 20 messages)
    history.push({ role: 'user', parts: [{ text: question }] });
    history.push({ role: 'model', parts: [{ text: answerText }] });
    if (history.length > 40) {
      history.splice(0, 2); // Remove oldest pair
    }

    res.json({
      question,
      answer: answerText,
      poiContext: poiName || 'general',
      language: language || 'en',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      question,
      answer: language === 'vi' 
        ? 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi. Vui lòng thử lại.' 
        : "I'm sorry, I encountered an error. Please try again.",
      poiContext: poiName || 'general',
      language: language || 'en',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// FLOW 5: ROBOT FAILURE / TOUR EXCEPTION HANDLING
// ============================================================
app.post('/api/amr/:amrId/fault', (req, res) => {
  const { faultType, severity } = req.body;
  const amr = getAmr(req.params.amrId);
  if (!amr) return res.status(404).json({ error: 'AMR not found' });

  amr.status = 'FAULT';
  amr.speed = 0;

  const alert = {
    id: `alert-${Date.now()}`,
    amrId: amr.id,
    amrName: amr.name,
    type: faultType || 'UNKNOWN_ERROR',
    severity: severity || 'MEDIUM',
    pose: { ...amr.pose },
    battery: amr.battery,
    timestamp: new Date().toISOString()
  };

  io.emit('amr_alert', alert);
  io.emit('amr_telemetry', { fleet: amrFleet });

  res.json({ success: true, alert });
});

app.post('/api/amr/:amrId/resume', (req, res) => {
  const amr = getAmr(req.params.amrId);
  if (!amr) return res.status(404).json({ error: 'AMR not found' });

  if (amr.status === 'FAULT') {
    amr.status = 'EN_ROUTE';
    startSimulationLoop(amr.id);
    io.emit('amr_telemetry', { fleet: amrFleet });
    return res.json({ success: true, status: 'Resumed' });
  }
  res.status(400).json({ error: 'AMR is not in fault state' });
});

app.post('/api/amr/:amrId/reassign', async (req, res) => {
  const faultedAmr = getAmr(req.params.amrId);
  if (!faultedAmr) return res.status(404).json({ error: 'AMR not found' });

  // Find another idle AMR
  const replacement = amrFleet.find(a => a.id !== faultedAmr.id && a.status === 'IDLE');
  if (!replacement) return res.status(400).json({ error: 'No idle AMR available for reassignment' });

  // Transfer mission
  replacement.status = 'EN_ROUTE';
  replacement.currentRouteId = faultedAmr.currentRouteId;
  replacement.currentBookingId = faultedAmr.currentBookingId;

  // Clear faulted AMR
  faultedAmr.currentRouteId = null;
  faultedAmr.currentBookingId = null;

  startSimulationLoop(replacement.id);
  io.emit('amr_telemetry', { fleet: amrFleet });
  io.emit('amr_reassigned', { from: faultedAmr.id, to: replacement.id });

  res.json({ success: true, message: `Reassigned from ${faultedAmr.name} to ${replacement.name}`, replacement });
});

// ============================================================
// FLOW 6: DIGITAL TWIN SIMULATION & PRE-DEPLOYMENT VALIDATION
// ============================================================
app.post('/api/simulation/run', (req, res) => {
  const { routeWaypoints, amrId } = req.body;
  const waypoints = routeWaypoints || mapPOIs;

  // Run a headless simulation: calculate total distance, estimated time, conflict zones
  let totalDistance = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  const avgSpeed = 2.5; // units per tick
  const tickRate = 10; // Hz
  const estTimeSec = totalDistance / (avgSpeed * tickRate);
  const batteryDrain = totalDistance * 0.02;

  const result = {
    totalDistance: Math.round(totalDistance),
    estimatedTimeSec: Math.round(estTimeSec),
    estimatedTimeMin: (estTimeSec / 60).toFixed(1),
    batteryDrainPercent: Math.round(batteryDrain),
    poiCount: waypoints.length,
    conflicts: [],
    status: batteryDrain > 100 ? 'FAIL_BATTERY' : 'PASS'
  };

  // Check if any other AMR paths overlap (simplified)
  const activeAmrs = amrFleet.filter(a => a.status === 'EN_ROUTE' && a.id !== amrId);
  if (activeAmrs.length > 0) {
    result.conflicts.push({
      type: 'POTENTIAL_PATH_OVERLAP',
      details: `${activeAmrs.length} AMR(s) currently active on routes`
    });
  }

  res.json({ success: true, simulation: result });
});

// ============================================================
// FOXGLOVE / ROS2 BRIDGE CONFIGURATION
// ============================================================
app.get('/api/foxglove/config', (req, res) => {
  // Returns the Foxglove WebSocket bridge configuration
  // When ROS2 is connected, this tells the frontend where to find Foxglove
  res.json({
    foxgloveWsUrl: process.env.FOXGLOVE_WS_URL || 'ws://localhost:8765',
    rosbridge: process.env.ROSBRIDGE_URL || 'ws://localhost:9090',
    topics: {
      pose: '/amr/pose',
      cmd_vel: '/amr/cmd_vel',
      scan: '/amr/scan',
      map: '/map',
      path: '/amr/plan',
      battery: '/amr/battery_state',
      diagnostics: '/diagnostics'
    },
    isConnected: false // Will be true when ROS2 bridge is live
  });
});

// ============================================================
// WEBSOCKET CONNECTIONS
// ============================================================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Send full state on connect
  socket.emit('amr_telemetry', { fleet: amrFleet });
  socket.emit('map_pois', mapPOIs);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await seedDatabase();
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server ready for Digital Twin sync`);
  console.log(`Foxglove bridge endpoint: GET /api/foxglove/config`);
});
