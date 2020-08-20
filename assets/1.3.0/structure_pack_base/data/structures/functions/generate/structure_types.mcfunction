execute as @e[type=armor_stand,tag=!located,tag=s_structure,scores={s_type=<STRUCT_ID>}] at @s run function structures:locate/<STRUCT_PLACEMENT>
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=<STRUCT_ID>}] at @s run tag @s add s_kill
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=<STRUCT_ID>},tag=s_kill] at @s run setblock ~ ~ ~ minecraft:structure_block{ignoreEntities:0b,rotation:"NONE",posX:<POSX>,posY:<POSY>,posZ:<POSZ>,mode:"LOAD",name:"structures:<STRUCT_NAME>"}
<STRUCT_ROTATION>
execute as @e[type=armor_stand,tag=located,tag=s_structure,scores={s_type=<STRUCT_ID>},tag=s_kill] at @s run setblock ~ ~ ~1 minecraft:redstone_block