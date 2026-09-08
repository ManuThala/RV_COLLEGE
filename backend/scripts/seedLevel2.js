import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { Question } from "../models/Question.js";

dotenv.config();

const makeQuestion = (number, question, options, correctOptionId) => ({
  level: 2,
  type: "coding-decoding",
  question,
  options: options.map((text, index) => ({
    id: String.fromCharCode(65 + index),
    text,
  })),
  correctOptionId,
  explanation:
    "Apply the coding rule described in the question consistently to calculate the answer.",
  tip: "Identify the exact rule first, then verify it against every letter or number before choosing.",
  difficulty: "Moderate",
  active: true,
  importKey: `L2-Q${String(number).padStart(2, "0")}`,
});

const questions = [
  makeQuestion(
    1,
    "If C = 3, FEAR is coded as 30, what will HAIR be coded as?",
    ["30", "33", "34", "36", "39"],
    "D",
  ),
  makeQuestion(
    2,
    "If B = 2, DOG is coded as 26, what will CAT be coded as?",
    ["21", "22", "24", "26", "28"],
    "C",
  ),
  makeQuestion(
    3,
    "If A = 1, BAT is coded as 23, what will SUN be coded as?",
    ["48", "50", "52", "54", "56"],
    "D",
  ),
  makeQuestion(
    4,
    "If E = 5, MOON is coded as 57, what will STAR be coded as?",
    ["54", "56", "58", "60", "62"],
    "C",
  ),
  makeQuestion(
    5,
    "If F = 6, FISH is coded as 42, what will BIRD be coded as?",
    ["29", "31", "33", "35", "37"],
    "C",
  ),
  makeQuestion(
    6,
    "If L = 12, LION is coded as 50, what will LAMP be coded as?",
    ["38", "40", "42", "44", "46"],
    "C",
  ),
  makeQuestion(
    7,
    "If Z = 26, ZOO is coded as 56, what will BEE be coded as?",
    ["10", "11", "12", "13", "14"],
    "C",
  ),
  makeQuestion(
    8,
    "If K = 11, KITE is coded as 45, what will ROPE be coded as?",
    ["50", "52", "54", "56", "58"],
    "C",
  ),
  makeQuestion(
    9,
    "If N = 14, NEST is coded as 58, what will DESK be coded as?",
    ["35", "37", "39", "41", "43"],
    "C",
  ),
  makeQuestion(
    10,
    "If P = 16, PLAN is coded as 43, what will CODE be coded as?",
    ["23", "25", "27", "29", "31"],
    "C",
  ),
  makeQuestion(
    11,
    "If CAT is coded as DBU (each letter shifted forward by 1), what will DOG be coded as?",
    ["EPH", "DPH", "EPI", "FQI", "EOH"],
    "A",
  ),
  makeQuestion(
    12,
    "If BOOK is coded as DQQM (each letter shifted forward by 2), what will PAGE be coded as?",
    ["RCHG", "SCIG", "RCIG", "RBIG", "RCIH"],
    "C",
  ),
  makeQuestion(
    13,
    "If SUN is coded as VXQ (each letter shifted forward by 3), what will MOON be coded as?",
    ["PRRP", "PQRQ", "PRRR", "PRRQ", "ORRQ"],
    "D",
  ),
  makeQuestion(
    14,
    "If ZOO is coded as YNN (each letter shifted back by 1), what will FISH be coded as?",
    ["FHRG", "EHRH", "DGQF", "EHRG", "EHSG"],
    "D",
  ),
  makeQuestion(
    15,
    "If BIRD is coded as FMVH (each letter shifted forward by 4), what will LAMP be coded as?",
    ["PEQS", "OEQT", "PEQT", "PDQT", "PEPT"],
    "C",
  ),
  makeQuestion(
    16,
    "If KITE is coded as PNYJ (each letter shifted forward by 5), what will ROPE be coded as?",
    ["WTUI", "VTUJ", "WSUJ", "WTUJ", "WTVJ"],
    "D",
  ),
  makeQuestion(
    17,
    "If NEST is coded as PGUV (each letter shifted forward by 2), what will DESK be coded as?",
    ["FGUL", "EGUM", "FHUM", "FGTM", "FGUM"],
    "E",
  ),
  makeQuestion(
    18,
    "If PLAN is coded as VRGT (each letter shifted forward by 6), what will CODE be coded as?",
    ["IUJJ", "HUJK", "IUJK", "IUIK", "IVJK"],
    "C",
  ),
  makeQuestion(
    19,
    "If STAR is coded as ZAHY (each letter shifted forward by 7), what will FISH be coded as?",
    ["MPZN", "LPZO", "MPYO", "MPZO", "MPZP"],
    "D",
  ),
  makeQuestion(
    20,
    "If BEE is coded as KNN (each letter shifted forward by 9), what will ZOO be coded as?",
    ["IXY", "JXX", "IWX", "HXX", "IXX"],
    "E",
  ),
  makeQuestion(
    21,
    "If CAT is coded as XZG, what will DOG be coded as using the reverse alphabet?",
    ["WLU", "VLT", "WLT", "WMT", "WLS"],
    "C",
  ),
  makeQuestion(
    22,
    "If BAT is coded as YZG, what will SUN be coded as using the reverse alphabet?",
    ["HFN", "GFM", "HEM", "HFM", "HFL"],
    "D",
  ),
  makeQuestion(
    23,
    "If DOG is coded as WLT, what will BIRD be coded as using the reverse alphabet?",
    ["YRIX", "XRIW", "YRHW", "YQIW", "YRIW"],
    "E",
  ),
  makeQuestion(
    24,
    "If MOON is coded as NLLM, what will LION be coded as using the reverse alphabet?",
    ["ORLN", "OQLM", "ORLM", "ORKM", "PRLM"],
    "C",
  ),
  makeQuestion(
    25,
    "If STAR is coded as HGZI, what will FISH be coded as using the reverse alphabet?",
    ["URHR", "UQHS", "URGS", "URHS", "VRHS"],
    "D",
  ),
  makeQuestion(
    26,
    "If BOOK is coded as 2-15-15-11, what will PAGE be coded as?",
    ["16-1-7-5", "16-1-8-5", "15-1-7-5", "16-2-7-5", "16-1-7-6"],
    "A",
  ),
  makeQuestion(
    27,
    "If TIME is coded as 20-9-13-5, what will CLOCK be coded as?",
    [
      "3-12-15-3-10",
      "3-12-15-3-11",
      "3-11-15-3-11",
      "4-12-15-3-11",
      "3-12-14-3-11",
    ],
    "B",
  ),
  makeQuestion(
    28,
    "If HOUSE is coded as 8-15-21-19-5, what will WATER be coded as?",
    [
      "23-1-20-5-19",
      "23-1-19-5-18",
      "22-1-20-5-18",
      "23-1-20-5-18",
      "23-2-20-5-18",
    ],
    "D",
  ),
  makeQuestion(
    29,
    "If GAME is coded as 7-1-13-5, what will WORD be coded as?",
    ["23-15-18-4", "23-15-19-4", "22-15-18-4", "23-14-18-4", "23-15-18-5"],
    "A",
  ),
  makeQuestion(
    30,
    "If PLANET is coded as 16-12-1-14-5-20, what will MARKET be coded as?",
    [
      "13-1-18-11-5-19",
      "13-1-18-11-5-20",
      "12-1-18-11-5-20",
      "13-1-19-11-5-20",
      "13-2-18-11-5-20",
    ],
    "B",
  ),
  makeQuestion(
    31,
    "If CAT is coded as DBU, how is DOG coded?",
    ["EPH", "EOG", "FPH", "ENH", "DPH"],
    "A",
  ),
  makeQuestion(
    32,
    "If BOOK is coded as YLLP, how is LOOK coded?",
    ["OLLP", "PLLP", "MLLP", "NLLP", "PLLQ"],
    "B",
  ),
  makeQuestion(
    33,
    "If A = 1, B = 2, C = 3... Z = 26, and BAT = 23, what will DOG be?",
    ["24", "25", "26", "27", "28"],
    "C",
  ),
  makeQuestion(
    34,
    "If MANGO is coded as NBOHP, how is APPLE coded?",
    ["BQQMF", "BPPMF", "CQQMF", "BQQNF", "APQMF"],
    "A",
  ),
  makeQuestion(
    35,
    "If TRAIN is coded as NIART, how is PLANE coded?",
    ["ENALP", "ENAPL", "EPNAL", "NELAP", "EALPN"],
    "A",
  ),
  makeQuestion(
    36,
    "If RED is coded as 27 and BLUE is coded as 40, using the sum of the letter positions, what is the code for GREEN?",
    ["45", "47", "49", "51", "53"],
    "C",
  ),
  makeQuestion(
    37,
    "If COLD is coded as DPME, how is WARM coded?",
    ["XBSN", "XARN", "YBSN", "WBSN", "XBTN"],
    "A",
  ),
  makeQuestion(
    38,
    "In a certain code, FISH = 69198. Each letter is replaced by its position in the alphabet. What will BIRD be?",
    ["29184", "29194", "29184", "29194", "21894"],
    "A",
  ),
  makeQuestion(
    39,
    "If HOUSE is coded as IPVTF, how is GARDEN coded?",
    ["HBSEFO", "HBSFEO", "HCRFEO", "GBSEFO", "HASEFO"],
    "A",
  ),
  makeQuestion(
    40,
    "If SUN = 54 and MOON = 57, based on the sum of the alphabet positions, what is the code for STAR?",
    ["54", "56", "58", "60", "62"],
    "B",
  ),
  makeQuestion(
    41,
    "If TABLE is coded as ELBAT, how is CHAIR coded?",
    ["RIAHC", "RIHAC", "RIAHC", "RAHIC", "RICHA"],
    "A",
  ),
  makeQuestion(
    42,
    "In a certain code, every vowel is replaced by the next letter and every consonant by the previous letter. How will GAME be coded?",
    ["FZND", "FZMF", "HZND", "FAMD", "GZND"],
    "A",
  ),
  makeQuestion(
    43,
    "If APPLE = 50 and BALL = 27, using the sum of the alphabet positions, what is GRAPE?",
    ["49", "51", "53", "55", "57"],
    "C",
  ),
  makeQuestion(
    44,
    "If the letters of a word are shifted two positions forward in the alphabet, with Z followed by A, how is ZEBRA coded?",
    ["BGDTD", "BGDTC", "BGDTZ", "YGDTD", "BFDTC"],
    "A",
  ),
  makeQuestion(
    45,
    "In a certain code: PEN → 16-5-14. What will BOOK be coded as?",
    ["2-15-15-11", "2-14-15-11", "3-15-15-11", "2-15-14-11", "2-15-15-10"],
    "A",
  ),
  makeQuestion(
    46,
    "If MOTHER is coded as REHTOM, how is FATHER coded?",
    ["REHTAF", "REHTFA", "RETHAF", "RHE TAF", "REHFTA"],
    "A",
  ),
  makeQuestion(
    47,
    "If A = Z, B = Y, C = X, and so on, how is DOG coded?",
    ["WLT", "WLG", "XLT", "VLT", "WMT"],
    "A",
  ),
  makeQuestion(
    48,
    "If APPLE is coded as 1-16-16-12-5, what is the code for GRAPE?",
    ["7-18-1-16-5", "7-17-1-16-5", "6-18-1-16-5", "7-18-2-16-5", "8-18-1-16-5"],
    "A",
  ),
  makeQuestion(
    49,
    "If BAT = 40 and CAT = 44, what will DOG be, using the same rule?",
    ["24", "26", "28", "30", "32"],
    "B",
  ),
  makeQuestion(
    50,
    "In a certain code, each letter is replaced by the letter three positions after it. How is MIND coded?",
    ["PLQG", "P L Q G", "P L Q F", "O L Q G", "PLRF"],
    "A",
  ),
  makeQuestion(
    51,
    "If CODE is written as 3-15-4-5, and the code is then reversed, how will it be represented?",
    ["5-4-15-3", "5-4-14-3", "4-5-15-3", "3-15-5-4", "5-3-15-4"],
    "A",
  ),
  makeQuestion(
    52,
    "If FIRE is coded as 6-9-18-5, but the code is formed by moving each letter one position backward, what will WATER be coded as?",
    [
      "22-0-19-4-17",
      "22-0-19-4-18",
      "23-0-19-4-17",
      "22-1-19-4-17",
      "22-0-20-4-17",
    ],
    "A",
  ),
  makeQuestion(
    53,
    "If KING is coded as LJMH, how is QUEEN coded?",
    ["RVFFO", "RVFEO", "RUFFO", "QVFFO", "RVFFN"],
    "A",
  ),
  makeQuestion(
    54,
    "In a certain code, the first and last letters of a word are exchanged, and the remaining letters stay unchanged. How will MARKET be coded?",
    ["TARKEM", "TARKET", "TARKEM", "KARMET", "TERKAM"],
    "A",
  ),
  makeQuestion(
    55,
    "If BIRD is coded as 2-18-9-4, and the code is changed by adding 1 to each number, what will be the code for FISH?",
    ["7-10-20-9", "6-10-19-9", "7-9-20-8", "7-10-19-9", "6-9-20-8"],
    "A",
  ),
];

const run = async () => {
  const connected = await connectDatabase();
  if (!connected)
    throw new Error("MongoDB is not connected. Configure backend/.env first.");

  await Question.deleteMany({ level: 2 });
  await Question.insertMany(questions);
  console.log(`Seeded ${questions.length} Level 2 questions.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
