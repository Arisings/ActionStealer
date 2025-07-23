const JString = Java.type("java.lang.String")
const Base64 = Java.type("java.util.Base64");
const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools");

export default class ActionItem {
    /* 
    0 -> Not an action item or invalid data
    1 -> v1, has exposed action data
    2 -> v2, has encrypted action data */
    version = -1;

    constructor(itemStack) {
        if (itemStack == null) return this.item = null;
        this.item = new Item(itemStack);
        this.version = this.validateVersion()
    }

    validateVersion() {
        if (this.getActionData()) {
            return 1;
        } else if (this.item.getNBT().getCompoundTag('tag')?.getCompoundTag('ExtraAttributes')?.getCompoundTag('interact_data')?.getString("data") && this.item.getNBT().getCompoundTag('tag')?.getCompoundTag('ExtraAttributes')?.getCompoundTag('interact_data')?.getInteger("version") == 2) { // v2 has interact_data
            return 2;
        } else {
            return 0;
        }
    }

    getInteractData() {
        if (this.version === 1) {
            return this.item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("interact_data");
        } else if (this.version === 2) {
            return this.item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getCompoundTag("interact_data").getString("data");
        } else {
            return null;
        }
    }

    // Returns JSON object with action data
    // ! Only meant to be used for v1 items !
    getActionData() {
        if (this.version !== -1 && this.version !== 1) return null;
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
    // ! Only meant to be used for v1 items !
    getJWT() {
        if (this.version !== -1 && this.version !== 1) return null;
        if (!this.item) return false;
        if (!this.item.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("interact_data")) return false;
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
