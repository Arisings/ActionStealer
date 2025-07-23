/// <reference types="../CTAutocomplete" />

import ActionItem from './Classes/ActionItem.js';
import Utils from './Classes/Utils.js';
import Settings from './config.js'

let actions = {}; // Store actions for chat commands
let encounteredData = [] // Store interact_data to prevent duplicates
register('worldLoad', () => {
  actions = {};
  encounteredData = [];
});

const prefix = '§7[§6ActionStealer§7]§r';

////////////
// LOGGER //
////////////

register("packetReceived", (packet) => {
  if (packet.class.getSimpleName() !== 'S04PacketEntityEquipment') return;
  if (Scoreboard?.getTitle()?.removeFormatting() !== "HOUSING") return;
  if (!Settings.actionStealer) return;
  if (Settings.condition === 1 && !Utils.isCreative()) return;
  if (Settings.condition === 2 && !Utils.onFreeBuild()) return;

  let entityID = packet.func_149389_d();
  let equipmentSlot = packet.func_149388_e();
  let item = packet.func_149390_c();

  let entity = World.getWorld().func_73045_a(entityID);
  if (!entity || !(entity instanceof net.minecraft.entity.player.EntityPlayer)) return;

  let player = new PlayerMP(entity);

  // Actual part
  let actionItem = new ActionItem(item);
  if (!actionItem.item) return
  if (actionItem.version === 0) return; // No action data
  if (Settings.dontRecordOwned && Utils.hasItem(actionItem.getInteractData())) return;
  if (encounteredData.includes(actionItem.getInteractData())) return;

  const viewUUID = Utils.UUID();
  if (actionItem.version === 1) actions[viewUUID] = () => {
    let actionData = actionItem.getActionData();
    ChatLib.chat(`§7Action Item Data: §f${JSON.stringify(actionData, null, 4)}`);
    ChatLib.command(`ct copy ${JSON.stringify(actionData)}`, true);
  }
  const giveUUID = Utils.UUID();
  actions[giveUUID] = () => {
    if (!Utils.isCreative()) return ChatLib.chat("§cYou must be in creative mode to do this!");
    Utils.giveItem(item);
    new Message(`${prefix} §7Added `, new Item(item).getTextComponent(), ` §7to your inventory`).chat();
  }
  const copyUUID = Utils.UUID();
  actions[copyUUID] = () => {
    ChatLib.command(`ct copy ${JSON.stringify(new Item(item).getRawNBT())}`, true);
    ChatLib.chat(`§aCopied NBT to Clipboard!`);
  }

  let alertMessage = new Message(`${prefix} §f${player.getName()} §bis holding Action Item `, new Item(item).getTextComponent(), `\n`);
  alertMessage.addTextComponent(`§aOptions: `)
  if (actionItem.version === 1) alertMessage.addTextComponent(new TextComponent('§9[View Actions]').setClick('run_command', `/asaction ${viewUUID}`).setHoverValue('§eView the item\'s action data and copy it to your clipboard.'))
  if (actionItem.version === 1) alertMessage.addTextComponent(new TextComponent(` `));
  alertMessage.addTextComponent(new TextComponent(`§${actionItem.version === 1 ? 'a' : 9}[Give Item]`).setClick('run_command', `/asaction ${giveUUID}`).setHoverValue('§eLoad the item into your held item slot. (Must be in creative mode)'))
  alertMessage.addTextComponent(new TextComponent(` `));
  alertMessage.addTextComponent(new TextComponent(`§6[Copy NBT]`).setClick('run_command', `/asaction ${copyUUID}`).setHoverValue('§eCopy the item\'s NBT to your clipboard'))
  if (actionItem.version === 1) alertMessage.addTextComponent(new TextComponent(`\n§8Item contains ${actionItem.getActionData().actions.length} action${actionItem.getActionData().actions.length > 1 ? 's' : ''}.`));
  alertMessage.chat();
  encounteredData.push(actionItem.getInteractData());
})

//////////////
// COMMANDS //
//////////////

// Config
register('command', () => {
  Settings.openGUI();
}).setName('actionstealer').setAliases(['as']);

// Debug command to see if the module is logging action items based off configured parameters
register('command', () => {
  if (Scoreboard?.getTitle()?.removeFormatting() !== "HOUSING") return ChatLib.chat("&cNot in Housing");
  if (!Settings.actionStealer) return ChatLib.chat("&cAction Stealer is disabled");
  if (Settings.condition === 1 && !Utils.isCreative()) return ChatLib.chat("&cNot in Creative");
  if (Settings.condition === 2 && !Utils.onFreeBuild()) return ChatLib.chat("&cNot in a FreeBuild");
  ChatLib.chat("§aAction items are being logged.")
}).setName('asdebug')

register('command', () => {
  if (Scoreboard?.getTitle()?.removeFormatting() !== "HOUSING") return ChatLib.chat("&cYou must be in Housing to use this command!");
  if (!Player.getHeldItem()) return ChatLib.chat("&cYou must be holding an item to use this command!");
  let actionItem = new ActionItem(Player.getHeldItem().getItemStack());


  if (actionItem.version === 0) return ChatLib.chat("&cThis item does not have any action data!");
  if (actionItem.version > 1) return ChatLib.chat("&cThis item uses Hypixel's newer action data encoding, which encrypts the data!");

  const actionData = actionItem.getActionData();

  const UUID = Utils.UUID();
  actions[UUID] = () => {
    ChatLib.command(`ct copy ${JSON.stringify(actionData)}`, true);
    ChatLib.chat(`§aCopied Action Data to Clipboard!`);
  }

  let itemActions = new Message(
    new TextComponent(
      "\n&bHeld Item Action Data &3&l(&3Click to Copy&3&l)\n\n" +
      JSON.stringify(actionData, null, 4) +
      "\n"
    )
      .setHoverValue("&eClick to copy")
      .setClick("run_command", `/asaction ${UUID}`)
  );
  ChatLib.chat(itemActions);
}).setName("viewactions").setAliases(['va'])

register('command', () => {
  if (Scoreboard?.getTitle()?.removeFormatting() !== "HOUSING") return ChatLib.chat("&cYou must be in Housing to use this command!");
  if (!Player.getHeldItem()) return ChatLib.chat("&cYou must be holding an item to use this command!");
  let actionItem = new ActionItem(Player.getHeldItem().getItemStack());
  if (actionItem.version === 0) return ChatLib.chat("&cThis item does not have any action data!");
  if (actionItem.version > 1) return ChatLib.chat("&cThis item uses Hypixel's newer action data encoding, which encrypts the data!");

  const jwt = actionItem.getJWT();

  const UUID = Utils.UUID();
  actions[UUID] = () => {
    ChatLib.command(`ct copy ${JSON.stringify(jwt)}`, true);
    ChatLib.chat("&aCopied JSON Web Token to Clipboard!");
  }

  let itemActions = new Message(
    new TextComponent(
      "\n&bHeld Item JSON Web Token &3&l(&3Click to Copy&3&l)\n\n" +
      JSON.stringify(jwt, null, 4) +
      "\n"
    )
      .setHoverValue("&eClick to copy")
      .setClick("run_command", `/asaction ${UUID}`)
  );
  ChatLib.chat(itemActions);
}).setName("viewjsonwebtoken").setAliases(['jwt'])

// Internal command
register('command', (uuid) => {
  if (!uuid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid)) return;
  if (!actions[uuid]) return ChatLib.chat("§cThis click action has expired or never existed!");
  actions[uuid]();
}).setName("asaction")
