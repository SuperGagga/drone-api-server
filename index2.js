// 1. โหลดเครื่องมือที่ติดตั้งมา
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// 2. ดึงค่าจาก .env
const PORT = process.env.PORT || 3000;
const SERVER1_URL = process.env.SERVER1_URL; 
const SERVER2_URL = process.env.SERVER2_URL;
const SERVER2_TOKEN = process.env.SERVER2_TOKEN;

// 3. สร้าง Server
const app = express();

// 4. ตั้งค่า Server (Middleware)
app.use(cors());
app.use(express.json());

// 5. สร้าง Endpoint ทดสอบ (หน้าแรก)
app.get('/', (req, res) => {
  res.send('✅ Drone API Server (Assignment #1) is running!');
});

// ===========================================
//  ASSIGNMENT #1 API ENDPOINTS (ฉบับสมบูรณ์)
// ===========================================

/**
 * @path GET /configs/:droneId
 * @description ดึงข้อมูล Config (5 fields) จาก Server 1
 */
app.get('/configs/:droneId', async (req, res) => {
  const { droneId } = req.params;
  const droneIdNum = parseInt(droneId, 10); 
  console.log(`GET /configs for droneId: ${droneIdNum}`);

  try {
    const response = await axios.get(SERVER1_URL);
    const allDrones = response.data.data; 
    const foundDrone = allDrones.find(drone => drone.drone_id === droneIdNum);

    if (!foundDrone) {
      return res.status(404).json({ error: 'Drone ID not found in Config Server' });
    }

    const formattedConfig = {
      drone_id: foundDrone.drone_id,
      drone_name: foundDrone.drone_name,
      light: foundDrone.light,
      country: foundDrone.country,
      weight: foundDrone.weight
    };
    res.json(formattedConfig);

  } catch (error) {
    console.error(`Error fetching config from Server 1: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch drone config' });
  }
});

/**
 * @path GET /status/:droneId
 * @description ดึงข้อมูล Status (1 field) จาก Server 1
 */
app.get('/status/:droneId', async (req, res) => {
  const { droneId } = req.params;
  const droneIdNum = parseInt(droneId, 10);
  console.log(`GET /status for droneId: ${droneIdNum}`);

  try {
    const response = await axios.get(SERVER1_URL);
    const allDrones = response.data.data;
    const foundDrone = allDrones.find(drone => drone.drone_id === droneIdNum);

    if (!foundDrone) {
      return res.status(404).json({ error: 'Drone ID not found in Config Server' });
    }

    const formattedStatus = {
      condition: foundDrone.condition
    };
    res.json(formattedStatus);

  } catch (error) {
    console.error(`Error fetching status from Server 1: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch drone status' });
  }
});

/**
 * @path GET /logs/:droneId
 * @description ดึง Log 12 รายการล่าสุด (5 fields) จาก Server 2
 */
app.get('/logs/:droneId', async (req, res) => {
  const { droneId } = req.params;
  console.log(`GET /logs for droneId: ${droneId}`);

  try {
    const response = await axios.get(SERVER2_URL, {
      headers: { 'Authorization': `Bearer ${SERVER2_TOKEN}` },
      params: {
        'filter': `(drone_id=${droneId})`,
        'sort': '-created',
        'perPage': 12
      }
    });

    const rawItems = response.data.items;
    const formattedLogs = rawItems.map(item => ({
      drone_id: item.drone_id,
      drone_name: item.drone_name,
      created: item.created,
      country: item.country,
      celsius: item.celsius
    }));

    res.json(formattedLogs);

  } catch (error) {
    console.error(`Error fetching logs from Server 2: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch drone logs' });
  }
});

// ⭐️ ===========================================
// ⭐️  POST /logs (ฉบับอัปเกรดที่ถูกต้อง)
// ⭐️ ===========================================
app.post('/logs', async (req, res) => {
  console.log('POST /logs (Smart Version) with body:', req.body);
  
  try {
    // 1. ดึงข้อมูลที่ Client (Asssignment #2) ส่งมา
    // (โจทย์ Ass#2 บอกว่า User จะกรอกแค่ Celsius)
    // เราจะออกแบบให้ Client ส่ง drone_id มาด้วย (จาก .env ของ Client)
    const { drone_id, celsius } = req.body;

    if (!drone_id || celsius === undefined) {
      return res.status(400).json({ error: 'Missing drone_id or celsius in request body' });
    }

    const droneIdNum = parseInt(drone_id, 10);

    // 2. (⭐️ ตรรกะใหม่) ไปดึง Config ที่ถูกต้องจาก Server 1
    const configResponse = await axios.get(SERVER1_URL);
    const allDrones = configResponse.data.data;
    const foundDrone = allDrones.find(drone => drone.drone_id === droneIdNum);

    if (!foundDrone) {
      return res.status(404).json({ error: 'Drone ID not found in Config Server' });
    }

    // 3. สร้างข้อมูล Log ที่ "ถูกต้อง" โดยใช้ข้อมูลจาก Server 1
    const logData = {
      drone_id: foundDrone.drone_id,
      drone_name: foundDrone.drone_name, // <-- เอา "Primitivo" มาจาก Server 1
      country: foundDrone.country,     // <-- เอา "Nigeria" มาจาก Server 1
      celsius: celsius                 // <-- เอามาจากที่ User กรอก
    };

    // 4. ยิง POST ไปหา Server 2 เพื่อ "สร้าง" (Create)
    const response = await axios.post(SERVER2_URL, logData, {
      headers: {
        'Authorization': `Bearer ${SERVER2_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // 5. ส่งผลลัพธ์ (ข้อมูลที่เพิ่งสร้างเสร็จ) กลับไปให้ Client
    res.status(201).json(response.data);

  } catch (error) {
    console.error('Error posting log to Server 2:', error.message);
    res.status(500).json({ error: 'Failed to create drone log' });
  }
});


// ===========================================
//  START SERVER
// ===========================================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});