import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { IncidentScenario } from "../models/IncidentScenario.js";

dotenv.config();

const scenario = (number, shown, correct) => ({
  level: 5,
  type: "incident-response",
  title: "Secure the Network",
  timerSeconds: 60,
  actions: shown.map((text, index) => ({ id: String(index + 1), text })),
  correctSequence: correct.map((text) => shown.indexOf(text) + 1),
  explanation:
    "Arrange the security components from the outer protection layer through detection, response, and recovery.",
  difficulty: "Advanced",
  active: true,
  importKey: `L5-Q${String(number).padStart(2, "0")}`,
});

const physical = "Physical Security";
const segmentation = "Network Segmentation";
const firewall = "Firewall";
const auth = "Authentication / Access Control";
const encryption = "Encryption";
const ids = "IDS/IPS";
const endpoint = "Antivirus / Endpoint Protection";
const monitoring = "Monitoring & Logging";
const response = "Incident Response";
const backup = "Backup & Recovery";

const questions = [
  scenario(
    1,
    [ids, segmentation, encryption, endpoint, physical, backup],
    [physical, segmentation, encryption, ids, endpoint, backup],
  ),
  scenario(
    2,
    [segmentation, monitoring, endpoint, physical, backup],
    [physical, segmentation, endpoint, monitoring, backup],
  ),
  scenario(
    3,
    [response, encryption, monitoring, auth, endpoint],
    [auth, encryption, endpoint, monitoring, response],
  ),
  scenario(
    4,
    [ids, firewall, segmentation, monitoring, encryption, physical],
    [physical, segmentation, firewall, encryption, ids, monitoring],
  ),
  scenario(
    5,
    [encryption, ids, auth, physical, backup],
    [physical, auth, encryption, ids, backup],
  ),
  scenario(
    6,
    [encryption, response, ids, backup, segmentation],
    [segmentation, encryption, ids, response, backup],
  ),
  scenario(
    7,
    [endpoint, segmentation, physical, monitoring, encryption, auth],
    [physical, segmentation, auth, encryption, endpoint, monitoring],
  ),
  scenario(
    8,
    [endpoint, backup, ids, encryption, auth],
    [auth, encryption, ids, endpoint, backup],
  ),
  scenario(
    9,
    [firewall, monitoring, endpoint, ids, backup],
    [firewall, ids, endpoint, monitoring, backup],
  ),
  scenario(
    10,
    [response, endpoint, backup, firewall, physical, auth],
    [physical, firewall, auth, endpoint, response, backup],
  ),
  scenario(
    11,
    [backup, monitoring, auth, endpoint, ids],
    [auth, ids, endpoint, monitoring, backup],
  ),
  scenario(
    12,
    [monitoring, encryption, ids, backup, response],
    [encryption, ids, monitoring, response, backup],
  ),
  scenario(
    13,
    [monitoring, physical, ids, endpoint, response, firewall],
    [physical, firewall, ids, endpoint, monitoring, response],
  ),
  scenario(
    14,
    [encryption, monitoring, endpoint, firewall, backup],
    [firewall, encryption, endpoint, monitoring, backup],
  ),
  scenario(
    15,
    [encryption, physical, response, firewall, ids],
    [physical, firewall, encryption, ids, response],
  ),
  scenario(
    16,
    [encryption, monitoring, physical, firewall, response, backup],
    [physical, firewall, encryption, monitoring, response, backup],
  ),
  scenario(
    17,
    [encryption, firewall, backup, physical, response],
    [physical, firewall, encryption, response, backup],
  ),
  scenario(
    18,
    [encryption, segmentation, auth, backup, physical],
    [physical, segmentation, auth, encryption, backup],
  ),
  scenario(
    19,
    [segmentation, backup, ids, auth, firewall, response],
    [segmentation, firewall, auth, ids, response, backup],
  ),
  scenario(
    20,
    [firewall, backup, auth, ids, response],
    [firewall, auth, ids, response, backup],
  ),
  scenario(
    21,
    [auth, response, firewall, segmentation, physical],
    [physical, segmentation, firewall, auth, response],
  ),
  scenario(
    22,
    [response, backup, monitoring, segmentation, physical, ids],
    [physical, segmentation, ids, monitoring, response, backup],
  ),
  scenario(
    23,
    [encryption, auth, firewall, ids, response],
    [firewall, auth, encryption, ids, response],
  ),
  scenario(
    24,
    [physical, endpoint, segmentation, auth, ids],
    [physical, segmentation, auth, ids, endpoint],
  ),
  scenario(
    25,
    [firewall, auth, response, monitoring, segmentation, physical],
    [physical, segmentation, firewall, auth, monitoring, response],
  ),
  scenario(
    26,
    [endpoint, monitoring, backup, firewall, auth],
    [firewall, auth, endpoint, monitoring, backup],
  ),
  scenario(
    27,
    [physical, monitoring, backup, response, segmentation],
    [physical, segmentation, monitoring, response, backup],
  ),
  scenario(
    28,
    [physical, monitoring, segmentation, backup, auth, endpoint],
    [physical, segmentation, auth, endpoint, monitoring, backup],
  ),
  scenario(
    29,
    [backup, response, monitoring, segmentation, firewall],
    [segmentation, firewall, monitoring, response, backup],
  ),
  scenario(
    30,
    [ids, encryption, physical, auth, response],
    [physical, auth, encryption, ids, response],
  ),
];

const run = async () => {
  const connected = await connectDatabase();
  if (!connected)
    throw new Error("MongoDB is not connected. Configure backend/.env first.");

  await IncidentScenario.deleteMany({ level: 5 });
  await IncidentScenario.insertMany(questions);
  console.log(
    `Seeded ${questions.length} Level 5 incident-response scenarios.`,
  );
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
