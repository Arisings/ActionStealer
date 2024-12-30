const JString = Java.type("java.lang.String")
const Base64 = Java.type("java.util.Base64");
const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");

export default class ActionItem {
    constructor(itemStack) {
        if (itemStack == null) return this.item = null;
        this.item = new Item(itemStack);
    }

    isValid() {
        return this.getActionData() != null;
    }

    getInteractData() {
        if (!this.hasInteractData()) return null;
        return this.item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("interact_data");
    }

    hasInteractData() {
        if (!this.item) return false;
        if (!this.item.getNBT().getCompoundTag("tag")) return false;
        if (!this.item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes")) return false;
        if (!this.item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("interact_data")) return false;
        return true;
    }

    // Returns JSON object with action data
    getActionData() {
        try {
            const payload = this.getJWT()?.payload;
            if (!payload) return null

            const bytearray = Base64.getDecoder().decode(payload['data']);
            const inputstream = new ByteArrayInputStream(bytearray);
            const decodedActionData = new NBTTagCompound(CompressedStreamTools.func_74796_a(inputstream)).toObject();
            return decodedActionData;
        } catch (e) {
            return null;
        }
    }

    // Returns JSON object with keys 'header', 'payload', 'signature'
    getJWT() {
        if (!this.hasInteractData()) return null;
        try {
            const actionToken = this.item.getNBT().getCompoundTag('tag').getCompoundTag('ExtraAttributes').getString('interact_data')
            const parts = actionToken.split('.');
            const header = JSON.parse(new JString(Base64.getDecoder().decode(parts[0])))
            const payload = JSON.parse(new JString(Base64.getDecoder().decode(parts[1])))
            const signature = parts[2]
            return { header, payload, signature }
        } catch (e) {
            return null;
        }
    }
}