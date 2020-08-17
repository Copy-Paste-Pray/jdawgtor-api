execute as @e[type=armor_stand,tag=!located,tag=s_structure,scores={s_type=368}] at @s run function structures:locate/surface
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=368}] at @s run tag @s add s_kill
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=368},tag=s_kill] at @s run setblock ~ ~ ~ minecraft:structure_block{ignoreEntities:0b,rotation:"NONE",posX:0,posY:0,posZ:0,mode:"LOAD",name:"structures:test_house"}
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=368},tag=s_kill] run function structures:generate/rotate
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=368},tag=s_kill] at @s run setblock ~ ~ ~1 minecraft:redstone_block

