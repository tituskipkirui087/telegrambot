/**
 * Local script to generate Telegram userbot session string
 * Run this locally: node generate-session.js
 * 
 * After running, it will:
 * 1. Ask for your phone number
 * 2. Send verification code to your Telegram
 * 3. Ask for the code
 * 4. Generate a session string (copy this to your .env)
 */

require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

async function generateSession() {
  const apiId = parseInt(process.env.API_ID);
  const apiHash = process.env.API_HASH;
  const phone = process.env.PHONE;

  if (!apiId || !apiHash || !phone) {
    console.log('❌ Missing credentials in .env file');
    console.log('Please add:');
    console.log('API_ID=your_api_id');
    console.log('API_HASH=your_api_hash');
    console.log('PHONE=+1234567890');
    return;
  }

  console.log('🔄 Starting authentication...');
  console.log('Phone:', phone);

  const session = new StringSession(''); // Empty session = new login
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => phone,
    password: async () => await input.text('Enter 2FA password (if any): '),
    phoneCode: async () => await input.text('Enter the code sent to your Telegram: '),
    onError: (err) => console.error('Error:', err),
  });

  console.log('\n✅ Authentication successful!');
  console.log('\n📝 COPY THIS SESSION STRING TO YOUR .env file:');
  console.log('==========================================');
  console.log(client.session.save());
  console.log('==========================================\n');

  await client.disconnect();
}

generateSession().catch(console.error);
