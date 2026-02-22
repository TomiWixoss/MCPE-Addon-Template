// scripts/main.ts
import { world, EquipmentSlot, GameMode, system } from "@minecraft/server";
var CUSTOM_TOOLS = ["custom:tool", "custom:weapon"];
function damageItem(item) {
  if (!item) return null;
  const durabilityComponent = item.getComponent("durability");
  if (!durabilityComponent) return item;
  let unbreakingLevel = 0;
  if (item.hasComponent("enchantments")) {
    const enchantments = item.getComponent("enchantments").enchantments;
    const unbreaking = enchantments.getEnchantment("unbreaking");
    if (unbreaking) {
      unbreakingLevel = unbreaking.level;
    }
  }
  const damageChance = durabilityComponent.getDamageChance(unbreakingLevel);
  const shouldDamage = Math.random() * 100 <= damageChance;
  if (shouldDamage) {
    if (durabilityComponent.damage >= durabilityComponent.maxDurability - 1) {
      return null;
    }
    durabilityComponent.damage += 1;
  }
  return item;
}
world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  if (player.getGameMode() === GameMode.Creative) return;
  const equipment = player.getComponent("equippable");
  if (!equipment) return;
  const mainhandItem = equipment.getEquipment(EquipmentSlot.Mainhand);
  if (!mainhandItem) return;
  if (!CUSTOM_TOOLS.includes(mainhandItem.typeId)) return;
  const newItem = damageItem(mainhandItem);
  equipment.setEquipment(EquipmentSlot.Mainhand, newItem);
  if (!newItem) {
    player.playSound("random.break");
  }
});
world.afterEvents.entityHurt.subscribe((event) => {
  const damageSource = event.damageSource;
  if (!damageSource.damagingEntity) return;
  const attacker = damageSource.damagingEntity;
  if (attacker.typeId !== "minecraft:player") return;
  const equipment = attacker.getComponent("equippable");
  if (!equipment) return;
  const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);
  if (!weapon) return;
  if (!CUSTOM_TOOLS.includes(weapon.typeId)) return;
  const newWeapon = damageItem(weapon);
  equipment.setEquipment(EquipmentSlot.Mainhand, newWeapon);
  if (!newWeapon && attacker.typeId === "minecraft:player") {
    attacker.playSound("random.break");
  }
});
function mainTick() {
  if (system.currentTick % 100 === 0) {
    world.sendMessage("Custom Addon Active! Tick: " + system.currentTick);
  }
  system.run(mainTick);
}
system.run(mainTick);

//# sourceMappingURL=../debug/main.js.map
