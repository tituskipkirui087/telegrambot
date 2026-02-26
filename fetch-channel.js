/**
 * Telegram Channel Fetcher
 * Fetches posts and images from a Telegram channel using MTProto API
 * 
 * Usage:
 * 1. Set your API_ID and API_HASH in .env file (already configured)
 * 2. Optionally set SESSION_STRING for persistent login
 * 3. Run: node fetch-channel.js
 * 
 * First run will prompt for phone number for authentication
 */

require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const CHANNEL_USERNAME = 'letsgetrichlink'; // Channel to fetch
const SESSION_STRING = process.env.SESSION_STRING || '';

async function main() {
    if (!API_ID || !API_HASH) {
        console.error('❌ Please set API_ID and API_HASH in .env file');
        console.error('   Get them from https://my.telegram.org/apps');
        process.exit(1);
    }

    console.log('🔗 Connecting to Telegram...');
    
    const session = new StringSession(SESSION_STRING);
    const client = new TelegramClient(session, API_ID, API_HASH, {
        connectionRetries: 5,
    });

    try {
        // Start the client - will prompt for phone if no session
        await client.start({
            phoneNumber: async () => {
                console.log('📱 Please enter your phone number: ');
                return await readLine();
            },
            password: async () => {
                console.log('🔐 Please enter your password: ');
                return await readLine();
            },
            phoneCode: async () => {
                console.log('📝 Please enter the Telegram code: ');
                return await readLine();
            },
            onError: (err) => {
                console.error('❌ Error:', err);
            }
        });

        console.log('✅ Successfully connected to Telegram!');

        // Save session string for future use
        const newSessionString = client.session.save();
        console.log('💾 Session string (save this in SESSION_STRING env for next time):');
        console.log(newSessionString);

        // Resolve the channel
        console.log(`\n📡 Fetching channel @${CHANNEL_USERNAME}...`);
        
        let channel;
        try {
            channel = await client.getEntity(CHANNEL_USERNAME);
        } catch (e) {
            // Try with @ prefix
            channel = await client.getEntity('@' + CHANNEL_USERNAME);
        }

        console.log('✅ Channel found:', channel.title);

        // Fetch messages
        console.log('📥 Fetching messages...');
        const messages = await client.getMessages(channel, {
            limit: 50, // Number of messages to fetch
        });

        console.log(`\n📊 Found ${messages.length} messages\n`);
        console.log('='.repeat(60));

        const postsData = [];

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            
            // Skip service messages
            if (msg.action) continue;

            const postInfo = {
                id: msg.id,
                date: msg.date.toISOString(),
                text: '',
                images: [],
                hasMedia: false
            };

            // Get text content
            if (msg.message) {
                postInfo.text = msg.message;
            }

            // Check for media
            if (msg.media) {
                postInfo.hasMedia = true;
                
                // Handle different media types
                if (msg.photo) {
                    // Photo - save it
                    const photoPath = await savePhoto(client, msg, channel.id, msg.id);
                    if (photoPath) {
                        postInfo.images.push(photoPath);
                    }
                } else if (msg.document) {
                    // Document (could be image/gif/video)
                    if (msg.document.mimeType && msg.document.mimeType.startsWith('image/')) {
                        const docPath = await saveDocument(client, msg, channel.id, msg.id);
                        if (docPath) {
                            postInfo.images.push(docPath);
                        }
                    }
                }
            }

            postsData.push(postInfo);

            // Display message preview
            console.log(`\n📝 Post #${msg.id}`);
            console.log(`   Date: ${postInfo.date}`);
            console.log(`   Media: ${postInfo.hasMedia ? 'Yes' : 'No'}`);
            if (postInfo.images.length > 0) {
                console.log(`   Images saved: ${postInfo.images.join(', ')}`);
            }
            
            const textPreview = postInfo.text.substring(0, 100);
            console.log(`   Text: ${textPreview}${postInfo.text.length > 100 ? '...' : ''}`);
            console.log('-'.repeat(40));
        }

        // Save all posts data to JSON
        const outputPath = path.join(__dirname, 'channel-posts.json');
        fs.writeFileSync(outputPath, JSON.stringify(postsData, null, 2));
        console.log(`\n💾 All posts data saved to: ${outputPath}`);

        console.log('\n✅ Done! Disconnecting...');
        await client.disconnect();

    } catch (error) {
        console.error('❌ Error:', error);
        await client.disconnect();
        process.exit(1);
    }
}

// Helper function to save photos
async function savePhoto(client, message, chatId, messageId) {
    try {
        const photo = message.photo;
        // Get the largest photo
        const largestPhoto = photo[photo.length - 1];
        
        const fileName = `photo_${chatId}_${messageId}.jpg`;
        const filePath = path.join(__dirname, 'media', fileName);
        
        // Ensure media directory exists
        const mediaDir = path.join(__dirname, 'media');
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }

        // Download the photo
        const buffer = await client.downloadMedia(largestPhoto);
        fs.writeFileSync(filePath, buffer);
        
        console.log(`   📷 Saved photo: ${fileName}`);
        return fileName;
    } catch (error) {
        console.error('   ❌ Error saving photo:', error.message);
        return null;
    }
}

// Helper function to save documents (images in documents)
async function saveDocument(client, message, chatId, messageId) {
    try {
        const doc = message.document;
        const fileName = doc.attributes[0]?.fileName || `doc_${chatId}_${messageId}`;
        const filePath = path.join(__dirname, 'media', fileName);
        
        // Ensure media directory exists
        const mediaDir = path.join(__dirname, 'media');
        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }

        // Download the document
        const buffer = await client.downloadMedia(doc);
        fs.writeFileSync(filePath, buffer);
        
        console.log(`   📎 Saved document: ${fileName}`);
        return fileName;
    } catch (error) {
        console.error('   ❌ Error saving document:', error.message);
        return null;
    }
}

// Simple readline wrapper for Node.js
function readLine() {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question('', (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

main();
