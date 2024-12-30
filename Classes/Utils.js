import ActionItem from "./ActionItem";

const creativePacket = Java.type("net.minecraft.network.play.client.C10PacketCreativeInventoryAction");

export default class Utils {
    static onFreeBuild() {
        if (!TabList || !TabList.getFooter()) return;
        return (TabList.getFooter().removeFormatting().includes("FreeBuild") ||
            TabList.getFooter().removeFormatting().includes("Free Build"));
    }

    static hasItem(interact_data) {
        let hit = false;
        Player.getInventory().getItems().forEach((item) => {
            if (!item) return;
            let actionItem = new ActionItem(item.getItemStack());
            if (actionItem.getInteractData() === interact_data) hit = true;
        })
        return hit;
    }

    static isCreative() {
        return Player.asPlayerMP().player.field_71075_bZ.field_75098_d;
    }

    static UUID() {
        return java.util.UUID.randomUUID().toString();
    }

    static giveItem(itemStack) {
        Client.sendPacket(new creativePacket(Player.getHeldItemIndex() + 36, itemStack));
    }

    static getItemFromNBT(nbtStr) {
        let nbt = net.minecraft.nbt.JsonToNBT.func_180713_a(nbtStr); // Get MC NBT object from string
        let count = nbt.func_74771_c('Count') // get byte
        let id = nbt.func_74779_i('id') // get string
        let damage = nbt.func_74765_d('Damage') // get short
        let tag = nbt.func_74781_a('tag') // get tag
        let item = new Item(id); // create ct item object
        item.setStackSize(count);
        item = item.getItemStack(); // convert to mc object
        item.func_77964_b(damage); // set damage of mc item object
        if (tag) item.func_77982_d(tag); // set tag of mc item object
        item = new Item(item); // convert back to ct object
        return item;
    }
}