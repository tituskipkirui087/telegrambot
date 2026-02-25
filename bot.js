const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ============================================
// CHANNEL CONFIGURATION
// ============================================
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME || 'ryancardsempire';
const CHANNEL_ID = '@' + CHANNEL_USERNAME;

// ============================================
// AUTO-POST MESSAGES - Unique generator (1 million+ variations)
// ============================================
const BOT_USERNAME = 'ryancardsempirebot';
const botLink = `https://t.me/${BOT_USERNAME}`;

// Slang words for generation - creates millions of unique combinations
const slangWords = {
  greeting: ['YO', 'HEY', 'WASSUP', 'WASSGOOD', 'WHAT UP', 'YOO', 'YOOO', 'AYYY', 'WADDUP', 'HEYYY', 'WADDUPP', 'WASSUP FAM', 'WASSGOOD MY GANG'],
  crowd: ['GANG', 'FAM', 'MY GANG', 'DUDE', 'FAM FAM', 'MY PEOPLE', 'YALL', 'EVERYONE', 'SQUAD', 'CREW', 'MY SQUAD', 'MY NIGGA', 'MY BRUH', 'MY G'],
  action: ['LETS GET THIS BAG', 'CHASE THAT BAG', 'GRIND TIME', 'GET THIS MONEY', 'MAKE THAT PAPER', 'STACK THAT CHEESE', 'GET THAT BREAD', 'CHASE THE BAG', 'GRIND IT OUT', 'MAKE IT RAIN', 'GET THAT PAPER', 'STACK UP', 'GET RICH QUICK'],
  urgency: ['NAOW', 'RIGHT NOW', 'ASAP', 'QUICK', 'FAST', 'IMMEDIATE', 'RN', 'RIGHT TF NOW', 'QUICKLY', 'DO IT NOW', 'TONIGHT', 'B4 ITS GONE', 'QUICK FAST'],
  emphasis: ['🔥', '💰', '💵', '💸', '🔥🔥', '💰💰', '💵💵', '💸💸', '🔥🔥🔥', '💰💰💰', '⚡', '💎', '🚀'],
  products: ['BANK LOGS', 'CCS', 'CASHAPP LOGS', 'PAYPAL', 'CHIME', 'VENMO', 'ZELLE', 'APPLE PAY', 'ACH', 'SLIPS', 'STIMS', 'WIRE TRANSFERS'],
  adjectives: ['FRESH', 'CLEAN', 'REAL', 'VERIFIED', 'READY', 'WORKING', 'CLEARED', 'PREMIUM', 'TOP TIER', 'LEGIT', 'FRICKIN', 'CRAZY', 'INSANE', 'COLD', 'CULTURED'],
  assurance: ['FR FR', 'NO CAP', 'FOR REAL', 'I AINT LYING', 'NO JOKE', 'FOR REAL FOR REAL', 'TRUTH', 'REAL TALK', 'FAITH', 'IT IS WHAT IT IS', 'ON GOD', 'ON MY MOM', 'SWEAR ON IT'],
  closing: ['LETS GET IT', 'READY', 'LETS GO', 'WEE WOO', 'LIGHTS CAMERA ACTION', 'GAME TIME', 'SHOWTIME', 'LETS DO THIS', 'ON GOD', 'NO DOUBT', 'LITERALLY', 'FIGHT ME', 'C MON', 'WEE WOO']
};

// Track posted messages to avoid repeats within the cycle (1 million unique messages)
let postedMessageHashes = new Set();

function generateUniqueMessage() {
  let attempts = 0;
  let message;
  let hash;
  
  do {
    // Random selections for variety
    const greeting = slangWords.greeting[Math.floor(Math.random() * slangWords.greeting.length)];
    const crowd = slangWords.crowd[Math.floor(Math.random() * slangWords.crowd.length)];
    const action = slangWords.action[Math.floor(Math.random() * slangWords.action.length)];
    const urgency = slangWords.urgency[Math.floor(Math.random() * slangWords.urgency.length)];
    const emphasis = slangWords.emphasis[Math.floor(Math.random() * slangWords.emphasis.length)];
    const emphasis2 = slangWords.emphasis[Math.floor(Math.random() * slangWords.emphasis.length)];
    const adj1 = slangWords.adjectives[Math.floor(Math.random() * slangWords.adjectives.length)];
    const adj2 = slangWords.adjectives[Math.floor(Math.random() * slangWords.adjectives.length)];
    const assurance = slangWords.assurance[Math.floor(Math.random() * slangWords.assurance.length)];
    const closing = slangWords.closing[Math.floor(Math.random() * slangWords.closing.length)];
    
    // Pick 4-7 random products
    const numProducts = 4 + Math.floor(Math.random() * 4);
    const shuffled = [...slangWords.products].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numProducts);
    const productList = selectedProducts.join(' | ');
    
    // Build unique message
    message = `${emphasis}${greeting} ${crowd}${emphasis2}\n\n${action} 💪💪\n\nWE GOT THE REAL STUFF FR FR🔥\n\n${adj1} ${productList}\n\n${adj2} AND READY TO GO\n\n${assurance} NO SCAM🎯\n\nTHIS THAT BAG CHASE SEASON🏃💨\n\n${closing} ${urgency}🔥🔥🔥\n\n[Click here to start](${botLink})`;
    
    // Create hash for this message to track uniqueness
    hash = message.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    attempts++;
    
  } while (postedMessageHashes.has(hash) && attempts < 1000);
  
  // Mark this message as posted
  postedMessageHashes.add(hash);
  
  // If we've posted 1 million unique messages, reset the cycle
  if (postedMessageHashes.size >= 1000000) {
    postedMessageHashes.clear();
    console.log('🔄 Message cycle complete (1 million), starting fresh!');
  }
  
  return message;
}

// Single message - will be regenerated each time
let currentAutoPostMessage = '';

function getNextMessage() {
  currentAutoPostMessage = generateUniqueMessage();
  return currentAutoPostMessage;
}

let autoPostInterval;

function startAutoPost() {
  // Post immediately on startup with a unique message
  postToChannel(getNextMessage());
  
  // Then post every 1 hour (1 * 60 * 60 * 1000 ms)
  autoPostInterval = setInterval(() => {
    postToChannel(getNextMessage());
  }, 1 * 60 * 60 * 1000);
  
  console.log('✅ Auto-post started: posting unique messages every 1 hour');
}

function stopAutoPost() {
  if (autoPostInterval) {
    clearInterval(autoPostInterval);
    console.log('⏹️ Auto-post stopped');
  }
}

// ============================================
// CHANNEL NOTIFICATION FUNCTIONS
// ============================================

// Send message to channel
async function sendToChannel(message, parseMode = 'Markdown') {
  try {
    await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: parseMode });
    console.log(`✅ Message sent to channel ${CHANNEL_ID}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending to channel:', error.message);
    return false;
  }
}

// Alias for postToChannel
async function postToChannel(message) {
  return sendToChannel(message);
}

// Notify new product/purchase
async function notifyPurchase(product, userId) {
  const message = `🛒 *New Order Received!*\n\n` +
    `📦 Product: ${product.name}\n` +
    `💵 Price: ${product.priceUsd} USD\n` +
    `👤 Customer ID: ${userId}\n` +
    `⏰ Time: ${new Date().toLocaleString()}`;
  return sendToChannel(message);
}

// Notify price change
async function notifyPriceChange(oldPrice, newPrice, productName) {
  const message = `💰 *Price Update!*\n\n` +
    `📦 Product: ${productName}\n` +
    `💵 Old Price: ${oldPrice} USD\n` +
    `💵 New Price: ${newPrice} USD\n` +
    `⏰ Updated: ${new Date().toLocaleString()}`;
  return sendToChannel(message);
}

// Notify promotional offer
async function notifyPromotion(title, description, discount) {
  const message = `🎉 *Promotional Offer!*\n\n` +
    `🏷️ ${title}\n` +
    `📝 ${description}\n` +
    `💎 Discount: ${discount}\n` +
    `⏰ Valid until: ${new Date(Date.now() + 24*60*60*1000).toLocaleString()}`;
  return sendToChannel(message);
}

// Notify restock/new stock
async function notifyRestock(productName, quantity) {
  const message = `📦 *New Stock Available!*\n\n` +
    `📦 Product: ${productName}\n` +
    `🔢 Quantity: ${quantity} cards\n` +
    `⏰ Available: ${new Date().toLocaleString()}`;
  return sendToChannel(message);
}

// ============================================
// PRODUCT CONFIGURATION - Add your products here
// ============================================
const CRYPTO_WALLET = "19QjFZbTzEd8VPvkVdr2KzTVzC3Zq2qR9M";

const products = [
  { id: 'product_1', name: '🔶 $50 Linkable Cards', priceUsd: '50', value: '$500' },
  { id: 'product_2', name: '🔶 $55 Linkable Cards', priceUsd: '55', value: '$700' },
  { id: 'product_3', name: '🔶 $60 Linkable Cards', priceUsd: '60', value: '$1000' },
  { id: 'product_4', name: '🔶 $70 Linkable Cards', priceUsd: '70', value: '$1200' },
  { id: 'product_5', name: '🔶 $75 Linkable Cards', priceUsd: '75', value: '$1500' },
  { id: 'product_6', name: '🔶 $80 Linkable Cards', priceUsd: '80', value: '$1800' },
  { id: 'product_7', name: '🔶 $85 Linkable Cards', priceUsd: '85', value: '$2000' },
  { id: 'product_8', name: '🔶 $90 Linkable Cards', priceUsd: '90', value: '$2200' },
  { id: 'product_9', name: '🔶 $95 Linkable Cards', priceUsd: '95', value: '$2500' },
  { id: 'product_10', name: '🔶 $100 Linkable Cards', priceUsd: '100', value: '$2800' },
  { id: 'product_11', name: '🔶 $130 Linkable Cards', priceUsd: '130', value: '$3000' },
  { id: 'product_12', name: '🔶 $150 Linkable Cards', priceUsd: '150', value: '$3500' }
];

// ============================================
// WELCOME MESSAGE
// ============================================
const welcomeMessage = `
💎 *ELITE VAULT SERVICES* 💎
━━━━━━━━━━━━━━━━━━━━━━

 *Welcome!* We're your trusted source for premium cards.

 ✨ *What We Offer:*
 ✅ Fresh high-balance drops
 ✅ 100% trusted & verified vendor  
 ✅ Fast delivery & replacement guarantee 

 💳 *Available Regions:*
 • USA | UK | EU Cards

 💰 *Balance Ranges:*
 • $500 - $5,000

 🚀 *Services:*
 • Instant processing
 • 24/7 support
 • Secure transactions only 

 ━━━━━━━━━━━━━━━━━━━━━━

 💡 Use /menu to browse products
 💡 Use /paynow to get payment address
 💡 Use /copy to copy BTC address

 *Serious buyers only. No time wasters.*
`;

// ============================================
// PRODUCT MENU KEYBOARD
// ============================================
function getProductMenu() {
  const buttons = products.map(product => 
    [Markup.button.callback(`${product.name}`, `buy_${product.id}`)]
  );
  
  buttons.push([Markup.button.callback('📞 Contact Support', 'contact_support')]);
  buttons.push([Markup.button.callback('ℹ️ About Us', 'about_us')]);
  
  return Markup.inlineKeyboard(buttons);
}

// ============================================
// BOT COMMANDS
// ============================================

bot.start(async (ctx) => {
  try {
    console.log('🎯 /start command received from:', ctx.from.first_name, ctx.from.id);
    const userName = ctx.from.first_name || 'Friend';
    await ctx.replyWithMarkdown(
      `👋 Hello ${userName}! ${welcomeMessage}`,
      getProductMenu()
    );
    console.log('✅ Welcome message sent');
  } catch (error) {
    console.error('Error in start command:', error);
  }
});

bot.command('menu', async (ctx) => {
  try {
    const buttons = products.map(product => 
      [Markup.button.callback(`${product.name}`, `buy_${product.id}`)]
    );
    
    buttons.push([Markup.button.callback('📞 Contact Support', 'contact_support')]);
    buttons.push([Markup.button.callback('ℹ️ About Us', 'about_us')]);
    
    const keyboard = Markup.inlineKeyboard(buttons);
    
    await ctx.reply('🛒 *Our Products*', { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  } catch (error) {
    console.error('Error in menu command:', error);
  }
});

bot.command('help', async (ctx) => {
  try {
    await ctx.replyWithMarkdown(`
 📖 *Help Guide*

 *How to purchase:*
 1. Browse our products using the menu
 2. Click on the product you want
 3. Click the payment link
 4. Complete payment with your preferred cryptocurrency

 *Supported Cryptocurrencies:*
 • Bitcoin (BTC)
 • Ethereum (ETH)
 • USDT (TRC20/ERC20)
 • And many more!

 *Need help?* Contact our support team anytime!
    `);
  } catch (error) {
    console.error('Error in help command:', error);
  }
});

bot.command('copy', async (ctx) => {
  try {
    await ctx.reply(CRYPTO_WALLET);
    await ctx.reply(
      `⚠️ *IMPORTANT NOTICE*\n\n` +
      `After making payment, please contact @ryancardsempire with:\n` +
      `• Screenshot of your payment\n` +
      `• The product you purchased\n\n` +
      `Our team will deliver your product to your DM once payment is confirmed!`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error in copy command:', error);
  }
});

bot.command('paynow', async (ctx) => {
  try {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📋 Copy BTC Address', 'copy_address')],
      [Markup.button.callback('🔙 Back to Menu', 'back_to_menu')]
    ]);
    
    await ctx.reply(
      `💰 *Payment Information*\n\n` +
      `Send payment in BTC to:\n\n` +
      `${CRYPTO_WALLET}\n\n` +
      `Tap and HOLD the address above to select & copy!\n\n` +
      `Or click the button below to copy.\n\n` +
      `⚠️ *After payment, contact @ryancardsempire with screenshot!*`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  } catch (error) {
    console.error('Error in paynow command:', error);
  }
});

bot.command('promote', async (ctx) => {
  try {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.reply('⛔ This command is only for admins.');
    }
    
    const args = ctx.message.text.split('|');
    if (args.length < 3) {
      return ctx.replyWithMarkdown(
        `📢 *Usage:* /promote title|description|discount\n\n` +
        `Example: /promote Summer Sale|Get 20% off on all cards|20% OFF`
      );
    }
    
    const title = args[1].trim();
    const description = args[2].trim();
    const discount = args[3] ? args[3].trim() : 'Special Deal';
    
    await notifyPromotion(title, description, discount);
    await ctx.reply('✅ Promotion sent to channel!');
  } catch (error) {
    console.error('Error in promote command:', error);
    ctx.reply('❌ Error sending promotion.');
  }
});

bot.command('restock', async (ctx) => {
  try {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.reply('⛔ This command is only for admins.');
    }
    
    const args = ctx.message.text.split('|');
    if (args.length < 3) {
      return ctx.replyWithMarkdown(
        `📦 *Usage:* /restock product|quantity\n\n` +
        `Example: /restock $50 Linkable Cards|25`
      );
    }
    
    const productName = args[1].trim();
    const quantity = args[2].trim();
    
    await notifyRestock(productName, quantity);
    await ctx.reply('✅ Restock notification sent to channel!');
  } catch (error) {
    console.error('Error in restock command:', error);
    ctx.reply('❌ Error sending restock notification.');
  }
});

bot.command('broadcast', async (ctx) => {
  try {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.reply('⛔ This command is only for admins.');
    }
    
    const message = ctx.message.text.replace('/broadcast', '').trim();
    if (!message) {
      return ctx.reply('📢 *Usage:* /broadcast your message here\n\nSends a custom message to the channel.');
    }
    
    await sendToChannel(message);
    await ctx.reply('✅ Message sent to channel!');
  } catch (error) {
    console.error('Error in broadcast command:', error);
    ctx.reply('❌ Error sending message.');
  }
});

bot.command('testchannel', async (ctx) => {
  try {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.reply('⛔ This command is only for admins.');
    }
    
    const success = await sendToChannel('✅ *Bot Connected Successfully!*\n\nChannel notifications are now active.');
    if (success) {
      await ctx.reply('✅ Channel connection successful! Test message sent.');
    } else {
      await ctx.reply('❌ Failed to send message to channel. Check bot permissions.');
    }
  } catch (error) {
    console.error('Error in testchannel command:', error);
    ctx.reply('❌ Error testing channel: ' + error.message);
  }
});

bot.command('postnow', async (ctx) => {
  try {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.reply('⛔ This command is only for admins.');
    }
    
    const message = getNextMessage();
    const success = await sendToChannel(message);
    if (success) {
      await ctx.reply('✅ Unique message posted to channel!');
    } else {
      await ctx.reply('❌ Failed to post to channel.');
    }
  } catch (error) {
    console.error('Error in postnow command:', error);
    ctx.reply('❌ Error posting message: ' + error.message);
  }
});

// ============================================
// CALLBACK QUERIES - Button handlers
// ============================================

products.forEach(product => {
  bot.action(`buy_${product.id}`, async (ctx) => {
    console.log('📥 Buy button clicked for:', product.id);
    try {
      await ctx.answerCbQuery();
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📋 Copy BTC Address', `copy_${product.id}`)],
        [Markup.button.callback('🔙 Back to Menu', 'back_to_menu')],
        [Markup.button.callback('📞 Contact Support', 'contact_support')]
      ]);
      
      await ctx.reply(
        `*${product.name}*\n\n` +
        `💎 Value of the card: ${product.value}\n\n` +
        `💵 Price: ${product.priceUsd} USD\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📥 PAYMENT INFO:\n\n` +
        `💰 Send exactly ${product.priceUsd} USD in BTC to:\n\n` +
        `${CRYPTO_WALLET}\n\n` +
        `Tap and HOLD to select the address above to copy!\n\n` +
        `Or type /copy to get the address anytime!\n\n` +
        `⚠️ Important:\n` +
        `- Send only BTC\n` +
        `- Include transaction ID when contacting support`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      console.log('✅ Product details sent');
    } catch (error) {
      console.error('❌ Error in buy handler:', error.message);
    }
  });
});

bot.action(/^copy_/, async (ctx) => {
  console.log('📋 Copy button clicked! Action:', ctx.match);
  try {
    await ctx.answerCbQuery('📋 Sending address...');
    const copyMsg = `📋 BTC Address:\n${CRYPTO_WALLET}\n\nTap and hold to copy!`;
    await ctx.reply(copyMsg);
    console.log(`✅ Address sent to user: ${ctx.from.id}`);
  } catch (error) {
    console.error('❌ Error in copy action:', error.message);
    await ctx.reply('❌ Error. Address: ' + CRYPTO_WALLET);
  }
});

bot.action('copy_address', async (ctx) => {
  try {
    await ctx.answerCbQuery('📋 Address copied!');
    await ctx.reply(CRYPTO_WALLET);
    await ctx.reply(
      `⚠️ *IMPORTANT NOTICE*\n\n` +
      `After making payment, please contact @ryancardsempire with:\n` +
      `• Screenshot of your payment\n` +
      `• The product you purchased\n\n` +
      `Our team will deliver your product to your DM once payment is confirmed!`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error in copy_address:', error.message);
  }
});

bot.on('inline_query', async (ctx) => {
  try {
    const address = ctx.inlineQuery.query;
    if (address && address === CRYPTO_WALLET) {
      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: 'btc_address',
          title: 'Copy BTC Address',
          description: `Tap to copy: ${CRYPTO_WALLET}`,
          input_message_content: {
            message_text: `📋 *BTC Address:*\n\`\`\`${CRYPTO_WALLET}\`\`\`\n\nTap to copy the address above!`,
            parse_mode: 'Markdown'
          }
        }
      ], { cache_time: 0 });
    }
  } catch (error) {
    console.error('Error in inline_query:', error);
  }
});

bot.action('back_to_menu', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      welcomeMessage + '\n\n🛒 *Choose a product:*',
      {
        parse_mode: 'Markdown',
        reply_markup: getProductMenu()
      }
    );
  } catch (error) {
    console.error('Error in back_to_menu:', error);
  }
});

bot.action('contact_support', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(`
 📞 *Contact Support*

 We're here to help! Reach out to us:

 💬 Telegram: @ryancardsempire

 _Response time: Minutes_
    `);
  } catch (error) {
    console.error('Error in contact_support:', error);
  }
});

bot.action('about_us', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(`
 ℹ️ *About Us*

 We are a trusted team of professional vendors with over 5 years of experience in the digital marketplace. Our mission is to provide premium quality products with fast delivery and guaranteed satisfaction.

 We have served thousands of happy clients worldwide and continue to expand our network daily. Our platform ensures secure transactions, privacy protection, and 24/7 support for all customers.

 Thank you for being part of our community! 🎉
    `);
  } catch (error) {
    console.error('Error in about_us:', error);
  }
});

// ============================================
// CHANNEL MEMBER HANDLER
// ============================================

bot.on('chat_member', async (ctx) => {
  try {
    const chatMember = ctx.chatMember;
    
    if (chatMember.new_chat_member.status === 'member') {
      const userName = chatMember.from.first_name || 'Friend';
      const userId = chatMember.from.id;
      
      try {
        await ctx.telegram.sendMessage(
          userId,
          `🎉 *Welcome to the Channel, ${userName}!* 🎉\n\n` +
          `Thank you for subscribing!\n\n` +
          welcomeMessage,
          { parse_mode: 'Markdown', reply_markup: getProductMenu() }
        );
        console.log(`✅ Welcome message sent to new subscriber: ${userName} (${userId})`);
      } catch (e) {
        console.error('❌ Failed to send welcome DM - user needs to start bot first');
        try {
          await ctx.telegram.sendMessage(
            userId,
            `👋 Hi ${userName}! To receive our product menu, please start the bot by clicking: https://t.me/${process.env.TELEGRAM_BOT_TOKEN.split(':')[0]}\n\nOr search for our bot and click /start`
          );
        } catch (e2) {
          console.error('Could not send fallback message:', e2.message);
        }
      }
    }
  } catch (error) {
    console.error('Error handling chat_member:', error);
  }
});

bot.on('my_chat_member', async (ctx) => {
  const chatMember = ctx.myChatMember;
  if (chatMember.new_chat_member.status === 'member' || chatMember.new_chat_member.status === 'administrator') {
    console.log(`Bot added to channel: ${chatMember.chat.title} (ID: ${chatMember.chat.id})`);
    
    await ctx.replyWithMarkdown(
      `✅ *Bot is now active!*\n\n` +
      `I'll welcome new subscribers automatically.\n` +
      `Use /start to see the product menu.`,
      { chat_id: chatMember.chat.id }
    );
  }
});

bot.on('message', async (ctx) => {
  try {
    const message = ctx.message;
    
    if (message && message.new_chat_members && message.chat.type === 'supergroup') {
      for (const newMember of message.new_chat_members) {
        const userName = newMember.first_name || 'Friend';
        
        await ctx.replyWithMarkdown(
          `🎉 *Welcome, ${userName}!* 🎉\n\n` +
          `We're happy to have you join our channel!\n\n` +
          `Use /start to see our products and services.`,
          getProductMenu()
        );
      }
    }
  } catch (error) {
    console.error('Error handling new member:', error);
  }
});

// ============================================
// ERROR HANDLING
// ============================================

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('⚠️ An error occurred. Please try again or contact support.');
});

// ============================================
// START THE BOT (Webhook mode for cloud deployment)
// ============================================

const http = require('http');

const app = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('🤖 Telegram Bot is running!');
    return;
  }
  
  // Handle webhook callbacks from Telegram - check for /webhook path
  if (req.method === 'POST' && req.url === '/webhook') {
    console.log('📥 Received webhook from Telegram');
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        console.log('📨 Update received:', update.message ? update.message.text : 'non-text');
        await bot.handleUpdate(update);
        console.log('✅ Update handled successfully');
      } catch (err) {
        console.error('❌ Error handling update:', err.message);
      }
      res.writeHead(200);
      res.end();
    });
  } else {
    console.log('⚠️ Unknown request:', req.method, req.url);
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;

// Simple and reliable: Use long polling for all environments
// This is more reliable than webhooks for most cases
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}!`);
  
  // Launch bot with long polling
  bot.launch()
    .then(() => console.log('🤖 Bot started with long polling'))
    .catch(err => console.error('Launch error:', err.message));
  
  startAutoPost();
});

process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  app.close();
  stopAutoPost();
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  app.close();
  stopAutoPost();
});

process.once('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  stopAutoPost();
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  stopAutoPost();
  bot.stop('SIGTERM');
});

// ============================================
// USERBOT FOR CHANNEL MIRRORING (Optional)
// ============================================

const { TelegramClient } = require('gramjs');

async function startUserbot() {
  const apiId = parseInt(process.env.API_ID);
  const apiHash = process.env.API_HASH;
  const phone = process.env.PHONE;
  const sessionString = process.env.SESSION_STRING;
  const sourceChannel = process.env.SOURCE_CHANNEL;
  const targetUsername = process.env.TARGET_USERNAME || 'ryancardsempire';
  
  if (!apiId || !apiHash || !phone || !sourceChannel) {
    console.log('⚠️ Userbot credentials not configured. Skipping...');
    console.log('📝 To enable mirroring, add to .env:');
    console.log('   API_ID=your_api_id');
    console.log('   API_HASH=your_api_hash');
    console.log('   PHONE=+1234567890');
    console.log('   SOURCE_CHANNEL=source_channel_username');
    return;
  }
  
  console.log('🔄 Starting userbot for channel mirroring...');
  
  try {
    const client = new TelegramClient(sessionString || phone, apiId, apiHash);
    
    await client.start({
      phoneNumber: async () => phone,
      password: async () => process.env.TWO_FA_PASSWORD || '',
      phoneCode: async () => process.env.VERIFICATION_CODE || '',
      onError: (err) => console.error('❌ Userbot error:', err)
    });
    
    // Save session string for future use
    if (!sessionString) {
      const newSession = client.session.save();
      console.log('📝 New session string (add to .env):');
      console.log(newSession);
    }
    
    console.log('✅ Userbot connected!');
    
    // Get source channel entity
    const channel = await client.getEntity(sourceChannel);
    console.log(`📡 Listening to channel: ${sourceChannel}`);
    
    // Listen for new messages
    client.addEventHandler(async (event) => {
      const message = event.message;
      if (!message || !message.out) return; // Only process outgoing messages from the channel
      
      console.log('📥 New message from source channel, mirroring...');
      
      try {
        // Get the message text and replace source admin username with target username
        let messageText = message.message || '';
        
        // If there's text, replace any username mentions
        if (messageText) {
          // Get channel info to find admin username
          const channelInfo = await client.getEntity(sourceChannel);
          const sourceUsername = channelInfo.username;
          
          // Replace @sourcechannel with @targetusername
          if (sourceUsername) {
            messageText = messageText.replace(new RegExp(`@${sourceUsername}`, 'gi'), `@${targetUsername}`);
          }
        }
        
        // Forward to your channel
        await client.invoke({
          _: 'messages.forwardMessages',
          fromPeer: channel,
          id: [message.id],
          toPeer: CHANNEL_ID,
          randomId: [BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))]
        });
        
        console.log('✅ Message mirrored to channel');
      } catch (err) {
        console.error('❌ Failed to mirror message:', err.message);
      }
    }, new client.HandleNewMessage({}));
    
  } catch (err) {
    console.error('❌ Userbot startup error:', err.message);
  }
}

// Enable userbot:
startUserbot();
