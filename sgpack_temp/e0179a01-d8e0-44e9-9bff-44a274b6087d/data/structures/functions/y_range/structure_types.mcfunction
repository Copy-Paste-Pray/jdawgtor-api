
#COPY AND PASTE THESE THREE COMMANDS FOR EACH STRUCTURE, THEN DELETE HASHTAGS
#execute as @e[type=minecraft:armor_stand,tag=s_structure,scores={s_type=<STRUCT_ID>}] at @s run tag @s add y_range
#execute as @e[type=minecraft:armor_stand,tag=s_structure,scores={s_type=<STRUCT_ID>},tag=y_range] at @s store result score @s s_Y run loot spawn ~ -200 ~ loot structures:y_range/<STRUCT_NAME>
#execute as @e[type=minecraft:armor_stand,tag=s_structure,scores={s_type=<STRUCT_ID>},tag=y_range] at @s store result entity @s Pos[1] double 1 run scoreboard players get @s s_Y