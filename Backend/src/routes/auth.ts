import { Router, type IRouter } from "express";
import {
  signup,
  login,
  logout,
  me,
  updateMe,
  deleteAccount,
  listMembers,
  addMember,
  updateMember,
  updateMemberStatus,
  removeMember,
  getMemberStats,
  listOrganisers,
  updateOrganiser,
} from "../controllers/auth";
import { authenticate, authorize } from "../middleware/auth";

const router: IRouter = Router();

// Public authentication
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticate, me);
router.patch("/auth/me", authenticate, updateMe);
router.delete("/auth/me", authenticate, deleteAccount);

// Member management (admin, organiser)
router.get("/auth/members", authenticate, authorize("admin", "organiser"), listMembers);
router.get(
  "/auth/members/stats",
  authenticate,
  authorize("admin", "organiser"),
  getMemberStats,
);
router.post("/auth/members", authenticate, authorize("admin", "organiser"), addMember);
router.patch(
  "/auth/members/:id",
  authenticate,
  authorize("admin", "organiser"),
  updateMember,
);
router.patch(
  "/auth/members/:id/status",
  authenticate,
  authorize("admin", "organiser"),
  updateMemberStatus,
);
router.delete(
  "/auth/members/:id",
  authenticate,
  authorize("admin", "organiser"),
  removeMember,
);

// Organiser management (admin only)
router.get("/auth/organisers", authenticate, authorize("admin"), listOrganisers);
router.patch("/auth/organisers/:id", authenticate, authorize("admin"), updateOrganiser);

export default router;