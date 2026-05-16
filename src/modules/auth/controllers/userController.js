const userService = require("../services/userService");
const jwt = require("jsonwebtoken");

/**
 * Helper: create a signed JWT for a user
 */
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * POST /api/auth/register - Register a new user
 */
async function register(req, res) {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Email, username, and password are required" });
    }

    const user = await userService.registerUser({
      email,
      username,
      password,
      firstName,
      lastName,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/auth/login - Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userService.loginUser(email, password);
    const token = createToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({ error: error.message });
  }
}

/**
 * GET /api/auth/user/:id - Get user by ID
 */
async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(404).json({ error: error.message });
  }
}

/**
 * GET /api/auth/me - Get current user from JWT
 */
async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

    const user = await userService.getUserById(decoded.id);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * PUT /api/auth/user/:id - Update user profile
 */
async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = await userService.updateUserProfile(id, updateData);
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/auth/change-password - Change user password
 */
async function changePasswordHandler(req, res) {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "userId, oldPassword, and newPassword are required" });
    }

    const user = await userService.changePassword(
      userId,
      oldPassword,
      newPassword,
    );
    res.json({ message: "Password changed successfully", user });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /api/auth/user/:id - Delete user account
 */
async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    const result = await userService.deleteUserAccount(id);
    res.json(result);
  } catch (error) {
    console.error("Delete account error:", error.message);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getUserProfile,
  updateProfile,
  changePasswordHandler,
  deleteAccount,
};
