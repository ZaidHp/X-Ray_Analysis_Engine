import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()


async def send_otp_email(to_email: str, otp: str):
    """Sends an OTP email asynchronously."""
    
    server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", 587))
    sender_email = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")

    if not sender_email or not password:
        print("Warning: SMTP credentials missing. OTP generated but not sent.")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify your account - X-Ray Analysis Engine"
    message["From"] = sender_email
    message["To"] = to_email

    html = f"""
    <html>
      <body>
        <h2>Account Verification</h2>
        <p>Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">{otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """
    
    part = MIMEText(html, "html")
    message.attach(part)

    def _send_email():
        try:
            with smtplib.SMTP(server, port) as server_conn:
                server_conn.starttls()
                server_conn.login(sender_email, password)
                server_conn.sendmail(sender_email, to_email, message.as_string())
        except Exception as e:
            print(f"Failed to send email: {e}")

    await asyncio.to_thread(_send_email)