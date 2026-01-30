const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

// Setup command embed
function createSetupEmbed(interfaceType = 'standard') {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('👾 Noop Setup')
    .setDescription('ยินดีต้อนรับสู่ Noop! ระบบอันทรงพลังนี้ช่วยให้ผู้ใช้สามารถสร้างและจัดการช่องเสียงชั่วคราวของตนเองได้.')
    .addFields(
      { 
        name: '🔧 การตั้งค่าเสร็จสมบูรณ์', 
        value: 'ระบบ Noop ได้รับการตั้งค่าในเซิร์ฟเวอร์นี้เรียบร้อยแล้ว.', 
        inline: false 
      },
      { 
        name: '📋 คำแนะนำ', 
        value: 
          '1. เข้าร่วมช่องทางการสร้างสรรค์ที่กำหนดไว้\n' +
          '2. จะมีการสร้างช่องเสียงส่วนตัวสำหรับคุณ\n' +
          '3. ใช้แผงควบคุมเพื่อปรับแต่งช่องของคุณ\n' +
          '4. ช่องนี้จะถูกลบเมื่อทุกคนออกจากช่องไปแล้ว',
        inline: false 
      },
      {
        name: '✨ คุณสมบัติ',
        value:
          '• เปลี่ยนชื่อช่องของคุณ\n' +
          '• กำหนดขีดจำกัดผู้ใช้\n' +
          '• ควบคุมการตั้งค่าความเป็นส่วนตัว\n' +
          '• จัดการสิทธิ์การใช้งานของผู้ใช้\n' +
          '• สร้างกระทู้สนทนา\n' +
          '• และอื่นๆ อีกมากมาย!',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Noop • Setup Complete', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });

  if (interfaceType === 'Advanced') {
    embed.addFields({
      name: '⚙️ โหมดขั้นสูง',
      value: 'เซิร์ฟเวอร์นี้ใช้ส่วนต่อประสานขั้นสูงที่มีคุณสมบัติเพิ่มเติมและตัวเลือกการปรับแต่ง.',
      inline: false
    });
  }

  return embed;
}

// Setup buttons
function createSetupButtons() {
  const setupButton = new ButtonBuilder()
    .setCustomId('setup_Noop')
    .setLabel('Standard Setup')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🎮');

  const setupAdvancedButton = new ButtonBuilder()
    .setCustomId('setup_Noop_original')
    .setLabel('Advanced Setup')
    .setStyle(ButtonStyle.Success)
    .setEmoji('⚙️');

  return new ActionRowBuilder().addComponents(setupButton, setupAdvancedButton);
}

// Interface embed
function createInterfaceEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('👾 Noop Control Panel')
    .setDescription('ยินดีต้อนรับสู่แผงควบคุมช่องเสียงของคุณ! ใช้ปุ่มด้านล่างเพื่อปรับแต่งประสบการณ์การใช้งานช่องเสียงชั่วคราวของคุณ.')
    .setTimestamp()
    .setFooter({ text: 'คลิกปุ่มด้านล่างเพื่อจัดการช่องสัญญาณเสียงของคุณ', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });
}

// Interface buttons
function createInterfaceButtons() {
  // Row 1 - Channel Management
  const nameButton = new ButtonBuilder()
    .setCustomId('voice_name')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✏️');

  const limitButton = new ButtonBuilder()
    .setCustomId('voice_limit')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('👥');

  const privacyButton = new ButtonBuilder()
    .setCustomId('voice_privacy')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🔐');

  const waitingRoomButton = new ButtonBuilder()
    .setCustomId('voice_waiting')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('⏳');

  const threadButton = new ButtonBuilder()
    .setCustomId('voice_thread')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('💬');

  // Row 2 - User Management
  const trustButton = new ButtonBuilder()
    .setCustomId('voice_trust')
    .setStyle(ButtonStyle.Success)
    .setEmoji('✅');

  const untrustButton = new ButtonBuilder()
    .setCustomId('voice_untrust')
    .setStyle(ButtonStyle.Success)
    .setEmoji('❌');

  const inviteButton = new ButtonBuilder()
    .setCustomId('voice_invite')
    .setStyle(ButtonStyle.Success)
    .setEmoji('📩');

  const kickButton = new ButtonBuilder()
    .setCustomId('voice_kick')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🚪');

  const regionButton = new ButtonBuilder()
    .setCustomId('voice_region')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🌍');

  // Row 3 - Advanced Controls
  const blockButton = new ButtonBuilder()
    .setCustomId('voice_block')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🚫');

  const unblockButton = new ButtonBuilder()
    .setCustomId('voice_unblock')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🔓');

  const claimButton = new ButtonBuilder()
    .setCustomId('voice_claim')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('👑');

  const transferButton = new ButtonBuilder()
    .setCustomId('voice_transfer')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🔄');

  const deleteButton = new ButtonBuilder()
    .setCustomId('voice_delete')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

  const row1 = new ActionRowBuilder().addComponents(nameButton, limitButton, privacyButton, waitingRoomButton, threadButton);
  const row2 = new ActionRowBuilder().addComponents(trustButton, untrustButton, inviteButton, kickButton, regionButton);
  const row3 = new ActionRowBuilder().addComponents(blockButton, unblockButton, claimButton, transferButton, deleteButton);

  return [row1, row2, row3];
}

// Voice channel control embed
function createVoiceControlEmbed(channel, owner) {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🍼 Room Voice Controls')
    .setDescription(`ยินดีต้อนรับสู่แผงควบคุมช่องเสียงของคุณ! แผงควบคุมนี้ช่วยให้คุณจัดการช่องเสียงชั่วคราวของคุณได้ **${channel.name}**.`)
    .addFields(
      { 
        name: '👑 เจ้าของช่อง', 
        value: `<@${owner.id}>`, 
        inline: true 
      },
      { 
        name: '👥 ผู้ใช้งานปัจจุบัน', 
        value: `${channel.members.size} members`, 
        inline: true 
      },
      { 
        name: '🔒 สถานะความเป็นส่วนตัว', 
        value: channel.permissionsFor(channel.guild.roles.everyone).has(PermissionFlagsBits.Connect) ? '🔓 สาธารณะ' : '🔐 ส่วนตัว', 
        inline: true 
      },
      {
        name: '💡 การดำเนินการที่มีให้เลือก',
        value: 'ใช้ปุ่มด้านล่างเพื่อจัดการช่องเสียงของคุณ คุณสามารถเปลี่ยนชื่อ กำหนดจำนวนผู้ใช้ จัดการความเป็นส่วนตัว และอื่นๆ ได้!',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Noop • Channel Controls', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });
}

// Helper function to format time
function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let timeString = '';
  if (days > 0) timeString += `${days}d `;
  if (hours > 0) timeString += `${hours}h `;
  if (minutes > 0) timeString += `${minutes}m `;
  if (remainingSeconds > 0 || timeString === '') timeString += `${remainingSeconds}s`;
  
  return timeString.trim();
}

// Voice channel control buttons
function createVoiceControlButtons(isLocked) {
  // Lock/Unlock button with dynamic label and style
  const lockButton = new ButtonBuilder()
    .setCustomId('voice_lock')
    .setStyle(isLocked ? ButtonStyle.Success : ButtonStyle.Danger)
    .setEmoji(isLocked ? '🔓' : '🔐');

  // Channel management buttons
  const renameButton = new ButtonBuilder()
    .setCustomId('voice_rename')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✏️');

  const limitButton = new ButtonBuilder()
    .setCustomId('voice_limit')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('👥');

  // User management buttons
  const permissionButton = new ButtonBuilder()
    .setCustomId('voice_permission')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🛡️');

  const inviteButton = new ButtonBuilder()
    .setCustomId('voice_invite')
    .setStyle(ButtonStyle.Success)
    .setEmoji('📩');

  // Danger zone
  const deleteButton = new ButtonBuilder()
    .setCustomId('voice_delete')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

  // Create rows with logical grouping
  const row1 = new ActionRowBuilder().addComponents(lockButton, renameButton, limitButton);
  const row2 = new ActionRowBuilder().addComponents(permissionButton, inviteButton, deleteButton);

  return [row1, row2];
}

// Error embed
function createErrorEmbed(title, description, errorDetails = null) {
  const embed = new EmbedBuilder()
    .setColor('#F04747') // Discord red color
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (errorDetails) {
    embed.addFields({ name: 'Error Details', value: `\`\`\`${errorDetails}\`\`\``, inline: false });
  }

  return embed;
}

// Success embed
function createSuccessEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor('#43B581') // Discord green color
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(...fields);
  }

  return embed;
}

// Info embed
function createInfoEmbed(title, description, fields = []) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(...fields);
  }

  return embed;
}

// Warning embed
function createWarningEmbed(title, description) {
  return new EmbedBuilder()
    .setColor('#FAA61A') // Discord yellow/orange color
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Help embed
function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('📚 Noop Help Guide')
    .setDescription('ยินดีต้อนรับสู่ Noop! นี่คือวิธีการใช้งานระบบควบคุมช่องเสียง:')
    .addFields(
      { 
        name: '👾 การควบคุมพื้นฐาน', 
        value: 
          '✏️ **Name** - ปรับแต่งชื่อช่องของคุณ\n' +
          '👥 **Limit** - กำหนดความจุของผู้ใช้ (0 = ไม่จำกัด)\n' +
          '🔐 **Privacy** - สลับการเข้าถึงแบบสาธารณะ/ส่วนตัว\n' +
          '⏳ **Waiting Room** - สร้างพื้นที่รอสำหรับผู้ใช้งาน\n' +
          '💬 **Thread** - สร้างหัวข้อสนทนาข้อความสำหรับช่องสนทนาเสียงของคุณ',
        inline: false 
      },
      { 
        name: '👥 การจัดการผู้ใช้', 
        value: 
          '✅ **Trust** - ให้สิทธิ์การใช้งานพิเศษแก่ผู้ใช้ในช่องของคุณ\n' +
          '❌ **Untrust** - ลบสิทธิ์พิเศษออก\n' +
          '📩 **Invite** - ส่งคำเชิญไปยังผู้ใช้ที่ระบุ\n' +
          '🚪 **Kick** - ลบผู้ใช้ออกจากช่องของคุณ\n' +
          '🚫 **Block** - ป้องกันไม่ให้ผู้ใช้บางรายเข้าร่วม\n' +
          '🔓 **Unblock** - ลบการบล็อกผู้ใช้',
        inline: false 
      },
      { 
        name: '⚙️ การตั้งค่าขั้นสูง', 
        value: 
          '🌍 **Region** - เปลี่ยนภูมิภาคเสียงเพื่อการเชื่อมต่อที่ดีขึ้น\n' +
          '👑 **Claim** - รับช่วงดูแลช่องทางที่ไม่ได้ใช้งาน\n' +
          '🔄 **Transfer** - มอบสิทธิ์การเป็นเจ้าของให้กับผู้ใช้รายอื่น\n' +
          '🗑️ **Delete** - ลบช่องของคุณออกไปโดยสมบูรณ์',
        inline: false 
      },
      {
        name: '💡 เคล็ดลับ',
        value: 
          '• คุณสามารถจัดการได้เฉพาะช่องที่คุณเป็นเจ้าของเท่านั้น\n' +
          '• ผู้ใช้ที่ได้รับอนุญาตสามารถเชิญผู้อื่นได้ แต่ไม่สามารถเปลี่ยนแปลงการตั้งค่าได้\n' +
          '• ช่องต่างๆ จะถูกลบโดยอัตโนมัติเมื่อว่างเปล่า\n' +
          '• ใช้เมนูแบบดรอปดาวน์เพื่อเลือกผู้ใช้สำหรับการดำเนินการต่างๆ เช่น การอนุญาต/การบล็อก',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Noop • Help Guide', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });
}

// Command help embed
function createCommandHelpEmbed(commandName, description, usage, examples = []) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle(`📚 Command: ${commandName}`)
    .setDescription(description)
    .addFields(
      { name: '📝 Usage', value: `\`\`\`${usage}\`\`\``, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'Noop • Command Help', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });

  if (examples.length > 0) {
    embed.addFields({ 
      name: '💡 Examples', 
      value: examples.map(ex => `\`${ex}\``).join('\n'), 
      inline: false 
    });
  }

  return embed;
}

// Region selection embed
function createRegionSelectionEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord blurple color
    .setTitle('🌍 การเลือกภูมิภาคเสียง')
    .setDescription('เลือกภูมิภาคเสียงเพื่อเพิ่มประสิทธิภาพคุณภาพการเชื่อมต่อของคุณ เลือกภูมิภาคที่ใกล้กับคุณหรือสมาชิกของคุณมากที่สุดเพื่อประสบการณ์ที่ดีที่สุด.')
    .addFields(
      { 
        name: '🌎 ทวีปอเมริกา', 
        value: 
          '🇺🇸 **US West** - ภาคตะวันตกของสหรัฐอเมริกา\n' +
          '🇺🇸 **US East** - ภาคตะวันออกของสหรัฐอเมริกา\n' +
          '🇺🇸 **US Central** - ภาคกลางของสหรัฐอเมริกา\n' +
          '🇧🇷 **Brazil** - อเมริกาใต้',
        inline: true 
      },
      { 
        name: '🌍 ยุโรปและแอฟริกา', 
        value: 
          '🇬🇧 **London** - สหราชอาณาจักร\n' +
          '🇪🇺 **Europe** - ยุโรปกลาง\n' +
          '🇷🇺 **Russia** - ยุโรปตะวันออก\n' +
          '🇿🇦 **South Africa** - แอฟริกา',
        inline: true 
      },
      { 
        name: '🌏 เอเชียและโอเชียเนีย', 
        value: 
          '🇯🇵 **Japan** - เอเชียตะวันออก\n' +
          '🇰🇷 **South Korea** - เอเชียตะวันออก\n' +
          '🇮🇳 **India** - เอเชียใต้\n' +
          '🇦🇺 **Sydney** - ออสเตรเลีย/โอเชียเนีย\n' +
          '🇸🇬 **Singapore** - เอเชียตะวันออกเฉียงใต้',
        inline: true 
      },
      {
        name: '💡 เคล็ดลับ',
        value: 'หากคุณประสบปัญหาการเชื่อมต่อ โปรดลองเลือกภูมิภาคที่อยู่ใกล้กับสมาชิกส่วนใหญ่ของคุณ คุณสามารถเปลี่ยนการตั้งค่านี้ได้ตลอดเวลา.',
        inline: false
      }
    )
    .setTimestamp()
    .setFooter({ text: 'เลือกภูมิภาคจากเมนูแบบเลื่อนลงด้านล่าง', iconURL: 'https://i.imgur.com/W6tg6FM.jpeg' });
}

module.exports = {
  createSetupEmbed,
  createSetupButtons,
  createInterfaceEmbed,
  createInterfaceButtons,
  createVoiceControlEmbed,
  createVoiceControlButtons,
  createErrorEmbed,
  createSuccessEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createHelpEmbed,
  createCommandHelpEmbed,
  createRegionSelectionEmbed
};