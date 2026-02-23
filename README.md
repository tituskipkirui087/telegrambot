# Telegram Crypto Payment Bot

A Telegram bot that welcomes new subscribers, shows a product menu, and provides crypto payment links for purchases.

## Features

- 🎉 **Automatic Welcome** - Greets new subscribers with a welcome message
- 🛒 **Product Menu** - Displays products with prices and descriptions
- 💳 **Crypto Payments** - Links to payment pages for cryptocurrency checkout
- 📞 **Support** - Built-in contact support functionality
- 🔄 **Navigation** - Easy back navigation between menu and products

## Prerequisites

- Node.js (v14 or higher)
- A Telegram account
- A Telegram Bot Token (from @BotFather)
- Crypto payment links (from NOWPayments, CoinPayments, or similar)

## Setup Instructions

### 1. Get Telegram Bot Token

1. Open Telegram and search for @BotFather
2. Send `/newbot` to create a new bot
3. Follow the instructions and get your bot token
4. Copy the token

### 2. Configure the Bot

Open `.env` file and replace `YOUR_BOT_TOKEN_HERE` with your actual bot token:

```
TELEGRAM_BOT_TOKEN=your_actual_token_here
```

### 3. Set Up Crypto Payment Links

In `bot.js`, update the `products` array with your products and payment links:

```javascript
const products = [
  {
    id: 'product_1',
    name: 'Your Product Name',
    price: '0.01', // Price in ETH
    description: 'Product description',
    paymentLink: 'YOUR_PAYMENT_LINK_HERE'
  },
  // Add more products as needed
];
```

### 4. Get Crypto Payment Links

You can get payment links from:
- **NOWPayments** (https://nowpayments.io) - Popular crypto payment processor
- **CoinPayments** (https://www.coinpayments.net) - Multi-crypto payment processor
- **Crypto.com Pay** - Another option for crypto payments

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Bot

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

## Bot Commands

- `/start` - Start the bot and see welcome message with product menu
- `/menu` - View the product menu anytime
- `/help` - Get help and information

## Customization

### Adding More Products

Add new products to the `products` array in `bot.js`:

```javascript
{
  id: 'product_4',
  name: 'New Product',
  price: '0.05',
  description: 'Description here',
  paymentLink: 'https://your-payment-link.com'
}
```

### Changing Welcome Message

Edit the `welcomeMessage` variable in `bot.js` to customize your welcome message.

### Adding More Payment Networks

The bot supports any crypto payment link. Simply add your payment URL to the `paymentLink` field.

## Supported Cryptocurrencies

Depending on your payment processor, you can accept:
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (TRC20, ERC20)
- And many more...

## Testing

1. Open Telegram and search for your bot username
2. Send `/start` to see the welcome message
3. Click on product buttons to see payment links
4. Test the navigation buttons

## Troubleshooting

- **Bot not responding**: Make sure the bot token is correct in `.env`
- **Payment links not working**: Verify your payment links are correct
- **Commands not working**: Make sure to restart the bot after making changes

## Project Structure

```
telegram-crypto-bot/
├── bot.js          # Main bot file
├── .env            # Environment variables (token)
├── package.json    # Dependencies
└── README.md       # This file
```

## License

ISC
