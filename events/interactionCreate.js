const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Slash commands ─────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        const msg = { content: '❌ Une erreur est survenue.', flags: 64 };
        interaction.replied ? interaction.followUp(msg) : interaction.reply(msg);
      }
    }

    // ── Boutons ────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const [action, param] = interaction.customId.split(':');

      // Captcha : ouvrir la modal de saisie
      if (action === 'captcha_reply') {
        const modal = new ModalBuilder()
          .setCustomId(`captcha_submit:${param}`)
          .setTitle('🔐 Vérification Vae Victis');

        const input = new TextInputBuilder()
          .setCustomId('captcha_code')
          .setLabel('Entre le code affiché sur l\'image')
          .setStyle(TextInputStyle.Short)
          .setMinLength(5)
          .setMaxLength(6)
          .setPlaceholder('Ex: A3KZP')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      // Tickets
      if (action === 'ticket_open')  return require('../utils/tickets').openTicket(interaction, client);
      if (action === 'ticket_close') return require('../utils/tickets').closeTicket(interaction, client);
    }

    // ── Modals ─────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const [action, targetId] = interaction.customId.split(':');

      if (action === 'captcha_submit') {
        await interaction.deferReply({ flags: 64 });

        const { captchaCodes } = require('./guildMemberAdd');
        const entry = captchaCodes.get(targetId);

        // Vérifier que c'est bien le bon membre qui répond
        if (interaction.user.id !== targetId) {
          return interaction.editReply({ content: '❌ Ce captcha ne te concerne pas.' });
        }

        if (!entry) {
          return interaction.editReply({ content: '❌ Captcha expiré ou introuvable. Un admin peut te vérifier manuellement.' });
        }

        const userInput = interaction.fields.getTextInputValue('captcha_code').toUpperCase().trim();
        entry.attempts++;

        // Bonne réponse
        if (userInput === entry.code) {
          captchaCodes.delete(targetId);

          const { roles, channels } = require('../config/config');
          const member = await interaction.guild.members.fetch(targetId).catch(() => null);
          if (!member) return interaction.editReply({ content: '❌ Membre introuvable.' });

          const roleMembre = interaction.guild.roles.cache.get(roles.membre);
          const roleNV     = interaction.guild.roles.cache.get(roles.nonVerifie);
          if (roleMembre) await member.roles.add(roleMembre);
          if (roleNV)     await member.roles.remove(roleNV);

          // Supprimer le message captcha
          await interaction.message?.delete().catch(() => {});

          await interaction.editReply({ content: '✅ Vérifié ! Bienvenue sur Vae Victis ⚔️' });

          // Log
          const logChannel = interaction.guild.channels.cache.get(channels.logs);
          if (logChannel) logChannel.send(`✅ **${member.user.tag}** s'est vérifié via captcha.`);

        // Mauvaise réponse
        } else if (entry.attempts >= 3) {
          captchaCodes.delete(targetId);
          await interaction.editReply({ content: '❌ 3 tentatives échouées. Contacte un modérateur.' });
        } else {
          await interaction.editReply({
            content: `❌ Code incorrect. Il te reste **${3 - entry.attempts}** essai(s).`,
          });
        }
      }
    }
  },
};
