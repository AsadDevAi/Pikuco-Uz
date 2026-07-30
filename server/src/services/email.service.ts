const getBrevoClient = () => {
  const Brevo = require('@getbrevo/brevo');
  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return apiInstance;
};


export const sendVerificationEmail = async (
  toEmail: string,
  toName: string,
  verificationLink: string,
): Promise<void> => {
  try {
    const apiInstance = getBrevoClient();
    
    if (!process.env.BREVO_API_KEY) {
      console.warn("⚠️ BREVO_API_KEY topilmadi. Email keta olmaydi.");
    }
    if (!process.env.SENDER_EMAIL) {
      console.warn("⚠️ SENDER_EMAIL topilmadi. Noto'g'ri sender ishlatilmoqda.");
    }

  await apiInstance.sendTransacEmail({
    sender: { name: 'Sinov Platform', email: process.env.SENDER_EMAIL || 'noreply@sinov.uz' },
    to: [{ email: toEmail, name: toName }],
    subject: "Sinov - Emailingizni tasdiqlang",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Sinov</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Test va Viktorina Platformasi</p>
        </div>
        <h2 style="color: #1f2937;">Emailingizni tasdiqlang</h2>
        <p style="color: #4b5563;">Salom, <strong>${toName}</strong>!</p>
        <p style="color: #4b5563;">Sinov platformasiga xush kelibsiz. Hisobingizni faollashtirish uchun quyidagi tugmani bosing:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationLink}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Emailni Tasdiqlash
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Ushbu havola 24 soat davomida amal qiladi.</p>
        <p style="color: #6b7280; font-size: 14px;">Agar siz bu so'rovni yubormasangiz, ushbu xatni e'tiborsiz qoldiring.</p>
      </div>
    `,
    });
    console.log("✅ verification email sent to:", toEmail);
  } catch (error: any) {
    console.error("❌ Brevo SDK Error:", error.response?.body || error.message || error);
  }
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  toName: string,
  resetLink: string,
): Promise<void> => {
  try {
    const apiInstance = getBrevoClient();

    if (!process.env.BREVO_API_KEY) {
      console.warn("⚠️ BREVO_API_KEY topilmadi. Email keta olmaydi.");
    }
    if (!process.env.SENDER_EMAIL) {
      console.warn("⚠️ SENDER_EMAIL topilmadi. Noto'g'ri sender ishlatilmoqda.");
    }

  await apiInstance.sendTransacEmail({
    sender: { name: 'Sinov Platform', email: process.env.SENDER_EMAIL || 'noreply@sinov.uz' },
    to: [{ email: toEmail, name: toName }],
    subject: "Sinov - Parolni tiklash",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Sinov</h1>
        </div>
        <h2 style="color: #1f2937;">Parolni tiklash</h2>
        <p style="color: #4b5563;">Salom, <strong>${toName}</strong>!</p>
        <p style="color: #4b5563;">Parolni tiklash uchun quyidagi tugmani bosing:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Parolni Tiklash
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Ushbu havola 1 soat davomida amal qiladi.</p>
        <p style="color: #6b7280; font-size: 14px;">Agar siz parolni tiklashni so'ramasangiz, ushbu xatni e'tiborsiz qoldiring.</p>
      </div>
    `,
    });
    console.log("✅ password reset email sent to:", toEmail);
  } catch (error: any) {
    console.error("❌ Brevo SDK Error:", error.response?.body || error.message || error);
  }
};
