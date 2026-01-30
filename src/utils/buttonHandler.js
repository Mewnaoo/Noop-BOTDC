const { PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TempVoiceSettings = require('../models/TempVoiceSettings');
const TempVoiceChannel = require('../models/TempVoiceChannel');
const { 
  createInterfaceEmbed, 
  createInterfaceButtons, 
  createVoiceControlEmbed, 
  createVoiceControlButtons,
  createErrorEmbed,
  createSuccessEmbed,
  createInfoEmbed,
  createWarningEmbed
} = require('./embeds');
const { verifySetup, cleanupInvalidSetup } = require('./setupHandler');
const { getInterfaceImage } = require('./imageHandler');
const { createUserSelectionModal } = require('./permissionHandler');
const { claimOwnership } = require('./permissionHandler');

async function handleButtonInteraction(interaction) {
  const { customId, guild, member } = interaction;

  try {
    switch (customId) {
      // Admin setup buttons
      case 'setup_tempvoice':
      case 'setup_tempvoice_original':
        await handleSetupTempVoice(interaction);
        break;
      case 'new_creator':
        await handleNewCreator(interaction);
        break;
      case 'new_interface':
        await handleNewInterface(interaction);
        break;
      
      // Voice channel management buttons
      case 'voice_name':
      case 'voice_rename':
        await handleVoiceRename(interaction);
        break;
      case 'voice_limit':
        await handleVoiceLimit(interaction);
        break;
      case 'voice_privacy':
      case 'voice_lock':
        await handleVoiceLock(interaction);
        break;
      case 'voice_waiting':
        await handleVoiceWaiting(interaction);
        break;
      case 'voice_thread':
        await handleVoiceThread(interaction);
        break;
      case 'voice_trust':
        await handleVoiceTrust(interaction);
        break;
      case 'voice_untrust':
        await handleVoiceUntrust(interaction);
        break;
      case 'voice_invite':
        await handleVoiceInvite(interaction);
        break;
      case 'voice_kick':
        await handleVoiceKick(interaction);
        break;
      case 'voice_region':
        await handleVoiceRegion(interaction);
        break;
      case 'voice_block':
        await handleVoiceBlock(interaction);
        break;
      case 'voice_unblock':
        await handleVoiceUnblock(interaction);
        break;
      case 'voice_claim':
        await handleVoiceClaim(interaction);
        break;
      case 'voice_transfer':
        await handleVoiceTransfer(interaction);
        break;
      case 'voice_permission':
        await handleVoicePermission(interaction);
        break;
      case 'voice_delete':
        await handleVoiceDelete(interaction);
        break;
      default:
        await interaction.reply({
          embeds: [createErrorEmbed(
            'ปุ่มที่ไม่รู้จัก', 
            `ปุ่มที่มีรหัสประจำตัว "${customId}" ไม่ได้รับการยอมรับหรือนำไปใช้.`
          )],
          ephemeral: true
        });
    }
  } catch (error) {
    console.error(`การจัดการข้อผิดพลาด การโต้ตอบปุ่มn: ${customId}`, error);
    
    try {
      // Check if the interaction has already been replied to
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'ข้อผิดพลาดของปุ่ม', 
            'เกิดข้อผิดพลาดขณะประมวลผลการโต้ตอบนี้!',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'ข้อผิดพลาดของปุ่ม', 
            'เกิดข้อผิดพลาดขณะประมวลผลการโต้ตอบนี้!',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error(`ไม่สามารถส่งการตอบกลับข้อผิดพลาดสำหรับปุ่มได้ ${customId}:`, replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Setup TempVoice
async function handleSetupTempVoice(interaction) {
  const { guild, member } = interaction;
  const interfaceType = interaction.customId === 'setup_tempvoice_original' ? 'original' : 'standard';

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'ไม่ได้รับอนุญาต', 
        'คุณต้องมีสิทธิ์ผู้ดูแลระบบในการติดตั้ง Noop.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
    if (setupStatus.valid) {
      return interaction.editReply({
        embeds: [createInfoEmbed(
          'ตั้งค่าเรียบร้อยแล้ว', 
          'Noop ได้ถูกตั้งค่าไว้ในเซิร์ฟเวอร์นี้เรียบร้อยแล้ว.',
          [
            { 
              name: 'การตั้งค่าปัจจุบัน', 
              value: `หมวดหมู่: <#${setupStatus.settings.categoryId}>\nช่องครีเอเตอร์: <#${setupStatus.settings.creatorChannelId}>\nช่องอินเทอร์เฟซ: <#${setupStatus.settings.interfaceChannelId}>`, 
              inline: false 
            }
          ]
        )],
        ephemeral: true
      });
    } else {
      // If setup is invalid, clean it up
      if (setupStatus.reason !== 'ไม่พบการตั้งค่าใดๆ') {
        await cleanupInvalidSetup(guild);
        await interaction.editReply({
          embeds: [createWarningEmbed(
            'การตั้งค่าที่ไม่ถูกต้องถูกล้างออกแล้ว', 
            `การตั้งค่าก่อนหน้านี้ไม่ถูกต้อง (${setupStatus.reason}). ระบบได้ทำการล้างข้อมูลเรียบร้อยแล้ว โปรดเรียกใช้คำสั่งอีกครั้งเพื่อตั้งค่า Noop.`
          )],
          ephemeral: true
        });
        return;
      }
    }

    // Create TempVoice category
    const category = await guild.channels.create({
      name: 'NoopVoice',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Create Creator Channel
    const creatorChannel = await guild.channels.create({
      name: '``﹒✸﹐กดเพื่อสรางห้อง﹒🐬﹐``',
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect],
          deny: [PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Create Interface Channel
    const interfaceChannel = await guild.channels.create({
      name: '``﹒✸﹐ตั้งค่าห้อง﹒🌷﹐',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ]
    });

    // Get interface image
    const interfaceImage = getInterfaceImage();
    
    // Send interface message
    const interfaceEmbed = createInterfaceEmbed();
    const interfaceButtons = createInterfaceButtons();
    
    let interfaceMessage;
    if (interfaceImage) {
      // Set the image to the bottom of the embed
      interfaceEmbed.setImage('attachment://' + interfaceImage.name);
      
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons,
        files: [interfaceImage]
      });
    } else {
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons
      });
    }

    // Save settings to database
    const settings = new TempVoiceSettings({
      guildId: guild.id,
      categoryId: category.id,
      creatorChannelId: creatorChannel.id,
      interfaceChannelId: interfaceChannel.id,
      interfaceMessageId: interfaceMessage.id,
      interfaceType: interfaceType
    });

    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'การตั้งค่าเสร็จสมบูรณ์', 
        'Noop ได้รับการตั้งค่าเรียบร้อยแล้ว!',
        [
          { 
            name: 'รายละเอียดการตั้งค่า', 
            value: `หมวดหมู่: ${category.name}\nช่องครีเอเตอร์: ${creatorChannel.name}\nช่องอินเทอร์เฟซ: ${interfaceChannel.name}\nประเภทอินเทอร์เฟซ: ${interfaceType === 'original' ? 'Original' : 'Standard'}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตั้งค่า Noop:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'การตั้งค่าล้มเหลว', 
        'เกิดข้อผิดพลาดขณะตั้งค่า Noop โปรดลองใหม่อีกครั้งในภายหลัง.',
      )],
      ephemeral: true
    });
  }
}

// Create a new creator channel
async function handleNewCreator(interaction) {
  const { guild, member } = interaction;

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'ไม่ได้รับอนุญาต', 
        'คุณต้องมีสิทธิ์ผู้ดูแลระบบจึงจะสามารถสร้างช่องครีเอเตอร์ใหม่ได้.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
    if (!setupStatus.valid) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ต้องตั้งค่าก่อน', 
          'Noop ยังไม่ได้ติดตั้งในเซิร์ฟเวอร์นี้ โปรดเรียกใช้คำสั่ง `/setup` ก่อน.'
        )],
        ephemeral: true
      });
    }

    const { settings } = setupStatus;
    const category = guild.channels.cache.get(settings.categoryId);

    if (!category) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบหมวดหมู่', 
          'ไม่พบหมวดหมู่ Noop โปรดเรียกใช้คำสั่ง `/setup` อีกครั้ง.'
        )],
        ephemeral: true
      });
    }

    // Create Creator Channel
    const creatorChannel = await guild.channels.create({
      name: '``﹒✸﹐สร้างห้องอัตโนมัติ﹒🐬﹐``',
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect],
          deny: [PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        }
      ]
    });

    // Update settings
    settings.creatorChannelId = creatorChannel.id;
    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'เพิ่มช่องครีเอเตอร์แล้ว', 
        'มีการเพิ่มช่องครีเอเตอร์ใหม่ในหมวดหมู่ Noop แล้ว.',
        [
          { 
            name: 'รายละเอียดช่อง', 
            value: `ชื่อ: ${creatorChannel.name}\nหมวดหมู่: ${category.name}`, 
            inline: false
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างช่องครีเอเตอร์ใหม่:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'การสร้างล้มเหลว', 
        'เกิดข้อผิดพลาดขณะสร้างช่องครีเอเตอร์ใหม่ โปรดลองใหม่อีกครั้งในภายหลัง.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Create a new interface message
async function handleNewInterface(interaction) {
  const { guild, member } = interaction;

  // Check if user has administrator permissions
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [createErrorEmbed(
        'ไม่ได้รับอนุญาต', 
        'คุณต้องมีสิทธิ์ผู้ดูแลระบบจึงจะสามารถสร้างข้อความอินเทอร์เฟซใหม่ได้.'
      )],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Verify if setup is still valid
    const setupStatus = await verifySetup(guild);
    
    if (!setupStatus.valid) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'Setup Required', 
          'TempVoice is not set up in this server. Please run the `/setup` command first.'
        )],
        ephemeral: true
      });
    }

    const { settings } = setupStatus;
    const interfaceChannel = guild.channels.cache.get(settings.interfaceChannelId);

    if (!interfaceChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ต้องตั้งค่าก่อน', 
          'Noop ยังไม่ได้ติดตั้งในเซิร์ฟเวอร์นี้ โปรดเรียกใช้คำสั่ง `/setup`.'
        )],
        ephemeral: true
      });
    }

    // Get interface image
    const interfaceImage = getInterfaceImage();
    
    // Send new interface message
    const interfaceEmbed = createInterfaceEmbed();
    const interfaceButtons = createInterfaceButtons();
    
    let interfaceMessage;
    if (interfaceImage) {
      // Set the image to the bottom of the embed
      interfaceEmbed.setImage('attachment://' + interfaceImage.name);
      
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons,
        files: [interfaceImage]
      });
    } else {
      interfaceMessage = await interfaceChannel.send({
        embeds: [interfaceEmbed],
        components: interfaceButtons
      });
    }

    // Update settings
    settings.interfaceMessageId = interfaceMessage.id;
    await settings.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'สร้างอินเทอร์เฟซ', 
        'มีการสร้างข้อความอินเทอร์เฟซใหม่แล้ว.',
        [
          { 
            name: 'รายละเอียดช่อง', 
            value: `ช่องอินเทอร์เฟซ: ${interfaceChannel.name}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('ข้อความแสดงข้อผิดพลาดในการสร้างอินเทอร์เฟซใหม่:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'การสร้างล้มเหลว', 
        'เกิดข้อผิดพลาดขณะสร้างข้อความอินเทอร์เฟซใหม่ โปรดลองใหม่อีกครั้งในภายหลัง.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Lock/Unlock voice channel
async function handleVoiceLock(interaction) {
  const { guild, member } = interaction;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่องสัญญาณ', 
          'คุณไม่มีช่องสัญญาณเสียงชั่วคราวที่ใช้งานอยู่.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่อง', 
          'ช่องเสียงชั่วคราวของคุณไม่มีอยู่อีกต่อไปแล้ว.'
        )],
        ephemeral: true
      });
    }

    // Check if channel is locked
    const isLocked = !channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.Connect);

    // Toggle lock status
    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      Connect: isLocked
    });

    // Update database
    tempChannel.settings.isLocked = !isLocked;
    await tempChannel.save();

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        isLocked ? 'ช่องถูกปลดล็อกแล้ว' : 'ช่องถูกล็อก', 
        `ช่องเสียงของคุณได้รับการเปิดใช้งานแล้ว ${isLocked ? 'unlocked' : 'locked'}.`,
        [
          { 
            name: 'รายละเอียดช่อง', 
            value: `ชื่อ: ${channel.name}\nสถานะ: ${isLocked ? '🔓 สาธารณะ' : '🔒 ส่วนตัว'}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการล็อก/ปลดล็อกช่องสัญญาณเสียง:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'การดำเนินการล้มเหลว', 
        'เกิดข้อผิดพลาดขณะล็อก/ปลดล็อกช่องเสียงของคุณ โปรดลองใหม่อีกครั้งในภายหลัง.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Rename voice channel
async function handleVoiceRename(interaction) {
  const { guild, member } = interaction;

  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่องสัญญาณ', 
          'คุณไม่มีช่องสัญญาณเสียงชั่วคราวที่ใช้งานอยู่.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่อง', 
          'ช่องเสียงชั่วคราวของคุณไม่มีอยู่อีกต่อไปแล้ว.'
        )],
        ephemeral: true
      });
    }

    // Create modal
    const modal = new ModalBuilder()
      .setCustomId('rename_channel_modal')
      .setTitle('Rename Voice Channel');

    // Add components to modal
    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel('ชื่อช่องใหม่')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ตั้งชื่อใหม่ให้กับช่องของคุณ')
      .setMaxLength(100)
      .setRequired(true)
      .setValue(channel.name);

    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
    modal.addComponents(firstActionRow);

    // Show the modal
    await interaction.showModal(modal);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแสดงโมดอลการเปลี่ยนชื่อ:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การเปลี่ยนชื่อล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเปลี่ยนชื่อช่องเสียงของคุณ โปรดลองใหม่อีกครั้งในภายหลัง<.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การเปลี่ยนชื่อล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเปลี่ยนชื่อช่องเสียงของคุณ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับการโต้ตอบการเปลี่ยนชื่อ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Set user limit for voice channel
async function handleVoiceLimit(interaction) {
  const { guild, member } = interaction;

  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่องสัญญาณ', 
          'คุณไม่มีช่องสัญญาณเสียงชั่วคราวที่ใช้งานอยู่.'
        )],
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่อง', 
          'ช่องเสียงชั่วคราวของคุณไม่มีอยู่อีกต่อไปแล้ว.'
        )],
        ephemeral: true
      });
    }

    // Create modal
    const modal = new ModalBuilder()
      .setTitle('กำหนดขีดจำกัดผู้ใช้');

    // Add components to modal
    const limitInput = new TextInputBuilder()
      .setCustomId('user_limit')
      .setLabel('ขีดจำกัดผู้ใช้ (0 = ไม่จำกัด)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ป้อนตัวเลขระหว่าง 0 ถึง 99')
      .setMaxLength(2)
      .setRequired(true)
      .setValue(channel.userLimit.toString());

    const firstActionRow = new ActionRowBuilder().addComponents(limitInput);
    modal.addComponents(firstActionRow);

    // Show the modal
    await interaction.showModal(modal);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการแสดงโมดอลจำกัดผู้ใช้:', error);
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'Limit Setting Failed', 
            'เกิดข้อผิดพลาดขณะพยายามตั้งค่าขีดจำกัดผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การตั้งค่าขีดจำกัดล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามตั้งค่าขีดจำกัดผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับเพื่อจำกัดการโต้ตอบ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Create a waiting room for the voice channel
async function handleVoiceWaiting(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'ฟีเจอร์ใหม่กำลังจะมาเร็วๆ นี้', 
      'ฟังก์ชันห้องรอรับสายยังไม่ได้ถูกนำมาใช้ในเวอร์ชันนี้.',
      [
        { 
          name: 'ทางเลือก', 
          value: 'คุณสามารถใช้ปุ่มความเป็นส่วนตัวเพื่อควบคุมว่าใครสามารถเข้าร่วมช่องของคุณได้.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Create a thread for the voice channel
async function handleVoiceThread(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'ฟีเจอร์ใหม่กำลังจะมาเร็วๆ นี้', 
      'ฟังก์ชันการสร้างเธรดไม่ได้ถูกนำมาใช้ในเวอร์ชันนี้.',
      [
        { 
          name: 'ทางเลือก', 
          value: 'คุณสามารถสร้างช่องข้อความในเซิร์ฟเวอร์ของคุณสำหรับการสนทนาผ่านช่องเสียงได้.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Trust a user in the voice channel
async function handleVoiceTrust(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'trust');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่คุณต้องการไว้วางใจ:',
        components: result.components,
        ephemeral: true
      });
    } else {
      // Just show the error message without manual input option
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การดำเนินการด้านความไว้วางใจล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาด การดำเนินการที่เชื่อถือได้ของผู้ใช้:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การดำเนินการด้านความไว้วางใจล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเชื่อถือผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การดำเนินการด้านความไว้วางใจล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเชื่อถือผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับปฏิสัมพันธ์ด้านความไว้วางใจ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Invite a user to the voice channel
async function handleVoiceInvite(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'invite');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่จะเชิญ:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การดำเนินการเชิญล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาด เชิญให้ผู้ใช้ดำเนินการ:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การดำเนินการเชิญล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเชิญผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การดำเนินการเชิญล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเชิญผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบรับคำเชิญโต้ตอบ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Kick a user from the voice channel
async function handleVoiceKick(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'kick');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่จะเตะออก:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การเตะล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาด การเตะผู้ใช้:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การเตะล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเตะผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การเตะล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามเตะผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับการโต้ตอบการเตะ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Change the region of the voice channel
async function handleVoiceRegion(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'ฟีเจอร์ใหม่กำลังจะมาเร็วๆ นี้', 
      'ฟังก์ชันการเปลี่ยนภูมิภาคยังไม่ได้ถูกนำมาใช้ในเวอร์ชันนี้.',
      [
        { 
          name: 'โน๊ต', 
          value: 'ขณะนี้ Discord จะปรับภูมิภาคเสียงให้เหมาะสมกับผู้ใช้ทุกคนในช่องโดยอัตโนมัติ.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Block a user from the voice channel
async function handleVoiceBlock(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'block');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่จะบล็อก:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การดำเนินการบล็อกล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาดบล็อกการกระทำของผู้ใช้:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การดำเนินการบล็อกล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามบล็อกผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การดำเนินการบล็อกล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามบล็อกผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับการโต้ตอบบล็อก:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Unblock a user from the voice channel
async function handleVoiceUnblock(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'unblock');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้เพื่อปลดบล็อก:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การดำเนินการปลดบล็อกล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาดเพื่อปลดบล็อกการกระทำของผู้ใช้:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การดำเนินการปลดบล็อกล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามปลดบล็อกผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การดำเนินการปลดบล็อกล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามปลดบล็อกผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับเพื่อปลดบล็อก:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Claim ownership of an abandoned voice channel
async function handleVoiceClaim(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    const result = await claimOwnership(interaction);
    
    if (result.success) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          'ช่องดังกล่าวได้รับการอ้างสิทธิ์แล้ว', 
          result.message,
          [
            { 
              name: 'รายละเอียดช่อง', 
              value: `ชื่อ: ${result.channel?.name || 'ไม่ทราบ'}`, 
              inline: false 
            }
          ]
        )],
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การเรียกร้องไม่สำเร็จ', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอ้างสิทธิ์ความเป็นเจ้าของ:', error);
    if (interaction.deferred) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การเรียกร้องไม่สำเร็จ', 
          'เกิดข้อผิดพลาดขณะยืนยันความเป็นเจ้าของ โปรดลองใหม่อีกครั้งในภายหลัง.',
          error.message
        )],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [createErrorEmbed(
          'การเรียกร้องไม่สำเร็จ', 
          'เกิดข้อผิดพลาดขณะยืนยันความเป็นเจ้าของ โปรดลองใหม่อีกครั้งในภายหลัง.',
          error.message
        )],
        ephemeral: true
      });
    }
  }
}

// Transfer ownership of the voice channel
async function handleVoiceTransfer(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'transfer');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่จะโอนกรรมสิทธิ์ให้:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การโอนย้ายล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาด การโอนกรรมสิทธิ์:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การโอนย้ายล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามโอนกรรมสิทธิ์ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การโอนย้ายล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามโอนกรรมสิทธิ์ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับการโอนเงิน:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

// Manage voice channel permissions
async function handleVoicePermission(interaction) {
  await interaction.reply({
    embeds: [createInfoEmbed(
      'ฟีเจอร์ใหม่กำลังจะมาเร็วๆ นี้', 
      'ในเวอร์ชันนี้ ระบบจัดการสิทธิ์การใช้งานช่องสัญญาณเสียงยังไม่ได้ถูกนำมาใช้.',
      [
        { 
          name: 'ทางเลือกอื่นๆ', 
          value: 'คุณสามารถใช้ปุ่ม เชื่อถือ ไม่เชื่อถือ บล็อก และ ปลดบล็อก เพื่อจัดการสิทธิ์ของผู้ใช้.', 
          inline: false 
        }
      ]
    )],
    ephemeral: true
  });
}

// Delete voice channel
async function handleVoiceDelete(interaction) {
  const { guild, member } = interaction;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Find user's temporary voice channel
    const tempChannel = await TempVoiceChannel.findOne({ 
      guildId: guild.id,
      ownerId: member.id
    });

    if (!tempChannel) {
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่องสัญญาณ', 
          'คุณไม่มีช่องสัญญาณเสียงชั่วคราวที่ใช้งานอยู่.'
        ephemeral: true
      });
    }

    // Get the channel
    const channel = guild.channels.cache.get(tempChannel.channelId);
    if (!channel) {
      await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });
      return interaction.editReply({
        embeds: [createErrorEmbed(
          'ไม่พบช่อง', 
          'ช่องเสียงชั่วคราวของคุณไม่มีอยู่อีกต่อไปแล้ว.'
        )],
        ephemeral: true
      });
    }

    // Store channel name for confirmation message
    const channelName = channel.name;

    // Delete the channel
    await channel.delete('Owner requested deletion');
    await TempVoiceChannel.deleteOne({ channelId: tempChannel.channelId });

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'ช่องถูกลบแล้ว', 
        'ช่องเสียงชั่วคราวของคุณถูกลบแล้ว.',
        [
          { 
            name: 'รายละเอียดช่อง', 
            value: `ชื่อ: ${channelName}`, 
            inline: false 
          }
        ]
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบช่องเสียง:', error);
    await interaction.editReply({
      embeds: [createErrorEmbed(
        'การลบไม่สำเร็จ', 
        'เกิดข้อผิดพลาดขณะลบช่องเสียงของคุณ โปรดลองใหม่อีกครั้งในภายหลัง.',
        error.message
      )],
      ephemeral: true
    });
  }
}

// Untrust a user in the voice channel
async function handleVoiceUntrust(interaction) {
  try {
    // Acknowledge the interaction immediately to prevent timeout
    await interaction.deferReply({ ephemeral: true });
    
    const { createUserSelectionDropdown } = require('./permissionHandler');
    const result = await createUserSelectionDropdown(interaction, 'untrust');
    
    if (result.success) {
      await interaction.editReply({
        content: 'เลือกผู้ใช้ที่ต้องการไม่ไว้วางใจ:',
        components: result.components,
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'การกระทำที่ไม่ไว้วางใจล้มเหลว', 
          result.message
        )],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('การจัดการข้อผิดพลาด การกระทำของผู้ใช้ที่ไม่น่าเชื่อถือ:', error);
    try {
      // Check if the interaction can still be replied to
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [createErrorEmbed(
            'การกระทำที่ไม่ไว้วางใจล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามยกเลิกการเชื่อถือผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed(
            'การกระทำที่ไม่ไว้วางใจล้มเหลว', 
            'เกิดข้อผิดพลาดขณะพยายามยกเลิกการเชื่อถือผู้ใช้ โปรดลองใหม่อีกครั้งในภายหลัง.',
            error.message
          )],
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('เกิดข้อผิดพลาดในการตอบกลับปฏิสัมพันธ์ที่ไม่น่าเชื่อถือ:', replyError);
      // At this point, we can't do anything more with this interaction
    }
  }
}

module.exports = { handleButtonInteraction }; 