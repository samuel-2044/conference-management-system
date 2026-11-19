import { Request, Response } from "express";
import {
  authenticate,
  authorize,
  comparePasswords,
  createSessionCookie,
  clearSessionCookie,
  hashPassword,
  logActivity,
} from "../middleware/auth";
import { z } from "zod";

const SignupBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["attendee", "speaker"], {
    errorMap: () => ({ message: "Only attendee and speaker roles can sign up" }),
  }),
});

const LoginBodySchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const ROLE_IDS: Record<string, string> = {
  admin: "role-1",
  organiser: "role-2",
  speaker: "role-3",
  attendee: "role-4",
};

function getDb(req: Request): D1Database {
  return (req as any).env?.convene_db;
}

export function signup(req: Request, res: Response): void {
  (async () => {
    const parseResult = SignupBodySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email: rawEmail, password, role } = parseResult.data;
    const email = rawEmail.toLowerCase().trim();
    const db = getDb(req);

    const existing = await db
      .prepare("SELECT id FROM users WHERE lower(email) = ?")
      .bind(email)
      .first();

    if (existing) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
      return;
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await hashPassword(password);

    try {
      await db
        .prepare(
          `INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          userId,
          ROLE_IDS[role],
          name,
          email,
          passwordHash,
          null,
          null,
          role,
          "active",
          new Date().toISOString(),
        )
        .run();
    } catch (err: any) {
      if (err?.message?.includes("UNIQUE") || err?.cause?.message?.includes("UNIQUE")) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in instead.",
        });
        return;
      }
      throw err;
    }

    logActivity(userId, "signup", { role, email });

    createSessionCookie(res, userId);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: userId,
        name,
        email,
        role,
        status: "active",
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Signup error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

export function login(req: Request, res: Response): void {
  (async () => {
    const parseResult = LoginBodySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;
    const db = getDb(req);

    const user = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (!user || !(user as any).password_hash) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isValid = await comparePasswords(password, (user as any).password_hash);

    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if ((user as any).status !== "active") {
      res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact an administrator.",
      });
      return;
    }

    logActivity(user.id, "login", { email });

    createSessionCookie(res, user.id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        status: user.status,
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Login error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

export function logout(req: Request, res: Response): void {
  clearSessionCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
}

export function me(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  res.json({
    success: true,
    message: "User retrieved",
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.roleName,
      status: req.user.status,
    },
  });
}

const UpdateMeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
});

export function updateMe(req: Request, res: Response): void {
  (async () => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const parseResult = UpdateMeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email: rawEmail } = parseResult.data;
    const db = getDb(req);
    const userId = req.user.id;

    if (rawEmail) {
      const email = rawEmail.toLowerCase().trim();
      const existing = await db
        .prepare("SELECT id FROM users WHERE lower(email) = ? AND id != ?")
        .bind(email, userId)
        .first();
      if (existing) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
        return;
      }
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (rawEmail) { fields.push("email = ?"); values.push(rawEmail.toLowerCase().trim()); }

    if (fields.length > 0) {
      values.push(userId);
      await db
        .prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`)
        .bind(...values)
        .run();
    }

    logActivity(userId, "update_profile", { name, email: rawEmail });

    const updated = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: (updated as any).id,
        name: (updated as any).name,
        email: (updated as any).email,
        role: (updated as any).role_name,
        status: (updated as any).status,
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Update profile error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

export function deleteAccount(req: Request, res: Response): void {
  (async () => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const db = getDb(req);
    const userId = req.user.id;

    await db.prepare("DELETE FROM attendee_sessions WHERE attendee_id IN (SELECT id FROM attendees WHERE user_id = ?)").bind(userId).run();
    await db.prepare("DELETE FROM conference_attendees WHERE attendee_id IN (SELECT id FROM attendees WHERE user_id = ?)").bind(userId).run();
    await db.prepare("DELETE FROM attendees WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM speakers WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM session_speakers WHERE speaker_id IN (SELECT id FROM speakers WHERE user_id = ?)").bind(userId).run();
    await db.prepare("DELETE FROM documents WHERE user_id = ?").bind(userId).run();
    await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    clearSessionCookie(res);
    logActivity(userId, "delete_account", { email: req.user.email });
    res.json({ success: true, message: "Account deleted successfully" });
  })().catch((err) => {
    logger.error({ err }, "Delete account error");
    res.status(500).json({ success: false, message: "Failed to delete account" });
  });
}

// ========== MEMBER MANAGEMENT ==========

const MemberListQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["attendee", "speaker", "admin", "organiser"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export function listMembers(req: Request, res: Response): void {
  (async () => {
    const parseResult = MemberListQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { search, role, status } = parseResult.data;
    const db = getDb(req);

    let sql = "SELECT * FROM users WHERE role_name != 'admin'";
    const values: unknown[] = [];

    if (search) {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)`;
      const s = `%${search.toLowerCase()}%`;
      values.push(s, s);
    }

    if (role) {
      sql += ` AND role_name = ?`;
      values.push(role);
    }

    if (status) {
      sql += ` AND status = ?`;
      values.push(status);
    }

    const result = await db.prepare(sql).bind(...values).all();

    res.json({
      success: true,
      message: "Members retrieved",
      data: result.results.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role_name,
        status: u.status,
        createdAt: u.created_at,
      })),
    });
  })().catch((err) => {
    logger.error({ err }, "List members error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

const MemberBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["attendee", "speaker"], {
    errorMap: () => ({ message: "Only attendee and speaker roles can be created" }),
  }),
});

export function addMember(req: Request, res: Response): void {
  (async () => {
    const parseResult = MemberBodySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email: rawEmail, password, role } = parseResult.data;
    const email = rawEmail.toLowerCase().trim();
    const db = getDb(req);

    const existing = await db
      .prepare("SELECT id FROM users WHERE lower(email) = ?")
      .bind(email)
      .first();

    if (existing) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
      return;
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await hashPassword(password);

    try {
      await db
        .prepare(
          `INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          userId,
          ROLE_IDS[role],
          name,
          email,
          passwordHash,
          null,
          null,
          role,
          "active",
          new Date().toISOString(),
        )
        .run();
    } catch (err: any) {
      if (err?.message?.includes("UNIQUE") || err?.cause?.message?.includes("UNIQUE")) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in instead.",
        });
        return;
      }
      throw err;
    }

    logActivity(req.user?.id, "add_member", { targetId: userId, role, email });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: {
        id: userId,
        name,
        email,
        role,
        status: "active",
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Add member error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

const MemberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["attendee", "speaker"]).optional(),
});

export function updateMember(req: Request, res: Response): void {
  (async () => {
    const parseResult = MemberUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.params.id;
    const db = getDb(req);

    const user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!user) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }

    if ((user as any).role_name === "admin" || (user as any).role_name === "organiser") {
      res.status(403).json({
        success: false,
        message: "Cannot modify admin or organiser accounts through member management",
      });
      return;
    }

    const { name, email, role } = parseResult.data;

    if (email && email !== (user as any).email) {
      const existing = await db
        .prepare("SELECT id FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (existing) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
        return;
      }
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (role) {
      fields.push("role_name = ?");
      fields.push("role_id = ?");
      values.push(role);
      values.push(ROLE_IDS[role]);
    }

    if (fields.length > 0) {
      values.push(userId);
      await db
        .prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`)
        .bind(...values)
        .run();
    }

    logActivity(req.user?.id, "update_member", { targetId: userId, changes: parseResult.data });

    const updated = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    res.json({
      success: true,
      message: "Member updated successfully",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role_name,
        status: updated.status,
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Update member error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

const MemberStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export function updateMemberStatus(req: Request, res: Response): void {
  (async () => {
    const parseResult = MemberStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.params.id;
    const db = getDb(req);

    const user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!user) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }

    if ((user as any).role_name === "admin" || (user as any).role_name === "organiser") {
      res.status(403).json({
        success: false,
        message: "Cannot deactivate admin or organiser accounts through member management",
      });
      return;
    }

    await db
      .prepare("UPDATE users SET status = ? WHERE id = ?")
      .bind(parseResult.data.status, userId)
      .run();

    logActivity(req.user?.id, "update_member_status", {
      targetId: userId,
      status: parseResult.data.status,
    });

    const updated = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    res.json({
      success: true,
      message: `Member ${parseResult.data.status} successfully`,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role_name,
        status: updated.status,
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Update member status error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

export function removeMember(req: Request, res: Response): void {
  (async () => {
    const userId = req.params.id;
    const db = getDb(req);

    const user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!user) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }

    if ((user as any).role_name === "admin" || (user as any).role_name === "organiser") {
      res.status(403).json({
        success: false,
        message: "Cannot remove admin or organiser accounts through member management",
      });
      return;
    }

    await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    logActivity(req.user?.id, "remove_member", { targetId: userId, role: (user as any).role_name });

    res.json({ success: true, message: "Member removed successfully" });
  })().catch((err) => {
    logger.error({ err }, "Remove member error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}

export function getMemberStats(req: Request, res: Response): void {
  (async () => {
    const db = getDb(req);

    const totalAttendees = await db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role_name = 'attendee'")
      .first();
    const totalSpeakers = await db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role_name = 'speaker'")
      .first();
    const activeMembers = await db
      .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
      .first();
    const inactiveMembers = await db
      .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'inactive'")
      .first();

    res.json({
      success: true,
      message: "Member statistics retrieved",
      data: {
        totalAttendees: (totalAttendees as { count: number })?.count ?? 0,
        totalSpeakers: (totalSpeakers as { count: number })?.count ?? 0,
        activeMembers: (activeMembers as { count: number })?.count ?? 0,
        inactiveMembers: (inactiveMembers as { count: number })?.count ?? 0,
      },
    });
  })().catch((err) => {
    logger.error({ err }, "Member stats error");
    res.status(500).json({ success: false, message: "Internal server error" });
  });
}
