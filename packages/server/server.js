// npm install @apollo/server @as-integrations/express5 express graphql cors
// Load local .env for development if present (do NOT commit secrets)
try {
  // dynamic import so dotenv is optional
  const dotenv = await import("dotenv");
  dotenv.config({ path: new URL("./.env", import.meta.url).pathname });
} catch (err) {
  // ignore if dotenv not installed or .env missing
}
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import http from "http";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import depthLimit from "graphql-depth-limit";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { typeDefs, resolvers } from "./schema/index.js";
import { setUserOnline, setUserOffline } from "./schema/user/resolvers.js";
import { logUserAction } from "./schema/logs/resolvers.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import inventoryRouter from "./routes/inventory.js";
import { initializeRegistry } from "./utils/registry.js";
import { startMailDispatcher } from "./workers/mailDispatcher.js";

import { host, port, PRIVATE_KEY } from "./config/config.js";
import authenticateUser from "./middleware/auth.js";
import { db, getTenantPool } from "./config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Institutional Telemetry Posture
const isProd = process.env.NODE_ENV === "production";
const logger = pino({
  level: isProd ? "info" : "debug",
  transport: isProd ? undefined : { target: "pino-pretty" }
});

// Debug logging
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception detected');
  fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled Rejection detected');
  fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
});


// Required logic for integrating with Express
const app = express();

// Security Hardening Layer (Vanguard Protocol)
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false, // Disable CSP in dev for sandbox
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded by the frontend
}));
app.use(compression());
app.use(hpp());

// Rate Limiting Hub (Anti-DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isProd ? 100 : 1000, // Stricter in production
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  skip: (req) => req.path === '/health'
});

// Health Endpoint (Restricted)
app.get("/health", cors("*"), (req, res) => res.status(200).send("OK"));

// Request Auditing
app.use(pinoHttp({ logger }));

// Static Asset Anchoring (Institutional Blueprint)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", cors(), express.static(path.join(__dirname, "uploads")));
app.use("/backups", cors(), express.static(path.join(__dirname, "backups")));

// CORS Whitelisting logic
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!isProd || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by Institutional CORS Policy"));
    }
  }
}));

app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes
app.use("/api/inventory", inventoryRouter);

const httpServer = http.createServer(app);

const uploadsDirUrl = new URL("./public/uploads/onboarding", import.meta.url);
const uploadsDirPath = fileURLToPath(uploadsDirUrl);
await fs.promises.mkdir(uploadsDirPath, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
]);

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;
    cb(null, fileName);
  },
});

const onboardingUpload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});


app.post("/uploads/onboarding", cors("*"), (req, res) => {
  onboardingUpload.single("file")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "File exceeds the 10MB size limit"
            : err.message;
        return res.status(400).json({ success: false, message });
      }
      return res
        .status(500)
        .json({ success: false, message: err?.message || "Upload failed" });
    }

    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      const storedPath = path.join(uploadsDirPath, file.filename);
      try {
        await fs.promises.unlink(storedPath);
      } catch (unlinkErr) {
        console.warn("Failed to clean up rejected file:", unlinkErr);
      }
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    const publicUrl = `/uploads/onboarding/${file.filename}`;

    return res.json({
      success: true,
      message: "Upload successful",
      url: publicUrl,
      fileName: file.originalname,
      storedFileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    });
  });
});

app.post("/api/auth/change-password", cors("*"), async (req, res) => {
  try {
    await authenticateUser({ req });
    const userId = req.user?.id;
    const { newPassword } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedPwd = await bcrypt.hash(newPassword, salt);

    await db.execute(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPwd, userId]
    );

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    const status = error?.extensions?.code === "UNAUTHENTICATED" ? 401 : 400;
    return res.status(status).json({
      success: false,
      message: error?.message || "Failed to change password",
    });
  }
});

// Modified server startup
// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({
  schema,
  onConnect: async (ctx) => {
    if (ctx.connectionParams && ctx.connectionParams.Authorization) {
      const token = ctx.connectionParams.Authorization.replace("Bearer ", "");
      try {
        const decoded = jwt.verify(token, PRIVATE_KEY);
        if (decoded && decoded.id) {
          await setUserOnline(decoded.id);
          return { user: decoded }; // Merged into context for onDisconnect
        }
      } catch (e) {
        console.error("WebSocket Auth Failed", e.message);
      }
    }
  },
  onDisconnect: async (ctx, code, reason) => {
    // Rely on the user object attached in onConnect
    if (ctx.user && ctx.user.id) {
      await setUserOffline(ctx.user.id);
    }
  }
}, wsServer);


const server = new ApolloServer({
  schema,
  introspection: !isProd,
  validationRules: [depthLimit(7)],
  formatError: (formattedError, error) => {
    // Audit internal errors without leaking forensics to client
    if (isProd) {
      logger.error({ error }, "Internal GraphQL Error");
      return {
        message: "Internal Laboratory Error [Reference: " + randomUUID() + "]",
        extensions: { code: "INTERNAL_SERVER_ERROR" }
      };
    }
    return formattedError;
  },
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Institutional Landing Page Configuration
    isProd 
      ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
      : ApolloServerPluginLandingPageLocalDefault(),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// Ensure we wait for our server to start
await server.start();

// Initialize Registry Hub for Multi-Tenancy
try {
  await initializeRegistry();
} catch (err) {
  console.error("[Registry Hub] Startup Failure:", err.message);
}

// Start Background Mail Queue Processor
startMailDispatcher();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/graphql",
  cors("*"),
  // graphqlUploadExpress must run BEFORE any body parser so multipart
  // requests are handled correctly. See graphql-upload docs.
  graphqlUploadExpress(),
  express.json({ limit: "10mb" }),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      // Be defensive: some clients or middleware may leave req.body undefined
      // (e.g. multipart requests or mis-ordered middleware). Pull operationName
      // from multiple places to avoid crashing during context creation.
      const operationName =
        (req && req.body && req.body.operationName) ||
        (req && req.query && req.query.operationName) ||
        (req &&
          req.headers &&
          (req.headers["x-operation-name"] || req.headers["operation-name"])) ||
        null;

      if (!operationName) {
        console.warn(`[apollo] Operation name missing for ${req.method} request to ${req.url}`);
      }
      const exemptOperations = new Set([
        "Login",
        "IntrospectionQuery",
        "GoogleLogin",
        "GoogleRegisterInstitution",
        "GoogleDecommissionRegistry",
        "GoogleFinalizeProvisioning",
        "System_settings"
      ]);

      // token: req.headers.token

      const isExempt = operationName && Array.from(exemptOperations).some(op => op.toLowerCase() === operationName.toLowerCase());
      // HSM v2.4: Unified Identity Handshake
      // We always authenticate if a token is present to ensure correct routing, 
      // EXCEPT for introspection/public handshakes which are handled as metadata telemetry.
      if (!isExempt) {
        await authenticateUser({ req });
      }

      const currentUser = req.user || null;
      let activeDb = db; // Default to 'hardware' master DB
      if (currentUser?.dbName) {
        activeDb = getTenantPool(currentUser.dbName);
      }

      // Institutional Routing Telemetry
      if (currentUser) {
        console.log(`[TredPos Routing] Operator: ${currentUser.username} | Role: ${currentUser.role} | Cluster: ${currentUser.dbName || 'ROOT_TERMINAL'}`);
      }

      return {
        req,
        res,
        user: currentUser,
        db: activeDb,
        // loaders: createLoaders(),
        logUserAction: (params) =>
          logUserAction({
            ...params,
            context: {
              ...params.context,
              user: currentUser,
              db: activeDb, // Injecting the institutional pool for forensic anchoring
              req,
              ip: req.ip,
            },
          }),
      };
    },
  })
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://${host}:${port}`);

// Note: background worker startup has been removed; emails are sent directly
// by the application code after DB commits. This avoids a Redis dependency.

// On startup, schedule any pending contract terminations saved in the DB


// Start scheduled jobs
// import { startArchiveJob } from "./jobs/archive_results_job.js";
// startArchiveJob();

// Removed redundant secondary express listen on 2222 to avoid port conflicts with the main httpServer 
// which is already listening on the configured port.
