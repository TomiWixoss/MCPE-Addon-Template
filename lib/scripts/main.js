import { world, EquipmentSlot, GameMode, system } from "@minecraft/server";
// Danh sách custom tools cần mất độ bền khi đào
const CUSTOM_TOOLS = ["custom:tool", "custom:weapon"];
// Hàm damage item với hỗ trợ Unbreaking
function damageItem(item) {
    if (!item)
        return null;
    const durabilityComponent = item.getComponent("durability");
    if (!durabilityComponent)
        return item;
    let unbreakingLevel = 0;
    // Kiểm tra enchantment Unbreaking
    if (item.hasComponent("enchantments")) {
        const enchantments = item.getComponent("enchantments").enchantments;
        const unbreaking = enchantments.getEnchantment("unbreaking");
        if (unbreaking) {
            unbreakingLevel = unbreaking.level;
        }
    }
    // Tính toán damage chance với Unbreaking
    const damageChance = durabilityComponent.getDamageChance(unbreakingLevel);
    const shouldDamage = Math.random() * 100 <= damageChance;
    if (shouldDamage) {
        // Kiểm tra nếu đã max durability thì phá vỡ item
        if (durabilityComponent.damage >= durabilityComponent.maxDurability - 1) {
            return null; // Item bị phá vỡ
        }
        durabilityComponent.damage += 1;
    }
    return item;
}
// Event khi player đào block
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    // Bỏ qua nếu player ở creative mode
    if (player.getGameMode() === GameMode.Creative)
        return;
    // Lấy item đang cầm
    const equipment = player.getComponent("equippable");
    if (!equipment)
        return;
    const mainhandItem = equipment.getEquipment(EquipmentSlot.Mainhand);
    if (!mainhandItem)
        return;
    // Kiểm tra nếu là custom tool
    if (!CUSTOM_TOOLS.includes(mainhandItem.typeId))
        return;
    // Damage item
    const newItem = damageItem(mainhandItem);
    // Set lại item (hoặc null nếu bị phá vỡ)
    equipment.setEquipment(EquipmentSlot.Mainhand, newItem);
    // Play sound khi item bị phá vỡ
    if (!newItem) {
        player.playSound("random.break");
    }
});
// Event khi player đánh entity (để weapon cũng mất độ bền)
world.afterEvents.entityHurt.subscribe((event) => {
    const damageSource = event.damageSource;
    if (!damageSource.damagingEntity)
        return;
    const attacker = damageSource.damagingEntity;
    // Chỉ xử lý nếu attacker là player
    if (attacker.typeId !== "minecraft:player")
        return;
    const equipment = attacker.getComponent("equippable");
    if (!equipment)
        return;
    const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon)
        return;
    // Kiểm tra nếu là custom weapon
    if (!CUSTOM_TOOLS.includes(weapon.typeId))
        return;
    // Damage weapon
    const newWeapon = damageItem(weapon);
    // Set lại weapon
    equipment.setEquipment(EquipmentSlot.Mainhand, newWeapon);
    // Play sound khi weapon bị phá vỡ
    if (!newWeapon && attacker.typeId === "minecraft:player") {
        attacker.playSound("random.break");
    }
});
// Hello message mỗi 100 ticks
function mainTick() {
    if (system.currentTick % 100 === 0) {
        world.sendMessage("Custom Addon Active! Tick: " + system.currentTick);
    }
    system.run(mainTick);
}
system.run(mainTick);
//# sourceMappingURL=main.js.map