const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";

async function sendVerificationEmail(to, nombre, verifyUrl) {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Curso Jupyter Notebook", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject: "Verifica tu cuenta — Curso Jupyter Notebook",
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1E1E1E;color:#fff;border-radius:12px;">
          <h2 style="color:#FF5722;margin-top:0;">Verifica tu cuenta</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por registrarte en el Curso de Jupyter Notebook. Haz clic en el botón para activar tu cuenta:</p>
          <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#FF5722;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Verificar mi cuenta
          </a>
          <p style="color:#999;font-size:13px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
          <p style="color:#999;font-size:13px;">Este enlace expira en 24 horas.</p>
        </div>
      `,
    }),
  });
}

exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    if (!email || !email.endsWith("@alumnos.udg.mx")) {
      return res.status(400).json({ message: "Solo se permite el registro con correo institucional (@alumnos.udg.mx)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({ nombre, email, password, verificationToken, isVerified: false });
    await user.save();

    const verifyUrl = `${FRONTEND_URL}/verificar?token=${verificationToken}`;

    await sendVerificationEmail(email, nombre, verifyUrl);

    res.json({ message: "Cuenta creada. Revisa tu correo para verificar tu cuenta." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: "Cuenta verificada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Debes verificar tu correo antes de iniciar sesión" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { userId: user._id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
