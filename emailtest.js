import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const result = await resend.emails.send({
    from: 'SnapDoor <onboarding@resend.dev>',
    to: 'uillenmachado@gmail.com',
    subject: 'Teste SnapDoor',
    html: '<p>Envio de e-mail funcional ✅</p>',
  });

  console.log(result);
}

main().catch(console.error);
