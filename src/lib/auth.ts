
import dns from "node:dns";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// MongoDB DNS configuration
dns.setServers(["1.1.1.1", "1.0.0.1"]);

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.DB_NAME || "fixmate");

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export const auth = betterAuth({
  // Google Login
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},

  // Database
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
  ],

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,

    // Password Reset Email
    sendResetPassword: async ({ user, url }) => {
      if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) {
        throw new Error("Gmail SMTP credentials are missing.");
      }

      await transporter.sendMail({
        from: `"FixMate" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "FixMate - Reset Your Password",

        text: `Hello ${user.name || "User"},

You requested to reset your FixMate password.

Click the link below:

${url}

If you did not request this, please ignore this email.

Thanks,
FixMate Team`,

        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:25px;border:1px solid #e5e7eb;border-radius:12px;">
            <h2 style="color:#2563eb;">FixMate Password Reset</h2>

            <p>Hello ${user.name || "User"},</p>

            <p>You requested to reset your FixMate account password.</p>

            <a
              href="${url}"
              style="display:inline-block;background:#2563eb;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;"
            >
              Reset Password
            </a>

            <p style="margin-top:20px;">
              If you did not request this, please ignore this email.
            </p>

            <p>Thanks,<br />FixMate Team</p>
          </div>
        `,
      });
    },
  },

  // Additional User Fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      area: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  // Database Hooks
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "technician" ? "technician" : "customer",
          },
        }),
      },

      update: {
        before: async (user) => {
          const safeUpdate = { ...user } as typeof user & {
            role?: unknown;
          };

          delete safeUpdate.role;

          return {
            data: safeUpdate,
          };
        },
      },
    },
  },
});
