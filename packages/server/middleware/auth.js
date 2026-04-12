import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY, getTenantPool } from "../config/config.js";
// import { getUserLastLoginDetails } from "../schema/user/resolvers.js";

const authenticateUser = async ({ req }) => {
  const authHeader = req.headers["authorization"];
  const portalType = req.headers["x-portal-type"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // HSM v2.4: Permissive Gateway for Public Handshakes (Login/Signup)
    return;
  }

  let secretKey = PRIVATE_KEY;
  //   if (portalType === "student") {
  //     secretKey = PORTAL_PRIVATE_KEY;
  //   } else if (portalType == "applicant") {
  //     secretKey = APPLICANT_PRIVATE_KEY;
  //   } else {
  //     secretKey = PRIVATE_KEY;
  //   }

  let decoded;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (error) {
    throw new GraphQLError("Invalid or expired token.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (!decoded) {
    throw new GraphQLError("Invalid Token.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (portalType == "student" || portalType == "applicant") {
    req.user = decoded;
    return;
  }

  // Continue with further checks if the token is verified
  //   const lastLogin = await getUserLastLoginDetails({
  //     user_id: decoded.id,
  //     lastRecord: true,
  //   });

  //   // console.log("last login", lastLogin);

  //   if (!lastLogin[0] || lastLogin[0].session_id !== decoded.session_id)
  //     throw new GraphQLError("Invalid token...", {
  //       extensions: { code: "UNAUTHENTICATED" },
  //     });

  // Enrich the request user with database values (biodata) from their institutional cluster.
  try {
    if (decoded?.id) {
      // HSM v2.4 Identity Resolution Layer
      let dbName = decoded.dbName;
      
      // 🛡️ Stale Token Reconciliation: If dbName is missing, resolve from Registry
      if (!dbName && (decoded.email || decoded.email_address)) {
        const userEmail = decoded.email || decoded.email_address;
        const registryPool = getTenantPool("tredpos_registry");
        const [tenantRows] = await registryPool.query(
          "SELECT db_name FROM tenants WHERE owner_email = ? AND status = 'active' LIMIT 1",
          [userEmail.toLowerCase()]
        );
        if (tenantRows.length > 0) {
          dbName = tenantRows[0].db_name;
        }
      }

      const registryPool = getTenantPool("tredpos_registry");
      let tenantStatus = 'active';

      // 🛡️ Institutional Status Verification
      if (dbName) {
        const [tenantRows] = await registryPool.query(
          "SELECT status FROM tenants WHERE db_name = ? LIMIT 1",
          [dbName]
        );
        if (tenantRows.length > 0) {
          tenantStatus = tenantRows[0].status;
        }
      }

      // 🔐 [HSM v2.4] Vanguard Suspension Guard (API Level)
      // Block all transactions if the institutional cluster is suspended.
      if (tenantStatus === 'suspended' && decoded.role !== 'hq-ceo') {
        throw new GraphQLError("ACCESS_DENIED: Your business account on the TREDPOS Platform has been temporarily suspended due to unresolved payment obligations. Please contact Tred Industries HQ for assistance.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const targetPool = getTenantPool(dbName);
      
      const [rows] = await targetPool.execute(
        `SELECT * FROM users WHERE id = ? LIMIT 1`,
        [decoded.id]
      );
      const dbUser = rows && rows[0] ? rows[0] : null;

      if (dbUser) {
        // provide a 'biodata' convenience object used by resolvers/clients
        const buildStaffName = (u) => {
          const safe = (v) =>
            v !== undefined &&
            v !== null &&
            String(v).trim() !== "" &&
            String(v) !== "null" &&
            String(v) !== "undefined";
          if (safe(u?.title) || safe(u?.staff_name)) {
            return {
              title: u?.title || null,
              staff_name: u?.staff_name || u?.surname || u?.last_name || null,
            };
          }
          const first = safe(u?.first_name)
            ? u.first_name
            : safe(u?.surname)
              ? u.surname
              : null;
          const last = safe(u?.last_name)
            ? u.last_name
            : safe(u?.other_names)
              ? u.other_names
              : null;
          return {
            title: null,
            staff_name: [first, last].filter(Boolean).join(" ").trim() || null,
          };
        };
        const biodata = buildStaffName(dbUser);
        // compute a display name if the token doesn't contain one
        const computeName = (d, b) => {
          if (d?.name) return d.name;
          if (b && (b.title || b.staff_name)) {
            return `${b.title || ""} ${b.staff_name || ""}`.trim();
          }
          const safe = (v) =>
            v !== undefined && v !== null && String(v).trim() !== "";
          const first = safe(dbUser?.first_name)
            ? dbUser.first_name
            : safe(dbUser?.surname)
              ? dbUser.surname
              : null;
          const last = safe(dbUser?.last_name)
            ? dbUser.last_name
            : safe(dbUser?.other_names)
              ? dbUser.other_names
              : null;
          if (first || last)
            return [first, last].filter(Boolean).join(" ").trim();
          return null; // avoid email fallback here
        };
        const name = computeName(decoded, biodata);
        req.user = { ...decoded, ...dbUser, biodata, name, dbName, tenantStatus };
      } else {
        req.user = { ...decoded, dbName, tenantStatus };
      }
    } else {
      req.user = decoded;
    }
  } catch (e) {
    if (e.message?.startsWith("ACCESS_DENIED")) throw e;
    // If DB lookup fails, still set decoded token onto req.user to avoid blocking request for minor DB errors
    console.warn("auth: failed to load user from institutional DB", e?.message || e);
    req.user = decoded;
  }
};
export default authenticateUser;
